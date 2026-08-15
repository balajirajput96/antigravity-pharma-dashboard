# Validation Notes

- Desktop verification, 15 August 2026: the protected dashboard loaded successfully after dependency optimization, with the safety panel and first-run controls visible. The first-import panel is intentionally hidden until a first import is pending.
- Mobile verification, 15 August 2026: the protected dashboard remains readable at 390 pixels wide, retaining the first-run controls and always-visible safety panel without horizontal overflow.
- First-import loading-state review, 15 August 2026: the isolated development preview showed the spinner, visible progress bar, safety-gated badge, and non-submission warning on both desktop and mobile. The panel stayed within the mobile layout without horizontal overflow.
- First-import completion review, 15 August 2026: the success notification presented the audited-lead, draft-ready, and safely-skipped counts plus clear Hindi-report and JSONL-audit availability on desktop and mobile. The isolated preview did not change live schedule or workspace data and was removed after inspection.
- First-import feedback verification: the shared regression tests confirm progress is restricted to an empty workspace, a refresh of an existing schedule cannot restart first-import feedback, and the completion notice can fire only for the first arriving run. The dashboard polls every 15 seconds only during that pending state, so no manual reload is required.
- Automated verification: all 10 Vitest tests and the TypeScript check passed after the first-import feedback update.
