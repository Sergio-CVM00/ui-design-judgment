# Reuse the product's system

Inspect package.json, the lockfile, component imports, tokens, existing screens
and Storybook before proposing a dependency. Preserve the framework, package
manager, backend and version constraints. A library is a means of implementation,
not an automatic reason to migrate the product.

1. Use the existing product component for the required behavior.
2. Use a supported variant or composition of those components.
3. If it is absent, check the selected library or registry.
4. Build a custom primitive only for a demonstrated gap; document its behavior,
   accessibility and ownership. Prefer extending the shared primitive to scattered
   caller overrides when the treatment belongs to the design system.

## Optional shadcn/ui and lint tools

Use these tools when the product already uses them or the authorized build selects
them. They are not prerequisites for this skill. Keep other component libraries and
lint systems when they already meet the product's needs; do not migrate a project
just to follow this guide. In read-only review, inspect existing configuration and
report gaps without installing packages or changing policies.

Select the two tools independently:

- **shadcn/ui:** reuse its source components, variants and blocks in compatible
  projects. It is not a requirement for non-web interfaces or other UI systems.
- **@shadcn/lint:** optional static policy enforcement for compatible Tailwind v4
  projects, including custom components without shadcn/ui. Check the current
  upstream runtime, parser and linter requirements before installing.
- **Neither:** continue with the project's components, lint and rendered checks.
  An unselected optional tool is not a failed check.

### Compose with shadcn/ui

Read components.json, aliases, tokens and installed source components. Use the
project's runner for the official CLI (`bunx --bun shadcn`, `pnpm dlx shadcn` or
`npx shadcn`). Inspect `info --json`, `search` and `docs <component>` before adding
something. Preserve the existing Radix or Base UI composition API and version.
Verify current commands and docs against the project's installed CLI.

Use semantic tokens and existing variants. Reuse Dialog/Sheet, Field/InputGroup,
Table, Empty, Skeleton, Alert, Badge and the existing toast implementation where
available. Do not rebuild interaction primitives as styled divs.

### Configure @shadcn/lint when selected

Run the project's lint first. The official
[@shadcn/lint](https://github.com/shadcn-ui/lint) can check component restyling,
raw colors and other declared design-system policies. Follow its
[SETUP.md](https://github.com/shadcn-ui/lint/blob/main/SETUP.md): register it with
the existing ESLint/Oxlint setup and preserve current policies. Installing a
plugin with no enabled rules proves configuration, not enforcement.

When selecting new rules is authorized, make the policy explicit and scope it:
component implementations need to style themselves; application consumers should
use variants. The repository's `examples/shadcn-lint/` demonstrates upstream
`no-raw-colors` on a deliberately limited fixture. It is not a universal preset.
See upstream documentation for Vue/Svelte parser and template coverage.

Source lint establishes code consistency within the plugin's supported paths.
Rendered inspection and interaction tests are still required. Record lint parser,
rule and discovery gaps instead of treating unsupported files as clean.

### Choose a policy, then verify it

Reuse existing policy first. In an authorized setup, select only rules supported
by the product's design decisions. These are options, not a mandatory preset:

| Need | Upstream rule | Example policy |
| --- | --- | --- |
| Preserve component appearance | `no-restyle` | Consumers use Button sizes instead of overriding internal padding |
| Use semantic colors | `no-raw-colors` | Use product theme tokens instead of one-off palette colors |
| Avoid arbitrary adjustments | `no-arbitrary-values` | Reject `p-[13px]` and use the selected spacing scale |
| Keep styles in the supported system | `no-inline-styles` | Restrict inline styles where the product permits this policy |
| Catch unavailable utilities | `no-unknown-classes` | Reject classes Tailwind cannot generate |
| Keep classes statically readable | `require-static-classes` | Avoid dynamically assembled class names the linter cannot inspect |

Consult the official [rules](https://github.com/shadcn-ui/lint/blob/main/docs/rules.md)
and [contracts](https://github.com/shadcn-ui/lint/blob/main/docs/design-systems.md).
Define what each component owns and what its callers may change. Scope consumer
restrictions separately from component implementations. Merge into the existing
lint configuration and command; respect its package manager and lockfile. Do not
replace configuration wholesale or disable findings merely to obtain a green run.

Validate selected rules with a known violation and an allowed alternative in the
actual project configuration, then run the project's lint command. Record the
plugin version, enabled rules, files inspected, command outcome and coverage gaps.
If a selected check cannot run, mark it unavailable rather than passed. Installing
the skill itself does not install shadcn/ui or the lint plugin in a target app.
The toolkit's development dependency tests its example integration only.

### Keep rendered verification

An allowed spacing token can still be wrong for the task. Valid components can
overflow with long content, misalign when errors appear, or compete for attention.
Reuse complete product patterns to reduce these mistakes, then inspect realistic
content, responsive widths and relevant interaction states with the existing
browser tests and [verification workflow](verification.md). Lint results support
coherence; they do not certify rendered geometry, accessibility or taste.

Reuse working component and lint configuration before consulting setup guides. Read
only the selected rule or component documentation needed for the current decision.
Confirm the available package runner before invoking CLI tools; Bun supports `bun x`
when a separate `bunx` executable is absent. Preserve full installation logs on disk
and surface their status and actionable errors instead of loading repeated warnings.
