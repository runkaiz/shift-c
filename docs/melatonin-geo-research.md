# Melatonin geo-gate research — country regulatory status

**Status:** Research seed for `MELATONIN_ALLOWED_COUNTRIES`
(`src/lib/melatoninPolicy.js`). This is engineering-directed research, not a
legal opinion — every country below still needs confirmation from an actual
legal/regulatory reviewer before the allowlist changes. Nothing in this
document should be read as legal advice.

**Date:** 2026-07-14
**Requested by:** product, to inform the geo-gate described in
`docs/science-review-request.md` open question 9 ("Jurisdiction").

## 1. Why this exists

`POST /api/plans` (`src/routes/api/plans/+server.js`) only enables melatonin
dosing content for requests that geolocate (via Cloudflare's
`request.cf.country`) to a country in `MELATONIN_ALLOWED_COUNTRIES`
(`src/lib/melatoninPolicy.js`). That constant started as a conservative
placeholder — `['US']` — with the exact list explicitly marked TBD pending
legal review. This document is a first-pass survey of melatonin's retail
regulatory status country-by-country, intended to seed that review rather
than replace it.

**Current code state: `MELATONIN_ALLOWED_COUNTRIES = ['US']`.** This research
confirms that as the correct conservative choice — no country surveyed here
clears the bar for addition without a named regulator source and an actual
legal sign-off first.

## 2. Method

Five parallel research passes (one U.S.-verification pass plus four regional
sweeps — North America/Oceania, Western Europe, Southern Europe/Nordics, and
Asia/other major markets) retrieved information from official regulator
sites, primary legal/statutory text, and (where no official source was
reachable) secondary trade-press or pharmacy-industry reporting, explicitly
flagged as lower confidence. A cluster of low-quality AI-generated
"content-farm" sites (e.g. is-this-legal.com, legalclarity.org,
biologyinsights.com) surfaced fabricated or unverifiable "2026 regulation
change" claims for several countries (notably Japan) during this research —
these were checked against primary sources and rejected where unconfirmed;
see the Japan entry below.

## 3. Findings

### 3.1 Unrestricted OTC — matches the US model

| Country | ISO | Detail | Confidence |
| --- | --- | --- | --- |
| United States | US | Dietary supplement under DSHEA (1994); no federal dose cap; sold without prescription like a vitamin. | High |

### 3.2 Candidates — plausible but not confirmed; needs legal review before inclusion

| Country | ISO | Detail | Confidence |
| --- | --- | --- | --- |
| Canada | CA | Regulated as a Natural Health Product (NHP); requires an NPN; no prescription/pharmacist gate for adults, but licensed products are capped at ~10mg — a distinct licensing regime, not a pure DSHEA-style supplement. | Medium |
| Mexico | MX | Sold OTC as a "suplemento alimenticio" under the Ley General de Salud; no prescription, no therapeutic claims permitted; no formal numeric cap found. Also exists in parallel as a registered medicine. | Medium |
| India | IN | Marketed OTC as an FSSAI nutraceutical; no prescription; no formal schedule listing or dose limit confirmed. | Medium-low |
| Poland | PL | No prescription required, but sold as a registered OTC *medicine* (up to 5mg), not a free-sale supplement — closest of the EU countries surveyed to the US model, but still a distinct regime. | Medium-high |

### 3.3 Excluded — prescription-only, restricted medicine, or capped well below typical dosing

| Country | ISO | Status | Detail | Confidence |
| --- | --- | --- | --- | --- |
| Brazil | BR | OTC but hard-capped | ANVISA authorizes melatonin as a food supplement only up to **0.21mg/day**, adults 19+ — tighter than this app's own placeholder dose range (0.2–0.5mg). A trap for a naive "sold OTC" read. | High |
| United Kingdom | GB | Prescription-only | Prescription-only medicine (POM); reclassified from supplement to medicine by MHRA. | High |
| Ireland | IE | Prescription-only | POM under S.I. No. 540/2003; not permitted in food even at low dose. FSAI (2025-10-02): "melatonin is a prescription medication, is not authorised in food." | High |
| Germany | DE | Medicine (dose-independent) | Federal institutes (BfArM/BfR) hold melatonin is a medicine requiring approval regardless of dose, "even ... 0.1mg"; low-dose products are sold in a legally contested gray zone. | Medium |
| France | FR | OTC with cap | Food supplements permitted below 2mg/day (ANSES); ≥2mg is a medicine. | High |
| Netherlands | NL | Contested/gray | ≤0.3mg treated as supplement by regulators; courts have ruled dose alone can't reclassify a product, leaving 0.3–5mg a live gray area. | Medium |
| Spain | ES | OTC with cap | Supplements capped ~1.9mg; ≥2mg is a medicine (AEMPS withdrew a 3mg supplement in 2021). | High |
| Italy | IT | OTC with cap | Supplement cap cut to 1mg/day by a 2013 health-ministry decree; unconfirmed whether a later increase occurred. | Medium-high |
| Sweden | SE | OTC medicine, indication-limited | Since autumn 2020, a non-prescription version is sold in pharmacies but only for short-term jet lag; chronic/insomnia use remains prescription. | Medium |
| Norway | NO | OTC with cap | Since 2020-01-01, up to 1mg/day sellable as a supplement; ≥2mg requires prescription. | High |
| Australia | AU | Prescription/pharmacist-only | S4 (prescription) by default; narrow S3 pharmacist-only carve-outs (2mg MR for 55+, 5mg IR for jet lag 18+). Not sold as a general-sale supplement. | High |
| New Zealand | NZ | OTC medicine, indication-limited | As of 2025-10-10, sellable to adults 18+ without consultation for short-term insomnia, but still a regulated medicine with dose/pack/indication caps (3mg IR / 2mg MR) — not an unrestricted supplement. | Medium-high |
| Japan | JP | Pharmaceutical | Regulated as a drug under the PMD Act; not a permitted food/supplement ingredient. **Note:** several low-quality sites claim a 2026 legalization of low-dose (≤2mg) melatonin as a supplement — this could not be verified against MHLW or any primary source and should be treated as false/unconfirmed. MHLW's actual 2023 working group only reviewed the classification; no reclassification has landed. | High |
| South Korea | KR | Prescription-only | Regulated as a hormone; POM under the Pharmaceutical Affairs Act. | Medium |
| China | CN | Restricted retail | Legal for retail only as a SAMR-registered "health food" product, not a free-sale supplement. | Medium |
| Singapore | SG | Prescription-only | Circadin 2mg is the only HSA-registered product, and it's POM; synthetic melatonin is not sold as an OTC supplement. | Medium |
| UAE | AE | Prescription/regulated | No OTC sale identified. | Low-medium |
| South Africa | ZA | Prescription | Circadin is Schedule 4 (prescription); some sources cite narrower pharmacist-only exceptions, but no free-OTC pathway found either way. | Low-medium |

