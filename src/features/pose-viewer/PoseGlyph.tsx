import type { Pose } from '../../types';

const hash = (value: string) => [...value].reduce((total, char) => total + char.charCodeAt(0), 0);

export function PoseGlyph({ pose, compact = false }: { pose: Pose; compact?: boolean }) {
  const seed = hash(pose.id);
  const lean = (seed % 17) - 8;
  const arm = 22 + seed % 34;
  const leg = 9 + seed % 20;
  const isPair = pose.subjects.includes('pair');
  const phone = pose.props.includes('phone');
  return (
    <svg className="pose-glyph" viewBox="0 0 240 230" role="img" aria-label={`Stylised preview of ${pose.title}`}>
      <defs>
        <linearGradient id={`bg-${pose.id}`} x1="0" y1="0" x2="1" y2="1">
          <stop stopColor={pose.category === 'mirror' ? '#dcecf2' : '#efe8dc'} />
          <stop offset="1" stopColor={pose.moods.includes('bold') ? '#ffc6bc' : '#dce7bf'} />
        </linearGradient>
      </defs>
      <rect width="240" height="230" rx={compact ? 18 : 28} fill={`url(#bg-${pose.id})`} />
      <path d="M18 194C61 182 179 182 222 194" fill="none" stroke="#20211f" strokeOpacity=".14" strokeWidth="2" />
      {pose.category === 'mirror' && <rect x="26" y="18" width="188" height="186" rx="6" fill="none" stroke="#20211f" strokeOpacity=".28" strokeWidth="3" />}
      <Figure x={isPair ? 87 : 120} lean={lean} arm={arm} leg={leg} phone={phone} coral />
      {isPair && <Figure x={151} lean={-lean} arm={arm - 8} leg={-leg} phone={pose.category === 'selfie'} coral={false} />}
      {pose.animation && (
        <g transform="translate(188 28)">
          <circle r="17" fill="#20211f" />
          <path d="m-4-7 12 7-12 7Z" fill="#c9ff64" />
        </g>
      )}
    </svg>
  );
}

function Figure({ x, lean, arm, leg, phone, coral }: { x: number; lean: number; arm: number; leg: number; phone: boolean; coral: boolean }) {
  const fill = coral ? '#ff5c45' : '#5e62bb';
  return (
    <g transform={`translate(${x} 54) rotate(${lean})`} stroke="#20211f" strokeLinecap="round" strokeLinejoin="round">
      <circle cy="1" r="16" fill="#f2b893" strokeWidth="3" />
      <path d="M0 18V91" strokeWidth="28" stroke={fill} />
      <path d={`M-8 33 L-${arm} 77`} strokeWidth="12" />
      <path d={`M8 33 L${arm} ${phone ? 31 : 75}`} strokeWidth="12" />
      {phone && <rect x={arm - 7} y="18" width="16" height="27" rx="3" fill="#20211f" stroke="none" />}
      <path d={`M-7 93 L-${leg} 160`} strokeWidth="15" />
      <path d={`M7 93 L${leg} 160`} strokeWidth="15" />
      <path d={`M-${leg} 160h-16`} strokeWidth="9" />
      <path d={`M${leg} 160h16`} strokeWidth="9" />
    </g>
  );
}

