/**
 * Whether the shell must block until the user accepts.
 *
 * Only blocks when the backend **said** the consent is missing. A failed query
 * — offline, API down — lets the user through, deliberately: this is a legal
 * requirement, not an access control. Locking a trainer out of their roster
 * because a request timed out is worse than asking again on the next load, and
 * the gate re-asks every time the app mounts.
 *
 * It also does not block while the query is in flight. Painting the gate before
 * the answer arrives would flash it at everyone, including the people who
 * accepted months ago.
 */
export function shouldBlockForConsent(params: {
  /** The query resolved successfully. */
  resolved: boolean
  /** What the backend answered. */
  needsConsent: boolean | undefined
}): boolean {
  if (!params.resolved) return false
  return params.needsConsent === true
}
