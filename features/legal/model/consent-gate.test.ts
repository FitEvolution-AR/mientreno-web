import { describe, expect, it } from "vitest"

import { shouldBlockForConsent } from "./consent-gate"

describe("shouldBlockForConsent", () => {
  it("blocks when the backend says the consent is missing", () => {
    expect(shouldBlockForConsent({ resolved: true, needsConsent: true })).toBe(true)
  })

  it("lets through anyone already on the current version", () => {
    // Whoever registers today accepts during signup, so they never see the gate.
    expect(shouldBlockForConsent({ resolved: true, needsConsent: false })).toBe(false)
  })

  it("lets through when the query failed", () => {
    // Fail-open on purpose: a legal prompt, not an access control. Locking a
    // trainer out of their roster over a timeout is the worse outcome.
    expect(shouldBlockForConsent({ resolved: false, needsConsent: undefined })).toBe(false)
  })

  it("does not block while the query is in flight", () => {
    // Otherwise the gate flashes at everyone on every load.
    expect(shouldBlockForConsent({ resolved: false, needsConsent: true })).toBe(false)
  })
})
