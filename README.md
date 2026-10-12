# UI Design Judgment

Help an agent decide whether an interface serves its users and explain that
judgment with actual rendered evidence.

**Intend -> Design -> Observe -> Judge -> refine when needed.**

The same contract supports building, reviewing and refining UI. It records the
task before critique, reuses the product's components and design system, inspects
the rendered result, and separates automated correctness from contextual judgment.
There is no universal aesthetic score, provider dependency or orchestration service.

## What is reused

| Existing capability | Role here |
| --- | --- |
| UX/UI Design Taste | Product hierarchy, composition, density and critique |
| Anthropic Frontend Design | An authorized, intentional visual direction |
| Vercel Web Interface Guidelines | Concrete interface conventions |
| Existing components, shadcn/ui and project tokens | Compose instead of rebuilding primitives |
| Existing lint and optional @shadcn/lint | Enforce the project's selected design-system policies |
| Playwright and axe | Exercise declared states, capture pixels/traces and run applicable checks |
| JSON Schema and Ajv | Verify the scope and consistency of an evidence-backed review |

The three guidance sources are bundled unmodified at pinned revisions, with their
licenses. Read [source attribution](skills/ui-design-judgment/references/sources.md)
and [sources.lock.json](sources.lock.json). The contribution is their contextual
use, component reuse workflow and evidence contract, with small executable adapters.

## Install the portable skill

Use your existing skill installer:

```sh
npx skills add Sergio-CVM00/ui-design-judgment --skill ui-design-judgment
```

Or copy `skills/ui-design-judgment/` into the skill directory supported by your
agent. The directory includes all its guidance, upstream references, schemas and
scripts. Invoke it with `$ui-design-judgment` or your harness's equivalent.
No account, provider API key or background service is required.

Example build request:

> Use ui-design-judgment to build this order-resolution view. Prioritize unresolved
> orders, reuse our current components and tokens, inspect desktop and mobile,
> and report correctness, coherence and taste with evidence.

Example review request:

> Use ui-design-judgment to review this dashboard without editing it. The primary
> task is revenue monitoring. Inspect the declared routes and states, justify
> findings against that intention and identify missing evidence.

## Optional shadcn/ui + lint workflow

When a project uses or selects shadcn/ui, the skill reuses its components, variants
and blocks. For compatible Tailwind v4 projects, `@shadcn/lint` can enforce selected
component and token policies, including in projects without shadcn/ui. Both tools
are optional; existing design systems remain the starting point.

Follow the portable [selection, setup and verification guide](skills/ui-design-judgment/references/component-reuse.md#optional-shadcnui-and-lint-tools).
It covers rule selection, consumer contracts, scoped evidence and rendered-review
limits. Installing this skill does not install either tool in the target app.
The repository's lint fixture tests one selected rule, not a complete UI policy.

Example request:

> Use ui-design-judgment with our existing shadcn/ui components. Configure
> @shadcn/lint to protect component styling and semantic tokens, preserve our
> existing lint setup, and verify the rendered form with realistic error states.

## Run the optional adapters

Node 22.13+ or 24+ and Bun 1.4.1 are used by this repository. Respect the target project's
package manager and isolated QA route when using an installed skill.

```sh
bun install --frozen-lockfile
bun run lint
bun run test
bun run check
bunx playwright install --with-deps chromium
bun run test:browser
```

For an app that already has a QA runner, reuse it. Otherwise adapt
[examples/inspect.json](examples/inspect.json), start the app in its authorized
test environment, and collect a new run:

```sh
bun run inspect -- --config examples/inspect.json
bun run validate-report -- --report /path/to/review.json
```

The example points to the synthetic fixture server, which can be started in a
second terminal with `node tests/server.mjs`. Stop that server when finished.
Use the app's actual URL, readiness selector, revision, states and checks for a
real review. The capture command writes screenshots, traces, axe output and hashes;
open the images, judge against the brief and write the review. Capture completion
does not produce design approval.

An installed skill resolves runtime dependencies from the QA project:

```sh
node /path/to/ui-design-judgment/scripts/cli.mjs inspect \
  --config /path/to/inspect.json --project /path/to/qa-project
```

See [verification and exit codes](skills/ui-design-judgment/references/verification.md),
the [brief](skills/ui-design-judgment/references/brief.md),
[component reuse](skills/ui-design-judgment/references/component-reuse.md),
the [review template](skills/ui-design-judgment/references/review-template.md) and
[review schema](skills/ui-design-judgment/references/review.schema.json).

## What approval means

| Dimension | Basis | Limit |
| --- | --- | --- |
| Correctness | Applicable interaction, accessibility and layout checks | Limited to the recorded checks, states and environment |
| Coherence | Existing patterns, tokens and components plus rendered comparison | Requires product context and code/render inspection |
| Taste | Justified hierarchy, composition, rhythm and refinement for the task | Contextual judgment, not objective aesthetic proof |

Every finding connects observation, user consequence, correction and verification.
Required unavailable checks, missing screenshots, missing scope or unreviewed
taste cannot yield a complete pass. Evidence hashes check artifact integrity, not
the truth of a reviewer's interpretation. A contextual task failure may block;
an aesthetic preference alone remains advisory.

## Verification and limits

CI tests the upstream shadcn lint integration, evidence/report safeguards,
standalone skill portability, rendered alternatives, mobile layout, a real click
state and seeded geometry failures. It retains screenshots and traces as artifacts.
The accessibility adapter uses axe's supported automated rules and Chromium.
It does not establish complete accessibility, other browser engines, native UI,
all clipping/overlap or user-study outcomes.

[Behavioral calibration cases](evaluation/README.md) test contextual judgment
beyond geometry. Independent model evaluation remains **pending**; the repository
does not claim that green tests prove a model has good taste. Compare actual
evaluator findings with withheld expected findings before making that claim.
The [rendered self-review](evaluation/self-review-2026-10-12.md) provides six actual
screenshots and a scoped report that remains partial where evidence is missing.

## Contribute

Open an issue with the product intention, a reproducible case and scoped evidence.
Preserve good existing behavior. Prefer upstream capabilities over new checkers
or component libraries. Run the commands above and deliver changes through a PR.
Use `python3 scripts/vendor_sources.py` to restore pinned source files; source
updates need revision, license and contextual-behavior review.

Original toolkit code and instructions: MIT. Bundled upstream files retain their
MIT or Apache-2.0 terms. No upstream endorsement is implied.
