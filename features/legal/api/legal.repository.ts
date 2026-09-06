import { apiFetch } from "@/core/http/client"
import { LEGAL_DOCUMENTS_VERSION } from "@/components/legal/documents"

import type { MyConsentsResponseDTO } from "../dto/legal.dto"

export const legalRepository = {
  myConsents(): Promise<MyConsentsResponseDTO> {
    return apiFetch<MyConsentsResponseDTO>("/api/legal/consents/me")
  },

  /**
   * Records the acceptance for an account that already exists.
   *
   * Deliberately **not** aimed at `/api/backend/*` like everything else in this
   * file. It goes to our own `app/api/legal/consents` handler, which fills in
   * the browser's address and user agent before forwarding: the generic proxy
   * forwards no browser headers, so the audit row would otherwise name our own
   * Next server as the origin — the same reason the registration routes exist.
   */
  async recordConsent(): Promise<void> {
    const response = await fetch("/api/legal/consents", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        // One checkbox, three flags: the label names all three documents.
        termsAccepted: true,
        privacyAccepted: true,
        cookiesAcknowledged: true,
        documentsVersion: LEGAL_DOCUMENTS_VERSION,
        platform: "WEB" as const,
        locale: typeof navigator !== "undefined" ? navigator.language : null,
      }),
    })

    if (!response.ok) {
      throw new Error("No pudimos registrar tu aceptación")
    }
  },
}
