/** Literal mirrors of the `legal/dto` records. Do not edit without the Java. */

export type LegalDocumentType = "TERMS_OF_SERVICE" | "PRIVACY_POLICY" | "COOKIE_POLICY"

export type ConsentAction = "ACCEPTED" | "ACKNOWLEDGED" | "WITHDRAWN"

export type ConsentContext = "REGISTRATION" | "RE_CONSENT" | "PROFILE"

/** `LegalConsentResponseDTO`. No IP or user agent — those stay server-side. */
export interface LegalConsentResponseDTO {
  document: LegalDocumentType
  documentVersion: string
  action: ConsentAction
  context: ConsentContext
  acceptedAt: string
  platform: string | null
  appVersion: string | null
}

/**
 * `MyConsentsResponseDTO`.
 *
 * `needsConsent` is the one field the shell cares about. It is `true` for
 * accounts created before registration asked for the acceptance — they have no
 * row at all, and one cannot be backfilled without inventing evidence — and
 * for accounts whose rows point at a version that is no longer current.
 */
export interface MyConsentsResponseDTO {
  currentVersion: string
  needsConsent: boolean
  consents: LegalConsentResponseDTO[]
}
