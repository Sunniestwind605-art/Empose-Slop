import { useId } from 'react';
import type { MannequinPose, Pose, Vec3 } from '../../types';

export type DiagramView = 'front' | 'three-quarter' | 'side';
export type DiagramPalette = 'pearl' | 'graphite' | 'cool-grey';

type V3 = [number, number, number];
type M3 = [number, number, number, number, number, number, number, number, number];
type Frame = { origin: V3; matrix: M3 };
type BodyPoint =
  | 'root' | 'torso' | 'neck' | 'head'
  | 'leftShoulder' | 'leftElbow' | 'leftWrist' | 'leftHand'
  | 'rightShoulder' | 'rightElbow' | 'rightWrist' | 'rightHand'
  | 'leftHip' | 'leftKnee' | 'leftAnkle' | 'leftFoot'
  | 'rightHip' | 'rightKnee' | 'rightAnkle' | 'rightFoot';
type Skeleton = { points: Record<BodyPoint, V3>; headFrame: Frame };
type Point2 = { x: number; y: number; depth: number };
type ProjectedSkeleton = { points: Record<BodyPoint, Point2>; headFrame: Frame };

const identity: M3 = [1, 0, 0, 0, 1, 0, 0, 0, 1];

type MaterialPalette = {
  light: string;
  mid: string;
  shadow: string;
  deep: string;
  edge: string;
  accent: string;
};

const palettes: Record<DiagramPalette, MaterialPalette> = {
  pearl: { light: '#ebeae7', mid: '#cbc9c5', shadow: '#aaa9a4', deep: '#8a8a85', edge: '#6d6e6a', accent: '#ff654f' },
  graphite: { light: '#777977', mid: '#626461', shadow: '#50524f', deep: '#414340', edge: '#343633', accent: '#c9ff64' },
  'cool-grey': { light: '#dce4e5', mid: '#bdcbce', shadow: '#9babad', deep: '#7f9194', edge: '#637477', accent: '#6f8f32' },
};

const add = (a: V3, b: V3): V3 => [a[0] + b[0], a[1] + b[1], a[2] + b[2]];

function multiply(a: M3, b: M3): M3 {
  return [
    a[0] * b[0] + a[1] * b[3] + a[2] * b[6],
    a[0] * b[1] + a[1] * b[4] + a[2] * b[7],
    a[0] * b[2] + a[1] * b[5] + a[2] * b[8],
    a[3] * b[0] + a[4] * b[3] + a[5] * b[6],
    a[3] * b[1] + a[4] * b[4] + a[5] * b[7],
    a[3] * b[2] + a[4] * b[5] + a[5] * b[8],
    a[6] * b[0] + a[7] * b[3] + a[8] * b[6],
    a[6] * b[1] + a[7] * b[4] + a[8] * b[7],
    a[6] * b[2] + a[7] * b[5] + a[8] * b[8],
  ];
}

function apply(matrix: M3, value: V3): V3 {
  return [
    matrix[0] * value[0] + matrix[1] * value[1] + matrix[2] * value[2],
    matrix[3] * value[0] + matrix[4] * value[1] + matrix[5] * value[2],
    matrix[6] * value[0] + matrix[7] * value[1] + matrix[8] * value[2],
  ];
}

function euler([x, y, z]: Vec3): M3 {
  const cx = Math.cos(x); const sx = Math.sin(x);
  const cy = Math.cos(y); const sy = Math.sin(y);
  const cz = Math.cos(z); const sz = Math.sin(z);
  const rotateX: M3 = [1, 0, 0, 0, cx, -sx, 0, sx, cx];
  const rotateY: M3 = [cy, 0, sy, 0, 1, 0, -sy, 0, cy];
  const rotateZ: M3 = [cz, -sz, 0, sz, cz, 0, 0, 0, 1];
  return multiply(rotateZ, multiply(rotateY, rotateX));
}

function child(parent: Frame, offset: V3, rotation: Vec3): Frame {
  return {
    origin: add(parent.origin, apply(parent.matrix, offset)),
    matrix: multiply(parent.matrix, euler(rotation)),
  };
}

const endpoint = (frame: Frame, offset: V3): V3 => add(frame.origin, apply(frame.matrix, offset));

function buildSkeleton(pose: MannequinPose): Skeleton {
  const world: Frame = { origin: [...pose.position], matrix: euler(pose.rotation) };
  const root = child(world, [0, 0, 0], pose.joints.root);
  const torso = child(root, [0, .35, 0], pose.joints.torso);
  const head = child(torso, [0, .98, 0], pose.joints.head);

  const leftShoulder = child(torso, [-.42, .68, 0], pose.joints.leftShoulder);
  const leftElbow = child(leftShoulder, [0, -.57, 0], pose.joints.leftElbow);
  const leftWrist = child(leftElbow, [0, -.51, 0], pose.joints.leftWrist);
  const rightShoulder = child(torso, [.42, .68, 0], pose.joints.rightShoulder);
  const rightElbow = child(rightShoulder, [0, -.57, 0], pose.joints.rightElbow);
  const rightWrist = child(rightElbow, [0, -.51, 0], pose.joints.rightWrist);

  const leftHip = child(root, [-.25, .14, 0], pose.joints.leftHip);
  const leftKnee = child(leftHip, [0, -.79, 0], pose.joints.leftKnee);
  const leftAnkle = child(leftKnee, [0, -.72, 0], pose.joints.leftAnkle);
  const rightHip = child(root, [.25, .14, 0], pose.joints.rightHip);
  const rightKnee = child(rightHip, [0, -.79, 0], pose.joints.rightKnee);
  const rightAnkle = child(rightKnee, [0, -.72, 0], pose.joints.rightAnkle);

  return {
    headFrame: head,
    points: {
      root: root.origin,
      torso: torso.origin,
      neck: head.origin,
      head: endpoint(head, [0, .2, 0]),
      leftShoulder: leftShoulder.origin,
      leftElbow: leftElbow.origin,
      leftWrist: leftWrist.origin,
      leftHand: endpoint(leftWrist, [0, -.17, 0]),
      rightShoulder: rightShoulder.origin,
      rightElbow: rightElbow.origin,
      rightWrist: rightWrist.origin,
      rightHand: endpoint(rightWrist, [0, -.17, 0]),
      leftHip: leftHip.origin,
      leftKnee: leftKnee.origin,
      leftAnkle: leftAnkle.origin,
      leftFoot: endpoint(leftAnkle, [0, -.03, .3]),
      rightHip: rightHip.origin,
      rightKnee: rightKnee.origin,
      rightAnkle: rightAnkle.origin,
      rightFoot: endpoint(rightAnkle, [0, -.03, .3]),
    },
  };
}

function rawProjection([x, y, z]: V3, view: DiagramView): Point2 {
  if (view === 'side') return { x: z + x * .18, y, depth: -x };
  if (view === 'three-quarter') return { x: x * .78 + z * .44, y, depth: z * .78 - x * .2 };
  return { x: x + z * .12, y, depth: z };
}

