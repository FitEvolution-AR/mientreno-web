"use client"

import { useEffect } from "react"

/**
 * Warns before the browser throws away an unsaved draft.
 *
 * The plan editors hold a whole routine — days, exercises, per-set targets — in
 * React state and nowhere else: a reload, a closed tab or a click on an
 * external link loses every minute spent on it. `beforeunload` is the only
 * hook the browser gives us for that, and it only fires when the listener is
 * attached, so this is registered and torn down with the draft's dirty state.
 *
 * It deliberately does **not** cover in-app navigation: the App Router gives no
 * cancellable navigation event, so the in-app exits (the editor's own
 * "Cancelar", the tab strip) confirm for themselves. See `ConfirmDialog` usage
 * in the plan tabs.
 */
export function useUnsavedChanges(enabled: boolean): void {
  useEffect(() => {
    if (!enabled) return

    function handler(event: BeforeUnloadEvent) {
      // Modern browsers show their own copy and ignore any string we return;
      // `preventDefault` is what actually arms the prompt.
      event.preventDefault()
      // Safari and older Chrome still need `returnValue` set to something.
      event.returnValue = ""
    }

    window.addEventListener("beforeunload", handler)
    return () => window.removeEventListener("beforeunload", handler)
  }, [enabled])
}
