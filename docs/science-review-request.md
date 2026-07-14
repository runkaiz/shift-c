# Request for science review & science note — Shift circadian/melatonin logic

**Status:** Melatonin dosing is currently disabled in production (feature flag,
see Appendix A). Bright light therapy (BLT) guidance and the core wake/sleep
retiming schedule remain live. This document is a request for an outside
review, not the review itself.

## 1. Purpose and context

Shift is a web app that helps a user shift their sleep/wake schedule (e.g.
for jet lag or a deliberate schedule change) toward a goal wake/bedtime. From
a user's current and goal wake/sleep times, it computes:

- A day-by-day retiming schedule (how much to move bedtime/wake time each
  day).
- Bright light therapy (BLT) timing — when to get/avoid light exposure.
- Melatonin dosing — a specific milligram dose and a specific time to take
  it, computed per user (**currently disabled**).

All three are delivered to the user as calendar events (.ics download or a
live calendar subscription) and, for users who opt in, a daily check-in
email that restates that day's bedtime/BLT/melatonin plan.

**Why this request exists:** the code that computes melatonin dosing
(`src/lib/melatonin.js`) contains comments that cite specific circadian
research and repeatedly refer to "the science note this module implements."
That science note does not exist anywhere in the current repository or in
its git history — it is either lost, was kept outside version control, or
never existed. Separately, the app is old enough (originally built in 2022,
per git history) and has been modified enough since that even if the
original note were recovered, it likely no longer accounts for everything
currently implemented. We are treating this as a green-field request rather
than trying to reconstruct a lost document.

**What we're asking you to produce:** a versioned, citable science note that
can live in this repository (e.g. as `docs/science-note.md`) and that
explicitly backs every number and piece of timing/dosing logic listed in
Section 2 below — either confirming the current implementation, or telling
us specifically what should change. Section 3 lists the open questions we
most need resolved. Section 4 summarizes the deliverable we're asking for.

This request deliberately does not ask you for legal advice. It asks for the
underlying science and clinical judgment; a separate legal/regulatory review
will follow once the science side is settled, and will lean on your note as
its foundation.

## 2. Complete inventory of current implementation

### 2.1 Regime classification (`src/lib/melatonin.js:58-70`)

The app classifies any requested schedule change into one of three
"regimes," which then determines both BLT and melatonin strategy:

| Regime      | Trigger                                                           | Code                 |
| ----------- | ----------------------------------------------------------------- | -------------------- |
| `extension` | `\|midpointShiftMinutes\| < 30`                                   | `melatonin.js:63-64` |
| `advance`   | `midpointShiftMinutes < 0` (and `\|midpointShiftMinutes\| >= 30`) | `melatonin.js:66`    |
| `delay`     | `midpointShiftMinutes >= 30`                                      | `melatonin.js:66`    |

Where:

- `midpointShiftMinutes = (wakeShiftMinutes + sleepShiftMinutes) / 2` — the
  shift in the midpoint of the sleep period (goal midpoint minus current
  midpoint).
- `durationShiftMinutes = wakeShiftMinutes - sleepShiftMinutes` — computed
  but currently only exposed, not used to alter dosing/timing.
- The 30-minute threshold (`REGIME_MIDPOINT_THRESHOLD_MINUTES`,
  `melatonin.js:15`) is the cutoff below which the app treats the request as
  a pure "sleep extension" (more sleep opportunity) problem rather than a
  circadian phase-shift problem. **No citation is given for this specific
  30-minute cutoff** — it is presented as implementing an unspecified
  "science note section 5."

**Code-flagged limitations on this section (verbatim from
`melatonin.js:10-14, 41-52`):**

- "Real regimes have a 30-60min gray zone the note leaves undiagnosed; we
  route all of that into the phase-shift branches rather than adding a
  fourth bucket."
- "Known simplification: the note's 'mixed' regime (advance one end, delay
  the other) is folded into 'advance'/'delay' by the sign of the net
  midpoint shift rather than being decomposed into separate midpoint- and
  duration-shift interventions, since a single regime is chosen once for the
  whole protocol."
- "Known limitation: wakeShiftMinutes/sleepShiftMinutes already carry the
  caller's independent per-endpoint midnight-wraparound correction. In rare
  inputs where only one endpoint crosses that ~12h wraparound boundary, the
  resulting midpoint sign (and therefore advance-vs-delay dosing direction)
  can be unstable. Not solved here."

### 2.2 Day-by-day shift rate (`src/lib/schedule.js`)