function projectSkeletons(skeletons: Skeleton[], view: DiagramView, upperFocus: boolean) {
  const raw = skeletons.map((skeleton) => ({
    headFrame: skeleton.headFrame,
    points: Object.fromEntries(Object.entries(skeleton.points).map(([name, value]) => [name, rawProjection(value, view)])) as Record<BodyPoint, Point2>,
  }));
  const focusNames: BodyPoint[] = upperFocus
    ? ['head', 'neck', 'leftShoulder', 'rightShoulder', 'leftElbow', 'rightElbow', 'leftWrist', 'rightWrist', 'leftHand', 'rightHand', 'leftHip', 'rightHip']
    : Object.keys(raw[0].points) as BodyPoint[];
  const focusPoints = raw.flatMap((skeleton) => focusNames.map((name) => skeleton.points[name]));
  const minX = Math.min(...focusPoints.map((point) => point.x));
  const maxX = Math.max(...focusPoints.map((point) => point.x));
  const minY = Math.min(...focusPoints.map((point) => point.y));
  const maxY = Math.max(...focusPoints.map((point) => point.y));
  const width = Math.max(maxX - minX, upperFocus ? 1.4 : 2.15);
  const height = Math.max(maxY - minY, upperFocus ? 1.7 : 2.9);
  const scale = Math.min(510 / width, 540 / height, upperFocus ? 225 : 190);
  const centerX = (minX + maxX) / 2;
  const centerY = (minY + maxY) / 2;
  return {
    scale,
    skeletons: raw.map((skeleton) => ({
      ...skeleton,
      points: Object.fromEntries(Object.entries(skeleton.points).map(([name, point]) => [name, {
        x: 360 + (point.x - centerX) * scale,
        y: 346 - (point.y - centerY) * scale,
        depth: point.depth,
      }])) as Record<BodyPoint, Point2>,
    })) as ProjectedSkeleton[],
  };
}

function refitProjectedSkeletons(skeletons: ProjectedSkeleton[], upperFocus: boolean) {
  const focusNames: BodyPoint[] = upperFocus
    ? ['head', 'neck', 'leftShoulder', 'rightShoulder', 'leftElbow', 'rightElbow', 'leftWrist', 'rightWrist', 'leftHand', 'rightHand', 'leftHip', 'rightHip']
    : (Object.keys(skeletons[0].points) as BodyPoint[]);
  const points = skeletons.flatMap((skeleton) => focusNames.map((name) => skeleton.points[name]));
  const minX = Math.min(...points.map((point) => point.x));
  const maxX = Math.max(...points.map((point) => point.x));
  const minY = Math.min(...points.map((point) => point.y));
  const maxY = Math.max(...points.map((point) => point.y));
  const width = Math.max(1, maxX - minX);
  const height = Math.max(1, maxY - minY);
  const factor = Math.min(1, 440 / width, (upperFocus ? 510 : 530) / height);
  if (factor >= .995) return 1;
  const centerX = (minX + maxX) / 2;
  const centerY = (minY + maxY) / 2;
  const targetY = upperFocus ? 335 : 355;
  skeletons.forEach((skeleton) => {
    (Object.keys(skeleton.points) as BodyPoint[]).forEach((name) => {
      const point = skeleton.points[name];
      point.x = 360 + (point.x - centerX) * factor;
      point.y = targetY + (point.y - centerY) * factor;
    });
  });
  return factor;
}

const line = (a: Point2, b: Point2) => `M ${a.x.toFixed(1)} ${a.y.toFixed(1)} L ${b.x.toFixed(1)} ${b.y.toFixed(1)}`;
const midpoint = (a: Point2, b: Point2): Point2 => ({ x: (a.x + b.x) / 2, y: (a.y + b.y) / 2, depth: (a.depth + b.depth) / 2 });

export function PoseDiagram({
  pose,
  mannequinPose,
  partnerPose,
  view = 'three-quarter',
  palette = 'pearl',
  showGuides = false,
  showPhotographer = false,
  compact = false,
}: {
  pose: Pose;
  mannequinPose?: MannequinPose;
  partnerPose?: MannequinPose;
  view?: DiagramView;
  palette?: DiagramPalette;
  showGuides?: boolean;
  showPhotographer?: boolean;
  compact?: boolean;
}) {
  const localId = useId().replaceAll(':', '');
  if (pose.artwork) {
    const artworkUrl = `${import.meta.env.BASE_URL}${pose.artwork.replace(/^\//, '')}`;
    return (
      <svg
        className={`pose-diagram authored-pose-art ${compact ? 'pose-glyph compact-diagram' : ''}`}
        viewBox="0 0 1254 1254"
        role="img"
        aria-label={`Authored articulated mannequin study of ${pose.title}`}
        preserveAspectRatio="xMidYMid slice"
      >
        <image href={artworkUrl} width="1254" height="1254" preserveAspectRatio="xMidYMid slice" />
      </svg>
    );
  }
  const figures = [buildSkeleton(mannequinPose ?? pose.modelPose)];
  const activePartner = partnerPose ?? pose.partnerPose;
  if (activePartner) figures.push(buildSkeleton(activePartner));
  const upperFocus = pose.category === 'portrait' || pose.category === 'selfie';
  const projected = projectSkeletons(figures, view, upperFocus);
  const { skeletons } = projected;
  refineIllustration(pose, skeletons, view, projected.scale);
  const scale = projected.scale * refitProjectedSkeletons(skeletons, upperFocus);
  const floor = Math.min(652, Math.max(...skeletons.flatMap((item) => [item.points.leftFoot.y, item.points.rightFoot.y])) + 18);
  const background = pose.category === 'mirror' ? '#dce5e8' : pose.moods.includes('bold') ? '#d5d3d0' : '#e4e2de';

  return (
    <svg
      className={`pose-diagram ${compact ? 'pose-glyph compact-diagram' : ''}`}
      viewBox="0 0 720 700"
      role="img"
      aria-label={`Detailed ${view} view illustration of ${pose.title}`}
      preserveAspectRatio="xMidYMid meet"
    >
      <defs>
        <linearGradient id={`${localId}-paper`} x1="0" y1="0" x2="1" y2="1">
          <stop stopColor={background} />
          <stop offset=".56" stopColor={pose.moods.includes('soft') ? '#f2f1ef' : '#d9dcdb'} />
          <stop offset="1" stopColor="#c7cbca" />
        </linearGradient>
        <filter id={`${localId}-drop`} x="-30%" y="-30%" width="160%" height="170%">
          <feDropShadow dx="0" dy="3" stdDeviation="3" floodColor="#252a2c" floodOpacity=".12" />
        </filter>
        <marker id={`${localId}-arrow`} markerWidth="9" markerHeight="9" refX="7" refY="4.5" orient="auto">
          <path d="M0 0 9 4.5 0 9Z" fill="#20211f" />
        </marker>
        <marker id={`${localId}-gaze`} markerWidth="9" markerHeight="9" refX="7" refY="4.5" orient="auto">
          <path d="M0 0 9 4.5 0 9Z" fill="#6f8f32" />
        </marker>
        <clipPath id={`${localId}-clip`}><rect x="0" y="0" width="720" height="700" rx={compact ? 26 : 0} /></clipPath>
      </defs>
      <g clipPath={`url(#${localId}-clip)`}>
        <rect width="720" height="700" fill={`url(#${localId}-paper)`} />
        {!compact && (
          <g stroke="#20211f" strokeOpacity=".07" strokeWidth="1">
            {[120, 240, 360, 480, 600].map((x) => <path key={`x-${x}`} d={`M${x} 0V700`} />)}
            {[100, 200, 300, 400, 500, 600].map((y) => <path key={`y-${y}`} d={`M0 ${y}H720`} />)}
          </g>
        )}
        {pose.category === 'mirror' && <MirrorFrame />}
        {pose.category === 'seated' && !pose.id.includes('floor') && <Seat skeleton={skeletons[0]} floor={floor} variant={pose.id} />}
        {pose.id.includes('floor') && <FloorMat skeleton={skeletons[0]} />}
        {pose.id === 'cafe-cup' && <Cup skeleton={skeletons[0]} />}
        <path d={`M 42 ${floor} Q 360 ${floor - 13} 678 ${floor}`} fill="none" stroke="#20211f" strokeOpacity=".25" strokeWidth="2" />
        {skeletons.map((skeleton, index) => {
          const figurePalette: DiagramPalette = pose.id === 'reference-arc-duo'
            ? (index === 0 ? 'graphite' : 'cool-grey')
            : index === 0 ? palette : palette === 'graphite' ? 'cool-grey' : 'graphite';
          return (
          <Figure
            key={index}
            skeleton={skeleton}
            scale={scale}
            id={`${localId}-figure-${index}`}
            material={palettes[figurePalette]}
            phone={pose.props.includes('phone') && (index === 0 || pose.category === 'selfie')}
            cap={pose.props.includes('cap') && index === 1}
            guides={showGuides && !compact}
            gazeMarker={`${localId}-gaze`}
            compact={compact}
            view={view}
          />
          );
        })}
        {pose.animation && <MotionMarks skeleton={skeletons[0]} marker={`${localId}-arrow`} compact={compact} />}
        {showPhotographer && pose.cameraGuide && !compact && <CameraBlueprint pose={pose} skeleton={skeletons[0]} marker={`${localId}-arrow`} />}
        {showGuides && !compact && <Callouts skeleton={skeletons[0]} upperFocus={upperFocus} />}
        {!compact && (
          <g transform="translate(22 22)">
            <rect width="172" height="35" rx="17.5" fill="#fbf8f2" fillOpacity=".88" stroke="#20211f" strokeOpacity=".16" />
            <circle cx="18" cy="17.5" r="5" fill="#ff654f" />
            <text x="31" y="22" fill="#20211f" fontSize="12" fontWeight="800" letterSpacing="1.2">{upperFocus ? 'WAIST-UP STUDY' : 'FULL-BODY STUDY'}</text>
          </g>
        )}
      </g>
    </svg>
  );
}

