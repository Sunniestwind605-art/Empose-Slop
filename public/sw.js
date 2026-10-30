const CACHE_NAME = 'posepilot-low-angle-v1';
const BASE_PATH = new URL(self.registration.scope).pathname;
const withBase = (path = '') => new URL(`${BASE_PATH}${path}`, self.location.origin).href;

const POSE_ASSETS = [
  'pose-guides/architectural-pause.jpg',
  'pose-guides/bag-swing.jpg',
  'pose-guides/city-stride.jpg',
  'pose-guides/distant-look.jpg',
  'pose-guides/editorial-01-lens-first-step.jpg',
  'pose-guides/editorial-02-paper-focus.jpg',
  'pose-guides/editorial-03-stairwell-trio.jpg',
  'pose-guides/editorial-04-bottle-lens-duo.jpg',
  'pose-guides/editorial-05-curbside-foreshorten.jpg',
  'pose-guides/editorial-06-street-recede.jpg',
  'pose-guides/editorial-07-tea-box-step.jpg',
  'pose-guides/editorial-08-ladder-thinker.jpg',
  'pose-guides/editorial-09-palm-block-duo.jpg',
  'pose-guides/editorial-10-face-cover-crouch.jpg',
  'pose-guides/editorial-11-corner-level-duo.jpg',
  'pose-guides/editorial-12-escalator-sprawl.jpg',
  'pose-guides/editorial-13-staircase-recline.jpg',
  'pose-guides/editorial-14-towering-chair.jpg',
  'pose-guides/editorial-15-phone-stair-slouch.jpg',
  'pose-guides/editorial-16-apple-lens-recline.jpg',
  'pose-guides/editorial-17-bottle-swing-step.jpg',
  'pose-guides/editorial-18-ledge-point.jpg',
  'pose-guides/editorial-19-rail-double-point.jpg',
  'pose-guides/editorial-20-motion-echo-fold.jpg',
  'pose-guides/fashion-counterline.jpg',
  'pose-guides/fence-levels-duo.jpg',
  'pose-guides/formal-ease.jpg',
  'pose-guides/forward-fold.jpg',
  'pose-guides/frame-edge-lean.jpg',
  'pose-guides/framed-low-angle.jpg',
  'pose-guides/high-angle-duo.jpg',
  'pose-guides/high-angle-stance.jpg',
  'pose-guides/jacket-reset.jpg',
  'pose-guides/ledge-perspective.jpg',
  'pose-guides/lens-frame-duo.jpg',
  'pose-guides/low-angle-duo.jpg',
  'pose-guides/low-angle-01-lens-reaching-frame.jpg',
  'pose-guides/low-angle-02-upward-sky-portrait.jpg',
  'pose-guides/low-angle-03-staircase-recline.jpg',
  'pose-guides/low-angle-04-ground-level-duo.jpg',
  'pose-guides/low-angle-05-overhead-forward-fold.jpg',
  'pose-guides/low-angle-06-forehead-shield.jpg',
  'pose-guides/low-angle-07-overhead-pocket-stance.jpg',
  'pose-guides/low-angle-08-forward-road-step.jpg',
  'pose-guides/low-angle-09-worms-eye-neck-study.jpg',
  'pose-guides/low-angle-10-towering-hip-portrait.jpg',
  'pose-guides/low-angle-11-human-frame.jpg',
  'pose-guides/low-angle-12-forward-hands-back.jpg',
  'pose-guides/low-angle-13-towering-shoe-stance.jpg',
  'pose-guides/low-angle-14-hand-on-chest.jpg',
  'pose-guides/low-angle-15-fisheye-crouch-reach.jpg',
  'pose-guides/low-angle-16-palm-block-duo.jpg',
  'pose-guides/low-angle-17-crouched-face-cover.jpg',
  'pose-guides/low-angle-18-towering-calm-portrait.jpg',
  'pose-guides/low-angle-19-neck-and-shoulder.jpg',
  'pose-guides/low-angle-20-double-hip-hold.jpg',
  'pose-guides/low-angle-21-overhead-arms-back.jpg',
  'pose-guides/low-angle-22-face-cup-diagonal.jpg',
  'pose-guides/low-angle-23-raised-knee-portrait.jpg',
  'pose-guides/low-angle-24-overhead-cheek-fold.jpg',
  'pose-guides/low-angle-25-overhead-palm-reach.jpg',
  'pose-guides/low-angle-26-diagonal-ground-recline.jpg',
  'pose-guides/low-angle-27-worms-eye-torso.jpg',
  'pose-guides/low-angle-28-raised-knee-stance.jpg',
  'pose-guides/low-angle-29-open-arms-hero.jpg',
  'pose-guides/low-angle-30-calm-towering-portrait.jpg',
  'pose-guides/low-angle-31-seated-forward-sole.jpg',
  'pose-guides/low-angle-32-railing-hands.jpg',
  'pose-guides/low-angle-33-beam-balance.jpg',
  'pose-guides/low-angle-34-dominant-hand-reach.jpg',
  'pose-guides/low-angle-35-quiet-torso-portrait.jpg',
  'pose-guides/low-angle-36-airborne-soles.jpg',
  'pose-guides/low-angle-37-crouch-palm-shield.jpg',
  'pose-guides/low-angle-38-hand-on-knee.jpg',
  'pose-guides/low-angle-39-side-glance-torso.jpg',
  'pose-guides/low-angle-40-staircase-recline.jpg',
  'pose-guides/low-angle-41-eye-ring-gesture.jpg',
  'pose-guides/low-angle-42-overhead-standing.jpg',
  'pose-guides/low-angle-43-airborne-duo.jpg',
  'pose-guides/low-angle-44-ground-sit-braced.jpg',
  'pose-guides/low-angle-45-overhead-stretch.jpg',
  'pose-guides/low-angle-46-forward-leg-stance.jpg',
  'pose-guides/low-angle-47-hand-on-hip.jpg',
  'pose-guides/low-angle-48-open-palm-block.jpg',
  'pose-guides/low-angle-49-wide-pocket-stance.jpg',
  'pose-guides/low-angle-50-heroic-side-gaze.jpg',
  'pose-guides/low-angle-51-waist-twist.jpg',
  'pose-guides/low-angle-52-airborne-stride.jpg',
  'pose-guides/low-angle-53-raised-arm-arc.jpg',
  'pose-guides/low-angle-54-double-sole-jump.jpg',
  'pose-guides/low-angle-55-overhead-hands-back.jpg',
  'pose-guides/low-angle-56-seated-sole-forward.jpg',
  'pose-guides/low-angle-57-giant-forward-foot.jpg',
  'pose-guides/low-angle-58-crouch-hand-reach.jpg',
  'pose-guides/low-angle-59-ledge-forward-lean.jpg',
  'pose-guides/low-angle-60-forward-sole-balance.jpg',
  'pose-guides/low-angle-61-crouched-fist-forward.jpg',
  'pose-guides/low-angle-62-block-seat-soles.jpg',
  'pose-guides/low-angle-63-shoulder-touch-stance.jpg',
  'pose-guides/low-angle-64-beam-wide-stance.jpg',
  'pose-guides/low-angle-65-chin-up-closeup.jpg',
  'pose-guides/low-angle-66-open-palm-worms-eye.jpg',
  'pose-guides/low-angle-67-crawl-hand-reach.jpg',
  'pose-guides/low-angle-68-overhead-hands-hips.jpg',
  'pose-guides/low-angle-69-double-palm-frame.jpg',
  'pose-guides/low-angle-70-overhead-arms-behind.jpg',
  'pose-guides/low-angle-71-forward-shoe-step.jpg',
  'pose-guides/low-angle-72-airborne-double-sole.jpg',
  'pose-guides/low-angle-73-raised-knee-arms-up.jpg',
  'pose-guides/low-angle-74-pocket-street-stance.jpg',
  'pose-guides/low-angle-75-monumental-wide-stance.jpg',
  'pose-guides/low-angle-76-hand-behind-head.jpg',
  'pose-guides/low-angle-77-neck-shoulder-portrait.jpg',
  'pose-guides/low-angle-78-downward-reading-gesture.jpg',
  'pose-guides/feminine-01-deep-squat-rest.jpg',
  'pose-guides/feminine-02-overhead-s-curve.jpg',
  'pose-guides/feminine-03-dual-lens-frame.jpg',
  'pose-guides/feminine-04-crouched-lens-frame.jpg',
  'pose-guides/feminine-05-overhead-hand-frame.jpg',
  'pose-guides/feminine-06-flip-phone-fold.jpg',
  'pose-guides/feminine-07-vertical-kick.jpg',
  'pose-guides/feminine-08-reclined-sole-first.jpg',
  'pose-guides/feminine-09-hands-behind-crown.jpg',
  'pose-guides/feminine-10-chair-handset.jpg',
  'pose-guides/feminine-11-wide-counterlean.jpg',
  'pose-guides/feminine-12-overhead-pocket-curve.jpg',
  'pose-guides/feminine-13-single-leg-backbend.jpg',
  'pose-guides/feminine-14-knee-bent-backlean.jpg',
  'pose-guides/feminine-15-hip-braced-tilt.jpg',
  'pose-guides/feminine-16-overhead-palm-block.jpg',
  'pose-guides/feminine-17-cube-perch.jpg',
  'pose-guides/feminine-18-airborne-baton.jpg',
  'pose-guides/feminine-19-high-angle-folded-arms.jpg',
  'pose-guides/feminine-20-forward-open-hand.jpg',
  'pose-guides/masculine-01-hip-set-look-away.jpg',
  'pose-guides/masculine-02-board-balance.jpg',
  'pose-guides/masculine-03-side-back-pocket.jpg',
  'pose-guides/masculine-04-diagonal-float.jpg',
  'pose-guides/masculine-05-asymmetrical-sway.jpg',
  'pose-guides/masculine-06-book-stack.jpg',
  'pose-guides/masculine-07-briefcase-flight.jpg',
  'pose-guides/masculine-08-trench-pocket-turn.jpg',
  'pose-guides/masculine-09-double-hip-brace.jpg',
  'pose-guides/masculine-10-low-angle-counterlean.jpg',
  'pose-guides/masculine-11-leaned-back-gaze.jpg',
  'pose-guides/masculine-12-hand-behind-neck.jpg',
  'pose-guides/masculine-13-one-hand-breakdance.jpg',
  'pose-guides/masculine-14-forward-hover-step.jpg',
  'pose-guides/masculine-15-point-and-guard.jpg',
  'pose-guides/masculine-16-pocketed-collar-slouch.jpg',
  'pose-guides/masculine-17-bag-drop-stance.jpg',
  'pose-guides/masculine-18-phone-walk.jpg',
  'pose-guides/masculine-19-chair-thinker.jpg',
  'pose-guides/masculine-20-neck-touch-portrait.jpg',
  'pose-guides/offset-stance.jpg',
  'pose-guides/pocket-angle.jpg',
  'pose-guides/power-square.jpg',
  'pose-guides/romantic-01-shared-horizon.jpg',
  'pose-guides/romantic-02-trailing-together.jpg',
  'pose-guides/romantic-03-head-to-head-rest.jpg',
  'pose-guides/romantic-04-veil-embrace.jpg',
  'pose-guides/romantic-05-forehead-near-kiss.jpg',
  'pose-guides/romantic-06-quiet-forehead-stand.jpg',
  'pose-guides/romantic-07-garden-dip.jpg',
  'pose-guides/romantic-08-lap-cradle-rest.jpg',
  'pose-guides/romantic-09-sideways-gaze.jpg',
  'pose-guides/romantic-10-stair-handhold.jpg',
  'pose-guides/romantic-11-crossed-over-conversation.jpg',
  'pose-guides/romantic-12-reclined-across-lap.jpg',
  'pose-guides/romantic-13-temple-to-temple.jpg',
  'pose-guides/romantic-14-overhead-nest.jpg',
  'pose-guides/romantic-15-hillside-daydream.jpg',
  'pose-guides/romantic-16-windblown-veil.jpg',
  'pose-guides/romantic-17-opposite-direction-rest.jpg',
  'pose-guides/romantic-18-shoulder-sunset.jpg',
  'pose-guides/romantic-19-lap-look-up.jpg',
  'pose-guides/romantic-20-back-to-back-daydream.jpg',
  'pose-guides/sculptural-power-stance.jpg',
  'pose-guides/shoulder-glance.jpg',
  'pose-guides/tailored-three-quarter.jpg',
  'pose-guides/wall-lean.jpg',
  'pose-guides/wide-counterlean.jpg',
];

