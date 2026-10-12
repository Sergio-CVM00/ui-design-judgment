# Rendered implementation self-review - 2026-10-12

This is an implementation self-review with access to the expected findings, not
an independent or blinded model evaluation. The evaluator is the Codex agent that
implemented the toolkit. The six committed screenshots came from isolated Linux
Chromium CI, not a personal browser or physical desktop. Their capture revision,
source run and SHA-256 hashes are recorded in [manifest.json](evidence/manifest.json).

Scope: a/b/c/d desktop at 1280x900, b mobile at 390x900, and the opened review
queue state at 1280x900. Only these synthetic views were visually inspected.
The browser suite separately exercised a click and inspected seeded overflow
and alignment failures. Keyboard/focus behavior, other browser engines and user
task completion were not verified by this review.

## Revenue monitoring

[View a](evidence/a-desktop.png) gives four metrics similar card and numeric
weight. Revenue's heading wraps while other metric headings fit on one line.
The repeated metrics compete as reading anchors. This is a contextual concern
for a brief that asks the owner to locate revenue and its change first.

[View b](evidence/b-desktop.png) gives revenue a full-width first row and a larger
number, with its monthly change beside the supporting label. That composition
more clearly expresses the stated financial priority. The machine checks pass
for both alternatives; this judgment comes from the visible hierarchy and brief.
It does not establish actual eye tracking or faster human task completion.
Under an order-resolution brief, those same pixels put a large summary metric
before the actionable queue. The recommendation would change to prioritize the
queue; the financial composition does not become universally bad.

## Operational density

[View c](evidence/c-desktop.png) puts the actionable queue before supporting
totals and exposes eight rows at a readable text size. Preserve that density for
an operator scanning exceptions throughout the day. Increasing metric sizes or
adding whitespace indiscriminately would push actionable rows farther down.

The first rendered inspection also found incidental fixture defects: additional
age values rose from 1 to 5 hours after a 6-hour row, despite the urgency-order
caption, and singular age copy said `1 hours`. Issue #9 corrected these to
descending ages and `1 hour`; Playwright now checks the relevant rendered values.
The committed screenshot records the corrected fixture.

## System coherence

[View d](evidence/d-desktop.png) changes the declared sans-serif system to serif,
navy actions to purple and modest card edges to thick rounded outlines. Those
changes conflict with this case's explicit product system even though the
captured geometry and automated accessibility checks pass. Restore the existing
tokens and typography for this brief. Another product brief could justify those
same visual choices; purple or serif type is not a universal defect.

## Mobile and interaction limits

[Mobile b](evidence/b-mobile.png) preserves the dominant revenue metric and keeps
the two-column supporting metrics within the viewport. The last metric leaves a
half-empty row; this is a refinement opportunity rather than proof the view fails
its financial task. Table cells wrap heavily at this size. Validate scanning with
representative mobile usage before deciding whether the table needs another
presentation. The screenshot alone cannot establish usability.

The [opened state](evidence/interaction.png) confirms that the queue-summary panel
renders after the button click. It appears near the bottom of the full-page
capture, so state feedback and discovery deserve closer interaction inspection.
The suite's text assertion does not establish focus movement, an announcement or
complete visibility of the feedback in the initial viewport.

## Evidence-backed report example

[revenue-review.json](evidence/revenue-review.json) shows a real scoped record
using committed screenshots, fixture source and captured check observations. It
intentionally remains **partial** because required keyboard/focus evidence is
unavailable. The validator checks its consistency and hashes; it does not endorse
the interpretation above or prove that an evaluator inspected the images.

Independent evaluation using withheld expected findings remains pending. This
example demonstrates how to make a critique reviewable without presenting a
self-review as general evidence that the skill improves model taste.
