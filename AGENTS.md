# PosePilot project instructions

PosePilot is a privacy-first, static photography pose coach. Keep all recommendations, questionnaire state, favourites, and shoot sessions client-side. Never add camera access, photo uploads, face analysis, analytics, accounts, server storage, or external AI calls.

- Use React, TypeScript, Vite, React Three Fiber, and small local data modules.
- Keep pose copy, scoring metadata, mannequin configurations, and animation keyframes linked by the same pose ID.
- Prefer semantic, keyboard-accessible controls and respect `prefers-reduced-motion`.
- The deployed Vite base is `/Empose-Slop/`; navigation must remain GitHub Pages-safe.
- Add only original or clearly licensed assets and record third-party assets in `ASSET_CREDITS.md`.
- Validate changes with `pnpm test`, `pnpm typecheck`, and `pnpm build`.

