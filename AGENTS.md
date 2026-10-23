# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.

# UI convention

Tailwind 4 utility classes (`.btn-primary`, `.input`, `.label`, etc. in `src/app/globals.css`) for ordinary elements. shadcn/ui (`src/components/ui/`) only for complex primitives: Dialog, Table, Select/Command, Tabs, Badge, Toast. Do not let shadcn sprawl into a full component-library rewrite — it's here to save time on a few genuinely hard widgets, not to replace the hand-rolled system.

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