### 3.4 Unresolved — thin/secondary sourcing only, not enough to classify

Denmark, Finland, Switzerland, Belgium, Austria, Portugal. Secondary sources
suggest patterns broadly similar to neighboring EU countries (low-dose
supplement allowance or prescription-only), but nothing here rests on a
primary regulator source. Needs a dedicated legal-review pass, not further
AI research, before any classification is relied on.

## 4. Recommendation

- **No change to `MELATONIN_ALLOWED_COUNTRIES` from this document alone.**
  It stays `['US']`.
- If jurisdiction expansion is prioritized later, **Canada, Mexico, India,
  and Poland** are the most plausible near-term candidates — each needs a
  named, current regulator source (Health Canada's NHP monograph, COFEPRIS,
  FSSAI, URPL respectively) confirmed by legal before being added.
- **Brazil is a specific trap to avoid**: "sold OTC" is true but misleading:
  its supplement cap (0.21mg/day) is tighter than this app's entire current
  dose range, so inclusion would require a country-specific dose override,
  not just an allowlist entry.
- Treat any secondary source claiming a recent (2025–2026) regulatory change
  with skepticism until checked against the relevant primary regulator —
  this research surfaced multiple fabricated claims of this kind (see §2,
  §3.3 Japan entry).

## Appendix: sources by country

Primary/official sources retrieved during this research, by country:

- **US:** FDA Dietary Supplements Q&A (fda.gov); NCCIH/NIH melatonin overview; CDC MMWR 2022 (mm7122a1) and 2024 (mm7309a5) on pediatric ingestion trends.
- **Canada:** Health Canada NNHPD "Melatonin – Oral" monograph; MedEffect Canada safety review (children/adolescents).
- **Mexico:** gob.mx/cofepris legal framework for food supplements; COFEPRIS transparency portal (supplement NOMs).
- **India:** FSSAI Compendium_Nutra (2021) and 2022 advisory.
- **Poland:** manufacturer/pharmacy listings (LEK-AM, Aflofarm Melabiorytm) — no single URPL/GIF regulator statement found; flagged as needing a stronger primary source.
- **Brazil:** ANVISA authorization notice (gov.br/anvisa, published 2021-10-15, updated 2022-11-04).
- **UK:** NHS.uk melatonin page; pharmaceutical-technology.com (MHRA reclassification context).
- **Ireland:** FSAI food alert 2025.53 (2025-10-02); S.I. No. 540/2003 (irishstatutebook.ie); Oireachtas parliamentary questions (2024-10-22, 2025-07-29).
- **Germany:** BfR statements on dose-independent medicinal classification, incl. a 2024 health-risk-warning document; BfArM's original 1996 position (via Ärzteblatt).
- **France:** ANSES recommendation (2018-04-11).
- **Netherlands:** NutraIngredients reporting on the 2016 Hague court ruling.
- **Spain:** AEMPS product-withdrawal notice (2021-07-02); AESAN conditions-of-use pages.
- **Italy:** NutraIngredients reporting on the 2013 Ministry of Health decree.
- **Sweden:** Läkemedelsverket non-prescription medicinal product page (JS-rendered, not fully extractable); SVT news reporting on OTC sales trends.
- **Norway:** DMP (Direktoratet for medisinske produkter) guidance; Store medisinske leksikon.
- **Australia:** Australian Pharmacist (S3/S4 scheduling detail); TGA news article on melatonin regulation.
- **New Zealand:** Medsafe reclassification notices (2025 and prior).
- **Japan:** peer-reviewed comparison of JP/US food-drug classification (J-STAGE); ChemLinked reporting on the MHLW 2023 working group.
- **South Korea, China, Singapore, UAE, South Africa:** secondary trade-compliance and regulator-adjacent sources only (HSA Singapore overview and RegAsk restricted-ingredients listing for Singapore; SAHPRA product information for South Africa) — treat as lower confidence pending a dedicated legal pass.

Full per-country source URLs and verbatim quotes retrieved during this
research are available in the session transcript if a deeper citation trail
is needed for legal review.
