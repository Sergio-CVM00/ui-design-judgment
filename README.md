# UI Design Judgment

![An original design workbench illustration: interface sketches, a composed dashboard and a magnifying glass inspecting visual hierarchy.](docs/images/design-judgment.png)

<sub>Original artwork created with OpenAI ImageGen for this project. Conceptual illustration, not a product screenshot.</sub>

Help an agent decide whether an interface serves its users and explain that
judgment with actual rendered evidence.

**Intend -> Design -> Observe -> Judge -> refine when needed.**

The same contract supports building, reviewing and refining UI. It records the
task before critique, reuses the product's components and design system, inspects
the rendered result, and separates automated correctness from contextual judgment.
There is no universal aesthetic score, provider dependency or orchestration service.

## Start here: use it with your agent

You need the portable skill, not a new agent framework. Your agent keeps its model,
normal tools and project workflow.

### 1. Install or point to the skill

With a compatible skill installer:

```sh
npx skills add Sergio-CVM00/ui-design-judgment --skill ui-design-judgment
```

Alternatively, clone this repository and tell your agent to read
`skills/ui-design-judgment/SKILL.md`, or copy the entire `skills/ui-design-judgment/`
directory into the skill location supported by your harness. Keep its references
and scripts together. This path-based approach also works when your harness does
not provide a skill installer.

### 2. Give it a concrete task

Replace the bracketed details and paste one of these prompts into your agent.
Use `$ui-design-judgment` where supported; otherwise include the skill's file path.

**Build or improve an interface**

```text
Read /path/to/ui-design-judgment/skills/ui-design-judgment/SKILL.md.
Build [screen] for [user]. Their main task is [task].
Reuse this project's components, tokens and existing design system.
Implement it, inspect the rendered desktop and mobile states, fix relevant
problems, and report what passed, failed or was not checked.
```

**Review without changing code**

```text
Read /path/to/ui-design-judgment/skills/ui-design-judgment/SKILL.md.
Review [route or screen] without editing it. The user needs to [task].
Inspect desktop, mobile and [important states]. Explain each material issue
with evidence and its effect on that task. Separate measured failures from
visual judgment, and state what you could not verify.
```

Want shadcn/ui and lint for a compatible new project? Add:

```text
Use shadcn/ui components and configure @shadcn/lint for the selected token
and component policies. Verify that a deliberate violation fails, remove it,
and check the final rendered result. Preserve existing project configuration.
```

### 3. Review the evidence

Expect a short explanation of the intended hierarchy, actual screenshots, relevant
check results and remaining limitations. Lint alone cannot approve the design.
The agent should read reference sections as needed, not load every bundled guide.

The skill needs no provider API key or background service of its own. Your coding
agent and application still use their normal setup. Browser inspection requires a
working, authorized browser test environment; unavailable checks must be reported.
Installing this skill does not install shadcn/ui, lint or Playwright in your app.
The adapters below are optional: reuse your project's existing checks first.

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
