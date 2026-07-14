// Prefer logical-property utilities (ps-/pe-/ms-/me-/start-/end-) over
// physical ones (pl-/pr-/ml-/mr-/left-/right-) so layout mirrors correctly
// under dir="rtl" (Arabic) without extra rtl: overrides.
module.exports = {
	content: ['./src/**/*.svelte', './src/**/*.css'],
	media: false,
	theme: {},
	variants: {
		extend: {}
	},
	plugins: []
};
