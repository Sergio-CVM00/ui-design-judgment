# Evidence adapters

Prefer the product's existing Playwright suites, Storybook stories, lint,
accessibility tests and visual comparison setup. Add the smallest missing check.
The included CLI is optional glue for a project without a durable capture path.

## Stable browser verification

For a new local UI, prefer a completed production build served by the project's
preview/static server for final checks. Rebuild after source changes. Keep test
reports, screenshots and traces outside watched source directories. If a dev server
is necessary, exclude evidence directories from its watcher and wait for updates
to settle before interacting. Artifact writes must not trigger page reloads.

When a check fails, distinguish a product defect from unstable test infrastructure.
Inspect the first useful error, trace or navigation event; reproduce one failing
case at one viewport before rerunning the matrix. Detached elements, unexpected
navigation and destroyed execution contexts warrant checking reloads and server
lifecycle before changing the application. Increase a timeout only when observed
latency justifies it; do not replace failures with forced clicks or weaker checks.

Once repaired, rerun affected coverage and inspect fresh screenshots. Avoid another
full run after acceptance passes unless a change or unresolved concern warrants it.
Keep full logs on disk. For a passing build, lint or typecheck, report exit status
and a short tail (for example, the last 12 lines); do not reopen the complete log.
Inspect new warning categories once with bounded searches. On failure, read the
first actionable error and its surrounding context, expanding only as needed. A green check never
replaces visual critique, keyboard checks or an honest coverage statement.

## Inspect without duplicate visual reads

Capture every required surface and run functional assertions across the declared
matrix. For visual review, open the base composition at each required width, then
the changed or highest-risk states (for example a long-name mobile dialog, empty
state and alternate chart). Reuse a capture already inspected when its pixels have
not changed. After a local correction, inspect the affected viewport/region first;
reopen other captures if the change can affect them. Expand the review whenever a
layout, interaction or uncertainty warrants it. A contact sheet is only an overview;
inspect full-resolution text and controls when judging legibility. State exactly
which captures were visually reviewed and which states were only machine checked.
Do not reduce required coverage or hide an unreviewed state behind a green test.

## Capture an explicit scope

Install the runtime dependencies in the environment that owns QA, using that
project's package manager: `@playwright/test`, `@axe-core/playwright` and `ajv`.
Install Playwright's matching Chromium build there. This toolkit never launches
a personal browser, installs dependencies or changes a project's configuration
automatically. A browser already installed for another version may be incompatible.

From the repository: `bun run inspect -- --config examples/inspect.json`.
From an installed skill: `node /path/to/ui-design-judgment/scripts/cli.mjs inspect
--config /path/to/inspect.json --project /path/to/qa-project`.
Dependencies resolve from `--project` (default: current directory), which makes
the copied skill independent of this repository. Config-relative `outputDir` paths
resolve relative to the config, not the shell directory. Existing output directories
are rejected so previous evidence cannot be overwritten accidentally.

The JSON config declares a build, surfaces, URL, viewport, state, readiness
selector, optional interaction steps and checks. Each surface has a stable id.
Use local/staging routes already authorized for QA. Review captures may perform
read-only navigation; clicks, form submissions or state changes need the task's
scope to cover them. This is not a crawler or a login/session manager.

Supported checks use Playwright directly: visible, in-viewport, text, CSS,
horizontal document overflow and declared alignment using locator bounding boxes.
Alignment requires a product-specific axis and tolerance. It does not establish
optical alignment. The overflow check does not detect all clipping or intended
scroll containers. There is no mandatory dependency named "Playwright Layout
Checker"; use an already selected layout tool if the project has one.

The adapter saves screenshots, Chromium traces, axe results and check observations,
with SHA-256 hashes in capture.json. Navigation, browser or capture failures remain
partial. Axe scans the rendered DOM state using WCAG 2 A/AA and 2.1 AA tags; it
cannot prove complete accessibility. Inspect keyboard, focus, reading order and
task behavior with appropriate tests and assistive technology where applicable.

CLI exit codes: 0 = capture completed (not design approval), 1 = confirmed check
findings, 2 = partial capture or configuration/runtime error. Coherence and taste
are never automatically approved by capture. Do not update visual baselines solely
to make a test pass; verify why the difference is acceptable first.

## Review and validate

Open the screenshots and inspect the relevant trace/interaction evidence. Write
the contextual critique in review-template.md or review.schema.json format.
Use `bun run validate-report -- --report /path/to/review.json` or the installed
skill's CLI with `--project`. Evidence paths are relative to the report and hashes
must match. Validation checks declared scope, required checks, evidence references
and artifact integrity. It verifies the report's consistency, not whether the
evaluator saw the image or made a good design judgment.

Exit codes: 0 = complete pass; 1 = findings/fail; 2 = partial or invalid report.
Every scope surface needs a screenshot for complete approval. A required check
unavailable, unreviewed taste or missing scope keeps the review partial. Choose
required checks from the intention and risk; optional evidence is not a substitute
for required checks. Purely aesthetic preferences are advisory, while a contextual
judgment about a primary-task failure can be a blocker with a concrete rationale.