function pointBetween(a: Point2, b: Point2, t: number): Point2 {
  return { x: a.x + (b.x - a.x) * t, y: a.y + (b.y - a.y) * t, depth: a.depth + (b.depth - a.depth) * t };
}

function anatomicalSegmentPath(a: Point2, b: Point2, startWidth: number, midWidth: number, endWidth: number) {
  const dx = b.x - a.x;
  const dy = b.y - a.y;
  const length = Math.max(1, Math.hypot(dx, dy));
  const nx = -dy / length;
  const ny = dx / length;
  const s = { x: nx * startWidth * .5, y: ny * startWidth * .5 };
  const m = { x: nx * midWidth * .5, y: ny * midWidth * .5 };
  const e = { x: nx * endWidth * .5, y: ny * endWidth * .5 };
  const c1 = { x: a.x + dx * .28, y: a.y + dy * .28 };
  const c2 = { x: a.x + dx * .62, y: a.y + dy * .62 };
  const c3 = { x: a.x + dx * .82, y: a.y + dy * .82 };
  return [
    `M ${a.x + s.x} ${a.y + s.y}`,
    `C ${c1.x + m.x} ${c1.y + m.y} ${c2.x + m.x} ${c2.y + m.y} ${c3.x + e.x} ${c3.y + e.y}`,
    `Q ${b.x + e.x} ${b.y + e.y} ${b.x} ${b.y}`,
    `Q ${b.x - e.x} ${b.y - e.y} ${c3.x - e.x} ${c3.y - e.y}`,
    `C ${c2.x - m.x} ${c2.y - m.y} ${c1.x - m.x} ${c1.y - m.y} ${a.x - s.x} ${a.y - s.y}`,
    `Q ${a.x} ${a.y} ${a.x + s.x} ${a.y + s.y} Z`,
  ].join(' ');
}

