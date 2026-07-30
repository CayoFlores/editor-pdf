# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project state

This is a Vue 3 + Vite + TypeScript project scaffolded from the standard `create-vue` template. It is currently unmodified from the scaffold: [src/App.vue](src/App.vue) still renders the default "You did it!" placeholder and no PDF-editing functionality has been implemented yet, despite the repo name. Do not assume any architecture beyond the scaffold exists until you check the current contents of [src/](src/).

## Commands

- `npm run dev` — start the Vite dev server with HMR.
- `npm run build` — type-checks (`vue-tsc --build`) and then builds for production (`vite build`), run in parallel via `run-p`.
- `npm run build-only` — production build without type-checking.
- `npm run type-check` — run `vue-tsc --build` alone.
- `npm run preview` — preview the production build locally.

There is no test runner, lint command, or formatter configured yet — don't assume `npm run lint` or `npm test` exist.

## Architecture notes

- Entry point is [src/main.ts](src/main.ts), which mounts [src/App.vue](src/App.vue) to `#app` in [index.html](index.html).
- Path alias `@` maps to `src/` (configured in both [vite.config.ts](vite.config.ts) and [tsconfig.app.json](tsconfig.app.json)) — use `@/...` imports for anything under `src/`.
- TypeScript is set up as a project-references build: the root [tsconfig.json](tsconfig.json) references [tsconfig.app.json](tsconfig.app.json) (app code, DOM lib, extends `@vue/tsconfig`) and [tsconfig.node.json](tsconfig.node.json) (Vite config itself). Because `.vue` files need type info `tsc` can't provide, type-checking must go through `vue-tsc`, not `tsc` directly.
- `noUncheckedIndexedAccess` is enabled in [tsconfig.app.json](tsconfig.app.json) — array/object index lookups are typed as possibly `undefined`.
- Vite dev tooling includes `vite-plugin-vue-devtools`, enabled in [vite.config.ts](vite.config.ts).
