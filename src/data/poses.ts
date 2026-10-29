import type {
  Difficulty, Expressiveness, Framing, JointName, Location, MannequinPose,
  Mood, Movement, Occasion, Pose, PoseKeyframe, PoseMode, PoseSubject, Vec3,
} from '../types';

type SeedPose = {
  id: string;
  title: string;
  artwork?: string;
  category: Pose['category'];
  moods: Mood[];
  cue: string;
  hands: string;
  gaze: string;
  movement?: Movement;
  difficulty?: Difficulty;
  prop?: string;
  framing?: Framing[];
  locations?: Location[];
  subjects?: PoseSubject[];
  modes?: PoseMode[];
  expressiveness?: Expressiveness;
};

const soloSubjects: PoseSubject[] = ['masculine', 'feminine', 'flexible'];
const degrees = (value: number) => value * Math.PI / 180;
const v = (x = 0, y = 0, z = 0): Vec3 => [degrees(x), degrees(y), degrees(z)];

const neutralJoints = (): Record<JointName, Vec3> => ({
  root: v(), torso: v(), head: v(),
  leftShoulder: v(0, 0, -5), rightShoulder: v(0, 0, 5),
  leftElbow: v(), rightElbow: v(), leftWrist: v(), rightWrist: v(),
  leftHip: v(), rightHip: v(), leftKnee: v(), rightKnee: v(),
  leftAnkle: v(), rightAnkle: v(),
});

const buildPose = (category: Pose['category'], index: number, phone = false, partner = false, id = ''): MannequinPose => {
  const joints = neutralJoints();
  const side = index % 2 === 0 ? 1 : -1;
  const drift = (index % 5) * 2;
  const seatedLike = category === 'seated' || id.includes('seated') || id.includes('floor') || id === 'shoulder-seat';
  const pose: MannequinPose = {
    position: partner ? [side * 0.72, 0, index % 3 === 0 ? -0.18 : 0.08] : [0, 0, 0],
    rotation: v(0, side * (5 + drift), side * (index % 3)),
    joints,
  };

  joints.torso = v(side * (index % 3) * 2, side * (4 + drift), side * (2 + index % 4));
  joints.head = v(side * (2 + index % 4), -side * (6 + drift), -side * 2);
  joints.leftHip = v(side > 0 ? 2 : -5, side * 2, side * 3);
  joints.rightHip = v(side > 0 ? -6 : 2, -side * 2, -side * 3);
  joints.leftKnee = v(index % 4 === 0 ? 12 : 2, 0, 0);
  joints.rightKnee = v(index % 4 === 1 ? 14 : 1, 0, 0);
  joints.leftShoulder = v(side * (5 + drift), 0, -(8 + index % 9));
  joints.rightShoulder = v(-side * (4 + drift), 0, 8 + (index + 3) % 9);
  joints.leftElbow = v(-20 - index % 35, 0, -side * 8);
  joints.rightElbow = v(-12 - (index * 3) % 42, 0, side * 7);

  if (seatedLike) {
    pose.position = [0, -0.92, 0];
    pose.rotation = v(0, side * (6 + drift), 0);
    joints.leftHip = v(-72 - index % 12, side * 6, 3);
    joints.rightHip = v(-78 + index % 10, -side * 5, -3);
    joints.leftKnee = v(75 + index % 14, 0, 0);
    joints.rightKnee = v(82 - index % 12, 0, 0);
    joints.torso = v(4 + index % 6, side * drift, side * 3);
  }

  if (category === 'portrait') {
    joints.leftShoulder = v(-18 - index % 32, side * 8, -14);
    joints.rightShoulder = v(-6 - (index * 4) % 36, -side * 8, 14);
    joints.leftElbow = v(-45 - index % 45, 0, -side * 18);
    joints.rightElbow = v(-35 - (index * 2) % 50, 0, side * 20);
    joints.head = v(side * (4 + drift), -side * (8 + index * 2), side * (index % 5));
  }

  if (category === 'couple') {
    pose.position = partner ? [0.62, seatedLike ? -0.92 : 0, 0.1] : [-0.62, seatedLike ? -0.92 : 0, 0];
    pose.rotation = v(0, partner ? -12 - drift : 12 + drift, 0);
    const inward = partner ? -1 : 1;
    joints.head = v(2, inward * 8, inward * 2);
    joints[inward > 0 ? 'rightShoulder' : 'leftShoulder'] = v(-20 - drift, 0, inward * 30);
    joints[inward > 0 ? 'rightElbow' : 'leftElbow'] = v(-55, 0, inward * 10);
  }

  if (phone || category === 'mirror' || category === 'selfie') {
    joints.rightShoulder = v(-35 - index % 24, -12, 18);
    joints.rightElbow = v(-92 + index % 22, 8, 12);
    joints.rightWrist = v(10, -8, 0);
    joints.leftShoulder = v(-8 - index % 30, 0, -12);
    joints.leftElbow = v(-25 - index % 45, 0, -side * 12);
    joints.head = v(side * 3, -side * (5 + drift), side * 3);
  }

  if (category === 'mirror') pose.rotation = v(0, side * (10 + drift), side * 2);
  return pose;
};

