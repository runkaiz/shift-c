# Shift — Circadian & Melatonin Science Note

**Version:** 1.0
**Date:** 2026-07-14
**Status:** Active. Supersedes the lost/never-existent note referenced in `src/lib/melatonin.js`. This note is the citable basis for the constants and logic inventoried in the review request. It is a _scientific and clinical-evidence_ foundation, not legal or regulatory advice, and not individualized medical advice for any end user.

**Revision history:**

| Version | Date       | Change                                                                                                        |
| ------- | ---------- | ------------------------------------------------------------------------------------------------------------- |
| 1.0     | 2026-07-14 | Initial green-field note. Backs all constants in Section 2 of the review request; answers open questions 1–9. |

---

## 0. How to read this note

Every implemented constant the review flagged is dispositioned here as **CONFIRM** (evidence supports it as-is), **CHANGE** (evidence contradicts it or a better value exists), or **UNSUPPORTED** (no evidence basis; keep only as an explicit, labelled engineering default or remove). A consolidated disposition table is in Section 10.

Two framing facts govern almost every judgment below, so they come first.

## 1. Two facts that constrain everything downstream

### 1.1 Melatonin has two separable actions, and the app must not blur them

Exogenous melatonin acts on sleep in two mechanistically distinct ways. The **chronobiotic** action shifts the phase of the central clock (the suprachiasmatic nucleus); it is time-of-administration dependent, described by a phase response curve (PRC), and builds over several days. The **hypnotic** (soporific) action is acute sleep promotion on the night of dosing; it is dose-dependent and largely local in time. The foundational human PRC papers open by naming both effects explicitly (Burgess et al. 2008; Burgess et al. 2010), and low-dose acute studies isolate the hypnotic effect on its own (Zhdanova et al. 1996, 2001).

This is why the module's separation of a _chronobiotic_ dose (advance/delay regimes) from a _hypnotic_ dose (extension regime) is conceptually correct and worth preserving. The failure mode to guard against is treating "more melatonin = more sleep = take before bed" as one lever; that collapses both axes and produces wrong timing for anyone whose actual problem is phase, not sleep opportunity.

### 1.2 The app anchors timing to clock time, but the biology is anchored to circadian phase — this is the deepest caveat

Both the light rules and the melatonin rules are computed from the user's _scheduled_ bedtime and wake time. The biology, however, responds relative to the user's **circadian phase** — operationally the dim-light melatonin onset (DLMO) for the evening reference and the core-body-temperature minimum (CBTmin, roughly 2–3 h before habitual wake) for the morning reference. The app approximates DLMO as bedtime − 2 h, which is a reasonable population average (Burgess & Eastman 2005; Sletten et al. 2010 report DLMO ≈ 2 h before bedtime), **but inter-individual variability in the DLMO-to-bedtime interval is large — up to ~5 h even under fixed schedules** (Wright et al. 2005, discussed in Sletten et al. 2010).

Why this matters, concretely: both the light PRC and the melatonin PRC have crossover points where the direction of the shift reverses. Light _after_ CBTmin advances; light _before_ CBTmin delays. For a substantially delayed sleeper — exactly the user most likely to reach for a circadian-shifting app — a "morning" light pulse timed 30 min after an _early scheduled_ wake can land _before_ their true CBTmin and push the clock the wrong way. The same reversal risk applies to a mistimed melatonin pulse. So clock-time anchoring is acceptable for near-normal-phase users and progressively less safe as the user's misalignment grows.

The reassuring counterweight, and the reason this is a caveat rather than a blocker: a 2024 randomized controlled trial in delayed sleep-wake phase disorder found that 0.5 mg melatonin timed by _estimated_ DLMO (5 h before actigraphic sleep onset) plus evening dim light and time-in-bed scheduling advanced circadian phase about as well as timing by _measured_ DLMO (Swanson et al. 2024). Estimation-based timing is therefore validated for the advance case. The honest position: the estimate is good enough on average, the tails are where it fails, and the product's confidence language (Section 6) should reflect that rather than implying per-individual precision the method doesn't have.

