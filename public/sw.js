const CACHE_NAME = 'posepilot-masculine-v1';
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