function Figure({
  id,
  skeleton,
  scale,
  material,
  phone,
  cap,
  guides,
  gazeMarker,
  compact,
  view,
}: {
  id: string;
  skeleton: ProjectedSkeleton;
  scale: number;
  material: MaterialPalette;
  phone: boolean;
  cap: boolean;
  guides: boolean;
  gazeMarker: string;
  compact: boolean;
  view: DiagramView;
}) {
  const p = skeleton.points;
  const arm = Math.max(25, scale * .155);
  const leg = Math.max(38, scale * .235);
  const shoulderMid = midpoint(p.leftShoulder, p.rightShoulder);
  const hipMid = midpoint(p.leftHip, p.rightHip);
  const headRadius = Math.max(29, Math.min(46, scale * .215));
  const support = p.leftAnkle.y > p.rightAnkle.y ? p.leftAnkle : p.rightAnkle;
  const headDirection = apply(skeleton.headFrame.matrix, [0, 0, 1]);
  const rawDirection = rawProjection(headDirection, view);
  const gazeX = Math.abs(rawDirection.x) < .08 ? 1 : Math.sign(rawDirection.x);
  const headTilt = Math.atan2(p.rightShoulder.y - p.leftShoulder.y, p.rightShoulder.x - p.leftShoulder.x) * 180 / Math.PI;
  const orderedShoulders = [p.leftShoulder, p.rightShoulder].sort((a, b) => a.x - b.x);
  const orderedHips = [p.leftHip, p.rightHip].sort((a, b) => a.x - b.x);
  const [leftShoulder, rightShoulder] = orderedShoulders;
  const [leftHip, rightHip] = orderedHips;
  const waistCenter = pointBetween(shoulderMid, hipMid, .55);
  const chestCenter = pointBetween(shoulderMid, waistCenter, .48);
  const shoulderHalf = Math.max(arm * 1.38, Math.abs(rightShoulder.x - leftShoulder.x) * .54);
  const chestHalf = shoulderHalf * .94;
  const hipHalf = Math.max(leg * .98, Math.abs(rightHip.x - leftHip.x) * .68);
  const waistHalf = Math.max(arm * .7, Math.min(shoulderHalf * .53, hipHalf * .58));
  const groinY = hipMid.y + leg * .64;
  const torso = `M ${shoulderMid.x} ${shoulderMid.y - arm * .24}
    C ${shoulderMid.x - shoulderHalf * .36} ${shoulderMid.y - arm * .4}, ${shoulderMid.x - shoulderHalf} ${shoulderMid.y - arm * .12}, ${shoulderMid.x - shoulderHalf} ${shoulderMid.y + arm * .18}
    C ${shoulderMid.x - shoulderHalf * 1.02} ${shoulderMid.y + arm * .72}, ${chestCenter.x - chestHalf * 1.03} ${chestCenter.y - arm * .12}, ${chestCenter.x - chestHalf} ${chestCenter.y + arm * .3}
    C ${chestCenter.x - chestHalf * .9} ${chestCenter.y + arm * .86}, ${waistCenter.x - waistHalf * 1.02} ${waistCenter.y - arm * .34}, ${waistCenter.x - waistHalf} ${waistCenter.y + arm * .12}
    C ${waistCenter.x - waistHalf * .98} ${waistCenter.y + arm * .58}, ${hipMid.x - hipHalf * 1.05} ${hipMid.y - leg * .42}, ${hipMid.x - hipHalf} ${hipMid.y}
    C ${hipMid.x - hipHalf * .92} ${hipMid.y + leg * .42}, ${hipMid.x - leg * .44} ${groinY - leg * .08}, ${hipMid.x - leg * .18} ${groinY}
    Q ${hipMid.x} ${groinY + leg * .14}, ${hipMid.x + leg * .18} ${groinY}
    C ${hipMid.x + leg * .44} ${groinY - leg * .08}, ${hipMid.x + hipHalf * .92} ${hipMid.y + leg * .42}, ${hipMid.x + hipHalf} ${hipMid.y}
    C ${hipMid.x + hipHalf * 1.05} ${hipMid.y - leg * .42}, ${waistCenter.x + waistHalf * .98} ${waistCenter.y + arm * .58}, ${waistCenter.x + waistHalf} ${waistCenter.y + arm * .12}
    C ${waistCenter.x + waistHalf * 1.02} ${waistCenter.y - arm * .34}, ${chestCenter.x + chestHalf * .9} ${chestCenter.y + arm * .86}, ${chestCenter.x + chestHalf} ${chestCenter.y + arm * .34}
    C ${chestCenter.x + chestHalf * 1.03} ${chestCenter.y - arm * .12}, ${shoulderMid.x + shoulderHalf * 1.02} ${shoulderMid.y + arm * .72}, ${shoulderMid.x + shoulderHalf} ${shoulderMid.y + arm * .18}
    C ${shoulderMid.x + shoulderHalf} ${shoulderMid.y - arm * .12}, ${shoulderMid.x + shoulderHalf * .36} ${shoulderMid.y - arm * .4}, ${shoulderMid.x} ${shoulderMid.y - arm * .24} Z`;

  const legs = [
    { name: 'left-leg', start: p.leftHip, joint: p.leftKnee, end: p.leftAnkle, startWidth: leg * 1.12, jointWidth: leg * .72, endWidth: leg * .48, firstBulge: leg * 1.28, secondBulge: leg * .98 },
    { name: 'right-leg', start: p.rightHip, joint: p.rightKnee, end: p.rightAnkle, startWidth: leg * 1.12, jointWidth: leg * .72, endWidth: leg * .48, firstBulge: leg * 1.28, secondBulge: leg * .98 },
  ];
  const arms = [
    { name: 'left-arm', start: p.leftShoulder, joint: p.leftElbow, end: p.leftWrist, startWidth: arm * 1.12, jointWidth: arm * .64, endWidth: arm * .45, firstBulge: arm * 1.08, secondBulge: arm * .79 },
    { name: 'right-arm', start: p.rightShoulder, joint: p.rightElbow, end: p.rightWrist, startWidth: arm * 1.12, jointWidth: arm * .64, endWidth: arm * .45, firstBulge: arm * 1.08, secondBulge: arm * .79 },
  ];

  return (
    <g filter={`url(#${id.split('-figure-')[0]}-drop)`}>
      <defs>
        <linearGradient id={`${id}-body`} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor={material.shadow} />
          <stop offset=".38" stopColor={material.light} />
          <stop offset=".7" stopColor={material.mid} />
          <stop offset="1" stopColor={material.shadow} />
        </linearGradient>
        <radialGradient id={`${id}-head`} cx="30%" cy="20%" r="82%">
          <stop stopColor={material.light} />
          <stop offset=".58" stopColor={material.mid} />
          <stop offset="1" stopColor={material.shadow} />
        </radialGradient>
      </defs>

      <ellipse cx={hipMid.x} cy={Math.max(p.leftFoot.y, p.rightFoot.y) + 13} rx={Math.max(40, leg * 2.7)} ry="10" fill="#252a2c" opacity=".12" />

      {legs.map((part) => <ContinuousLimb key={part.name} {...part} id={id} material={material} />)}
      <SculptedFoot ankle={p.leftAnkle} foot={p.leftFoot} width={leg} id={id} edge={material.edge} />
      <SculptedFoot ankle={p.rightAnkle} foot={p.rightFoot} width={leg} id={id} edge={material.edge} />

      <path d={anatomicalSegmentPath(shoulderMid, p.neck, arm * .68, arm * .66, arm * .56)} fill={`url(#${id}-body)`} stroke={material.edge} strokeWidth="1.1" strokeOpacity=".72" />
      {arms.map((part) => <ContinuousLimb key={part.name} {...part} id={id} material={material} />)}

      <path d={torso} fill={`url(#${id}-body)`} stroke={material.edge} strokeWidth="1.25" strokeOpacity=".82" strokeLinejoin="round" />
      <path d={`M ${shoulderMid.x - shoulderHalf * .72} ${shoulderMid.y + arm * .42}
        C ${chestCenter.x - chestHalf * .65} ${chestCenter.y - arm * .2}, ${waistCenter.x - waistHalf * .62} ${waistCenter.y - arm * .48}, ${waistCenter.x} ${waistCenter.y - arm * .3}
        C ${waistCenter.x + waistHalf * .62} ${waistCenter.y - arm * .48}, ${chestCenter.x + chestHalf * .65} ${chestCenter.y - arm * .2}, ${shoulderMid.x + shoulderHalf * .72} ${shoulderMid.y + arm * .42}
        Q ${shoulderMid.x} ${shoulderMid.y + arm * .02}, ${shoulderMid.x - shoulderHalf * .72} ${shoulderMid.y + arm * .42} Z`} fill={material.light} fillOpacity=".13" />
      <path d={`M ${chestCenter.x} ${chestCenter.y - arm * .12} C ${waistCenter.x - arm * .12} ${waistCenter.y - arm * .18}, ${hipMid.x - arm * .1} ${hipMid.y - leg * .28}, ${hipMid.x} ${hipMid.y + leg * .28}`} fill="none" stroke="#fff" strokeOpacity=".12" strokeWidth="1.4" strokeLinecap="round" />
      <path d={`M ${waistCenter.x - waistHalf * .88} ${waistCenter.y + arm * .18}
        C ${hipMid.x - hipHalf * .76} ${hipMid.y - leg * .36}, ${hipMid.x - hipHalf * .72} ${hipMid.y + leg * .24}, ${hipMid.x - leg * .16} ${groinY - leg * .08}
        Q ${hipMid.x} ${groinY + leg * .05}, ${hipMid.x + leg * .16} ${groinY - leg * .08}
        C ${hipMid.x + hipHalf * .72} ${hipMid.y + leg * .24}, ${hipMid.x + hipHalf * .76} ${hipMid.y - leg * .36}, ${waistCenter.x + waistHalf * .88} ${waistCenter.y + arm * .18}
        Q ${hipMid.x} ${hipMid.y - leg * .12}, ${waistCenter.x - waistHalf * .88} ${waistCenter.y + arm * .18} Z`} fill={material.deep} fillOpacity=".07" />

      <g transform={`rotate(${headTilt.toFixed(1)} ${p.head.x} ${p.head.y})`}>
        <path d={`M ${p.head.x} ${p.head.y - headRadius} C ${p.head.x + headRadius * .68} ${p.head.y - headRadius * .94}, ${p.head.x + headRadius * .8} ${p.head.y - headRadius * .18}, ${p.head.x + headRadius * .64} ${p.head.y + headRadius * .52} C ${p.head.x + headRadius * .43} ${p.head.y + headRadius * .96}, ${p.head.x - headRadius * .43} ${p.head.y + headRadius * .96}, ${p.head.x - headRadius * .64} ${p.head.y + headRadius * .52} C ${p.head.x - headRadius * .8} ${p.head.y - headRadius * .18}, ${p.head.x - headRadius * .68} ${p.head.y - headRadius * .94}, ${p.head.x} ${p.head.y - headRadius} Z`} fill={`url(#${id}-head)`} stroke={material.edge} strokeWidth="1.2" strokeOpacity=".82" />
        <path d={`M ${p.head.x - headRadius * .46} ${p.head.y - headRadius * .48} Q ${p.head.x - headRadius * .3} ${p.head.y - headRadius * .69} ${p.head.x - headRadius * .06} ${p.head.y - headRadius * .75}`} fill="none" stroke="#fff" strokeOpacity=".2" strokeWidth="2" strokeLinecap="round" />
        <path d={`M ${p.head.x} ${p.head.y - headRadius * .78} Q ${p.head.x + gazeX * headRadius * .14} ${p.head.y} ${p.head.x} ${p.head.y + headRadius * .72}`} fill="none" stroke={material.edge} strokeOpacity=".18" strokeWidth="1" />
        <path d={`M ${p.head.x - headRadius * .6} ${p.head.y - headRadius * .06} Q ${p.head.x} ${p.head.y + headRadius * .06} ${p.head.x + headRadius * .6} ${p.head.y - headRadius * .06}`} fill="none" stroke={material.edge} strokeOpacity=".16" strokeWidth="1" />
        {cap && <MannequinCap x={p.head.x} y={p.head.y} radius={headRadius} />}
      </g>

      <SculptedHand point={p.leftHand} wrist={p.leftWrist} size={arm} id={id} edge={material.edge} />
      <SculptedHand point={p.rightHand} wrist={p.rightWrist} size={arm} id={id} edge={material.edge} />
      {phone && <Phone hand={p.rightHand} wrist={p.rightWrist} />}

      {!compact && (
        <path d={`M ${p.head.x + gazeX * headRadius * .72} ${p.head.y - 2} L ${p.head.x + gazeX * (headRadius + 44)} ${p.head.y - 10}`} fill="none" stroke="#6f8f32" strokeWidth="3" strokeDasharray="6 6" markerEnd={`url(#${gazeMarker})`} />
      )}

      {guides && (
        <g>
          {(['leftShoulder', 'rightShoulder', 'leftElbow', 'rightElbow', 'leftWrist', 'rightWrist', 'leftHip', 'rightHip', 'leftKnee', 'rightKnee', 'leftAnkle', 'rightAnkle'] as BodyPoint[]).map((name) => (
            <g key={name}>
              <circle cx={p[name].x} cy={p[name].y} r="7" fill={material.accent} stroke={material.edge} strokeWidth="2" />
              <circle cx={p[name].x} cy={p[name].y} r="2" fill={material.edge} />
            </g>
          ))}
          <path d={`M ${hipMid.x} ${hipMid.y - 8} L ${support.x} ${support.y - 16}`} stroke="#ff654f" strokeWidth="4" strokeDasharray="7 7" />
          <path d={`M ${support.x - 12} ${support.y - 16} h 24`} stroke="#ff654f" strokeWidth="5" strokeLinecap="round" />
        </g>
      )}
    </g>
  );
}