## 2. Regime classification (`melatonin.js:58-70`) — Q1, Q2

**The three-way split (extension / advance / delay) is sound in principle** because it maps onto the two-axis structure in §1.1: advance and delay are chronobiotic problems (the clock is in the wrong place), extension is a sleep-opportunity problem (the clock is fine, the window is too short). No published source defines these exact regimes — they are an engineering framework — but the framework is defensible.

**The 30-minute midpoint threshold (`REGIME_MIDPOINT_THRESHOLD_MINUTES`) is an uncited engineering heuristic, and that is acceptable, with one reframing.** There is no clinical literature that sets a "phase-shift vs. extension" cutoff at 30 min or any other value, so it cannot be _confirmed_ against a source — but it does not need a citation, because it is not a clinical claim. It is a routing decision. Thirty minutes is a reasonable floor: a midpoint move smaller than that is within the day-to-day noise of DLMO estimation and within a single day's retiming increment, so treating it as "no meaningful phase shift requested" is justifiable. Keep it, but label it in code as a product heuristic, not as implementing a cited figure.

**The "30–60 min gray zone" the code flags does not need a fourth bucket.** The cleaner fix is to stop treating extension and phase-shift as mutually exclusive at all (see Q2). A request that is mostly extension with a small phase component should get the extension handling for the duration part _and_ a small phase nudge — not be forced into one of two boxes.

**Q2 — folding "mixed" into a single advance-or-delay by net midpoint sign is the weakest part of the classifier, and I recommend decomposing it.** A request such as "advance bedtime 2 h, delay wake 1 h" is not really an advance _or_ a delay; it is a ~30-min midpoint shift (small chronobiotic component) plus a 3-h sleep _extension_ (opportunity component). These have different mechanisms and different rate limits, and the melatonin implications are opposite: the chronobiotic part might warrant a small timed dose, while the extension part warrants either a hypnotic dose or, more often, no drug at all. Collapsing to one regime forces one melatonin strategy onto a request that contains two independent problems.

Because the product constraint is "one regime chosen once for the whole protocol," the pragmatic recommendation is: compute `midpointShiftMinutes` and `durationShiftMinutes` separately (the code already computes both — `durationShiftMinutes` is currently exposed but unused), and drive **light/phase strategy from the midpoint component** and **melatonin choice from both**: chronobiotic dose only if `|midpointShift| ≥ threshold`, hypnotic handling (or nothing) for the duration component. This uses data the app already has and removes the false exclusivity.

**Q2-adjacent, and higher priority than either: the midpoint-sign instability under wraparound (`melatonin.js` third flagged limitation) is a correctness bug with a safety consequence, not a modelling nicety.** The advance and delay protocols are near-opposites — advance doses melatonin ~5 h before bed and puts light in the morning; delay doses at wake and puts light in the evening. If a wraparound edge case flips the computed midpoint sign, the app doesn't merely give a slightly-off plan — it drives light and (when enabled) melatonin at the _anti-phase_ time, which per the PRC crossover (§1.2) actively pushes the clock the wrong direction and can worsen misalignment. **Recommendation: this must be made deterministic before melatonin is ever enabled.** Resolve the intended shift direction from the sign of the _smaller-magnitude single-endpoint_ interpretation, or require both endpoints to agree on direction, or refuse to emit a plan when the direction is ambiguous. Getting the direction wrong is the single highest-consequence failure in the module.

## 3. Day-by-day retiming rate (`schedule.js`, 30 min/day) — Q6

**CONFIRM 30 min/day as a conservative, safe default, with two caveats.** The maximum phase shift achievable per day with optimally timed melatonin + bright light + schedule advance is on the order of ~1 h/day, and advances are harder to achieve than delays because the intrinsic human circadian period is slightly longer than 24 h (Revell, Burgess et al. 2006 reported ~1 h/day advances under a combined protocol). A 30-min/day plan sits comfortably inside that ceiling, so it will not ask the clock to move faster than it can — the safe direction to err.