const clonePose = (pose: MannequinPose): MannequinPose => ({
  position: [...pose.position], rotation: [...pose.rotation],
  joints: Object.fromEntries(Object.entries(pose.joints).map(([key, value]) => [key, [...value]])) as Record<JointName, Vec3>,
});

const makeAnimation = (pose: MannequinPose, movement: Movement, index: number): PoseKeyframe[] => {
  const start = clonePose(pose);
  const middle = clonePose(pose);
  const finish = clonePose(pose);
  const stride = movement === 'energetic' ? 0.6 : movement === 'walking' ? 0.38 : 0.12;
  start.position[0] -= stride;
  finish.position[0] += stride;
  start.joints.leftHip = v(18, 0, 0);
  start.joints.rightHip = v(-14, 0, 0);
  finish.joints.leftHip = v(-14, 0, 0);
  finish.joints.rightHip = v(18, 0, 0);
  middle.joints.head = v(2, index % 2 ? 12 : -12, 0);
  finish.joints.head = v(1, 0, 0);
  return [
    { label: 'Set', capture: 'Find the line and let your shoulders settle.', duration: 1.2, pose: start },
    { label: movement === 'micro' ? 'Shift' : 'Move', capture: 'Shoot through the transition; keep the breath moving.', duration: 1.5, pose: middle },
    { label: 'Land', capture: 'Capture the instant the eyes reconnect and the stance lands.', duration: 1.3, pose: finish },
  ];
};

const occasionsFor = (seed: SeedPose): Occasion[] => {
  if (seed.category === 'couple') return ['couple', 'travel', 'celebration'];
  if (seed.category === 'mirror' || seed.category === 'selfie') return ['social', 'everyday', 'travel'];
  if (seed.category === 'portrait') return ['portrait', 'brand', 'formal'];
  if (seed.moods.includes('editorial')) return ['fashion', 'creative', 'brand'];
  return ['everyday', 'street', 'travel'];
};

const modesFor = (seed: SeedPose): PoseMode[] => {
  if (seed.category === 'mirror') return ['mirror-selfie'];
  if (seed.category === 'selfie') return ['front-selfie'];
  return ['photographer', 'friend', 'tripod'];
};

const framingFor = (category: Pose['category']): Framing[] => {
  if (category === 'portrait' || category === 'selfie') return ['close-up', 'head-shoulders', 'waist-up'];
  if (category === 'mirror') return ['waist-up', 'three-quarter', 'full-body'];
  return ['three-quarter', 'full-body', 'environmental'];
};

const locationsFor = (category: Pose['category']): Location[] => {
  if (category === 'mirror') return ['home-mirror', 'full-mirror'];
  if (category === 'selfie') return ['cafe', 'nature', 'urban', 'anywhere'];
  if (category === 'seated') return ['cafe', 'studio', 'urban', 'nature'];
  return ['studio', 'urban', 'nature', 'architecture', 'beach', 'anywhere'];
};

