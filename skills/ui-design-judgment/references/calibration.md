# Test judgment, not eloquence

Use the cases in the repository's `evaluation/cases.json` and capture their
fixtures in an isolated headless browser. Give the evaluator this skill, a case's
brief and the actual rendered evidence. Keep expected-findings.json out of that
context. Do not reveal defect flags, the preferred answer or the implementation's
self-review. Randomize alternatives for a comparison when practical.

Evaluate whether the agent:

- Identifies the intended first focus and primary task.
- Locates consequential problems in real evidence and explains their effect.
- Preserves good dense layouts when the task calls for density.
- Respects the existing system rather than proposing its own preferred look.
- Changes its assessment when the same composition serves a different brief.
- Proposes a fitting correction and its verification without exceeding authority.
- Reports missing evidence and distinguishes judgment from facts.

Record evaluator/model identity, date, skill revision, cases, artifacts, actual
findings, expected findings found/missed, false positives and uncertainty. A human
can adjudicate disagreements. One reviewer agreeing with another is not a user
study. Repeated cases and different products are needed before generalizing.

Automated fixture checks verify the collector and demonstrate that mechanically
valid alternatives can differ contextually. They do not verify agent taste. Do
not publish an empty or hand-filled evaluation record as a completed independent
run. This repository starts with an explicit pending independent evaluation.