Caveat one: the AASM clinical practice guideline made **no recommendation for prescribed sleep-wake scheduling as a standalone treatment**, citing insufficient evidence (Auger et al. 2015). So the retiming schedule should be understood and described as the behavioral scaffold that the light (and, if enabled, melatonin) adjuncts act through — not as an independently evidence-backed intervention on its own. The live product currently ships the schedule + light without melatonin, which is a defensible configuration, but the marketing claim "evidence-based way to shift your circadian rhythm" leans mostly on the _light_ evidence, not the scheduling evidence.

Caveat two: 30 min/day is applied symmetrically, but delays tolerate a faster pace than advances. Keeping it symmetric is an acceptable simplicity-for-safety trade; if you ever want to optimize, the asymmetry to exploit is "delays can go faster," never "advances can."

## 4. Bright light timing (`melatonin.js:72-98`) — Q3

**Direction is correct for all three regimes.** Morning light for advances and evening light for delays is the consensus position and is the more strongly evidenced of the two levers in this app: the AASM guideline positively endorses light therapy (with/without behavioral treatment) for circadian rhythm sleep-wake disorders (Auger et al. 2015), and the human light PRC establishes morning-advance / evening-delay directionality (Khalsa et al. 2003). Even ordinary indoor light shifts phase and suppresses melatonin in a dose-dependent way, with half-maximal effects near ~100 lux (Zeitzer et al. 2000), and short-wavelength (blue, ~460–480 nm) light is disproportionately potent (Lockley et al. 2003) — which is why the "keep evenings dim" copy for advances is well-founded.

**Advance = light at wake + 30 min: CONFIRM.** Placing light shortly after wake, on the advance-causing side of CBTmin for a near-normal-phase user, is correct. The residual risk is the anchoring problem in §1.2 for strongly delayed users; see Section 6 for how to handle it in copy.

**Delay = light at bedtime − 90 min (`EVENING_LIGHT_OFFSET_MINUTES`): the direction is right but the specific 90-min offset is UNSUPPORTED as a point value, and that's fine if relabelled.** There is no clean "X minutes before bedtime" figure in the literature for delay light; the effective principle is that bright light in the hours _before and around_ habitual bedtime produces phase delays, and that avoiding _morning_ light matters at least as much as timing the evening exposure. Field data show that even household-strength evening light (tens of lux) in the hours before bed delays DLMO by ~1 h over a week (Burgess & Eastman field study, _Photochem Photobiol_ 2014). So 90 min before bed is a reasonable, defensible placeholder — but it should be documented as a rounded default, and the user-facing emphasis for delays should be at least as strong on _avoiding morning light_ as on getting evening light, because the morning-avoidance side is where the leverage and the backfire-risk both live. The current delay copy does say "avoid bright light after waking," which is correct and should stay prominent.

**Extension = morning light for alertness only: CONFIRM, and the copy is exemplary.** The extension copy explicitly says this is for alertness and "not any phase-shift claim," which is exactly the right scientific framing — morning light for a pure-extension user is a wakefulness/consolidation aid, not a clock intervention.

**One structural recommendation for all light events:** the fixed 15-min calendar block is fine as a calendar artifact, but the product should communicate a _minimum effective exposure_ separately (the intervention literature typically uses 30–60 min of bright exposure, longer for lower intensities), so users don't read "15 minutes" as the clinical dose.

## 5. Melatonin dosing (`melatonin.js:100-135`) — Q4, Q5

### 5.1 Advance: 0.5 mg at bedtime − 5 h — CONFIRM (best-supported value in the module)

The citations in the code are correct, current, and appropriate. The derivation is sound: for 0.5 mg, maximum phase advances occur when the dose is taken 2–4 h before DLMO or 9–11 h before sleep midpoint (Burgess et al. 2010); DLMO ≈ bedtime − 2 h (Burgess & Eastman 2005); so bedtime − 2 h − 3 h (midpoint of the 2–4 h window) = bedtime − 5 h. This is not only internally consistent, it was **prospectively validated in 2024**: an RCT in DSWPD used 0.5 mg at 5 h before actigraphic sleep onset (estimated DLMO) plus evening dim light plus time-in-bed scheduling — essentially this app's advance protocol — and advanced circadian phase comparably to measured-DLMO timing (Swanson et al. 2024). Nothing here needs to change. 0.5 mg is also the dose for which the advance PRC is best characterized and which avoids the evening drowsiness and delay-zone spillover of 3+ mg (Burgess et al. 2010).

