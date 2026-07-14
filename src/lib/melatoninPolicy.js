// Policy data for the melatonin feature's geo-gate and screening version —
// kept separate from src/lib/featureFlags.js, which stays a simple on/off
// switch. These values are inputs to that gate, not the switch itself.

// Countries where melatonin dosing content is allowed to be shown. Starts
// conservative (US only) — melatonin is prescription-only across much of
// Europe/UK/Australia. TBD from legal review, see
// docs/science-review-request.md open question 9.
export const MELATONIN_ALLOWED_COUNTRIES = ['US'];

// Bump this when the screening questions (age/pregnancy/medications) change
// meaningfully — a stored melatonin_screening_version on a plan row that
// doesn't match this constant should be treated as stale and re-screened.
export const MELATONIN_SCREENING_VERSION = 1;
