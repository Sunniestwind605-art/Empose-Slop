import type { Expressiveness, Framing, HelpArea, Location, Mood, Movement, Occasion, PoseMode, PoseSubject, QuestionnaireAnswers } from '../types';

export const subjectOptions: { value: PoseSubject; label: string; note: string }[] = [
  { value: 'masculine', label: 'One person · structured', note: 'A sharper styling direction, still fully flexible.' },
  { value: 'feminine', label: 'One person · flowing', note: 'A softer styling direction, without limiting the pose.' },
  { value: 'flexible', label: 'One person · open', note: 'Neutral styling with the broadest range.' },
  { value: 'pair', label: 'Two people', note: 'Couples, friends, collaborators or family.' },
];

export const moodOptions: { value: Mood; label: string; note: string }[] = [
  { value: 'cool', label: 'Cool & effortless', note: 'Loose lines, unhurried energy.' },
  { value: 'confident', label: 'Confident & powerful', note: 'Grounded stance and direct intent.' },
  { value: 'natural', label: 'Natural & relaxed', note: 'Small gestures that feel lived-in.' },
  { value: 'elegant', label: 'Elegant & formal', note: 'Composed lines and calm precision.' },
  { value: 'playful', label: 'Playful & fun', note: 'Movement, warmth and surprise.' },
  { value: 'mysterious', label: 'Mysterious', note: 'Quiet expression and indirect gaze.' },
  { value: 'romantic', label: 'Romantic & connected', note: 'Close spacing and shared attention.' },
  { value: 'bold', label: 'Bold & expressive', note: 'Clear shapes with more attitude.' },
  { value: 'editorial', label: 'Editorial', note: 'Graphic, fashion-led composition.' },
  { value: 'quirky', label: 'Weird & quirky', note: 'Deliberate asymmetry and wit.' },
  { value: 'candid', label: 'Candid', note: 'In-between moments and easy motion.' },
  { value: 'soft', label: 'Soft & calm', note: 'Gentle gaze and open shoulders.' },
  { value: 'sporty', label: 'Sporty & energetic', note: 'Ready-to-move posture.' },
  { value: 'artistic', label: 'Artistic', note: 'Unconventional shapes and framing.' },
];

export const occasionOptions: { value: Occasion; label: string }[] = [
  ['everyday', 'Everyday'], ['social', 'Social content'], ['travel', 'Travel'],
  ['formal', 'Formal event'], ['couple', 'Two-person photos'], ['fashion', 'Fashion/editorial'],
  ['portrait', 'Portrait session'], ['street', 'Street photography'], ['celebration', 'Celebration'],
  ['brand', 'Personal brand'], ['creative', 'Creative experiment'],
].map(([value, label]) => ({ value: value as Occasion, label }));

export const locationOptions: { value: Location; label: string }[] = [
  ['studio', 'Studio / plain'], ['urban', 'Urban street'], ['cafe', 'Café / indoors'],
  ['nature', 'Nature / park'], ['beach', 'Beach / open'], ['architecture', 'Architecture'],
  ['home-mirror', 'Home mirror'], ['full-mirror', 'Full-length mirror'], ['anywhere', 'Any location'],
].map(([value, label]) => ({ value: value as Location, label }));

export const modeOptions: { value: PoseMode; label: string }[] = [
  ['photographer', 'Photographer'], ['friend', 'Friend'], ['tripod', 'Tripod / stand'],
  ['front-selfie', 'Front-camera selfie'], ['mirror-selfie', 'Mirror selfie'],
].map(([value, label]) => ({ value: value as PoseMode, label }));

export const framingOptions: { value: Framing; label: string }[] = [
  ['close-up', 'Close-up'], ['head-shoulders', 'Head & shoulders'], ['waist-up', 'Waist-up'],
  ['three-quarter', 'Three-quarter'], ['full-body', 'Full-body'], ['environmental', 'Wide / environmental'],
].map(([value, label]) => ({ value: value as Framing, label }));

export const helpOptions: { value: HelpArea; label: string }[] = [
  ['expression', 'Expression'], ['gaze', 'Head & gaze'], ['hands', 'Hands & fingers'],
  ['shoulders', 'Shoulders'], ['posture', 'Posture'], ['legs', 'Legs & feet'],
  ['sit-lean', 'Sitting / leaning'], ['movement', 'Natural movement'], ['couple', 'Pair coordination'],
  ['phone', 'Phone placement'], ['composition', 'Camera composition'],
].map(([value, label]) => ({ value: value as HelpArea, label }));

export const expressiveOptions: { value: Expressiveness; label: string }[] = [
  ['subtle', 'Subtle'], ['natural', 'A little personality'], ['expressive', 'Noticeably expressive'], ['dramatic', 'Experimental'],
].map(([value, label]) => ({ value: value as Expressiveness, label }));

export const movementOptions: { value: Movement; label: string; note: string }[] = [
  { value: 'static', label: 'Hold the frame', note: 'A composed, repeatable pose.' },
  { value: 'micro', label: 'Small movement', note: 'A breath, glance or hand adjustment.' },
  { value: 'walking', label: 'Walk or turn', note: 'A guided three-stage sequence.' },
  { value: 'energetic', label: 'More energy', note: 'A bigger, expressive action.' },
];

export const defaultAnswers: QuestionnaireAnswers = {
  subject: 'flexible',
  primaryMood: 'natural',
  secondaryMoods: [],
  occasion: 'everyday',
  location: 'anywhere',
  mode: 'friend',
  framing: 'full-body',
  helpAreas: ['hands', 'posture'],
  expressiveness: 'natural',
  movement: 'micro',
  prop: 'none',
};

