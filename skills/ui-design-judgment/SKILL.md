---
name: ui-design-judgment
description: Create, critique or refine interfaces against their users, tasks and existing design system, reusing proven guidance and components and supporting judgments with rendered evidence. Use when contextual UI quality matters beyond geometry or lint.
license: MIT
---

# UI Design Judgment

Make deliberate design decisions and make them reviewable. Use the same Intend,
Design, Observe, Judge loop for implementation and review. Work within the user's
authorized mode: a review produces findings; a build or refinement may change UI.

## Intend

Record the audience, primary task, intended first focus, design system, constraints
and acceptance scope before evaluating the result. Separate confirmed requirements
from assumptions. Read the existing tokens, components, patterns and actual content.
Ask only when the missing answer materially changes the task or design authority.
Use [brief.md](references/brief.md) when a brief does not already exist.

Calibrate density and expression to the product. A claims console, consumer flow
and editorial page can require different compositions. Do not equate taste with
minimalism, whitespace, novelty, animation or a preferred font.

## Design

Connect hierarchy, grouping, rhythm, typography, color and state treatment to the
task. State the intended reading and action order. Use existing components and
variants first; follow [component-reuse.md](references/component-reuse.md).
For compatible projects, shadcn/ui and `@shadcn/lint` are optional tools: follow
[the selection and policy workflow](references/component-reuse.md#optional-shadcnui-and-lint-tools).
Reuse an existing system first; selecting one tool does not require the other.
In review mode, reconstruct observable decisions without inventing the author's
intent. Keep references as supporting examples, not a requirement to copy a look.

Load only the applicable existing guidance:

- General product composition and critique: the bundled
  [UX/UI Design Taste](references/upstream/design-taste/SKILL.md). Follow its
  relevant supporting references rather than loading them all.
- New visual identity or an explicitly authorized visual direction:
  [Anthropic Frontend Design](references/upstream/frontend-design/SKILL.md).
- Concrete interface conventions and implementation review:
  [Vercel Web Interface Guidelines](references/upstream/web-interface-guidelines/command.md).

Resolve conflicts through explicit product requirements, the existing design
system, applicable accessibility requirements, then contextual guidance. Record
the reason for a material exception. Stylistic defaults are not universal gates.
See [sources.md](references/sources.md) for attribution, pins and source boundaries.

## Observe

Inspect the actual rendered interface at the declared routes, sizes and states.
Exercise the primary task and relevant focus, loading, empty and error states.
Reuse project tests, lint, Storybook and browser tooling. Collect screenshots,
check results and, where useful, traces. Playwright and axe are evidence tools;
lint cannot inspect pixels, and screenshots cannot prove every interaction.

Use [verification.md](references/verification.md) for the minimal adapter. Its
screenshots must be visually opened and examined. Do not approve from source code,
from filenames, from an approved baseline alone, or from a green automated scan.
Record unavailable checks and missing coverage explicitly. Respect the host's
isolated QA route; do not use a personal browser as a fallback.

## Judge

Compare the observed result with the recorded intention. Examine hierarchy,
composition, rhythm/density, consistency and refinement. For each material finding
provide the observed evidence, effect on the user's task, proposed correction and
how that correction will be verified. Distinguish measured facts from visual
judgments. Prefer a concrete comparison to an aesthetic score.

Report three dimensions independently:

- Correctness: the applicable interaction, accessibility and layout checks.
- Coherence: consistency with product patterns, tokens, components and hierarchy.
- Taste: contextual judgment about how effectively the composition serves its task.

Use [review-template.md](references/review-template.md) and the optional
[report schema](references/review.schema.json). A blocker needs a demonstrated
impact on an agreed requirement or the primary task. An aesthetic preference alone
is advisory. Scope approval to inspected evidence; unreviewed taste or missing
required evidence remains partial. An agent judgment is not proof of user outcomes.

In build/refinement mode, fix the consequential findings, observe the changed
result and verify the affected behavior. Stop when the agreed scope is acceptable;
if a remaining problem requires wider authority or unavailable evidence, report
it. In review mode, return the critique without changing the interface.

For testing this skill itself, use [calibration.md](references/calibration.md).
Keep expected findings separate from the evaluator's inputs and record evaluator
identity, evidence, misses and limits. Passing a schema is not passing this test.