function ContinuousLimb({ id, material, name, start, joint, end, startWidth, jointWidth, endWidth, firstBulge, secondBulge }: { id: string; material: MaterialPalette; name: string; start: Point2; joint: Point2; end: Point2; startWidth: number; jointWidth: number; endWidth: number; firstBulge: number; secondBulge: number }) {
  const firstPath = anatomicalSegmentPath(start, joint, startWidth, firstBulge, jointWidth);
  const secondPath = anatomicalSegmentPath(joint, end, jointWidth, secondBulge, endWidth);
  const dx = end.x - start.x; const dy = end.y - start.y; const length = Math.max(1, Math.hypot(dx, dy));
  const nx = -dy / length; const ny = dx / length; const mid = pointBetween(start, end, .5);
  const gradientId = `${id}-${name}`;
  return (
    <g>
      <defs>
        <linearGradient id={gradientId} gradientUnits="userSpaceOnUse" x1={mid.x - nx * firstBulge * .55} y1={mid.y - ny * firstBulge * .55} x2={mid.x + nx * firstBulge * .55} y2={mid.y + ny * firstBulge * .55}>
          <stop stopColor={material.shadow} />
          <stop offset=".38" stopColor={material.light} />
          <stop offset=".72" stopColor={material.mid} />
          <stop offset="1" stopColor={material.shadow} />
        </linearGradient>
      </defs>
      <path d={firstPath} fill={`url(#${gradientId})`} stroke={material.edge} strokeWidth="1.15" strokeOpacity=".78" strokeLinejoin="round" />
      <path d={secondPath} fill={`url(#${gradientId})`} stroke={material.edge} strokeWidth="1.15" strokeOpacity=".78" strokeLinejoin="round" />
      <ellipse cx={joint.x} cy={joint.y} rx={jointWidth * .58} ry={jointWidth * .54} fill={`url(#${gradientId})`} />
      <path d={line(pointBetween(start, joint, .24), pointBetween(start, joint, .72))} stroke="#fff" strokeOpacity=".08" strokeWidth={Math.max(.8, firstBulge * .04)} strokeLinecap="round" />
      <path d={line(pointBetween(joint, end, .2), pointBetween(joint, end, .68))} stroke="#fff" strokeOpacity=".07" strokeWidth={Math.max(.8, secondBulge * .04)} strokeLinecap="round" />
    </g>
  );
}

function SculptedHand({ point, wrist, size, id, edge }: { point: Point2; wrist: Point2; size: number; id: string; edge: string }) {
  const angle = Math.atan2(point.y - wrist.y, point.x - wrist.x);
  const angleDeg = angle * 180 / Math.PI;
  const anchor = pointBetween(wrist, point, .4);
  const palmLength = Math.max(18, size * .94);
  const palmWidth = Math.max(12, size * .68);
  return (
    <g transform={`translate(${anchor.x} ${anchor.y}) rotate(${angleDeg})`}>
      <path d={`M ${-palmLength * .76} ${-palmWidth * .3}
        C ${-palmLength * .22} ${-palmWidth * .48}, ${palmLength * .18} ${-palmWidth * .5}, ${palmLength * .54} ${-palmWidth * .3}
        Q ${palmLength * .72} 0, ${palmLength * .5} ${palmWidth * .32}
        C ${palmLength * .12} ${palmWidth * .5}, ${-palmLength * .24} ${palmWidth * .46}, ${-palmLength * .76} ${palmWidth * .27} Z`} fill={`url(#${id}-body)`} stroke={edge} strokeWidth="1.05" strokeOpacity=".78" />
      {[-.2, .02, .24].map((offset) => (
        <path key={offset} d={`M ${palmLength * .17} ${offset * palmWidth} Q ${palmLength * .42} ${offset * palmWidth * .95} ${palmLength * .57} ${offset * palmWidth * .78}`} fill="none" stroke={edge} strokeOpacity=".24" strokeWidth=".75" strokeLinecap="round" />
      ))}
      <path d={`M ${palmLength * .02} ${palmWidth * .25} Q ${palmLength * .3} ${palmWidth * .56} ${palmLength * .46} ${palmWidth * .34}`} fill="none" stroke={edge} strokeOpacity=".24" strokeWidth=".8" strokeLinecap="round" />
    </g>
  );
}