### 5.2 Delay: 0.5 mg at wake — CONFIRM, and here is the citation the code lacks

The delay rule currently has no citation, but it is backed by the _same_ paper already cited for advances: in the 0.5 mg PRC, the time for maximum phase _delays_ peaked soon after wake time (Burgess et al. 2010). So "0.5 mg on waking" for delays is evidence-based; add Burgess et al. 2010 as its citation. Two honest qualifications belong in the copy: the delay side of the melatonin PRC is _less sharply defined_ than the advance side (the 2010 paper describes the delay peak as "not as distinct"), and for delays **light is the stronger and better-evidenced lever** — which the current delay copy already says ("optional — light is the stronger signal for a delay"). That framing is correct; keep it.

### 5.3 Extension: 0.3 mg at bedtime − 45 min — dose CONFIRM, timing acceptable, but the premise is the weakest link

The **0.3 mg dose is well-chosen**: it is the canonical _physiological_ dose that raises plasma melatonin into the normal nocturnal range without overshooting, established across Zhdanova's work (Zhdanova et al. 1996 in healthy young adults; Zhdanova et al. 2001 restoring sleep efficiency in older insomniacs at 0.3 mg specifically). Physiological dosing avoids the next-day grogginess and supraphysiological carry-over of 3–5 mg.

The **45-min-before-bed timing is defensible but arbitrary** — it sits inside the standard 30–60 min pre-bed window for hypnotic use, but no single trial pins 45 min; Zhdanova used 30 min before bed for the sleep-efficiency result. Treat 45 min as a reasonable default, not a cited figure.

The real issue is the **premise**. The hypnotic/extension benefit of melatonin is small and population-dependent, and at 0.3 mg specifically it is contested. Meta-analysis across primary sleep disorders finds melatonin increases total sleep time by only ~8 min versus placebo (Ferracioli-Oda et al. 2013). The clearest extension benefits are in _older_ adults with reduced endogenous melatonin (Zhdanova et al. 2001; and prolonged-release melatonin / Circadin, licensed in Europe for primary insomnia in patients ≥55, improves sleep maintenance in that group) and in people sleeping at the _wrong circadian time_ (shift work, jet lag). In healthy younger adults sleeping in their biological night with intact endogenous production, exogenous melatonin has little receptor headroom to work with, and even the direct evidence at 0.3 mg is mixed — one middle-aged study found 1.0 mg but _not_ 0.3 mg increased total sleep time (Attenburrow et al. 1996).

**Recommendation for the extension regime: demote melatonin from a default to an optional, clearly-bounded suggestion, and lead with environment.** For the modal extension user (near-normal phase, wanting more sleep opportunity), the higher-leverage interventions are behavioral and environmental — consistent sleep window held for 1–2 weeks, darkness (blackout / mask), cool room, and removing the actual causes of early waking (morning light leakage, noise, phone). If a hypnotic dose is offered at all, 0.3 mg is the right dose, framed exactly as the current copy does ("for falling asleep, not for shifting your clock"), but it should not be presented as the primary answer to a sleep-opportunity problem.

## 6. Personalized point-dose vs. general range (Q7) — the pivotal recommendation

**Recommendation: do not present a computed point-value dose framed as personalized-to-the-individual. Show an evidence-based general range and a timing _window_, explain the mechanism, and route dose selection to "discuss with a clinician." Keep the schedule and light guidance personalized; de-personalize the drug dose specifically.**

Three reasons, in order of weight:

First, the personalization the app actually performs is _regime classification + schedule arithmetic_, not individualized pharmacological titration. The opt-in copy — "We'll pick the timing and amount that fits your plan — not the same for everyone" — reads as a claim of individualized dosing, but the "amount" is one of two fixed constants (0.5 mg or 0.3 mg) selected by regime, and the "timing" is an offset from a schedule the user typed in. That is real personalization of _timing bucket_, but stated as though it were personalization of _dose to physiology_, which the app does not and cannot do without measuring the individual's DLMO. This overclaims.

