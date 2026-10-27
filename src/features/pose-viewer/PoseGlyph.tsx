import type { Pose } from '../../types';
import { PoseDiagram } from './PoseDiagram';

export function PoseGlyph({ pose, compact = false }: { pose: Pose; compact?: boolean }) {
  return <PoseDiagram pose={pose} view="three-quarter" compact={compact} />;
}

