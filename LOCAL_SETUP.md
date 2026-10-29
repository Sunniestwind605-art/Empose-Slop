# PosePilot local setup

This package is intended to run locally. No deployment is required.

## Requirements

- Node.js 22 or newer
- pnpm 11

## Start the development server

From the project folder:

```powershell
pnpm install
pnpm dev
```

Open the local address printed by Vite. If port 5173 is available, it is normally `http://localhost:5173/Empose-Slop/`.

## Verify a production build locally

```powershell
pnpm test
pnpm typecheck
pnpm build
pnpm preview
```

The preview command prints a second local address. All pose recommendations, favourites and shoot-plan data stay in the browser; the application has no backend or upload service.

## Revised mannequin renderer

The shared SVG renderer is in `src/features/pose-viewer/PoseDiagram.tsx`. It uses one continuous torso/pelvis silhouette, overlapping Bézier surfaces for each arm and leg, matte neutral-grey materials, soft head modelling and restrained outlines. The same geometry is used for standing, bent-arm, crouched, seated and paired poses.
