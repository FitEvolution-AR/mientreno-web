import { MAIN_CONTENT_ID } from "@/lib/dom"

/**
 * First stop of every Tab sequence, invisible until it has focus.
 *
 * All three shells put a sidebar and a header ahead of the content, so a
 * keyboard user landed on the same six or seven navigation links before
 * reaching anything on the page — on every navigation, since the shell does not
 * unmount. This jumps straight to `<main>`.
 *
 * It has to be the first focusable element in the DOM, which is why it lives in
 * the layouts rather than inside any shell component.
 */
export function SkipLink() {
  return (
    <a
      href={`#${MAIN_CONTENT_ID}`}
      className="sr-only rounded-lg bg-primary px-4 py-2 text-body font-medium text-primary-foreground focus-visible:not-sr-only focus-visible:absolute focus-visible:top-3 focus-visible:left-3 focus-visible:z-50"
    >
      Saltar al contenido
    </a>
  )
}
