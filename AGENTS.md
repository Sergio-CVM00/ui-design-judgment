# Repository instructions

This toolkit helps agents make contextual design decisions and support them with rendered evidence. Keep the portable skill self-contained. Reuse upstream guidance and existing tools; add glue only for evidence collection, scope and reporting.

- Use English for repository content. Preserve source licenses and pinned revisions.
- Existing product requirements and design systems outrank aesthetic defaults.
- Keep build authorization separate from read-only review. Never infer permission to redesign from a critique.
- Use Bun and the committed bun.lock. Node 22.13+ or 24+ is the supported runtime.
- Before delivery run `bun run lint`, `bun run test`, `bun run check` and Linux headless browser CI. Browser screenshots must be inspected; record judgment separately from machine checks.
- Work on a feature branch and deliver through a pull request after CI passes. Never push directly to main.
- Do not edit vendored upstream files. Run `python3 scripts/vendor_sources.py` to restore the pinned sources; changing pins needs license and behavior review.
- Do not claim general agent taste validation from synthetic geometry tests or a self-review. Behavioral calibration records must identify the evaluator and limits.
