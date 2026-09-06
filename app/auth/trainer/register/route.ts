import { type NextRequest, NextResponse } from "next/server"

import { readClientOrigin } from "@/server/client-origin"
import { postJson } from "@/server/upstream"

/**
 * Trainer registration.
 *
 * This handler used to chain a `POST /auth/register/resend-otp` after the
 * registration call, because `UserDetailsServiceAuth.registerTrainer` saved the
 * user and returned without ever emailing a verification code — unlike
 * `registerStudent`, which sends one. Without the chained call a trainer could
 * never verify through the happy path.
 *
 * The backend now sends the code itself, so the workaround is gone. Keeping it
 * would be actively wrong today: the second send lands inside
 * `email-verification.resend-cooldown-seconds` and comes back 429, which is a
 * round trip spent to be told the thing already happened.
 *
 * `verificationCodeSent` stays in the response because the register form reads
 * it to decide whether to promise an email. It now mirrors whether registration
 * itself succeeded, which is the same thing: the backend sends the code inside
 * that call, and a failure to send fails the registration.
 */
export async function POST(req: NextRequest) {
  const body = (await req.json().catch(() => null)) as
    | {
        email?: string
        password?: string
        phone?: string
        legal?: Record<string, unknown>
      }
    | null

  if (!body?.email || !body.password) {
    return NextResponse.json(
      { message: "El correo y la contraseña son obligatorios" },
      { status: 400 },
    )
  }

  /*
   * Re-check the consent here and not only in the form's zod schema.
   *
   * This handler is reachable with a bare fetch, and the upstream property
   * `legal.consent.enforce` starts off so the already-published mobile builds
   * can keep registering — meaning a request with no `legal` block would
   * currently create a web account with no audit row at all. Checking here
   * closes that for the panel without waiting on the mobile rollout.
   */
  if (!body.legal?.termsAccepted || !body.legal?.privacyAccepted || !body.legal?.cookiesAcknowledged) {
    return NextResponse.json(
      { message: "Tenés que aceptar los términos y condiciones para crear la cuenta" },
      { status: 400 },
    )
  }

  const registration = await postJson("/auth/trainer/register", {
    email: body.email.trim(),
    password: body.password,
    // @Pattern tolerates null but not an empty string.
    phone: body.phone?.trim() || null,
    // The browser's own address and user agent, which only this hop can see.
    legal: { ...body.legal, ...readClientOrigin(req) },
  })

  if (!registration.ok) {
    return NextResponse.json(
      registration.data ?? { message: "No pudimos crear tu cuenta. Volvé a intentarlo." },
      { status: registration.status },
    )
  }

  return NextResponse.json({
    email: body.email.trim(),
    verificationCodeSent: true,
  })
}
