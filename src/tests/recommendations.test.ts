import { describe, expect, it } from 'vitest';
import { defaultAnswers } from '../data/options';
import { poses } from '../data/poses';
import { filterPoses, recommendPoses, scorePose } from '../features/recommendations/engine';

describe('pose library', () => {
  it('contains the complete authored artwork library with unique identifiers', () => {
    expect(poses).toHaveLength(64);
    expect(new Set(poses.map((pose) => pose.id)).size).toBe(poses.length);
    expect(new Set(poses.map((pose) => pose.collection))).toEqual(new Set(['essentials', 'editorial', 'romantic']));
    expect(poses.filter((pose) => pose.collection === 'romantic')).toHaveLength(20);
    poses.forEach((pose) => {
      expect(pose.artwork).toMatch(/^pose-guides\/.+\.jpg$/);
      expect(pose.instructions.length).toBeGreaterThanOrEqual(4);
      expect(pose.modelPose.joints.head).toHaveLength(3);
      expect(pose.handTips.length).toBeGreaterThan(15);
    });
  });

  it('provides genuinely varied model configurations', () => {
    const signatures = poses.map((pose) => JSON.stringify(pose.modelPose));
    expect(new Set(signatures).size).toBe(poses.length);
  });
});

describe('recommendation engine', () => {
  it('gives a strong primary mood match more weight than a mismatch', () => {
    const confident = poses.find((pose) => pose.id === 'power-square')!;
    const soft = poses.find((pose) => pose.id === 'editorial-02-paper-focus')!;
    const answers = { ...defaultAnswers, primaryMood: 'confident' as const, mode: 'photographer' as const };
    expect(scorePose(confident, answers).score).toBeGreaterThan(scorePose(soft, answers).score);
  });

  it('does not invent mirror or front-camera results without authored artwork', () => {
    const mirror = recommendPoses(poses, { ...defaultAnswers, mode: 'mirror-selfie', location: 'full-mirror' }, { limit: 20 });
    const front = recommendPoses(poses, { ...defaultAnswers, mode: 'front-selfie' }, { limit: 20 });
    expect(mirror).toHaveLength(0);
    expect(front).toHaveLength(0);
  });

  it('returns pair poses for a two-person brief', () => {
    const results = recommendPoses(poses, { ...defaultAnswers, subject: 'pair', occasion: 'couple' }, { limit: 8 });
    expect(results).toHaveLength(8);
    expect(results.every(({ pose }) => pose.subjects.includes('pair'))).toBe(true);
  });

  it('avoids a recent result set when alternatives exist', () => {
    const first = recommendPoses(poses, defaultAnswers, { limit: 4, seed: 9 });
    const second = recommendPoses(poses, defaultAnswers, { limit: 4, seed: 9, excludeIds: first.map(({ pose }) => pose.id) });
    expect(second.some(({ pose }) => first.every((old) => old.pose.id !== pose.id))).toBe(true);
  });

  it('supports combined search and filters', () => {
    const results = filterPoses(poses, 'phone', { collection: '', subject: '', mood: '', movement: '', framing: '', mode: 'photographer', difficulty: '' });
    expect(results.length).toBeGreaterThan(0);
    expect(results.every((pose) => pose.modes.includes('photographer'))).toBe(true);
  });
});