function SculptedFoot({ ankle, foot, width, id, edge }: { ankle: Point2; foot: Point2; width: number; id: string; edge: string }) {
  const angle = Math.atan2(foot.y - ankle.y, foot.x - ankle.x) * 180 / Math.PI;
  const length = Math.max(width * .92, Math.hypot(foot.x - ankle.x, foot.y - ankle.y));
  return (
    <g transform={`translate(${ankle.x} ${ankle.y}) rotate(${angle})`}>
      <path d={`M ${-width * .03} ${-width * .24}
        C ${length * .34} ${-width * .31}, ${length * .78} ${-width * .26}, ${length} ${-width * .08}
        Q ${length * 1.1} ${width * .03}, ${length * .93} ${width * .22}
        C ${length * .58} ${width * .34}, ${length * .28} ${width * .32}, ${length * .12} ${width * .22}
        Q ${width * .02} ${width * .12}, ${-width * .03} ${-width * .24} Z`} fill={`url(#${id}-body)`} stroke={edge} strokeWidth="1.15" strokeOpacity=".8" />
      <path d={`M ${length * .48} ${-width * .13} Q ${length * .76} ${-width * .01} ${length * .96} ${width * .05}`} fill="none" stroke="#fff" strokeOpacity=".12" strokeWidth="1" />
    </g>
  );
}

function MannequinCap({ x, y, radius }: { x: number; y: number; radius: number }) {
  return (
    <g>
      <path d={`M ${x - radius * .65} ${y - radius * .3} Q ${x - radius * .38} ${y - radius * 1.02} ${x + radius * .48} ${y - radius * .78} Q ${x + radius * .73} ${y - radius * .55} ${x + radius * .64} ${y - radius * .22} Z`} fill="#2879a7" stroke="#1f2c34" strokeWidth="2" />
      <path d={`M ${x + radius * .18} ${y - radius * .3} Q ${x + radius * .78} ${y - radius * .22} ${x + radius * 1.02} ${y - radius * .02} Q ${x + radius * .62} ${y + radius * .08} ${x + radius * .12} ${y - radius * .04} Z`} fill="#173f85" stroke="#1f2c34" strokeWidth="2" />
      <path d={`M ${x - radius * .48} ${y - radius * .52} Q ${x - radius * .1} ${y - radius * .72} ${x + radius * .34} ${y - radius * .62}`} fill="none" stroke="#7bc0e2" strokeOpacity=".65" strokeWidth="2" />
    </g>
  );
}

function bendArm(points: Record<BodyPoint, Point2>, side: 'left' | 'right', target: { x: number; y: number }, bend = 1) {
  const shoulder = points[`${side}Shoulder`];
  const elbowName = `${side}Elbow` as BodyPoint;
  const wristName = `${side}Wrist` as BodyPoint;
  const handName = `${side}Hand` as BodyPoint;
  const dx = target.x - shoulder.x;
  const dy = target.y - shoulder.y;
  const length = Math.max(1, Math.hypot(dx, dy));
  const normalX = -dy / length;
  const normalY = dx / length;
  points[elbowName] = { x: shoulder.x + dx * .48 + normalX * 32 * bend, y: shoulder.y + dy * .48 + normalY * 32 * bend, depth: shoulder.depth };
  points[wristName] = { x: target.x - dx / length * 13, y: target.y - dy / length * 13, depth: shoulder.depth };
  points[handName] = { x: target.x, y: target.y, depth: shoulder.depth };
}

function placeArm(
  points: Record<BodyPoint, Point2>,
  side: 'left' | 'right',
  elbow: { x: number; y: number },
  wrist: { x: number; y: number },
  hand: { x: number; y: number },
) {
  const depth = points[`${side}Shoulder`].depth;
  points[`${side}Elbow` as BodyPoint] = { ...elbow, depth };
  points[`${side}Wrist` as BodyPoint] = { ...wrist, depth };
  points[`${side}Hand` as BodyPoint] = { ...hand, depth };
}

function placeLeg(points: Record<BodyPoint, Point2>, side: 'left' | 'right', knee: { x: number; y: number }, ankle: { x: number; y: number }, footDirection = 1) {
  const depth = points[`${side}Hip`].depth;
  points[`${side}Knee` as BodyPoint] = { ...knee, depth };
  points[`${side}Ankle` as BodyPoint] = { ...ankle, depth };
  points[`${side}Foot` as BodyPoint] = { x: ankle.x + 25 * footDirection, y: ankle.y + 7, depth };
}

