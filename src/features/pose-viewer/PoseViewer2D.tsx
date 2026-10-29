import { Eye, Hand, Pause, Play, ScanLine, SkipBack, SkipForward, Weight } from 'lucide-react';
import { useEffect, useState } from 'react';
import type { Pose } from '../../types';
import { PoseDiagram, type DiagramPalette, type DiagramView } from './PoseDiagram';

const viewLabels: { value: DiagramView; label: string }[] = [
  { value: 'front', label: 'Front' },
  { value: 'three-quarter', label: '3/4' },
  { value: 'side', label: 'Side' },
];

const paletteColors: Record<DiagramPalette, string> = {
  pearl: '#d7dadb',
  graphite: '#596063',
  'cool-grey': '#9aa8ae',
};

export default function PoseViewer2D({
  pose,
  showPhotographer = false,
  showCueRail = true,
}: {
  pose: Pose;
  showPhotographer?: boolean;
  showCueRail?: boolean;
}) {
  const [palette, setPalette] = useState<DiagramPalette>('pearl');
  const [guides, setGuides] = useState(false);
  const [view, setView] = useState<DiagramView>('three-quarter');
  const [playing, setPlaying] = useState(Boolean(pose.animation));
  const [stage, setStage] = useState(0);
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    const media = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReducedMotion(media.matches);
    const listener = () => setReducedMotion(media.matches);
    media.addEventListener('change', listener);
    return () => media.removeEventListener('change', listener);
  }, []);

  useEffect(() => {
    setStage(0);
    setPlaying(Boolean(pose.animation) && !reducedMotion);
  }, [pose.id, pose.animation, reducedMotion]);

  useEffect(() => {
    if (!playing || !pose.animation || reducedMotion) return;
    const duration = pose.animation[stage]?.duration ?? 1.4;
    const timer = window.setTimeout(() => setStage((current) => (current + 1) % pose.animation!.length), duration * 1000);
    return () => window.clearTimeout(timer);
  }, [playing, pose.animation, reducedMotion, stage]);

  const activePose = pose.animation?.[stage]?.pose ?? pose.modelPose;
  const activePartnerPose = pose.animation?.[stage]?.partnerPose ?? pose.partnerPose;

  return (
    <div className="pose-viewer-shell">
      <div className="viewer-canvas">
        <PoseDiagram
          pose={pose}
          mannequinPose={activePose}
          partnerPose={activePartnerPose}
          view={view}
          palette={palette}
          showGuides={guides}
          showPhotographer={showPhotographer}
        />
        <div className="viewer-badge">{pose.artwork ? 'authored reference · exact camera study' : `${view.replace('-', ' ')} view · sculpted articulated study`}</div>
        {guides && (
          <div className="diagram-legend" aria-hidden="true">
            <span><i className="legend-joint" /> pivot joints</span>
            <span><i className="legend-gaze" /> head direction</span>
            <span><i className="legend-weight" /> balance</span>
          </div>
        )}
      </div>

      {!pose.artwork && <div className="viewer-controls" aria-label="Pose illustration controls">
        <div className="view-tabs" aria-label="Illustration angle">
          {viewLabels.map((item) => (
            <button
              key={item.value}
              className={view === item.value ? 'active' : ''}
              onClick={() => setView(item.value)}
              aria-pressed={view === item.value}
            >
              {item.label}
            </button>
          ))}
        </div>
        <button className={`detail-toggle ${guides ? 'active' : ''}`} onClick={() => setGuides((value) => !value)} aria-pressed={guides}>
          <ScanLine size={17} /> {guides ? 'Hide labels' : 'Show labels'}
        </button>
        <span className="control-separator" />
        <span className="palette-label">Material</span>
        {(Object.keys(paletteColors) as DiagramPalette[]).map((value) => (
          <button
            key={value}
            className={`material-swatch ${palette === value ? 'active' : ''}`}
            style={{ backgroundColor: paletteColors[value] }}
            onClick={() => setPalette(value)}
            aria-label={`Use ${value} mannequin material`}
            aria-pressed={palette === value}
          />
        ))}
      </div>}

      {showCueRail && (
        <div className="visual-cue-rail" aria-label="Key visual pose cues">
          <article><Hand size={18} /><div><span>Hands</span><p>{pose.handTips}</p></div></article>
          <article><Weight size={18} /><div><span>Weight & posture</span><p>{pose.postureTip}</p></div></article>
          <article><Eye size={18} /><div><span>Head & gaze</span><p>{pose.gazeTip}</p></div></article>
        </div>
      )}

      {pose.animation && (
        <div className="animation-panel">
          <div className="animation-controls">
            <button className="icon-button" onClick={() => setStage((current) => (current - 1 + pose.animation!.length) % pose.animation!.length)} aria-label="Previous movement stage"><SkipBack size={17} /></button>
            <button className="play-button" onClick={() => setPlaying((value) => !value)} aria-label={playing ? 'Pause animation' : 'Play animation'}>
              {playing ? <Pause size={17} /> : <Play size={17} />} {playing ? 'Pause' : 'Play'}
            </button>
            <button className="icon-button" onClick={() => setStage((current) => (current + 1) % pose.animation!.length)} aria-label="Next movement stage"><SkipForward size={17} /></button>
          </div>
          <div className="stage-copy" aria-live="polite">
            <span>Drawing {stage + 1}/{pose.animation.length}</span>
            <strong>{pose.animation[stage].label}</strong>
            <p>{pose.animation[stage].capture}</p>
          </div>
          {reducedMotion && <small>Automatic movement is paused to respect your reduced-motion preference.</small>}
        </div>
      )}
    </div>
  );
}