async function cacheResponse(cache, url) {
  try {
    const response = await fetch(url, { cache: 'reload' });
    if (response.ok) await cache.put(url, response);
  } catch {
    // One unavailable image should not prevent the rest of the offline library installing.
  }
}

self.addEventListener('install', (event) => {
  event.waitUntil((async () => {
    const cache = await caches.open(CACHE_NAME);
    const shellUrl = withBase();
    const shellResponse = await fetch(shellUrl, { cache: 'reload' });
    if (!shellResponse.ok) throw new Error('App shell unavailable');
    await cache.put(shellUrl, shellResponse.clone());
    await cache.put(withBase('index.html'), shellResponse.clone());

    const shellHtml = await shellResponse.text();
    const builtAssets = [...shellHtml.matchAll(/(?:src|href)="([^"]+\.(?:js|css))"/g)]
      .map((match) => new URL(match[1], shellUrl).href);
    const assets = [withBase('manifest.webmanifest'), withBase('favicon.svg'), ...builtAssets, ...POSE_ASSETS.map(withBase)];

    for (let index = 0; index < assets.length; index += 8) {
      await Promise.all(assets.slice(index, index + 8).map((url) => cacheResponse(cache, url)));
    }
    await self.skipWaiting();
  })());
});

self.addEventListener('activate', (event) => {
  event.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(keys.filter((key) => key.startsWith('posepilot-') && key !== CACHE_NAME).map((key) => caches.delete(key)));
    await self.clients.claim();
  })());
});

self.addEventListener('fetch', (event) => {
  const request = event.request;
  if (request.method !== 'GET') return;
  const url = new URL(request.url);
  if (url.origin !== self.location.origin || !url.pathname.startsWith(BASE_PATH)) return;

  if (request.mode === 'navigate') {
    event.respondWith((async () => {
      try {
        const response = await fetch(request);
        if (response.ok) await (await caches.open(CACHE_NAME)).put(withBase(), response.clone());
        return response;
      } catch {
        return (await caches.match(withBase())) || (await caches.match(withBase('index.html')));
      }
    })());
    return;
  }

  event.respondWith((async () => {
    const cached = await caches.match(request);
    if (cached) return cached;
    const response = await fetch(request);
    if (response.ok) await (await caches.open(CACHE_NAME)).put(request, response.clone());
    return response;
  })());
});
