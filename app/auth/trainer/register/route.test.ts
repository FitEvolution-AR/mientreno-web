import { NextRequest } from "next/server"
import { beforeEach, describe, expect, it, vi } from "vitest"

const upstream = vi.hoisted(() => ({ postJson: vi.fn() }))
vi.mock("@/server/upstream", () => upstream)

import { POST } from "./route"

const VALID_LEGAL = {
  termsAccepted: true,
  privacyAccepted: true,
  cookiesAcknowledged: true,
  documentsVersion: "2026-09-06",
  platform: "WEB",
  locale: "es-AR",
}

function request(body: unknown, headers: Record<string, string> = {}) {
  return new NextRequest("http://dashboard.test/auth/trainer/register", {
    method: "POST",
    headers: { "content-type": "application/json", ...headers },
    body: JSON.stringify(body),
  } as never)
}

function credentials(legal: unknown = VALID_LEGAL) {
  return { email: "ana@gimnasio.com", password: "Password1234", phone: "+5491112345678", legal }
}

beforeEach(() => {
  upstream.postJson.mockReset()
  upstream.postJson.mockResolvedValue({ ok: true, status: 200, data: {} })
})

describe("trainer registration", () => {
  it("forwards the legal block upstream", async () => {
    await POST(request(credentials()))

    expect(upstream.postJson).toHaveBeenCalledOnce()
    const [path, body] = upstream.postJson.mock.calls[0]
    expect(path).toBe("/auth/trainer/register")
    expect(body.legal).toMatchObject({
      termsAccepted: true,
      privacyAccepted: true,
      cookiesAcknowledged: true,
      documentsVersion: "2026-09-06",
    })
  })

  it("attaches the browser's address and user agent", async () => {
    // Only this hop can see them: `postJson` forwards no browser headers, so
    // without this the audit row would name our own Next server as the origin
    // of every trainer consent.
    await POST(
      request(credentials(), {
        "x-forwarded-for": "181.10.10.10, 10.0.0.1",
        "user-agent": "Mozilla/5.0",
      }),
    )

    const [, body] = upstream.postJson.mock.calls[0]
    // Leftmost entry: proxies append, so that is the originating address. The
    // backend reads the same header from the right, because there it defends a
    // rate limiter and a spoofable value would be an exploit.
    expect(body.legal.clientIp).toBe("181.10.10.10")
    expect(body.legal.userAgent).toBe("Mozilla/5.0")
  })

  it("rejects a registration with no legal block without calling upstream", async () => {
    // Reachable with a bare fetch, and `legal.consent.enforce` is off upstream
    // during the mobile rollout — so this is what keeps a web account from
    // being created with no audit row.
    const response = await POST(request({ ...credentials(), legal: undefined }))

    expect(response.status).toBe(400)
    expect(upstream.postJson).not.toHaveBeenCalled()
  })

  it("rejects a partially ticked acceptance", async () => {
    const response = await POST(
      request(credentials({ ...VALID_LEGAL, privacyAccepted: false })),
    )

    expect(response.status).toBe(400)
    expect(upstream.postJson).not.toHaveBeenCalled()
  })

  it("still requires email and password first", async () => {
    const response = await POST(request({ legal: VALID_LEGAL }))

    expect(response.status).toBe(400)
    expect(upstream.postJson).not.toHaveBeenCalled()
  })

  it("passes an upstream failure through with its status", async () => {
    upstream.postJson.mockResolvedValue({
      ok: false,
      status: 409,
      data: { message: "El email ya se encuentra registrado" },
    })

    const response = await POST(request(credentials()))

    expect(response.status).toBe(409)
    await expect(response.json()).resolves.toMatchObject({
      message: "El email ya se encuentra registrado",
    })
  })
})
