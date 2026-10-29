import type { Pose, QuestionnaireAnswers, Recommendation } from '../../types';

const label = (value: string) => value.replaceAll('-', ' ');

export function scorePose(pose: Pose, answers: QuestionnaireAnswers): Recommendation {
  let score = 0;
  const reasons: string[] = [];

  if (pose.subjects.includes(answers.subject)) {
    score += 34;
    reasons.push(answers.subject === 'pair' ? 'designed for two people' : 'fits your subject direction');
  }
  if (pose.modes.includes(answers.mode)) {
    score += 30;
    reasons.push(`works for ${label(answers.mode)}`);
  }
  if (pose.moods.includes(answers.primaryMood)) {
    score += 28;
    reasons.push(`matches your ${label(answers.primaryMood)} mood`);
  }
  const secondaryMatches = answers.secondaryMoods.filter((mood) => pose.moods.includes(mood));
  score += secondaryMatches.length * 9;
  if (secondaryMatches.length) reasons.push(`also feels ${secondaryMatches.map(label).join(' and ')}`);
  if (pose.occasions.includes(answers.occasion)) {
    score += 14;
    reasons.push(`suited to ${label(answers.occasion)}`);
  }
  if (pose.locations.includes(answers.location) || pose.locations.includes('anywhere') || answers.location === 'anywhere') {
    score += 11;
    reasons.push(`works in ${label(answers.location)}`);
  }
  if (pose.framing.includes(answers.framing)) {
    score += 14;
    reasons.push(`supports ${label(answers.framing)} framing`);
  }
  const helpMatches = answers.helpAreas.filter((area) => pose.helpAreas.includes(area));
  score += helpMatches.length * 6;
  if (helpMatches.length) reasons.push(`includes ${helpMatches.slice(0, 2).map(label).join(' + ')} coaching`);
  if (pose.expressiveness === answers.expressiveness) score += 8;
  if (pose.movement === answers.movement) {
    score += 16;
    reasons.push(answers.movement === 'static' ? 'easy to hold' : `includes ${label(answers.movement)} direction`);
  } else if (answers.movement !== 'static' && pose.animation) score += 5;
  if (answers.prop !== 'none' && pose.props.includes(answers.prop)) {
    score += 10;
    reasons.push(`uses your ${answers.prop}`);
  }

  return { pose, score, reasons: reasons.slice(0, 3) };
}

function mulberry32(seed: number) {
  return () => {
    let t = seed += 0x6d2b79f5;
    t = Math.imul(t ^ t >>> 15, t | 1);
    t ^= t + Math.imul(t ^ t >>> 7, t | 61);
    return ((t ^ t >>> 14) >>> 0) / 4294967296;
  };
}

export function recommendPoses(
  allPoses: Pose[],
  answers: QuestionnaireAnswers,
  options: { limit?: number; excludeIds?: string[]; seed?: number } = {},
): Recommendation[] {
  const limit = options.limit ?? 8;
  const random = mulberry32(options.seed ?? 42);
  const excluded = new Set(options.excludeIds ?? []);
  const strict = allPoses.filter((pose) => {
    if (!pose.subjects.includes(answers.subject)) return false;
    if (answers.mode === 'mirror-selfie') return pose.modes.includes('mirror-selfie');
    if (answers.mode === 'front-selfie') return pose.modes.includes('front-selfie');
    return pose.modes.some((mode) => ['photographer', 'friend', 'tripod'].includes(mode));
  });

  const scored = strict
    .map((pose) => ({ ...scorePose(pose, answers), jitter: random() * 2 }))
    .sort((a, b) => (b.score + b.jitter) - (a.score + a.jitter));

  const unseen = scored.filter(({ pose }) => !excluded.has(pose.id));
  const pool = unseen.length >= Math.min(4, limit) ? unseen : scored;
  const selected: typeof scored = [];
  const categoryCounts = new Map<string, number>();

  for (const item of pool) {
    const count = categoryCounts.get(item.pose.category) ?? 0;
    if (count < 3) {
      selected.push(item);
      categoryCounts.set(item.pose.category, count + 1);
    }
    if (selected.length === limit) break;
  }

  if (selected.length < limit) {
    for (const item of pool) {
      if (!selected.some(({ pose }) => pose.id === item.pose.id)) selected.push(item);
      if (selected.length === limit) break;
    }
  }

  return selected.map(({ jitter: _jitter, ...result }) => result);
}

export type LibraryFilters = {
  collection: string;
  subject: string;
  mood: string;
  movement: string;
  framing: string;
  mode: string;
  difficulty: string;
};

export function filterPoses(poses: Pose[], search: string, filters: LibraryFilters) {
  const query = search.trim().toLowerCase();
  return poses.filter((pose) => {
    const haystack = [pose.title, pose.description, ...pose.tags, ...pose.styles].join(' ').toLowerCase();
    return (!query || haystack.includes(query))
      && (!filters.collection || pose.collection === filters.collection)
      && (!filters.subject || pose.subjects.includes(filters.subject as never))
      && (!filters.mood || pose.moods.includes(filters.mood as never))
      && (!filters.movement || pose.movement === filters.movement)
      && (!filters.framing || pose.framing.includes(filters.framing as never))
      && (!filters.mode || pose.modes.includes(filters.mode as never))
      && (!filters.difficulty || pose.difficulty === filters.difficulty);
  });
}

