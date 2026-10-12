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

## shadcn/ui projects

Read components.json, aliases, tokens and installed source components. Use the
project's runner for the official CLI (`bunx --bun shadcn`, `pnpm dlx shadcn` or
`npx shadcn`). Inspect `info --json`, `search` and `docs <component>` before adding
something. Preserve the existing Radix or Base UI composition API and version.
Verify current commands and docs against the project's installed CLI.

Use semantic tokens and existing variants. Reuse Dialog/Sheet, Field/InputGroup,
Table, Empty, Skeleton, Alert, Badge and the existing toast implementation where
available. Do not rebuild interaction primitives as styled divs.

## Existing lint, then @shadcn/lint when applicable

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