- `DEFAULT_INCREMENT_MINUTES = 30` (`schedule.js:5`) — the schedule moves
  bedtime and wake time by **30 minutes per day** until the goal is reached.
  Number of days = `ceil(|shift in minutes| / 30)` for wake and sleep
  independently; the plan runs as many days as whichever endpoint needs
  more.
- `WRAPAROUND_THRESHOLD_HOURS = 12` (`schedule.js:7`) — used to decide
  whether a given goal time "actually" means the next/previous calendar day
  (e.g. a goal of 00:30 when current is 23:00 is treated as a 1.5h delay,
  not a ~22.5h advance).
- No citation is given anywhere for the 30-minutes/day rate. This is a
  product/UX pacing choice as much as a clinical one — flagging for your
  judgment on whether it's within safe/effective bounds for phase-shifting
  via behavioral scheduling alone (independent of the BLT/melatonin
  adjuncts below).

### 2.3 Bright light therapy (BLT) timing (`src/lib/melatonin.js:72-98`)

| Regime      | BLT direction                                                    | Timing                                                                            | Code                 |
| ----------- | ---------------------------------------------------------------- | --------------------------------------------------------------------------------- | -------------------- |
| `advance`   | Morning                                                          | `wake + bltOffsetMinutes` (default 30 min after wake, `schedule.js:6`)            | `melatonin.js:94-97` |
| `extension` | Morning (for alertness, "not any phase-shift claim" per comment) | Same as above                                                                     | `melatonin.js:94-97` |
| `delay`     | Evening                                                          | `sleep - EVENING_LIGHT_OFFSET_MINUTES` (90 min before bedtime, `melatonin.js:30`) | `melatonin.js:88-91` |

**Code-flagged limitation (verbatim, `melatonin.js:27-30`):** "the note
endorses evening bright light for delays but gives no specific offset
before bedtime. This value is a placeholder, not derived from a cited
figure." This is the one number in the whole module explicitly marked as
not backed by any source.

User-facing BLT copy (`src/lib/ical.js:11-19`, sent verbatim in calendar
event descriptions and, in shortened form, in the daily check-in email):

> **delay regime:** "Get some bright light exposure in the evening to help
> shift your circadian clock later. Avoid bright light after waking, until
> your target wake time."
>
> **extension regime:** "Get some bright light exposure shortly after waking
> for alertness. Your plan mainly needs more sleep opportunity rather than a
> clock shift, so this step is optional."
>
> **advance regime (default/else branch):** "Get some bright light exposure
> shortly after waking to help shift your circadian clock earlier. Keep the
> 2-3 hours before your bedtime dim to reinforce the shift."

BLT event duration in the calendar is fixed at 15 minutes
(`BLT_DURATION_MINUTES`, `ical.js:3`) — not itself a clinical claim, just a
calendar-block length, but flagging in case you have a view on whether the
UI should communicate a minimum effective exposure duration.

### 2.4 Melatonin dosing (`src/lib/melatonin.js:100-135`) — currently disabled

| Regime      | Dose                                              | Timing                                                                                    | Chronobiotic?                                  | Code                   |
| ----------- | ------------------------------------------------- | ----------------------------------------------------------------------------------------- | ---------------------------------------------- | ---------------------- |
| `advance`   | 0.5 mg (`CHRONOBIOTIC_DOSE_MG`, `melatonin.js:7`) | `bedtime - 300 min` (5h before bedtime, `ADVANCE_DOSE_OFFSET_MINUTES`, `melatonin.js:21`) | Yes                                            | `melatonin.js:114-119` |
| `delay`     | 0.5 mg                                            | At wake time                                                                              | Yes                                            | `melatonin.js:122-127` |
| `extension` | 0.3 mg (`HYPNOTIC_DOSE_MG`, `melatonin.js:8`)     | `bedtime - 45 min` (`EXTENSION_HYPNOTIC_OFFSET_MINUTES`, `melatonin.js:25`)               | No (framed as a sleep aid, not phase-shifting) | `melatonin.js:130-134` |

**Citations already present in code comments (verbatim,
`melatonin.js:3-4, 17-21`):**

- "Dosing/timing defaults derived from the melatonin PRC literature
  (Burgess, Revell & Eastman 2008/2010; see the science note this module
  implements)."
- "Advance dosing: DLMO is approximated as 2h before habitual bedtime
  (Burgess & Eastman 2005), and the optimal 0.5mg offset before DLMO is
  2-4h (we use the 3h midpoint) -> bedtime - 2h - 3h = bedtime - 5h. This
  independently matches the note's simpler '4-6h before bedtime' heuristic."