Second, the evidence underneath every dose here is population-level, from controlled laboratory studies (Burgess PRCs) and specific clinical populations (DSWPD, older insomniacs). Extrapolating a _precise_ personal mg-and-minute to an arbitrary general-wellness user, without DLMO measurement, without contraindication screening, and without clinical supervision, presents false precision. The 2024 RCT is reassuring that _estimated_-DLMO timing works on average (§1.2), but "works on average in a supervised DSWPD trial" is not "is the correct personal dose for this unscreened individual."

Third, the individual optimum genuinely depends on the person's DLMO, which the app estimates as bedtime − 2 h with population variability up to ~5 h (§1.2). A confidently stated single clock time is therefore more precise than the underlying estimate warrants for the tails of the distribution.

Concretely, for the enabled state I recommend: state the regime and _why_ (advance/delay/extension), give the mechanism, give a range and window ("chronobiotic use is typically ~0.5 mg taken in the several hours before your target bedtime; the exact dose and time that suit you should be set with a clinician"), and keep the schedule/light plan fully personalized since those carry far less liability than a specific drug dose (which the review notes was the reason melatonin, but not light, was gated off). Rewrite the opt-in line to drop "we'll pick the amount that fits your plan"; replace with language that personalizes _timing guidance_ and explicitly does not personalize _dose_.

## 7. Contraindication screening (Q8)

**The current reactive disclaimer is inadequate; require explicit exclusion screening _before_ any dosing content is shown.** A string appended _after_ "take {dose} mg now" that says "check with a clinician if you are pregnant, on other medications, or have a health condition" inverts the correct order — it instructs the action first and qualifies it second, so a user who stops reading at the instruction has already been told to dose.

Before surfacing any melatonin content, the product should screen out at minimum: pregnancy and breastfeeding; minors (under 18); and clinically relevant medication/condition interactions. Melatonin is metabolized largely by CYP1A2, so strong CYP1A2 inhibitors (e.g., fluvoxamine) sharply raise exposure; it has documented interactions and cautions with anticoagulants, immunosuppressants, anticonvulsants/seizure disorders, hormonal contraceptives, and it can affect glucose regulation (relevant for diabetes). Autoimmune conditions are a commonly cited caution. This note does not attempt an exhaustive interaction list — that belongs in the clinical/regulatory review — but the design principle is firm: screen first, show dosing content only to users who pass, and present the screen as a gate, not a footnote. Given the product is non-clinical and unsupervised, this gating is the main thing standing between "general wellness information" and "unsupervised drug-dosing instruction to a contraindicated user."

## 8. Jurisdiction (Q9)

**The note flags, for the downstream regulatory review, that the "general wellness supplement" framing is US-specific and does not hold universally.** Melatonin is available over-the-counter as a supplement in the United States, but in a number of jurisdictions it is regulated as a medicine and/or is prescription-only (for example, prolonged-release melatonin is a prescription product in the EU/UK, and several countries restrict melatonin sale). The scientific content of this note is jurisdiction-neutral, but the _product framing_ — that a user can simply obtain and self-administer melatonin — is not portable. I am deliberately not enumerating a country list; that must be verified against current regulations by the regulatory reviewer. The recommendation for the note and product is: do not assume OTC availability in copy, and surface a locale-appropriate "how melatonin is regulated where you are" checkpoint rather than a universal "pick some up" assumption.

## 9. Educational content (`learn/circadian`, §2.5)

The two-process explainer (circadian Process C + homeostatic Process S) is scientifically sound and the battery/charger analogy is a fair lay rendering. It makes no dosing or timing claims, so it does not create the same liability surface as the dosing content. For credibility and versioning hygiene, add the canonical citation for the model — Borbély (1982), updated in Borbély et al. (2016) — even though lay explainers don't strictly require it. The top-level "evidence-based way to shift your circadian rhythm" marketing claim is _defensible on the strength of the light + timed-melatonin evidence_ (AASM 2015; Burgess PRCs), but note that it leans on the light and melatonin evidence, not on the behavioral-scheduling evidence, which the AASM guideline found insufficient (Auger et al. 2015). If melatonin stays disabled, the claim rests almost entirely on the light evidence — still defensible, but worth knowing.

