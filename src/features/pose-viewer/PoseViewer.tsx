export { default } from './PoseViewer2D';

/* Legacy 3D implementation retained below for pose-data migration reference.
import { Canvas, useFrame } from '@react-three/fiber';
import { Line, OrbitControls, RoundedBox } from '@react-three/drei';
import { Pause, Play, RefreshCcw, Rotate3d, ScanLine, SkipBack, SkipForward, ZoomIn, ZoomOut } from 'lucide-react';
import { Suspense, useEffect, useMemo, useRef, useState } from 'react';
import type { Group, Mesh } from 'three';
import type { CameraGuide, JointName, MannequinPose, Pose } from '../../types';
import { PoseGlyph } from './PoseGlyph';

type Appearance = 'coral' | 'ink' | 'lavender';

const appearanceColors: Record<Appearance, { clothing: string; skin: string }> = {
  coral: { clothing: '#ff654f', skin: '#c98262' },
  ink: { clothing: '#383b37', skin: '#8d5b46' },
  lavender: { clothing: '#7774ad', skin: '#e0ad87' },
};

const cameraPositions = {
  front: [0, 1.4, 5.2],
  side: [5.2, 1.5, 0.2],
  top: [0.1, 6.2, 2.1],
} as const;

function supportsWebGL() {
  try {
    const canvas = document.createElement('canvas');
    return Boolean(canvas.getContext('webgl2') || canvas.getContext('webgl'));
  } catch {
    return false;
  }
}

export default function PoseViewer({ pose, showPhotographer = false }: { pose: Pose; showPhotographer?: boolean }) {
  const [appearance, setAppearance] = useState<Appearance>('coral');
  const [guides, setGuides] = useState(false);
  const [view, setView] = useState<keyof typeof cameraPositions>('front');
  const [zoom, setZoom] = useState(1);
  const [resetKey, setResetKey] = useState(0);
  const [playing, setPlaying] = useState(Boolean(pose.animation));
  const [stage, setStage] = useState(0);
  const [reducedMotion, setReducedMotion] = useState(false);
  const [webgl] = useState(supportsWebGL);

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
  const camera = cameraPositions[view].map((value) => value / zoom) as [number, number, number];
  const nextView = () => setView((current) => current === 'front' ? 'side' : current === 'side' ? 'top' : 'front');

  if (!webgl) {
    return (
      <div className="viewer-fallback" role="img" aria-label={`2D fallback for ${pose.title}`}>
        <PoseGlyph pose={pose} />
        <p><strong>3D unavailable.</strong> The complete written pose guide remains available below.</p>
      </div>
    );
  }

  return (
    <div className="pose-viewer-shell">
      <div className="viewer-canvas" aria-label={`Interactive 3D demonstration of ${pose.title}`}>
        <Canvas
          key={`${view}-${zoom}-${resetKey}`}
          camera={{ position: camera, fov: 38 }}
          dpr={[1, 1.6]}
          gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
        >
          <color attach="background" args={['#e9e4da']} />
          <fog attach="fog" args={['#e9e4da', 6, 11]} />
          <ambientLight intensity={1.55} />
          <directionalLight position={[3, 5, 4]} intensity={2.2} castShadow />
          <directionalLight position={[-4, 2, -3]} intensity={0.8} color="#bdc4ff" />
          <Suspense fallback={null}>
            <Mannequin pose={activePose} appearance={appearance} guides={guides} phone={pose.props.includes('phone')} />
            {activePartnerPose && <Mannequin pose={activePartnerPose} appearance={appearance === 'coral' ? 'lavender' : 'coral'} guides={guides} phone={pose.category === 'selfie'} />}
            {showPhotographer && pose.cameraGuide && <PhotographerGuide guide={pose.cameraGuide} />}
          </Suspense>
          <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -1.42, 0]} receiveShadow>
            <circleGeometry args={[3.2, 64]} />
            <meshStandardMaterial color="#d9d2c6" roughness={0.85} />
          </mesh>
          <gridHelper args={[6, 12, '#aaa69e', '#d8d2c7']} position={[0, -1.4, 0]} />
          <OrbitControls makeDefault enablePan={false} minDistance={3} maxDistance={8} minPolarAngle={0.25} maxPolarAngle={Math.PI / 1.82} target={[0, 0.15, 0]} />
        </Canvas>
        <div className="viewer-badge">{view} view · drag to rotate · pinch or wheel to zoom</div>
      </div>

      <div className="viewer-controls" aria-label="3D viewer controls">
        <button className="icon-button" onClick={nextView} aria-label="Switch preview angle" title="Switch preview angle"><Rotate3d size={18} /></button>
        <button className="icon-button" onClick={() => setZoom((value) => Math.min(1.35, value + .15))} aria-label="Zoom in" title="Zoom in"><ZoomIn size={18} /></button>
        <button className="icon-button" onClick={() => setZoom((value) => Math.max(.72, value - .15))} aria-label="Zoom out" title="Zoom out"><ZoomOut size={18} /></button>
        <button className="icon-button" onClick={() => { setView('front'); setZoom(1); setResetKey((value) => value + 1); }} aria-label="Reset 3D view" title="Reset view"><RefreshCcw size={18} /></button>
        <button className={`icon-button ${guides ? 'active' : ''}`} onClick={() => setGuides((value) => !value)} aria-pressed={guides} aria-label="Toggle joint guides" title="Joint guides"><ScanLine size={18} /></button>
        <span className="control-separator" />
        {(['coral', 'ink', 'lavender'] as Appearance[]).map((value) => (
          <button
            key={value}
            className={`material-swatch ${appearance === value ? 'active' : ''}`}
            style={{ backgroundColor: appearanceColors[value].clothing }}
            onClick={() => setAppearance(value)}
            aria-label={`Use ${value} mannequin appearance`}
            aria-pressed={appearance === value}
          />
        ))}
      </div>

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
            <span>Stage {stage + 1}/{pose.animation.length}</span>
            <strong>{pose.animation[stage].label}</strong>
            <p>{pose.animation[stage].capture}</p>
          </div>
          {reducedMotion && <small>Automatic movement is paused to respect your reduced-motion preference.</small>}
        </div>
      )}
    </div>
  );
}

function Mannequin({ pose, appearance, guides, phone }: { pose: MannequinPose; appearance: Appearance; guides: boolean; phone: boolean }) {
  const root = useRef<Group>(null);
  const refs = useRef<Partial<Record<JointName, Group>>>({});
  const colors = appearanceColors[appearance];
  const setJoint = (name: JointName) => (node: Group | null) => { if (node) refs.current[name] = node; };

  useFrame((_, delta) => {
    const ease = 1 - Math.exp(-delta * 7);
    if (root.current) {
      root.current.position.set(
        root.current.position.x + (pose.position[0] - root.current.position.x) * ease,
        root.current.position.y + (pose.position[1] - root.current.position.y) * ease,
        root.current.position.z + (pose.position[2] - root.current.position.z) * ease,
      );
      root.current.rotation.x += (pose.rotation[0] - root.current.rotation.x) * ease;
      root.current.rotation.y += (pose.rotation[1] - root.current.rotation.y) * ease;
      root.current.rotation.z += (pose.rotation[2] - root.current.rotation.z) * ease;
    }
    Object.entries(pose.joints).forEach(([name, rotation]) => {
      const node = refs.current[name as JointName];
      if (!node) return;
      node.rotation.x += (rotation[0] - node.rotation.x) * ease;
      node.rotation.y += (rotation[1] - node.rotation.y) * ease;
      node.rotation.z += (rotation[2] - node.rotation.z) * ease;
    });
  });

  const joint = (position: [number, number, number]) => guides ? (
    <mesh position={position}><sphereGeometry args={[.055, 12, 12]} /><meshBasicMaterial color="#c9ff64" depthTest={false} /></mesh>
  ) : null;

  return (
    <group ref={root} position={pose.position} rotation={pose.rotation}>
      <group ref={setJoint('root')}>
        <mesh castShadow position={[0, .15, 0]}><sphereGeometry args={[.27, 24, 18]} /><meshStandardMaterial color={colors.clothing} roughness={.7} /></mesh>
        <group ref={setJoint('torso')} position={[0, .35, 0]}>
          <RoundedBox args={[.72, .9, .34]} radius={.15} smoothness={4} castShadow position={[0, .46, 0]}>
            <meshStandardMaterial color={colors.clothing} roughness={.72} />
          </RoundedBox>
          <group ref={setJoint('head')} position={[0, 1.16, 0]}>
            <mesh castShadow position={[0, .16, 0]}><capsuleGeometry args={[.22, .27, 8, 18]} /><meshStandardMaterial color={colors.skin} roughness={.78} /></mesh>
            <mesh position={[0, .17, .205]}><coneGeometry args={[.035, .1, 12]} /><meshStandardMaterial color="#4e3028" /></mesh>
            {joint([0, 0, 0])}
          </group>
          <Arm side="left" jointRef={setJoint} color={colors.clothing} skin={colors.skin} guides={guides} phone={false} />
          <Arm side="right" jointRef={setJoint} color={colors.clothing} skin={colors.skin} guides={guides} phone={phone} />
        </group>
        <Leg side="left" jointRef={setJoint} color={appearance === 'ink' ? '#1f211f' : '#3c4854'} guides={guides} />
        <Leg side="right" jointRef={setJoint} color={appearance === 'ink' ? '#1f211f' : '#3c4854'} guides={guides} />
      </group>
    </group>
  );
}

function Arm({ side, jointRef, color, skin, guides, phone }: { side: 'left' | 'right'; jointRef: (name: JointName) => (node: Group | null) => void; color: string; skin: string; guides: boolean; phone: boolean }) {
  const sign = side === 'left' ? -1 : 1;
  const shoulder = `${side}Shoulder` as JointName;
  const elbow = `${side}Elbow` as JointName;
  const wrist = `${side}Wrist` as JointName;
  return (
    <group ref={jointRef(shoulder)} position={[sign * .45, .86, 0]}>
      {guides && <mesh><sphereGeometry args={[.055, 12, 12]} /><meshBasicMaterial color="#c9ff64" /></mesh>}
      <mesh castShadow position={[0, -.27, 0]}><capsuleGeometry args={[.1, .34, 6, 12]} /><meshStandardMaterial color={color} roughness={.75} /></mesh>
      <group ref={jointRef(elbow)} position={[0, -.57, 0]}>
        {guides && <mesh><sphereGeometry args={[.05, 12, 12]} /><meshBasicMaterial color="#c9ff64" /></mesh>}
        <mesh castShadow position={[0, -.24, 0]}><capsuleGeometry args={[.082, .31, 6, 12]} /><meshStandardMaterial color={skin} roughness={.8} /></mesh>
        <group ref={jointRef(wrist)} position={[0, -.51, 0]}>
          <mesh castShadow position={[0, -.07, 0]}><sphereGeometry args={[.1, 16, 12]} /><meshStandardMaterial color={skin} roughness={.8} /></mesh>
          {phone && <mesh castShadow position={[0, -.07, .11]}><boxGeometry args={[.18, .31, .045]} /><meshStandardMaterial color="#252927" metalness={.35} roughness={.38} /></mesh>}
        </group>
      </group>
    </group>
  );
}

function Leg({ side, jointRef, color, guides }: { side: 'left' | 'right'; jointRef: (name: JointName) => (node: Group | null) => void; color: string; guides: boolean }) {
  const sign = side === 'left' ? -1 : 1;
  const hip = `${side}Hip` as JointName;
  const knee = `${side}Knee` as JointName;
  const ankle = `${side}Ankle` as JointName;
  return (
    <group ref={jointRef(hip)} position={[sign * .18, .14, 0]}>
      {guides && <mesh><sphereGeometry args={[.055, 12, 12]} /><meshBasicMaterial color="#c9ff64" /></mesh>}
      <mesh castShadow position={[0, -.39, 0]}><capsuleGeometry args={[.14, .52, 7, 14]} /><meshStandardMaterial color={color} roughness={.78} /></mesh>
      <group ref={jointRef(knee)} position={[0, -.79, 0]}>
        {guides && <mesh><sphereGeometry args={[.05, 12, 12]} /><meshBasicMaterial color="#c9ff64" /></mesh>}
        <mesh castShadow position={[0, -.36, 0]}><capsuleGeometry args={[.115, .48, 7, 14]} /><meshStandardMaterial color={color} roughness={.78} /></mesh>
        <group ref={jointRef(ankle)} position={[0, -.72, 0]}>
          <RoundedBox args={[.25, .16, .46]} radius={.06} smoothness={3} castShadow position={[0, -.04, .1]}>
            <meshStandardMaterial color="#242625" roughness={.75} />
          </RoundedBox>
        </group>
      </group>
    </group>
  );
}

function PhotographerGuide({ guide }: { guide: CameraGuide }) {
  const distance = guide.distance === 'far' ? 3.1 : guide.distance === 'medium' ? 2.4 : 1.8;
  const x = guide.angle === 'slight-left' ? -1 : guide.angle === 'slight-right' ? 1 : guide.angle === 'profile' ? 2.4 : 0;
  const z = guide.angle === 'profile' ? .2 : distance;
  const y = guide.height === 'waist' ? -.35 : guide.height === 'chest' ? .15 : .6;
  return (
    <group position={[x, -.7, z]}>
      <mesh position={[0, .75, 0]}><capsuleGeometry args={[.16, .6, 8, 16]} /><meshStandardMaterial color="#66706d" transparent opacity={.72} /></mesh>
      <mesh position={[0, 1.2, 0]}><sphereGeometry args={[.2, 18, 14]} /><meshStandardMaterial color="#66706d" transparent opacity={.72} /></mesh>
      <mesh position={[0, 1.03, -.22]} rotation={[0, 0, 0]}><boxGeometry args={[.34, .22, .2]} /><meshStandardMaterial color="#1f211f" /></mesh>
      <Line points={[[0, 1.03, -.3], [-x, .7 - y, -z]]} color="#ff5c45" dashed dashScale={5} lineWidth={1.5} />
    </group>
  );
}
*/