const seeds: SeedPose[] = [
  { id: 'lens-frame-duo', title: 'Lens-Frame Duo', artwork: 'pose-guides/lens-frame-duo.jpg', category: 'couple', moods: ['bold', 'artistic'], cue: 'Stand shoulder-to-shoulder beneath a high wide-angle camera and reach both open hands toward opposite sides of the lens.', hands: 'Spread every finger and keep a clear window between the palms so both heads remain visible.', gaze: 'Tip both faces upward into the gap between the hands.', difficulty: 'experimental', expressiveness: 'dramatic', framing: ['full-body', 'environmental'], locations: ['nature', 'urban', 'anywhere'] },
  { id: 'fence-levels-duo', title: 'Fence Levels', artwork: 'pose-guides/fence-levels-duo.jpg', category: 'couple', moods: ['cool', 'editorial'], cue: 'Build two strong levels: one person standing behind the rail and one seated securely on top.', hands: 'Let the standing wrists drape over the rail while the seated person joins the hands softly between the knees.', gaze: 'Lift both chins slightly above the camera for a calm, distant attitude.', difficulty: 'moderate', expressiveness: 'natural', framing: ['full-body', 'environmental'], locations: ['urban', 'architecture'] },
  { id: 'deep-forward-fold', title: 'Deep Forward Fold', artwork: 'pose-guides/forward-fold.jpg', category: 'standing', moods: ['artistic', 'mysterious'], cue: 'Keep the legs long and hinge sharply from the hips until the torso is almost parallel to the floor.', hands: 'Reach both arms behind the body and clasp the hands above the pelvis without lifting the shoulders.', gaze: 'Extend the neck from the spine and angle the feature line slightly toward camera.', difficulty: 'experimental', expressiveness: 'dramatic', framing: ['full-body'], locations: ['studio', 'anywhere'] },
  { id: 'worms-eye-duo', title: "Worm's-Eye Duo", artwork: 'pose-guides/low-angle-duo.jpg', category: 'couple', moods: ['bold', 'editorial'], cue: 'Place one person very close to a ground-level lens while the partner holds a low angular stance several steps behind.', hands: 'Foreground hand anchors at the back hip; the rear figure braces one hand at the hip and one near the thigh.', gaze: 'Both figures look down toward the lens from different heights.', difficulty: 'experimental', expressiveness: 'dramatic', framing: ['full-body', 'environmental'], locations: ['urban', 'architecture', 'anywhere'] },
  { id: 'ledge-lens', title: 'Ledge Lens', artwork: 'pose-guides/ledge-perspective.jpg', category: 'seated', moods: ['bold', 'editorial'], cue: 'Perch securely above a low camera, open both knees and send one shoe dramatically toward the lens.', hands: 'Brace one palm beside the hip and place the opposite hand lightly over the crown.', gaze: 'Turn the face away from the raised elbow while keeping the chest open.', difficulty: 'experimental', expressiveness: 'dramatic', framing: ['full-body', 'environmental'], locations: ['urban', 'architecture'] },
  { id: 'wide-counterlean', title: 'Wide Counter-Lean', artwork: 'pose-guides/wide-counterlean.jpg', category: 'standing', moods: ['cool', 'editorial'], cue: 'Open into a wide stance, send the hips toward the weighted leg and lean the ribcage in the opposite direction.', hands: 'Slide the low hand to the extended thigh and hook the other hand high at the hip.', gaze: 'Let the head follow the torso diagonal with a soft counter-tilt.', difficulty: 'moderate', expressiveness: 'expressive', framing: ['full-body'], locations: ['studio', 'anywhere'] },
  { id: 'high-angle-pair', title: 'High-Angle Pair', artwork: 'pose-guides/high-angle-duo.jpg', category: 'couple', moods: ['bold', 'editorial'], cue: 'Stand close beneath a steep overhead camera with one person half a step nearer to the lens.', hands: 'Let both sets of arms hang with intentional asymmetry and keep the hands separated from the thighs.', gaze: 'Tip both faces fully upward to meet the overhead lens.', difficulty: 'moderate', expressiveness: 'expressive', framing: ['full-body', 'environmental'], locations: ['studio', 'anywhere'] },
  { id: 'overhead-poise', title: 'Overhead Poise', artwork: 'pose-guides/high-angle-stance.jpg', category: 'standing', moods: ['elegant', 'editorial'], cue: 'Plant the feet apart, settle the hips back and lean the upper body subtly toward a steep overhead camera.', hands: 'Anchor one hand at the hip and hold the other loosely near the waist in a small conversational gesture.', gaze: 'Lift the entire face toward the lens rather than only raising the eyes.', difficulty: 'moderate', expressiveness: 'natural', framing: ['full-body'], locations: ['studio', 'urban', 'anywhere'] },
  { id: 'human-frame', title: 'Human Frame', artwork: 'pose-guides/framed-low-angle.jpg', category: 'couple', moods: ['artistic', 'bold'], cue: 'Place the main figure beyond a ground-level lens while a partner forms a close foreground arch around the frame.', hands: 'Keep the central hands compact near the waist and open the foreground hand clearly toward the lens.', gaze: 'The central figure looks down through the opening made by the partner.', difficulty: 'experimental', expressiveness: 'dramatic', framing: ['full-body', 'environmental'], locations: ['studio', 'anywhere'] },
  { id: 'sculptural-power-stance', title: 'Sculptural Power Stance', artwork: 'pose-guides/sculptural-power-stance.jpg', category: 'standing', moods: ['bold', 'artistic'], cue: 'Sink into an exceptionally wide turned-out stance and twist the torso above the centred pelvis.', hands: 'Place one hand behind the head and carry the opposite forearm horizontally across the chest.', gaze: 'Turn the head over the crossed arm with the chin slightly lifted.', difficulty: 'experimental', expressiveness: 'dramatic', framing: ['full-body'], locations: ['studio', 'anywhere'] },
  { id: 'pocket-angle', title: 'Pocket Angle', artwork: 'pose-guides/pocket-angle.jpg', category: 'standing', moods: ['cool', 'natural'], cue: 'Shift weight to the back leg and let the front toe point toward the light.', hands: 'Hook only the thumbs into the pockets; keep fingers visible.', gaze: 'Look just past the lens with an easy jaw.' },
  { id: 'wall-lean', title: 'Wall, Then Breathe', artwork: 'pose-guides/wall-lean.jpg', category: 'standing', moods: ['cool', 'candid'], cue: 'Rest one shoulder lightly on the wall and leave space through the waist.', hands: 'Let the wall-side hand hang while the other settles at the pocket seam.', gaze: 'Turn the chin toward the open side.' },
  { id: 'shoulder-glance', title: 'Shoulder Glance', artwork: 'pose-guides/shoulder-glance.jpg', category: 'standing', moods: ['mysterious', 'elegant'], cue: 'Turn away from camera, then return only through the upper torso.', hands: 'Keep both hands low and quiet so the twist stays readable.', gaze: 'Bring the eyes back before the chin.' },
  { id: 'jacket-reset', title: 'Jacket Reset', artwork: 'pose-guides/jacket-reset.jpg', category: 'standing', moods: ['confident', 'editorial'], cue: 'Square the feet, roll one shoulder back and settle the jacket into place.', hands: 'Pinch the lapels softly instead of gripping them.', gaze: 'Look directly into the lens as the hands finish.', movement: 'micro', prop: 'jacket' },
  { id: 'city-stride', title: 'Crosswalk Rhythm', artwork: 'pose-guides/city-stride.jpg', category: 'standing', moods: ['candid', 'sporty'], cue: 'Take three unhurried steps through the frame, allowing the arms to swing naturally.', hands: 'Keep fingers loose and let the opposite arm follow each step.', gaze: 'Start ahead, then glance to camera on the final step.', movement: 'walking' },
  { id: 'offset-stance', title: 'Offset Stance', artwork: 'pose-guides/offset-stance.jpg', category: 'standing', moods: ['natural', 'confident'], cue: 'Place one foot half a step forward and keep the knees unlocked.', hands: 'Rest one hand at the hip seam and leave the other loose.', gaze: 'Aim the nose slightly off-camera, eyes back to lens.' },
  { id: 'architectural-pause', title: 'Column Pause', artwork: 'pose-guides/architectural-pause.jpg', category: 'standing', moods: ['elegant', 'artistic'], cue: 'Echo a nearby vertical line while shifting the hips gently away from it.', hands: 'Touch the surface with fingertips only.', gaze: 'Follow the architectural line upward.', locations: ['architecture', 'urban'] },
  { id: 'distant-look', title: 'Far Horizon', artwork: 'pose-guides/distant-look.jpg', category: 'standing', moods: ['soft', 'mysterious'], cue: 'Open the chest toward the widest part of the scene and settle into one hip.', hands: 'Layer one relaxed hand over the other at the front.', gaze: 'Look toward a distant point at eye level.' },
  { id: 'bag-swing', title: 'Bag in Motion', category: 'standing', moods: ['playful', 'candid'], cue: 'Step forward as the bag crosses behind the body, then let it settle.', hands: 'Hold the strap near its midpoint with a soft wrist.', gaze: 'Track the bag briefly, then lift the eyes.', movement: 'energetic', prop: 'bag' },
  { id: 'power-square', title: 'Quiet Power', category: 'standing', moods: ['confident', 'bold'], cue: 'Plant the feet slightly wider than the hips and lengthen through the crown.', hands: 'Place one hand at the waist; leave the other arm with a clean bend.', gaze: 'Use a steady, direct gaze.', expressiveness: 'expressive' },
  { id: 'tailored-three-quarter', title: 'Tailored Three-Quarter', category: 'standing', moods: ['elegant', 'editorial'], cue: 'Turn the body 30 degrees and keep the shoulder line calm.', hands: 'Stack the hands lightly at the lower jacket button.', gaze: 'Meet the lens without lifting the chin.' },
  { id: 'fashion-counterline', title: 'Counterline', category: 'standing', moods: ['editorial', 'artistic'], cue: 'Send the hips one way and the shoulders the other for a graphic S-line.', hands: 'Place one hand high at the waist and extend the other away.', gaze: 'Turn the head against the shoulder line.', difficulty: 'experimental', expressiveness: 'dramatic' },
  { id: 'formal-ease', title: 'Formal, Not Frozen', category: 'standing', moods: ['elegant', 'natural'], cue: 'Stand tall, soften both knees and rotate one shoulder closer to camera.', hands: 'Join hands loosely at the centre without interlocking fingers.', gaze: 'Look directly at camera with a small exhale.' },
  { id: 'frame-edge-lean', title: 'Edge of Frame', category: 'standing', moods: ['cool', 'artistic'], cue: 'Lean diagonally into the empty space while keeping both feet grounded.', hands: 'Let one arm echo the lean; anchor the other at the waist.', gaze: 'Look into the negative space.', difficulty: 'moderate' },
  { id: 'sun-turn', title: 'Turn Into Light', category: 'standing', moods: ['soft', 'candid'], cue: 'Begin side-on, turn slowly into the light and stop before facing fully forward.', hands: 'Brush one hand along a sleeve during the turn.', gaze: 'Let the eyes arrive last.', movement: 'walking' },
  { id: 'coat-drape', title: 'Coat Drape', category: 'standing', moods: ['cool', 'editorial'], cue: 'Drape the coat over one shoulder and counterbalance with the opposite hip.', hands: 'Hold the collar from underneath so the fingers stay long.', gaze: 'Look level across the frame.', prop: 'jacket' },

  { id: 'stool-forward', title: 'Stool Forward', category: 'seated', moods: ['confident', 'natural'], cue: 'Sit on the front third of the stool with both feet fully planted.', hands: 'Rest forearms over the thighs without collapsing the shoulders.', gaze: 'Raise the eyes to camera from a neutral chin.' },
  { id: 'chair-sideways', title: 'Side-Saddle Chair', category: 'seated', moods: ['elegant', 'editorial'], cue: 'Turn across the chair and lengthen the spine away from the backrest.', hands: 'Layer the hands softly over the nearest knee.', gaze: 'Look over the nearer shoulder.', difficulty: 'moderate' },
  { id: 'bench-breathe', title: 'Bench Breathe', category: 'seated', moods: ['soft', 'natural'], cue: 'Sit deep enough to feel supported, then release the shoulders on an exhale.', hands: 'Place palms beside the hips with easy elbows.', gaze: 'Look toward the open end of the bench.' },
  { id: 'steps-offset', title: 'Offset Steps', category: 'seated', moods: ['cool', 'sporty'], cue: 'Sit one step above the feet so the knees make two different angles.', hands: 'Drape one wrist over the higher knee.', gaze: 'Turn toward the lower shoulder.', locations: ['urban', 'architecture'] },
  { id: 'cafe-cup', title: 'First Sip', category: 'seated', moods: ['candid', 'soft'], cue: 'Angle the chair toward the window and lean forward by only a few centimetres.', hands: 'Hold the cup low enough that it does not hide the face.', gaze: 'Look down at the cup, then up toward the light.', movement: 'micro', prop: 'coffee cup', locations: ['cafe'] },
  { id: 'floor-triangle', title: 'Floor Triangle', category: 'seated', moods: ['artistic', 'quirky'], cue: 'Build three clear angles with the knees and keep the torso lifted between them.', hands: 'Use one palm behind as a light brace; float the other at the knee.', gaze: 'Tilt toward the raised knee.', difficulty: 'experimental', expressiveness: 'dramatic' },
  { id: 'ledge-swing', title: 'Ledge Swing', category: 'seated', moods: ['playful', 'candid'], cue: 'Sit securely and alternate a small foot swing rather than holding still.', hands: 'Grip the edge only enough for balance.', gaze: 'Follow one foot, then laugh back to camera.', movement: 'energetic' },
  { id: 'crossed-ankle', title: 'Crossed Ankle Calm', category: 'seated', moods: ['elegant', 'soft'], cue: 'Keep both feet touching the floor and cross only at the ankles.', hands: 'Rest one hand over the other without pressing.', gaze: 'Use a gentle three-quarter gaze.' },
  { id: 'editorial-perch', title: 'Editorial Perch', category: 'seated', moods: ['bold', 'editorial'], cue: 'Perch high, open one knee to the side and counter-turn the shoulders.', hands: 'Frame the outer thigh with one hand; keep the other angular.', gaze: 'Set the chin slightly down for intensity.', difficulty: 'experimental', expressiveness: 'dramatic' },
  { id: 'window-rest', title: 'Window Rest', category: 'seated', moods: ['mysterious', 'soft'], cue: 'Sit parallel to the window and let the upper body rotate toward the light.', hands: 'Rest fingertips at the window ledge or lap.', gaze: 'Look through the glass rather than at your reflection.', locations: ['cafe', 'studio'] },

  { id: 'soft-chin', title: 'Soft Chin', category: 'portrait', moods: ['soft', 'natural'], cue: 'Lengthen the back of the neck and bring the face a fraction toward the light.', hands: 'Keep hands out of frame or barely touch the collarbone.', gaze: 'Look just above the lens with relaxed eyelids.' },
  { id: 'confident-gaze', title: 'Steady Gaze', category: 'portrait', moods: ['confident', 'bold'], cue: 'Square one shoulder toward camera and keep the chin level.', hands: 'Use one hand at the lapel or neckline as a visual anchor.', gaze: 'Look directly into the centre of the lens.', expressiveness: 'expressive' },
  { id: 'shoulder-frame', title: 'Shoulder Frame', category: 'portrait', moods: ['elegant', 'mysterious'], cue: 'Bring one shoulder closer and let it form the bottom edge of the portrait.', hands: 'Touch the far shoulder lightly without covering the neck.', gaze: 'Look across the raised shoulder.' },
  { id: 'thoughtful-lookaway', title: 'Thought Between Frames', category: 'portrait', moods: ['mysterious', 'soft'], cue: 'Turn the face toward the light while keeping the chest nearly forward.', hands: 'Rest one fingertip near the temple, with space between hand and cheek.', gaze: 'Focus on a point beyond the camera.' },
  { id: 'laugh-release', title: 'Laugh Release', category: 'portrait', moods: ['playful', 'candid'], cue: 'Start with a closed-mouth smile, exhale, then let the laugh arrive.', hands: 'Drop the hands between frames so the face stays open.', gaze: 'Begin at camera, then briefly look away.', movement: 'micro' },
  { id: 'profile-breath', title: 'Profile Breath', category: 'portrait', moods: ['elegant', 'artistic'], cue: 'Rotate to a clean profile and breathe into the back of the ribs.', hands: 'Let a hand trace the collar line without gripping.', gaze: 'Keep the eye line level across the frame.' },
  { id: 'collar-touch', title: 'Collar Touch', category: 'portrait', moods: ['cool', 'editorial'], cue: 'Angle the shoulders and bring the collar slightly toward the chin.', hands: 'Use thumb and forefinger lightly; keep the wrist long.', gaze: 'Look down the near shoulder.' },
  { id: 'calm-close', title: 'Calm Close', category: 'portrait', moods: ['natural', 'soft'], cue: 'Let the shoulders fall and keep a little space between lips and teeth.', hands: 'Fold hands below the crop so the upper body stays quiet.', gaze: 'Meet the lens as if listening.' },
  { id: 'dramatic-turn', title: 'Flash Turn', category: 'portrait', moods: ['bold', 'editorial'], cue: 'Begin in profile and snap the eyes, then the head, toward camera.', hands: 'Use one hand near the crown to extend the shape.', gaze: 'Land directly on the lens.', movement: 'energetic', difficulty: 'experimental', expressiveness: 'dramatic' },
  { id: 'playful-peek', title: 'Peek & Tilt', category: 'portrait', moods: ['playful', 'quirky'], cue: 'Tilt from the upper spine, not only the neck, and let one shoulder rise.', hands: 'Frame one side of the face without covering an eye.', gaze: 'Look through the open space between fingers.', difficulty: 'moderate', expressiveness: 'expressive' },

  { id: 'side-sync', title: 'Side-by-Side Sync', category: 'couple', moods: ['natural', 'romantic'], cue: 'Stand hip-to-hip with shoulders relaxed and feet at slightly different depths.', hands: 'Let the inside hands connect while outside arms rest naturally.', gaze: 'Both look to camera, then soften toward one another.' },
  { id: 'connected-walk', title: 'Connected Walk', category: 'couple', moods: ['candid', 'romantic'], cue: 'Walk at the same pace with one person half a step ahead.', hands: 'Join the inside hands low enough for a natural swing.', gaze: 'Look forward first, then toward each other.', movement: 'walking' },
  { id: 'look-exchange', title: 'Look Exchange', category: 'couple', moods: ['playful', 'candid'], cue: 'Begin facing camera, exchange a glance, then return together.', hands: 'Keep one small point of contact at shoulder or hand.', gaze: 'Let one person look first so the moment feels unscripted.', movement: 'micro' },
  { id: 'shoulder-seat', title: 'Shoulder-to-Shoulder', category: 'couple', moods: ['soft', 'natural'], cue: 'Sit close with shoulders touching and knees angled in different directions.', hands: 'Place outer hands on knees; connect the inside hands loosely.', gaze: 'One to camera, one toward their partner.' },
  { id: 'depth-line', title: 'Two Depths', category: 'couple', moods: ['editorial', 'artistic'], cue: 'Place one person a full step behind and create a diagonal through both faces.', hands: 'Front subject stays compact; rear subject adds the wider gesture.', gaze: 'Use two different gaze directions.', difficulty: 'moderate' },
  { id: 'foreground-anchor', title: 'Foreground Anchor', category: 'couple', moods: ['confident', 'editorial'], cue: 'Place one person nearer the lens and overlap the silhouettes only slightly.', hands: 'Rear subject connects at the front subject’s shoulder.', gaze: 'Both use a direct gaze for a strong graphic frame.', difficulty: 'moderate' },
  { id: 'handhold-pause', title: 'Handhold Pause', category: 'couple', moods: ['romantic', 'soft'], cue: 'Stand apart by one arm length, then settle the weight away from the joined hands.', hands: 'Connect gently at the fingers without pulling.', gaze: 'Look at the joined hands, then at each other.' },
  { id: 'playful-counterbalance', title: 'Counterbalance', category: 'couple', moods: ['playful', 'quirky'], cue: 'Lean away in equal measure while keeping the joined hands central.', hands: 'Use a secure handhold with elbows softly bent.', gaze: 'Laugh across the space between you.', movement: 'energetic', difficulty: 'experimental', expressiveness: 'dramatic' },
  { id: 'back-to-back', title: 'Back-to-Back Editorial', category: 'couple', moods: ['cool', 'editorial'], cue: 'Stand back-to-back with one person slightly lower through the knees.', hands: 'Choose contrasting hand shapes: one pocketed, one at the waist.', gaze: 'Look in opposite directions.' },
  { id: 'reference-arc-duo', title: 'Back-to-Back Arc', category: 'couple', moods: ['editorial', 'artistic'], cue: 'Set the hips back-to-back, lengthen one arm overhead and let the second figure curve through the waist.', hands: 'One person reaches upward with an open hand; the partner frames the crown with both hands.', gaze: 'Turn both faces toward camera from opposite shoulder lines.', difficulty: 'moderate', expressiveness: 'dramatic', framing: ['three-quarter', 'full-body'], locations: ['studio', 'anywhere'], prop: 'cap' },
  { id: 'arm-link', title: 'Linked & Loose', category: 'couple', moods: ['natural', 'elegant'], cue: 'Link arms with enough space that both shoulder lines remain visible.', hands: 'Keep the linked hands relaxed rather than clenched.', gaze: 'Both look toward the same off-camera point.' },
  { id: 'walkaway-glance', title: 'Walk Away, Look Back', category: 'couple', moods: ['candid', 'playful'], cue: 'Walk away together, then turn from the upper torso at different moments.', hands: 'Keep the shared handhold low and moving.', gaze: 'One looks back first; the other follows.', movement: 'walking' },

  { id: 'mirror-outfit-offset', title: 'Outfit Offset', category: 'mirror', moods: ['cool', 'natural'], cue: 'Stand a half-step off-centre with the far foot forward and the full outfit visible.', hands: 'Hold the phone beside the cheek; rest the free thumb at the pocket.', gaze: 'Look at your reflection, not down at the screen.', prop: 'phone' },
  { id: 'mirror-cheek-side', title: 'Cheek-Side Phone', category: 'mirror', moods: ['soft', 'elegant'], cue: 'Turn the torso slightly and position the phone just beyond the cheek line.', hands: 'Keep the phone wrist straight; let the free arm fall with a small gap.', gaze: 'Look into the mirror so both eyes stay visible.', prop: 'phone', framing: ['waist-up', 'three-quarter'] },
  { id: 'mirror-seated', title: 'Seated Reflection', category: 'mirror', moods: ['natural', 'candid'], cue: 'Sit diagonally to the mirror, plant both feet and lean forward slightly.', hands: 'Brace the phone elbow lightly at the knee without collapsing.', gaze: 'Check the outer edges of the frame, then lift the gaze.', prop: 'phone' },
  { id: 'mirror-shoulder-back', title: 'Reflection Look-Back', category: 'mirror', moods: ['mysterious', 'editorial'], cue: 'Turn away from the mirror and rotate the upper body back toward it.', hands: 'Hold the phone outside the face line and keep the free hand at the hip.', gaze: 'Look at your reflected eyes.', prop: 'phone', difficulty: 'moderate' },
  { id: 'mirror-pocket', title: 'Pocket & Parallel', category: 'mirror', moods: ['cool', 'confident'], cue: 'Keep the phone parallel to the mirror and set one foot slightly across the other.', hands: 'Place the free thumb in a pocket and show the fingertips.', gaze: 'Look level at the lens reflection.', prop: 'phone' },
  { id: 'mirror-floor', title: 'Low Mirror Geometry', category: 'mirror', moods: ['artistic', 'quirky'], cue: 'Sit safely near the mirror and create one tall and one low knee line.', hands: 'Hold the phone at shoulder height; use the free palm for balance.', gaze: 'Look over the top edge of the phone.', prop: 'phone', difficulty: 'experimental', expressiveness: 'dramatic' },
  { id: 'mirror-formal', title: 'Formal Reflection', category: 'mirror', moods: ['elegant', 'confident'], cue: 'Set a three-quarter stance and leave clean space around the outfit.', hands: 'Use the free hand to neaten one cuff or lapel.', gaze: 'Keep the chin level and eyes on the mirror.', prop: 'phone' },
  { id: 'mirror-movement', title: 'Mirror Step-Through', category: 'mirror', moods: ['playful', 'candid'], cue: 'Take one small side step, let fabric settle, then pause on the new weight.', hands: 'Keep the phone stable while the free arm follows the step.', gaze: 'Track your reflection and stop with a soft smile.', prop: 'phone', movement: 'walking' },
  { id: 'mirror-wide-room', title: 'Room in the Frame', category: 'mirror', moods: ['artistic', 'soft'], cue: 'Step back enough to show context, leaving a deliberate band of space around you.', hands: 'Hold the phone at chest height and slightly away from the body.', gaze: 'Look toward the brightest clean area of the room.', prop: 'phone', framing: ['full-body', 'environmental'] },

  { id: 'selfie-eye-level', title: 'Eye-Level Ease', category: 'selfie', moods: ['natural', 'soft'], cue: 'Hold the phone just beyond arm’s length at eye level and turn one shoulder in.', hands: 'Keep the holding elbow below the frame and the wrist neutral.', gaze: 'Look into the lens, not your on-screen image.', prop: 'phone' },
  { id: 'selfie-high-soft', title: 'Soft High Angle', category: 'selfie', moods: ['soft', 'playful'], cue: 'Raise the phone only slightly above eye level and tip the face toward the light.', hands: 'Extend from the shoulder without locking the elbow.', gaze: 'Look at the lens with a gentle smile.', prop: 'phone' },
  { id: 'selfie-three-quarter', title: 'Three-Quarter Selfie', category: 'selfie', moods: ['confident', 'elegant'], cue: 'Turn the torso 30 degrees while keeping the phone aligned with the eyes.', hands: 'Rest the free hand below the collarbone with separated fingers.', gaze: 'Use a steady lens gaze.', prop: 'phone' },
  { id: 'selfie-genuine-smile', title: 'Smile Arrives', category: 'selfie', moods: ['candid', 'playful'], cue: 'Begin neutral, breathe out, then let the smile build over three frames.', hands: 'Keep the phone steady and let the free hand drop.', gaze: 'Look at the lens through the whole sequence.', prop: 'phone', movement: 'micro' },
  { id: 'selfie-window-side', title: 'Window-Side Portrait', category: 'selfie', moods: ['mysterious', 'soft'], cue: 'Stand at a right angle to a window and rotate the face halfway into the light.', hands: 'Hold the phone on the shadow side for a clear face line.', gaze: 'Look toward the lens, then out of frame.', prop: 'phone', locations: ['cafe', 'studio', 'anywhere'] },
  { id: 'selfie-environmental', title: 'Place & Person', category: 'selfie', moods: ['candid', 'artistic'], cue: 'Extend the phone farther away and place yourself on one third of the frame.', hands: 'Angle the phone to include the setting without tilting the horizon.', gaze: 'Look at the lens while the background stays intentional.', prop: 'phone', framing: ['waist-up', 'environmental'] },
  { id: 'selfie-duo', title: 'Duo Lean-In', category: 'selfie', moods: ['playful', 'romantic'], cue: 'Bring both faces to a similar camera distance and overlap shoulders, not faces.', hands: 'The phone holder extends slightly to the side; the partner connects at the shoulder.', gaze: 'Both look at the lens on the same count.', prop: 'phone', subjects: ['pair'], difficulty: 'moderate' },
  { id: 'selfie-playful-tilt', title: 'Tilt & Spark', category: 'selfie', moods: ['quirky', 'bold'], cue: 'Tilt from the upper torso and counter-tilt the phone to keep the eyes level.', hands: 'Use the free hand as a small shape near the edge of frame.', gaze: 'Lift the brows slightly and connect with the lens.', prop: 'phone', difficulty: 'experimental', expressiveness: 'dramatic' },
];

