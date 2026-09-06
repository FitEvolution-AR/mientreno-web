"use client"

import { useState } from "react"

import { Button } from "@/components/ui/button"
import { LegalConsentField } from "@/features/auth/components/legal-consent-field"
import { useLogout } from "@/features/auth/hooks/use-auth-actions"
import { useLegalConsentGate } from "../hooks/use-legal-consent"

/**
 * Blocking acceptance screen for accounts that predate the consent record.
 *
 * Whoever registers today accepts during signup and never sees this. It catches
 * the accounts created before registration asked — which have no audit row, and
 * none can be backfilled without inventing evidence — and the ones whose rows
 * point at a superseded version of the documents.
 *
 * It reuses `LegalConsentField` rather than restating the copy, so the sentence
 * recorded here is word-for-word the one shown at signup. Two wordings for the
 * same three rows would eventually disagree, and the audit trail would have no
 * way to say which one the person actually read.
 *
 * Rendered as a fixed overlay over the shell, not as a route: a route can be
 * navigated away from, and the whole point is that there is nowhere else to go.
 * The way out is signing out, which the footer offers — a screen with no exit
 * at all is a hostage situation, and "accept or lose your account" is not a
 * freely given consent once you also remove the door.
 */
export function LegalConsentGate() {
  const { mustAccept, accepting, failed, accept } = useLegalConsentGate()
  const logout = useLogout()
  const [accepted, setAccepted] = useState(false)

  if (!mustAccept) return null

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="legal-gate-title"
      className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-background/95 p-4 backdrop-blur-sm"
    >
      <div className="w-full max-w-md rounded-xl border border-border bg-card p-6 shadow-lg sm:p-8">
        <h1 id="legal-gate-title" className="font-heading text-heading-3 text-foreground">
          Actualizamos nuestros términos
        </h1>

        <p className="mt-3 text-body text-foreground-secondary">
          Antes de seguir necesitamos que aceptes los documentos legales de Mi Entreno. Es un paso
          único: no te lo vamos a volver a pedir salvo que cambien.
        </p>

        <div className="mt-6">
          <LegalConsentField
            id="legalGateConsent"
            checked={accepted}
            onCheckedChange={setAccepted}
            disabled={accepting}
          />
        </div>

        {failed && (
          <p role="alert" className="mt-4 text-caption text-destructive">
            No pudimos registrar tu aceptación. Revisá tu conexión e intentá de nuevo.
          </p>
        )}

        <Button
          size="lg"
          className="mt-6 w-full"
          disabled={!accepted || accepting}
          onClick={() => accept()}
        >
          {accepting ? "Guardando…" : "Continuar"}
        </Button>

        <div className="mt-4 text-center">
          {/*
            `useLogout` and not a plain form post: the logout route answers JSON,
            so a native submit would strand the user on a page of raw JSON. The
            hook revokes the refresh token upstream and routes to /login.
          */}
          <button
            type="button"
            disabled={accepting}
            onClick={() => void logout()}
            className="text-caption text-foreground-secondary underline underline-offset-4 hover:text-foreground disabled:opacity-50"
          >
            Cerrar sesión
          </button>
        </div>
      </div>
    </div>
  )
}
