// Central switch for features that are temporarily disabled pending review.
// Every place that decides melatonin eligibility or renders melatonin
// content must gate on this flag rather than trusting user input or stored
// D1 data directly, so flipping it back on later is a single-line change.
export const MELATONIN_FEATURE_ENABLED = true;
