import { type NextRequest, NextResponse } from "next/server"

import { readClientOrigin } from "@/server/client-origin"
import { authedJson } from "@/server/upstream"

/**
 * `POST /api/legal/consents`, wrapped so the browser's origin survives the hop.
 *
 * The generic `/api/backend/*` proxy forwards no browser headers — by design,
 * since the backend authenticates our server rather than the visitor. For most
 * endpoints that costs nothing. For a consent audit row it costs the only
 * detail worth recording about where the acceptance came from: without this
 * handler the backend would resolve our own Next server as the origin of every
 * trainer and merchant re-consent.
 *
 * Same reasoning, and the same helper, as the two registration routes.
 */
export async function POST(req: NextRequest) {
  const legal = (await req.json().catch(() => null)) as Record<string, unknown> | null

  // The browser is not trusted to say it accepted on someone's behalf — but it
  // is the only thing that knows whether the box was ticked, so a missing or
  // half-ticked payload is a client bug, not a user decision.
  if (!legal?.termsAccepted || !legal?.privacyAccepted || !legal?.cookiesAcknowledged) {
    return NextResponse.json(
      { message: "Tenés que aceptar los tres documentos para continuar" },
      { status: 400 },
    )
  }

  const { ok, status, data } = await authedJson("/api/legal/consents", "POST", {
    legal: { ...legal, ...readClientOrigin(req) },
  })

  if (!ok) {
    return NextResponse.json(
      data ?? { message: "No pudimos registrar tu aceptación" },
      { status },
    )
  }

  return new NextResponse(null, { status: 204 })
}
