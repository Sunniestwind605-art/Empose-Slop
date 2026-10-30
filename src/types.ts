export type PoseSubject = 'masculine' | 'feminine' | 'flexible' | 'pair';
export type PoseMode = 'photographer' | 'friend' | 'tripod' | 'mirror-selfie' | 'front-selfie';
export type Mood =
  | 'cool' | 'confident' | 'natural' | 'elegant' | 'playful' | 'mysterious'
  | 'romantic' | 'bold' | 'editorial' | 'quirky' | 'candid' | 'soft'
  | 'sporty' | 'artistic';
export type Occasion =
  | 'everyday' | 'social' | 'travel' | 'formal' | 'couple' | 'fashion'
  | 'portrait' | 'street' | 'celebration' | 'brand' | 'creative';
export type Location =
  | 'studio' | 'urban' | 'cafe' | 'nature' | 'beach' | 'architecture'
  | 'home-mirror' | 'full-mirror' | 'anywhere';
export type Framing = 'close-up' | 'head-shoulders' | 'waist-up' | 'three-quarter' | 'full-body' | 'environmental';
export type HelpArea =
  | 'expression' | 'gaze' | 'hands' | 'shoulders' | 'posture' | 'legs'
  | 'sit-lean' | 'movement' | 'couple' | 'phone' | 'composition';
export type Expressiveness = 'subtle' | 'natural' | 'expressive' | 'dramatic';
export type Movement = 'static' | 'micro' | 'walking' | 'energetic';
export type Difficulty = 'easy' | 'moderate' | 'experimental';
export type PoseCollection = 'essentials' | 'editorial' | 'romantic' | 'masculine' | 'feminine';

export type Vec3 = [number, number, number];
export type JointName =
  | 'root' | 'torso' | 'head'
  | 'leftShoulder' | 'rightShoulder' | 'leftElbow' | 'rightElbow'
  | 'leftWrist' | 'rightWrist' | 'leftHip' | 'rightHip'
  | 'leftKnee' | 'rightKnee' | 'leftAnkle' | 'rightAnkle';

export type MannequinPose = {
  position: Vec3;
  rotation: Vec3;
  joints: Record<JointName, Vec3>;
};

export type PoseKeyframe = {
  label: string;
  capture: string;
  duration: number;
  pose: MannequinPose;
  partnerPose?: MannequinPose;
};

export type CameraGuide = {
  angle: 'straight-on' | 'slight-left' | 'slight-right' | 'profile';
  height: 'eye' | 'chest' | 'waist' | 'slightly-high';
  distance: 'close' | 'medium' | 'far';
  composition: string;
};

export type Pose = {
  id: string;
  title: string;
  artwork?: string;
  collection: PoseCollection;
  category: 'standing' | 'seated' | 'portrait' | 'couple' | 'mirror' | 'selfie';
  description: string;
  subjects: PoseSubject[];
  modes: PoseMode[];
  moods: Mood[];
  styles: string[];
  occasions: Occasion[];
  locations: Location[];
  framing: Framing[];
  helpAreas: HelpArea[];
  expressiveness: Expressiveness;
  movement: Movement;
  difficulty: Difficulty;
  props: string[];
  tags: string[];
  instructions: string[];
  handTips: string;
  postureTip: string;
  gazeTip: string;
  expressionTips: string[];
  photographerTip?: string;
  selfieTip?: string;
  cameraGuide?: CameraGuide;
  modelPose: MannequinPose;
  partnerPose?: MannequinPose;
  animation?: PoseKeyframe[];
};

export type QuestionnaireAnswers = {
  subject: PoseSubject;
  primaryMood: Mood;
  secondaryMoods: Mood[];
  occasion: Occasion;
  location: Location;
  mode: PoseMode;
  framing: Framing;
  helpAreas: HelpArea[];
  expressiveness: Expressiveness;
  movement: Movement;
  prop: string;
};

export type Recommendation = {
  pose: Pose;
  score: number;
  reasons: string[];
};