## 10. Disposition of every flagged constant

| Constant / rule                                     | Location                    | Verdict                                              | Basis                                                                                                        |
| --------------------------------------------------- | --------------------------- | ---------------------------------------------------- | ------------------------------------------------------------------------------------------------------------ |
| Regime split (extension/advance/delay)              | `melatonin.js:58-70`        | CONFIRM (framework)                                  | Maps to chronobiotic vs. hypnotic axes (§1.1)                                                                |
| 30-min midpoint threshold                           | `melatonin.js:15`           | CONFIRM as labelled heuristic                        | Routing choice, not a clinical claim (§2)                                                                    |
| "Mixed" folded into advance/delay by net sign       | `melatonin.js:41-52`        | CHANGE                                               | Decompose midpoint vs. duration using existing `durationShiftMinutes` (§2, Q2)                               |
| Midpoint-sign wraparound instability                | `melatonin.js`              | CHANGE (blocker)                                     | Wrong sign → anti-phase dosing; must be deterministic before enabling melatonin (§2)                         |
| 30 min/day retiming rate                            | `schedule.js:5`             | CONFIRM (conservative)                               | Inside ~1 h/day ceiling (Revell 2006); note scheduling alone is not independently endorsed (Auger 2015) (§3) |
| Advance light @ wake + 30 min                       | `melatonin.js:94-97`        | CONFIRM                                              | Light PRC / AASM (§4); anchoring caveat §1.2                                                                 |
| Delay light @ bedtime − 90 min                      | `melatonin.js:30`           | UNSUPPORTED as point value; keep as labelled default | Direction correct; specific offset not from a cited figure; emphasize morning-light avoidance (§4)           |
| Extension light (alertness only)                    | `melatonin.js:94-97`        | CONFIRM                                              | Framing already correct (§4)                                                                                 |
| Advance melatonin 0.5 mg @ bedtime − 5 h            | `melatonin.js:114-119`      | CONFIRM                                              | Burgess 2008/2010; Burgess & Eastman 2005; validated by Swanson et al. 2024 (§5.1)                           |
| Delay melatonin 0.5 mg @ wake                       | `melatonin.js:122-127`      | CONFIRM; add citation                                | Burgess 2010 (delay peak near wake) — currently uncited (§5.2)                                               |
| Extension hypnotic 0.3 mg                           | `melatonin.js:8`            | CONFIRM (dose)                                       | Zhdanova 1996/2001 physiological dose (§5.3)                                                                 |
| Extension timing bedtime − 45 min                   | `melatonin.js:25`           | Acceptable default, not cited                        | Within 30–60 min window; not a specific trial value (§5.3)                                                   |
| Extension _premise_ (melatonin as extension answer) | —                           | CHANGE emphasis                                      | Demote to optional; lead with environment/behavior (§5.3)                                                    |
| Personalized point-dose + opt-in copy               | `plan/+page.svelte:128-133` | CHANGE                                               | Show range + window, de-personalize dose, rewrite opt-in claim (§6, Q7)                                      |
| Reactive-only disclaimer                            | `ical.js:5-6`               | CHANGE                                               | Require exclusion screening before dosing content (§7, Q8)                                                   |
| OTC/"supplement" framing                            | product-wide                | CHANGE / flag                                        | Not jurisdiction-portable (§8, Q9)                                                                           |
| Two-process explainer                               | `learn/circadian`           | CONFIRM; add Borbély cite                            | Sound; citation is hygiene (§9)                                                                              |

## Bibliography

Attenburrow MEJ, Cowen PJ, Sharpley AL (1996). Low dose melatonin improves sleep in healthy middle-aged subjects. _Psychopharmacology_ 126:179–181.