function refineIllustration(pose: Pose, skeletons: ProjectedSkeleton[], view: DiagramView, scale: number) {
  if (view === 'side') return;
  const p = skeletons[0].points;
  const u = Math.max(28, Math.min(42, scale * .2));
  const hip = midpoint(p.leftHip, p.rightHip);

  if (pose.props.includes('phone')) {
    const reach = pose.category === 'selfie' ? u * 2.2 : u * 1.35;
    bendArm(p, 'right', { x: p.head.x + reach, y: p.head.y - u * .15 }, -1);
  }

  if (['pocket-angle', 'offset-stance', 'mirror-pocket'].includes(pose.id)) {
    bendArm(p, 'left', { x: p.leftHip.x - u * .12, y: p.leftHip.y + u * .18 }, 1);
  }
  if (pose.id === 'formal-ease') {
    bendArm(p, 'left', { x: hip.x - 8, y: hip.y - u * .25 }, 1);
    bendArm(p, 'right', { x: hip.x + 8, y: hip.y - u * .25 }, -1);
  }
  if (['fashion-counterline', 'power-square', 'mirror-shoulder-back'].includes(pose.id)) {
    bendArm(p, 'left', { x: p.leftHip.x - 4, y: p.leftHip.y - u * .55 }, 1);
    bendArm(p, 'right', { x: p.rightShoulder.x + u * 1.65, y: p.rightShoulder.y + u * .35 }, -1);
  }
  if (['coat-drape', 'jacket-reset'].includes(pose.id)) {
    bendArm(p, 'left', { x: p.rightShoulder.x - u * .2, y: p.rightShoulder.y - u * .1 }, 1);
    bendArm(p, 'right', { x: p.rightHip.x + u * .2, y: p.rightHip.y - u * .35 }, -1);
  }
  if (pose.id === 'frame-edge-lean') {
    const lean = -u * .48;
    (['head', 'neck', 'leftShoulder', 'rightShoulder', 'leftElbow', 'rightElbow', 'leftWrist', 'rightWrist', 'leftHand', 'rightHand'] as BodyPoint[]).forEach((name) => { p[name].x += lean; });
  }

  if (pose.category === 'portrait') {
    const faceLeft = { x: p.head.x - u * .75, y: p.head.y + u * .05 };
    const faceRight = { x: p.head.x + u * .75, y: p.head.y + u * .05 };
    if (pose.id === 'thoughtful-lookaway') bendArm(p, 'right', faceRight, -1);
    if (pose.id === 'shoulder-frame') bendArm(p, 'left', { x: p.rightShoulder.x - 5, y: p.rightShoulder.y + 7 }, 1);
    if (pose.id === 'collar-touch' || pose.id === 'profile-breath') bendArm(p, 'right', { x: p.neck.x + u * .35, y: p.neck.y + u * .2 }, -1);
    if (pose.id === 'playful-peek') bendArm(p, 'left', faceLeft, 1);
    if (pose.id === 'dramatic-turn') bendArm(p, 'right', { x: p.head.x + u * .35, y: p.head.y - u * .85 }, -1);
    if (pose.id === 'soft-chin') bendArm(p, 'left', { x: p.neck.x - u * .15, y: p.neck.y + u * .45 }, 1);
    if (pose.id === 'confident-gaze') bendArm(p, 'right', { x: p.neck.x + u * .45, y: p.neck.y + u * .5 }, -1);
  }

  if (pose.category === 'seated') {
    const seatY = hip.y + u * .2;
    if (pose.id === 'floor-triangle') {
      placeLeg(p, 'left', { x: hip.x - u * 1.3, y: seatY + u * .5 }, { x: hip.x - u * 2, y: seatY + u * 1.7 }, -1);
      placeLeg(p, 'right', { x: hip.x + u * 1.2, y: seatY - u * .05 }, { x: hip.x + u * .2, y: seatY + u * 1.75 }, 1);
      bendArm(p, 'left', { x: hip.x - u * 1.55, y: seatY + u * .55 }, 1);
      bendArm(p, 'right', { x: hip.x + u * .7, y: seatY - u * .3 }, -1);
    }
    if (pose.id === 'stool-forward') {
      bendArm(p, 'left', { x: p.leftKnee.x - 5, y: p.leftKnee.y - 8 }, 1);
      bendArm(p, 'right', { x: p.rightKnee.x + 5, y: p.rightKnee.y - 8 }, -1);
    }
    if (pose.id === 'chair-sideways' || pose.id === 'window-rest') {
      bendArm(p, 'left', { x: p.rightKnee.x - 10, y: p.rightKnee.y - 12 }, 1);
      bendArm(p, 'right', { x: p.rightKnee.x + 8, y: p.rightKnee.y - 6 }, -1);
    }
    if (pose.id === 'bench-breathe') {
      bendArm(p, 'left', { x: p.leftHip.x - u * .7, y: seatY + 5 }, 1);
      bendArm(p, 'right', { x: p.rightHip.x + u * .7, y: seatY + 5 }, -1);
    }
    if (pose.id === 'steps-offset') {
      placeLeg(p, 'left', { x: hip.x - u * .9, y: seatY + u * .15 }, { x: hip.x - u * .8, y: seatY + u * 1.45 }, -1);
      placeLeg(p, 'right', { x: hip.x + u * .7, y: seatY + u * .75 }, { x: hip.x + u * 1.1, y: seatY + u * 1.55 }, 1);
    }
    if (pose.id === 'crossed-ankle') {
      p.leftAnkle.x = hip.x + 8; p.rightAnkle.x = hip.x - 8;
      p.leftFoot.x = hip.x + 34; p.rightFoot.x = hip.x - 34;
    }
    if (pose.id === 'editorial-perch') {
      p.leftKnee.x -= u * 1.15; p.leftAnkle.x -= u * .7;
      bendArm(p, 'left', { x: p.leftKnee.x, y: p.leftKnee.y - 10 }, 1);
    }
    if (pose.id === 'cafe-cup') {
      bendArm(p, 'left', { x: hip.x - 10, y: p.torso.y - u * .1 }, 1);
      bendArm(p, 'right', { x: hip.x + 10, y: p.torso.y - u * .1 }, -1);
    }
  }

  if (skeletons[1]) {
    const q = skeletons[1].points;
    const centerX = (p.root.x + q.root.x) / 2;
    const handY = Math.max(p.leftHip.y, q.rightHip.y) - u * .25;
    if (pose.id === 'reference-arc-duo') {
      // Keep the pair touching at the hips without letting the front figure
      // swallow the rear silhouette. The reference reads as two complete
      // mannequins first and an overlapping couple second.
      const pShift = centerX - u * 1.62 - p.root.x;
      const qShift = centerX + u * 1.48 - q.root.x;
      (Object.keys(p) as BodyPoint[]).forEach((name) => { p[name].x += pShift; });
      (Object.keys(q) as BodyPoint[]).forEach((name) => { q[name].x += qShift; });
      (['head', 'neck', 'leftShoulder', 'rightShoulder'] as BodyPoint[]).forEach((name) => { p[name].x -= u * .28; q[name].x += u * .22; });
      p.head.x -= u * .26;
      q.head.x += u * .2;
      p.leftHip.x += u * .18; p.rightHip.x += u * .18;
      q.leftHip.x -= u * .18; q.rightHip.x -= u * .18;
      bendArm(p, 'left', { x: p.head.x - u * .28, y: p.head.y - u * 2.35 }, -1);
      placeArm(p, 'right',
        { x: p.leftHip.x - u * .72, y: p.leftHip.y + u * .28 },
        { x: p.leftHip.x - u * .68, y: p.leftHip.y + u * .88 },
        { x: p.leftHip.x - u * .54, y: p.leftHip.y + u * 1.16 });
      placeArm(q, 'left',
        { x: q.head.x - u * 1.28, y: q.head.y + u * .18 },
        { x: q.head.x - u * .45, y: q.head.y - u * .7 },
        { x: q.head.x - u * .12, y: q.head.y - u * .86 });
      placeArm(q, 'right',
        { x: q.head.x + u * 1.42, y: q.head.y + u * .82 },
        { x: q.head.x + u * .94, y: q.head.y + u * .06 },
        { x: q.head.x + u * .76, y: q.head.y - u * .08 });
      placeLeg(p, 'left', { x: p.leftHip.x - u * .72, y: p.leftHip.y + u * 1.45 }, { x: p.leftHip.x - u * .58, y: p.leftHip.y + u * 2.82 }, -1);
      placeLeg(q, 'right', { x: q.rightHip.x + u * .75, y: q.rightHip.y + u * 1.55 }, { x: q.rightHip.x + u * 1.18, y: q.rightHip.y + u * 2.8 }, 1);
    }
    if (['side-sync', 'connected-walk', 'handhold-pause', 'playful-counterbalance', 'walkaway-glance'].includes(pose.id)) {
      bendArm(p, 'right', { x: centerX - 5, y: handY }, -1);
      bendArm(q, 'left', { x: centerX + 5, y: handY }, 1);
    }
    if (pose.id === 'look-exchange' || pose.id === 'arm-link') {
      bendArm(p, 'right', { x: q.leftShoulder.x - 4, y: q.leftShoulder.y + 8 }, -1);
    }
    if (pose.id === 'selfie-duo') {
      const headGap = q.head.x - p.head.x;
      (['head', 'neck', 'leftShoulder', 'rightShoulder'] as BodyPoint[]).forEach((name) => { q[name].x -= headGap * .25; });
    }
  }
}

function Phone({ hand, wrist }: { hand: Point2; wrist: Point2 }) {
  const angle = Math.atan2(hand.y - wrist.y, hand.x - wrist.x) * 180 / Math.PI;
  return (
    <g transform={`translate(${hand.x} ${hand.y}) rotate(${angle + 90})`}>
      <rect x="-14" y="-24" width="28" height="48" rx="5" fill="#242522" stroke="#f7f4ed" strokeWidth="2" />
      <circle cx="7" cy="-17" r="3" fill="#c9ff64" />
      <path d="M-5 18h10" stroke="#f7f4ed" strokeWidth="2" strokeLinecap="round" />
    </g>
  );
}

function MirrorFrame() {
  return (
    <g>
      <rect x="52" y="37" width="616" height="616" rx="20" fill="#f7fbfc" fillOpacity=".28" stroke="#20211f" strokeOpacity=".33" strokeWidth="5" />
      <path d="M77 75 152 0M530 700l138-138" stroke="#fff" strokeOpacity=".55" strokeWidth="13" />
      <path d="M90 44v602M630 44v602" stroke="#20211f" strokeOpacity=".08" strokeWidth="2" />
    </g>
  );
}

