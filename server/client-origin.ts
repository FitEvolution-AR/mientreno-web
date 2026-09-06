import "server-only"

import type { NextRequest } from "next/server"

/**
 * What the browser looked like from the BFF's point of view.
 *
 * `postJson` forwards no browser headers upstream — by design, since the
 * backend authenticates our server, not the visitor. The side effect is that
 * anything the backend derives from the transport describes *us*: for every
 * trainer and merchant registration, `ClientIpResolver` would resolve the Next
 * server's address and the user agent would read as `node-fetch`.
 *
 * That is fine for rate limiting, which is supposed to be about the connection.
 * It is useless for a consent audit trail, where the interesting party is the
 * person who ticked the box. So we read the browser's IP and user agent here,
 * where they are still visible, and pass them upstream as declared values. The
 * backend stores them in columns of their own and never lets them influence a
 * security decision — they are unverifiable by construction, and pretending
 * otherwise is how a spoofable header becomes a rate-limit bypass.
 */
export interface ClientOrigin {
  clientIp: string | null
  userAgent: string | null
}

export function readClientOrigin(req: NextRequest): ClientOrigin {
  return {
    clientIp: readClientIp(req),
    userAgent: req.headers.get("user-agent"),
  }
}

/**
 * Reads `X-Forwarded-For` from the LEFT, which is the opposite of what the
 * backend's `ClientIpResolver` does — and correct here for that same reason.
 *
 * Proxies append, so the leftmost entry is the one the client sent and the
 * rightmost is the one our closest proxy observed. The backend reads from the
 * right because it is defending a rate limiter, where a spoofable value is an
 * exploit. Here we *want* the originating address and already treat the whole
 * value as unverified, so the leftmost entry is the useful one.
 *
 * `x-real-ip` is the fallback for platforms that set it instead.
 */
function readClientIp(req: NextRequest): string | null {
  const forwarded = req.headers.get("x-forwarded-for")
  if (forwarded) {
    const first = forwarded.split(",")[0]?.trim()
    if (first) return first
  }
  return req.headers.get("x-real-ip")
}