Auger RR, Burgess HJ, Emens JS, Deriy LV, Thomas SM, Sharkey KM (2015). Clinical Practice Guideline for the Treatment of Intrinsic Circadian Rhythm Sleep-Wake Disorders: ASWPD, DSWPD, N24SWD, and ISWRD. An Update for 2015. _J Clin Sleep Med_ 11(10):1199–1236. (American Academy of Sleep Medicine.)

Borbély AA (1982). A two process model of sleep regulation. _Hum Neurobiol_ 1(3):195–204.

Borbély AA, Daan S, Wirz-Justice A, Deboer T (2016). The two-process model of sleep regulation: a reappraisal. _J Sleep Res_ 25(2):131–143.

Burgess HJ, Eastman CI (2005). The dim light melatonin onset following fixed and free sleep schedules. _J Sleep Res_ 14(3):229–237.

Burgess HJ, Molina TA (2014) [Burgess & Eastman group]. Home lighting before usual bedtime impacts circadian timing: a field study. _Photochem Photobiol_ 90(3):723–726.

Burgess HJ, Revell VL, Eastman CI (2008). A three pulse phase response curve to three milligrams of melatonin in humans. _J Physiol_ 586(2):639–647.

Burgess HJ, Revell VL, Molina TA, Eastman CI (2010). Human phase response curves to three days of daily melatonin: 0.5 mg versus 3.0 mg. _J Clin Endocrinol Metab_ 95(7):3325–3331.

Ferracioli-Oda E, Qawasmi A, Bloch MH (2013). Meta-analysis: melatonin for the treatment of primary sleep disorders. _PLoS One_ 8(5):e63773.

Khalsa SBS, Jewett ME, Cajochen C, Czeisler CA (2003). A phase response curve to single bright light pulses in human subjects. _J Physiol_ 549(3):945–952.

Lockley SW, Brainard GC, Czeisler CA (2003). High sensitivity of the human circadian melatonin rhythm to resetting by short wavelength light. _J Clin Endocrinol Metab_ 88(9):4502–4505.

Lewy AJ, Ahmed S, Jackson JM, Sack RL (1992). Melatonin shifts human circadian rhythms according to a phase-response curve. _Chronobiol Int_ 9(5):380–392.

Revell VL, Burgess HJ, Gazda CJ, Smith MR, Fogg LF, Eastman CI (2006). Advancing human circadian rhythms with afternoon melatonin and morning intermittent bright light. _J Clin Endocrinol Metab_ 91(1):54–59.

Sletten TL, Vincenzi S, Redman JR, Lockley SW, Rajaratnam SMW (2010). Timing of sleep and its relationship with the endogenous melatonin rhythm. _Front Neurol_ 1:137.

Zeitzer JM, Dijk DJ, Kronauer RE, Brown EN, Czeisler CA (2000). Sensitivity of the human circadian pacemaker to nocturnal light: melatonin phase resetting and suppression. _J Physiol_ 526(3):695–702.

Zhdanova IV, Wurtman RJ, Morabito C, Piotrovska VR, Lynch HJ (1996). Effects of low oral doses of melatonin, given 2–4 hours before habitual bedtime, on sleep in normal young humans. _Sleep_ 19(5):423–431.

Zhdanova IV, Wurtman RJ, Regan MM, Taylor JA, Shi JP, Leclair OU (2001). Melatonin treatment for age-related insomnia. _J Clin Endocrinol Metab_ 86(10):4727–4730.

Swanson LM, de Sibour T, DuBuc K, Conroy DA, Raglan GB, Lorang K, Zollars J, Hershner S, Arnedt JT, Burgess HJ (2024). Low-dose exogenous melatonin plus evening dim light and time in bed scheduling advances circadian phase irrespective of measured or estimated dim light melatonin onset time: preliminary findings. _J Clin Sleep Med_ 20(7):1131–1140. doi:10.5664/jcsm.11076. PMID 38445651. (Free PMC article.)

---

_This note provides scientific and clinical-evidence assessment to inform the Shift team's implementation and its separate legal/regulatory review. It is not medical advice for any individual and does not itself constitute regulatory clearance for the melatonin feature._
