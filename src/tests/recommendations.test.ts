import { describe, expect, it } from 'vitest';
import { defaultAnswers } from '../data/options';
import { poses } from '../data/poses';
import { filterPoses, recommendPoses, scorePose } from '../features/recommendations/engine';

describe('pose library', () => {
  it('contains at least 60 complete, uniquely identified poses', () => {
    expect(poses.length).toBeGreaterThanOrEqual(60);
    expect(new Set(poses.map((pose) => pose.id)).size).toBe(poses.length);
    poses.forEach((pose) => {
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
    const soft = poses.find((pose) => pose.id === 'soft-chin')!;
    const answers = { ...defaultAnswers, primaryMood: 'confident' as const, mode: 'photographer' as const };
    expect(scorePose(confident, answers).score).toBeGreaterThan(scorePose(soft, answers).score);
  });

  it('hard-limits mirror and front-camera recommendations to the right mode', () => {
    const mirror = recommendPoses(poses, { ...defaultAnswers, mode: 'mirror-selfie', location: 'full-mirror' }, { limit: 20 });
    const front = recommendPoses(poses, { ...defaultAnswers, mode: 'front-selfie' }, { limit: 20 });
    expect(mirror.length).toBeGreaterThan(0);
    expect(mirror.every(({ pose }) => pose.modes.includes('mirror-selfie'))).toBe(true);
    expect(front.length).toBeGreaterThan(0);
    expect(front.every(({ pose }) => pose.modes.includes('front-selfie'))).toBe(true);
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
    const results = filterPoses(poses, 'phone', { subject: '', mood: '', movement: '', framing: '', mode: 'mirror-selfie', difficulty: '' });
    expect(results.length).toBeGreaterThan(0);
    expect(results.every((pose) => pose.modes.includes('mirror-selfie'))).toBe(true);
  });
});