export const poses: Pose[] = seeds.map((seed, index) => {
  const movement = seed.movement ?? 'static';
  const modelPose = buildPose(seed.category, index, seed.category === 'mirror' || seed.category === 'selfie', false, seed.id);
  const subjects = seed.subjects ?? (seed.category === 'couple' ? ['pair'] : soloSubjects);
  const modes = seed.modes ?? modesFor(seed);
  const isSelfie = seed.category === 'mirror' || seed.category === 'selfie';
  const partnerPose = subjects.includes('pair') ? buildPose(seed.category === 'selfie' ? 'couple' : seed.category, index + 3, false, true, seed.id) : undefined;
  const animation = movement === 'static' ? undefined : makeAnimation(modelPose, movement, index);
  if (animation && partnerPose) {
    const partnerFrames = makeAnimation(partnerPose, movement, index + 5);
    animation.forEach((frame, frameIndex) => { frame.partnerPose = partnerFrames[frameIndex].pose; });
  }
  return {
    id: seed.id,
    title: seed.title,
    artwork: seed.artwork,
    category: seed.category,
    description: seed.cue,
    subjects,
    modes,
    moods: seed.moods,
    styles: [seed.category, ...seed.moods],
    occasions: occasionsFor(seed),
    locations: seed.locations ?? locationsFor(seed.category),
    framing: seed.framing ?? framingFor(seed.category),
    helpAreas: isSelfie
      ? ['phone', 'expression', 'gaze', 'composition']
      : seed.category === 'couple'
        ? ['couple', 'posture', 'hands', 'composition']
        : seed.category === 'seated'
          ? ['sit-lean', 'hands', 'posture', 'legs']
          : ['posture', 'hands', 'gaze', movement === 'static' ? 'legs' : 'movement'],
    expressiveness: seed.expressiveness ?? (seed.moods.includes('bold') ? 'expressive' : 'natural'),
    movement,
    difficulty: seed.difficulty ?? (index % 7 === 0 ? 'moderate' : 'easy'),
    props: seed.prop ? [seed.prop] : [],
    tags: [seed.category, ...seed.moods, movement, ...(seed.prop ? [seed.prop] : [])],
    instructions: [
      `Set the frame for ${seed.title.toLowerCase()} and give yourself room to move.`,
      seed.cue,
      seed.hands,
      `Take two quiet breaths, make one small adjustment, then hold for the frame.`,
    ],
    handTips: seed.hands,
    postureTip: seed.cue,
    gazeTip: seed.gaze,
    expressionTips: seed.moods.includes('playful') || seed.moods.includes('candid')
      ? ['Relax the jaw before the frame.', 'Let the expression develop rather than switching it on.']
      : ['Keep breathing normally.', 'Soften the mouth and make tiny changes between frames.'],
    photographerTip: isSelfie ? undefined : `Frame for ${framingFor(seed.category)[0].replace('-', ' ')} and leave space in the direction of the gaze. Shoot the transition as well as the held pose.`,
    selfieTip: isSelfie ? `${seed.hands} Keep the lens clean, use soft light, and check the full edge of the frame before shooting.` : undefined,
    cameraGuide: isSelfie ? undefined : {
      angle: index % 4 === 0 ? 'slight-left' : index % 4 === 1 ? 'slight-right' : index % 4 === 2 ? 'straight-on' : 'profile',
      height: seed.category === 'standing' ? 'waist' : seed.category === 'seated' ? 'chest' : 'eye',
      distance: seed.category === 'portrait' ? 'close' : seed.category === 'couple' ? 'far' : 'medium',
      composition: `Keep the ${seed.category === 'couple' ? 'pair' : 'subject'} slightly off-centre and preserve the body lines created by the pose.`,
    },
    modelPose,
    partnerPose,
    animation,
  };
});

export const poseById = (id: string | undefined) => poses.find((pose) => pose.id === id);

export const poseStats = {
  total: poses.length,
  animated: poses.filter((pose) => pose.animation).length,
  mirror: poses.filter((pose) => pose.category === 'mirror').length,
  selfie: poses.filter((pose) => pose.category === 'selfie').length,
  couples: poses.filter((pose) => pose.subjects.includes('pair')).length,
};

