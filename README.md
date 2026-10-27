# PosePilot

PosePilot is a privacy-first, browser-based photography pose coach. A guided questionnaire turns creative intent into ranked pose recommendations, then a detailed 2D pose blueprint demonstrates each pose and movement sequence.

Expected GitHub Pages URL: <https://Sunniestwind605-art.github.io/Empose-Slop/>

## What works

- Nine-step, mode-aware pose questionnaire with retained answers and sensible defaults.
- Weighted local recommendation engine using subject, primary/supporting moods, occasion, location, camera mode, framing, help areas, expressiveness, movement and optional props.
- 64 authored pose guides: standing, seated, portrait, pair, mirror-selfie and front-camera directions.
- Search, six library filters, active-filter chips, sorting and useful empty states.
- Detailed SVG pose blueprints with articulated shoulders, elbows, wrists, hips, knees, ankles, head and torso.
- Pose-specific joint configurations, pair placement, phone prop, seated and mirror context, three colour palettes, front/three-quarter/side views, joint labels, gaze arrows and weight guides.
- Real three-stage motion keyframes with play, pause and stage navigation; reduced-motion users get manual stages.
- Optional in-scene photographer/camera placement guide plus written height, angle, distance and composition cues.
- Dedicated mirror-selfie, front-camera and seven-expression coaching experiences.
- Persistent favourites and shoot-plan ordering in browser `localStorage`.
- Print-friendly and local JSON shoot-plan exports.
- Fast, accessible vector rendering with no WebGL requirement.
- Hash-based routing and `/Empose-Slop/` asset base for GitHub Pages.

## Stack

React 19, TypeScript, Vite, Three.js, React Three Fiber, Drei, Lucide and Vitest. The application is entirely static and has no backend.

## Local development

Requires Node.js 22+ and pnpm.

```bash
pnpm install
pnpm dev
```

Open the local URL shown by Vite. The following checks are used before deployment:

```bash
pnpm test
pnpm typecheck
pnpm build
pnpm preview
```

## How recommendations work

`src/features/recommendations/engine.ts` first enforces the relevant subject and camera-mode pool. It then applies explicit weights: subject and mode are strongest, followed by primary mood, movement and framing, then occasion, location, supporting moods, help areas, expression strength and props. A seeded two-point jitter varies equally suitable results without making tests nondeterministic. A short in-memory history avoids immediate repeats when alternatives exist.

Nothing is sent over the network. The interface never claims that a remote AI model is scoring the user.

## How the illustration system works

Each entry in `src/data/poses.ts` owns a complete `modelPose` with root position/rotation and rotations for the torso, head and limb joints. `src/features/pose-viewer/PoseDiagram.tsx` applies forward kinematics so the wrist follows the elbow, the elbow follows the shoulder, the ankle follows the knee and the knee follows the hip. The same structure is projected into readable front, three-quarter and side SVG views.

Dynamic poses add three authored `PoseKeyframe` objects with capture directions. The UI advances through them on each keyframe duration or lets the user pause and step manually. Pair poses include a second independent mannequin configuration.

## Privacy guarantees

PosePilot does not include webcam access, `getUserMedia`, uploads, face landmarks, face recognition, biometric processing, user accounts, analytics, advertising trackers, external recommendation APIs or server-side collection. Generic SVG demonstrations are not representations of the user.

The only persistence is optional browser `localStorage` for favourites, current answers and the shoot plan. **About & privacy → Clear my local data** erases all three.

## Adding a pose

1. Add a unique `SeedPose` to `src/data/poses.ts` with an original title, actionable body/hand/gaze cues and relevant metadata.
2. Choose the appropriate category, modes, subjects, framing and location tags.
3. For movement, set `movement` to `micro`, `walking` or `energetic`; the entry receives a three-stage local animation.
4. Run the tests. The suite checks IDs, completeness and uniqueness of mannequin configurations.

To extend the illustration system, keep the `MannequinPose` contract as the shared source of truth and map any new visual treatment to the existing joint names.

## Deployment

Vite uses `base: '/Empose-Slop/'`. `.github/workflows/deploy.yml` installs from the frozen pnpm lockfile, runs tests and type checks, builds `dist`, uploads it and deploys through GitHub Pages.

If the first workflow does not publish automatically, open **Settings → Pages**, choose **GitHub Actions** as the source, then rerun **Deploy PosePilot to GitHub Pages** from the Actions tab. A live URL should only be reported after that workflow succeeds and the published site is checked.

## Research and originality

The interaction model was informed by the public [Empose App Store listing](https://apps.apple.com/us/app/empose-aesthetic-poses/id6799978162), [Canon portrait-direction guidance](https://www.usa.canon.com/learning/training-articles/training-articles-list/posing-tips-for-successful-portraits), [Adobe hand and seated-pose guidance](https://www.adobe.com/creativecloud/photography/discover/sitting-poses-and-hand-poses.html), and the [official Vite GitHub Pages guide](https://vite.dev/guide/static-deploy). Pinterest was considered only as a category/discovery reference; no Pinterest or third-party photographic assets were copied.