These are the only two citations in the entire codebase for any
dosing/timing number, anywhere. No author, journal, or full title is given
— just surname/year. **We need you to either confirm these are the correct,
current, best-available sources for this use case, or tell us what should
replace them.**

The delay-regime "melatonin at wake time" rule and the extension-regime
hypnotic dose/offset (0.3mg, 45 minutes before bed) have **no citation at
all** in the code, informal or otherwise.

User-facing melatonin copy (`src/lib/ical.js:21-29`, also echoed in the
daily check-in email as `Melatonin: take {doseMg} mg at {time}` —
`src/lib/server/email.js:15-17` — and in the app's day-by-day plan view as
`Melatonin · {doseMg} mg` / `around {time}` —
`src/lib/components/DayCard.svelte:134-135`):

> **Hypnotic (extension) framing:** "Take {dose} mg melatonin now as a sleep
> aid before bed. This dose is for falling asleep, not for shifting your
> clock. [disclaimer]"
>
> **Delay framing:** "Take {dose} mg melatonin now, right on waking, to help
> shift your circadian clock later (optional — light is the stronger signal
> for a delay). Avoid bright light after waking until your target wake time.
> [disclaimer]"
>
> **Advance framing (default/else branch):** "Take {dose} mg melatonin now
> to help shift your circadian clock earlier. Keep lights dim for the next
> 2-3 hours, especially close to bedtime. [disclaimer]"

Where `[disclaimer]` is the following string, appended to every melatonin
description (`MELATONIN_DISCLAIMER`, `ical.js:5-6`), verbatim:

> "General estimate, not medical advice — check with a clinician if you are
> pregnant, on other medications, or have a health condition."

Melatonin calendar-event duration is fixed at 5 minutes
(`MELATONIN_DURATION_MINUTES`, `ical.js:4`) — a calendar-block length, not a
clinical claim.

**Opt-in copy shown to the user before they enable this feature**
(`src/routes/(main)/app/plan/+page.svelte:128-133`, currently only rendered
when the feature flag is on):

> "Chronobiotics use a small, precisely-timed dose of melatonin. We'll pick
> the timing and amount that fits your plan — not the same for everyone.
> General estimate, not medical advice — check with a clinician if you're
> pregnant, on other medications, or have a health condition."

**This is worth your specific attention:** "We'll pick the timing and
amount that fits your plan — not the same for everyone" is an explicit,
confident claim of personalization made to the user at the moment they opt
in — stronger and more specific than the reactive disclaimer that follows
it. Please assess whether this framing is appropriate given what the
underlying evidence actually supports for a non-clinical, non-supervised
context.

### 2.5 General educational content (no dosing/timing numbers)