function Seat({ skeleton, floor, variant }: { skeleton: ProjectedSkeleton; floor: number; variant: string }) {
  const hip = midpoint(skeleton.points.leftHip, skeleton.points.rightHip);
  const seatY = hip.y + 25;
  if (variant === 'steps-offset') {
    return (
      <g fill="#d2c9bb" stroke="#5f625c" strokeWidth="4" opacity=".72">
        <path d={`M ${hip.x - 155} ${seatY + 5} h 120 v 58 h 115 v 58 h 130 v 90 h -365Z`} />
      </g>
    );
  }
  if (variant === 'ledge-swing') {
    return <path d={`M ${hip.x - 180} ${seatY} H ${hip.x + 180} V ${seatY + 42} H ${hip.x - 180}Z`} fill="#bfc4bd" stroke="#5f625c" strokeWidth="5" opacity=".7" />;
  }
  return (
    <g stroke="#5f625c" fill="none" strokeWidth="8" strokeLinecap="round" strokeLinejoin="round" opacity=".55">
      <path d={`M ${hip.x - 90} ${seatY} H ${hip.x + 90}`} />
      <path d={`M ${hip.x - 73} ${seatY + 4} L ${hip.x - 94} ${floor}`} />
      <path d={`M ${hip.x + 73} ${seatY + 4} L ${hip.x + 94} ${floor}`} />
      <path d={`M ${hip.x - 82} ${seatY} V ${Math.max(90, seatY - 165)}`} strokeWidth="6" />
    </g>
  );
}

function FloorMat({ skeleton }: { skeleton: ProjectedSkeleton }) {
  const hip = midpoint(skeleton.points.leftHip, skeleton.points.rightHip);
  return <ellipse cx={hip.x} cy={Math.max(skeleton.points.leftFoot.y, skeleton.points.rightFoot.y) + 10} rx="190" ry="28" fill="#ff654f" fillOpacity=".13" stroke="#ff654f" strokeOpacity=".35" strokeWidth="3" strokeDasharray="10 8" />;
}

function Cup({ skeleton }: { skeleton: ProjectedSkeleton }) {
  const hand = midpoint(skeleton.points.leftHand, skeleton.points.rightHand);
  return (
    <g transform={`translate(${hand.x} ${hand.y})`}>
      <path d="M-13-15h26v25c0 10-26 10-26 0Z" fill="#fbf8f2" stroke="#20211f" strokeWidth="3" />
      <path d="M13-8c16-2 16 20 0 18" fill="none" stroke="#20211f" strokeWidth="3" />
      <path d="M-6-21q5-9 0-17M5-21q5-9 0-17" fill="none" stroke="#7f8b82" strokeWidth="2" strokeLinecap="round" />
    </g>
  );
}

function MotionMarks({ skeleton, marker, compact }: { skeleton: ProjectedSkeleton; marker: string; compact: boolean }) {
  const hip = midpoint(skeleton.points.leftHip, skeleton.points.rightHip);
  return (
    <g fill="none" stroke="#20211f" strokeOpacity={compact ? .22 : .5} strokeWidth={compact ? 4 : 3} strokeDasharray="8 8" markerEnd={`url(#${marker})`}>
      <path d={`M ${hip.x - 88} ${hip.y + 18} Q ${hip.x - 48} ${hip.y - 12} ${hip.x - 12} ${hip.y + 8}`} />
      {!compact && <path d={`M ${skeleton.points.leftFoot.x - 40} ${skeleton.points.leftFoot.y - 9} Q ${skeleton.points.leftFoot.x - 18} ${skeleton.points.leftFoot.y - 35} ${skeleton.points.leftFoot.x + 9} ${skeleton.points.leftFoot.y - 12}`} />}
    </g>
  );
}

function CameraBlueprint({ pose, skeleton, marker }: { pose: Pose; skeleton: ProjectedSkeleton; marker: string }) {
  const target = midpoint(skeleton.points.leftShoulder, skeleton.points.rightHip);
  const guide = pose.cameraGuide!;
  const cameraX = guide.angle === 'slight-left' ? 75 : guide.angle === 'slight-right' ? 645 : guide.angle === 'profile' ? 650 : 95;
  const cameraY = guide.height === 'waist' ? 445 : guide.height === 'chest' ? 350 : guide.height === 'slightly-high' ? 155 : 235;
  return (
    <g>
      <path d={`M ${cameraX} ${cameraY} L ${target.x} ${target.y}`} stroke="#ff654f" strokeWidth="3" strokeDasharray="10 8" markerEnd={`url(#${marker})`} />
      <g transform={`translate(${cameraX} ${cameraY})`}>
        <rect x="-27" y="-18" width="54" height="36" rx="6" fill="#20211f" />
        <circle r="11" fill="#e9e4da" stroke="#c9ff64" strokeWidth="4" />
        <path d="M-14 18-30 45M14 18 30 45M0 18v30" stroke="#20211f" strokeWidth="5" strokeLinecap="round" />
      </g>
      <g transform={`translate(${cameraX < 360 ? 24 : 540} ${cameraY + 62})`}>
        <rect width="156" height="31" rx="15.5" fill="#ff654f" />
        <text x="78" y="20" textAnchor="middle" fill="#20211f" fontSize="11" fontWeight="900" letterSpacing="1">CAMERA POSITION</text>
      </g>
    </g>
  );
}

function Callouts({ skeleton, upperFocus }: { skeleton: ProjectedSkeleton; upperFocus: boolean }) {
  const p = skeleton.points;
  const shoulders = midpoint(p.leftShoulder, p.rightShoulder);
  const hands = midpoint(p.leftHand, p.rightHand);
  const support = p.leftAnkle.y > p.rightAnkle.y ? p.leftAnkle : p.rightAnkle;
  const callouts = [
    { label: 'HEAD + GAZE', x: 553, y: 94, target: p.head, side: 'right' },
    { label: 'SHOULDER LINE', x: 27, y: 168, target: shoulders, side: 'left' },
    { label: 'HAND SHAPE', x: 553, y: 272, target: hands, side: 'right' },
    ...(!upperFocus ? [{ label: 'WEIGHTED FOOT', x: 27, y: 570, target: support, side: 'left' }] : []),
  ];
  return (
    <g>
      {callouts.map((item) => {
        const startX = item.side === 'left' ? item.x + 126 : item.x;
        const elbowX = item.side === 'left' ? item.target.x - 24 : item.target.x + 24;
        return (
          <g key={item.label}>
            <path d={`M ${startX} ${item.y + 14} H ${elbowX} L ${item.target.x} ${item.target.y}`} fill="none" stroke="#20211f" strokeOpacity=".52" strokeWidth="2" />
            <circle cx={item.target.x} cy={item.target.y} r="5" fill="#c9ff64" stroke="#20211f" strokeWidth="2" />
            <rect x={item.x} y={item.y} width="140" height="29" rx="14.5" fill="#fbf8f2" stroke="#20211f" strokeOpacity=".25" />
            <text x={item.x + 70} y={item.y + 19} textAnchor="middle" fill="#20211f" fontSize="10.5" fontWeight="900" letterSpacing="1.05">{item.label}</text>
          </g>
        );
      })}
    </g>
  );
}
