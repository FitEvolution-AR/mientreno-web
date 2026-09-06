import { NextRequest } from "next/server"
import { beforeEach, describe, expect, it, vi } from "vitest"

const upstream = vi.hoisted(() => ({ authedJson: vi.fn() }))
vi.mock("@/server/upstream", () => upstream)

import { POST } from "./route"

const VALID = {
  termsAccepted: true,
  privacyAccepted: true,
  cookiesAcknowledged: true,
  documentsVersion: "2026-09-06",
  platform: "WEB",
  locale: "es-AR",
}

function request(body: unknown, headers: Record<string, string> = {}) {
  return new NextRequest("http://dashboard.test/api/legal/consents", {
    method: "POST",
    headers: { "content-type": "application/json", ...headers },
    body: JSON.stringify(body),
  } as never)
}

beforeEach(() => {
  upstream.authedJson.mockReset()
  upstream.authedJson.mockResolvedValue({ ok: true, status: 204, data: null })
})

describe("re-consent", () => {
  it("wraps the payload in the legal envelope the backend expects", async () => {
    const response = await POST(request(VALID))

    expect(response.status).toBe(204)
    const [path, method, body] = upstream.authedJson.mock.calls[0]
    expect(path).toBe("/api/legal/consents")
    expect(method).toBe("POST")
    expect(body.legal).toMatchObject({ termsAccepted: true, documentsVersion: "2026-09-06" })
  })

  it("attaches the browser's address and user agent", async () => {
    // The generic /api/backend proxy forwards no browser headers, so without
    // this hop the audit row would name our own Next server as the origin.
    await POST(
      request(VALID, { "x-forwarded-for": "181.10.10.10, 10.0.0.1", "user-agent": "Mozilla/5.0" }),
    )

    const [, , body] = upstream.authedJson.mock.calls[0]
    expect(body.legal.clientIp).toBe("181.10.10.10")
    expect(body.legal.userAgent).toBe("Mozilla/5.0")
  })

  it("refuses a half-ticked acceptance without calling upstream", async () => {
    const response = await POST(request({ ...VALID, privacyAccepted: false }))

    expect(response.status).toBe(400)
    expect(upstream.authedJson).not.toHaveBeenCalled()
  })

  it("passes an upstream failure through with its status", async () => {
    upstream.authedJson.mockResolvedValue({
      ok: false,
      status: 401,
      data: { message: "Tu sesión ha expirado" },
    })

    const response = await POST(request(VALID))

    expect(response.status).toBe(401)
    await expect(response.json()).resolves.toMatchObject({ message: "Tu sesión ha expirado" })
  })
})
