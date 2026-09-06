import type { Metadata } from "next"

import { BottomNav } from "@/components/dashboard/bottom-nav"
import { SkipLink } from "@/components/shared/skip-link"
import { MAIN_CONTENT_ID } from "@/lib/dom"
import { DashboardHeader } from "@/components/dashboard/header"
import { Sidebar } from "@/components/dashboard/sidebar"
import { LegalConsentGate } from "@/features/legal/components/legal-consent-gate"
import { isAdmin } from "@/server/jwt"
import { readSession } from "@/server/session-store"

/**
 * Reads the trainer's first name off the session token, server-side.
 *
 * `JwtUtils.createToken` signs a `firstName` claim, so the name is already in
 * the cookie by the time this renders — no request needed. Handing it to the
 * shell means the first painted frame says "Alex" instead of the word
 * "Entrenador", which is what used to flash on every reload while
 * `GET /api/trainer/profile` was still in flight.
 *
 * It is a hint, not the source of truth: the client query still runs and
 * upgrades this to the full name. A token without the claim falls back to a
 * skeleton rather than to a placeholder word.
 */
export const metadata: Metadata = {
  title: 'Mi Entreno — Panel del entrenador',
}

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await readSession()
  const initialName = session?.claims.firstName ?? null
  // El rol se lee acá y baja como prop: el sidebar es un componente cliente y
  // no tiene acceso a la cookie.
  const admin = isAdmin(session?.claims ?? null)

  return (
    <div className="relative flex min-h-svh">
      <SkipLink />
      <Sidebar initialName={initialName} isAdmin={admin} />
      <div className="flex min-w-0 flex-1 flex-col">
        <DashboardHeader initialName={initialName} />
        <main
          id={MAIN_CONTENT_ID}
          tabIndex={-1}
          className="flex-1 px-4 pb-24 pt-6 sm:px-6 md:pb-8 lg:px-8"
        >
          {children}
        </main>
      </div>
      <BottomNav />
      {/*
        Renders nothing for anyone whose consent is on the current version,
        which is everyone who registered after the signup form started asking.
        When it does render it covers the shell entirely — see the component.
      */}
      <LegalConsentGate />
    </div>
  )
}
