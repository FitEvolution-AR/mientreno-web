"use client"

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"

import { qk } from "@/core/http/query-keys"
import { legalRepository } from "../api/legal.repository"
import { shouldBlockForConsent } from "../model/consent-gate"

/**
 * The re-consent gate for accounts that already exist.
 *
 * Whoever registers today leaves the audit rows during signup, so they never
 * see this. It is for two cases: accounts created before registration asked for
 * the acceptance — no rows at all, and none can be backfilled without inventing
 * evidence — and accounts whose rows point at a superseded version.
 */
export function useLegalConsentGate() {
  const queryClient = useQueryClient()

  const query = useQuery({
    queryKey: qk.legal.myConsents,
    queryFn: () => legalRepository.myConsents(),
    // The answer only changes when the user accepts (which invalidates) or when
    // new documents ship. No reason to ask twice in one session.
    staleTime: Infinity,
    retry: 1,
  })

  const accept = useMutation({
    mutationFn: () => legalRepository.recordConsent(),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: qk.legal.all }),
  })

  return {
    mustAccept: shouldBlockForConsent({
      resolved: query.isSuccess,
      needsConsent: query.data?.needsConsent,
    }),
    accepting: accept.isPending,
    failed: accept.isError,
    accept: accept.mutate,
  }
}