`src/routes/(main)/learn/circadian/+page.svelte` is a plain-language
explainer of the two-process model of sleep regulation (circadian "process
C" + homeostatic sleep pressure "process S"), using a battery/charger
analogy. It contains **no citations of any kind**, formal or informal, and
makes no dosing or timing claims — it's general orientation content shown
before the survey. Flagging for completeness in case you think even
general framing here needs a citation or a caveat.

The app's landing page (`src/routes/(main)/+page.svelte`) describes the
overall approach as "an evidence-based way to shift your circadian rhythm."
This is a top-level marketing claim covering the whole product, not tied to
any specific number — flagging so you're aware it exists alongside the more
granular claims above.

## 3. Open questions for the reviewer

**From code-flagged uncertainties (Section 2, collected here):**

1. Is the 30-minute midpoint-shift threshold for "extension vs. phase-shift"
   regime classification (`melatonin.js:15`) correct, and how should the
   unresolved "30-60min gray zone" the code mentions be handled?
2. Is folding the note's "mixed regime" case into a single advance-or-delay
   choice by net midpoint sign an acceptable simplification, or does it
   need to be decomposed into separate midpoint-shift and duration-shift
   interventions?
3. Is the 90-minute pre-bedtime offset for delay-regime evening light
   (`EVENING_LIGHT_OFFSET_MINUTES`, `melatonin.js:30`) — explicitly marked
   in the code as "a placeholder, not derived from a cited figure" —
   acceptable as a rough default, or does it need a specific evidence-based
   value?
4. Are the Burgess & Eastman 2005 (DLMO ≈ bedtime − 2h) and Burgess, Revell
   & Eastman 2008/2010 (optimal chronobiotic dose timing 2-4h before DLMO)
   citations correct, current, and the best available sources for this
   use case? If not, what should replace them?
5. What is the evidence basis (if any) for: melatonin-at-wake-time for the
   delay regime; the 0.3mg / 45-minutes-before-bed hypnotic dosing for the
   extension regime? Neither has any citation, even informal, in the
   current code.
6. Is 30 minutes/day an appropriate, evidence-grounded pace for the
   underlying wake/sleep retiming schedule itself (independent of BLT/
   melatonin), or should this vary by regime/shift size?

**Product-level questions:**

7. **Personalized dose vs. general range.** The current design computes and
   states a specific milligram dose and a specific clock time for a
   specific user ("take 0.5mg now"), and — per the opt-in copy quoted in
   2.4 — explicitly tells the user this is personalized to them. Should we
   instead show a general educational range with a "talk to a clinician
   about what's right for you" framing, and avoid stating a computed
   point-value dose? What's your recommendation, and why?
8. **Contraindication screening.** The only safety language today is the
   reactive disclaimer quoted in 2.4, appended after the instruction to
   take a dose. Does that adequately address pregnancy, pediatric use, and
   medication interactions, or should the product require explicit
   exclusion screening (e.g. asking about pregnancy/medications) _before_
   showing any dosing content at all?
9. **Jurisdiction.** Melatonin is available over-the-counter in the US but
   is prescription-only in a number of other countries. We are not asking
   you to enumerate a country list (that needs to be verified against
   current regulations by whoever handles the regulatory review), but we'd
   like your view on whether/how the science note itself should flag that
   the "general wellness supplement" framing does not hold universally.

## 4. What we're asking for as the deliverable

A written science note, suitable to check into this repository, that:

- Addresses every numbered item in Section 2 (regime classification, BLT
  timing, melatonin dosing/timing, and the 30-min/day retiming rate) with
  full, current citations — not just surname/year, but complete references
  we can put in a bibliography.
- Explicitly answers each open question in Section 3.
- States plainly which current implemented values (if any) are wrong,
  outdated, or unsupported and need to change, versus which are fine as-is.
- Gives a clear recommendation on the personalized-dose-vs-general-range
  question (3.7), since that decision drives how much of the rest of this
  feature needs to be rebuilt.
- Is versioned (dated, with a revision history) so future code changes can
  reference which version of the note justified which implementation.

Once this note exists, we intend to route the personalization/dosing
questions and the jurisdiction question through separate legal/regulatory
review, using your note as its factual foundation. We are not asking you
for that legal judgment here.

---

## Appendix A: current state of the feature in the app

Melatonin dosing is fully implemented in code but gated off behind a single
flag, `MELATONIN_FEATURE_ENABLED = false` in `src/lib/featureFlags.js`,
pending exactly the review requested above. Every code path that would
surface melatonin content — the opt-in UI toggle, calendar exports, the
calendar subscription feed, and the daily check-in email — checks this flag
and suppresses melatonin content when it's off, including for
already-existing user data. Bright light therapy guidance and the core
wake/sleep retiming schedule are not gated and remain live, since they were
judged to carry substantially less liability than a specific personalized
drug dose.

## Appendix B: file reference index

| File                                             | What it contains                                                                                                                           |
| ------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------ |
| `src/lib/melatonin.js`                           | Regime classification, BLT timing, melatonin dosing — the core logic reviewed in Section 2                                                 |
| `src/lib/schedule.js`                            | Day-by-day wake/sleep retiming schedule (`computeIntervention`), including the 30-min/day rate and the two constants BLT timing depends on |
| `src/lib/ical.js`                                | User-facing text templates for BLT and melatonin, shown in calendar event descriptions; also home of the disclaimer string                 |
| `src/lib/server/email.js`                        | Daily check-in email body, which restates that day's bedtime/BLT/melatonin plan in short form                                              |
| `src/lib/components/DayCard.svelte`              | In-app display of each day's bedtime, wake time, BLT time, and melatonin dose/time                                                         |
| `src/routes/(main)/app/plan/+page.svelte`        | Opt-in toggle UI and copy for both bright light therapy and chronobiotics (melatonin), shown before a plan is generated                    |
| `src/routes/(main)/learn/circadian/+page.svelte` | General, uncited educational content on the two-process sleep model, shown earlier in onboarding                                           |
| `src/lib/featureFlags.js`                        | The single flag currently gating melatonin content off everywhere                                                                          |
