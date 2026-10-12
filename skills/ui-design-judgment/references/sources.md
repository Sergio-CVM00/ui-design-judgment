# Sources and boundaries

The contribution is the contextual decision/evidence contract, selective routing,
component reuse workflow, scope-aware capture and honest review reporting. The
toolkit reuses these upstream sources instead of rebuilding an aesthetic manual:

| Source | Bundled revision | License | Use |
| --- | --- | --- | --- |
| [UX/UI Design Taste](https://github.com/arez-xd/ux-ui-design-taste) by Adam Reznik | a5c03fb6ac2b6b42f8f183d8514e30e9d032062c | MIT | General product composition and critique |
| [Anthropic Frontend Design](https://github.com/anthropics/skills/tree/main/skills/frontend-design) | dbd4588f9e1033efb41dad4bef2f7947c8993d44 | Apache-2.0 | Authorized aesthetic direction |
| [Vercel Web Interface Guidelines](https://github.com/vercel-labs/web-interface-guidelines) | 434b7f91364665f2f733b310ec54809bf8f37937 | MIT | Concrete interface conventions |

These bundled files are unmodified, with their original license files. See the
repository's sources.lock.json for file hashes and exact source URLs. Apache
licensed files retain their license; the repository's MIT license applies to our
original contribution and does not replace third-party terms. No upstream
endorsement or collaboration is implied. Updates are reviewed and pinned, not
silently downloaded during an agent task.

The source guidance contains opinions and simplifying rules. For example,
Frontend Design favors sentence case while the Vercel checklist specifies title
case. The product's established copy style resolves that difference. Motion-only
transform/opacity rules and component sizing defaults are useful guidance rather
than substitutes for platform requirements or measured behavior.

Official runtime and integration references (linked, not vendored):

- [shadcn/ui](https://ui.shadcn.com/docs) and
  [@shadcn/lint](https://github.com/shadcn-ui/lint), inspected at lint revision
  9a55f6d1b3fc78e6342c39c26cb6093342fd1b67; npm versions are pinned in bun.lock.
- [Playwright assertions](https://playwright.dev/docs/test-assertions),
  [screenshots](https://playwright.dev/docs/screenshots),
  [traces](https://playwright.dev/docs/trace-viewer) and
  [accessibility testing](https://playwright.dev/docs/accessibility-testing).
- [axe-core](https://github.com/dequelabs/axe-core) and
  [Ajv](https://ajv.js.org/) for existing accessibility analysis and JSON Schema.

OpenDesign, Figma, React Grab and other project-selected tools can supply design
or rendered context. They are optional adapters, not approval authorities. Do not
install an orchestration framework or require a provider account to use this skill.
