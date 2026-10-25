import { CameraOff, Lightbulb, ScanFace, Smartphone } from 'lucide-react';
import { useState } from 'react';
import { PageIntro } from '../components/PageIntro';
import { PoseCard } from '../components/PoseCard';
import { poses } from '../data/poses';

const expressions = [
  { id: 'neutral', title: 'Quiet neutral', mouth: 'M40 62 Q50 63 60 62', eyes: 0, tip: 'Release the jaw, breathe through the nose and let the lips meet without pressing.' },
  { id: 'subtle', title: 'Subtle smile', mouth: 'M39 60 Q50 68 61 60', eyes: 1, tip: 'Think of something pleasant and let only the corners of the mouth answer.' },
  { id: 'broad', title: 'Open smile', mouth: 'M37 58 Q50 75 63 58 Q50 66 37 58', eyes: 2, tip: 'Exhale just before the frame so the smile reaches the eyes instead of freezing.' },
  { id: 'laugh', title: 'Candid laugh', mouth: 'M38 57 Q50 78 62 57 Q50 70 38 57', eyes: 3, tip: 'Look away, laugh on the breath, then let the eyes return while the expression is still moving.' },
  { id: 'editorial', title: 'Editorial focus', mouth: 'M40 62 L60 61', eyes: -1, tip: 'Lower the chin a fraction, relax the brow and focus through the lens rather than at the screen.' },
  { id: 'thoughtful', title: 'Thoughtful away', mouth: 'M41 62 Q50 64 59 61', eyes: 1, tip: 'Pick a real point beside the phone and turn the eyes first, followed by only a little chin.' },
  { id: 'playful', title: 'Playful spark', mouth: 'M39 61 Q50 71 61 59', eyes: 4, tip: 'Add one asymmetry—a raised brow or tiny head tilt—while keeping the shoulders easy.' },
];

export function SelfieStudioPage() {
  const [tab, setTab] = useState<'mirror' | 'front' | 'expression'>('mirror');
  const collection = poses.filter((pose) => pose.category === (tab === 'front' ? 'selfie' : tab)).slice(0, 8);
  return (
    <div className="page section-wrap selfie-page">
      <PageIntro eyebrow="Selfie studio" title="Direct the shot from your side of the lens." copy="Mirror, front-camera and expression guidance—without opening your camera, scanning your face or asking for a photo." aside={<div className="privacy-stamp"><CameraOff size={20} /><span><strong>Camera-free</strong> by design</span></div>} />
      <div className="studio-tabs" role="tablist" aria-label="Selfie studio modes">
        <button role="tab" aria-selected={tab === 'mirror'} className={tab === 'mirror' ? 'active' : ''} onClick={() => setTab('mirror')}><span>01</span><Smartphone /> Mirror poses</button>
        <button role="tab" aria-selected={tab === 'front'} className={tab === 'front' ? 'active' : ''} onClick={() => setTab('front')}><span>02</span><ScanFace /> Front camera</button>
        <button role="tab" aria-selected={tab === 'expression'} className={tab === 'expression' ? 'active' : ''} onClick={() => setTab('expression')}><span>03</span><Lightbulb /> Expression coach</button>
      </div>

      {tab !== 'expression' ? (
        <>
          <section className="studio-note">
            <div className="big-number">{tab === 'mirror' ? 'M' : 'F'}</div>
            <div><span className="kicker">{tab === 'mirror' ? 'Control the reflection' : 'Start with the lens'}</span><h2>{tab === 'mirror' ? 'Phone beside the face. Body inside the frame.' : 'Set the phone first, then settle your expression.'}</h2></div>
            <ul>{tab === 'mirror' ? <><li>Keep the phone parallel to the mirror.</li><li>Leave clean space around the outfit and feet.</li><li>Use soft side or front light; tidy what the mirror reveals.</li></> : <><li>Hold the lens near eye level to start.</li><li>Look at the lens—not your own preview.</li><li>Make small shoulder and head-angle changes.</li></>}</ul>
          </section>
          <div className="pose-grid">{collection.map((pose) => <PoseCard key={pose.id} pose={pose} />)}</div>
        </>
      ) : (
        <section className="expression-section">
          <div className="expression-intro"><span className="kicker">Seven starting points</span><h2>There is no ideal face.<br />There are only different intentions.</h2><p>Use these illustrations as tiny movement prompts. Pause between frames, keep breathing and let your expression change rather than trying to “hold” it perfectly.</p></div>
          <div className="expression-grid">{expressions.map((expression) => <article key={expression.id}><ExpressionFace {...expression} /><span>{expression.id}</span><h3>{expression.title}</h3><p>{expression.tip}</p></article>)}</div>
        </section>
      )}
    </div>
  );
}

function ExpressionFace({ title, mouth, eyes }: { title: string; mouth: string; eyes: number }) {
  const leftY = 42 - Math.max(0, eyes);
  const rightY = 42 + (eyes === 4 ? 2 : -Math.max(0, eyes));
  return (
    <svg className="expression-face" viewBox="0 0 100 100" role="img" aria-label={`Illustration of ${title}`}>
      <path d="M50 7C28 7 16 24 18 49c2 28 14 44 32 44s30-16 32-44C84 24 72 7 50 7Z" fill="#efb28c" />
      <path d="M20 39C18 18 31 5 51 5c18 0 30 10 31 31-10-7-17-16-20-23-9 12-24 19-42 26Z" fill="#3b322c" />
      <path d={`M30 ${leftY} Q36 ${leftY - 4 - Math.min(eyes, 1)} 42 ${leftY}`} fill="none" stroke="#302a27" strokeWidth="3" strokeLinecap="round" />
      <path d={`M58 ${rightY} Q64 ${rightY - 4 + Math.min(eyes, 0)} 70 ${rightY}`} fill="none" stroke="#302a27" strokeWidth="3" strokeLinecap="round" />
      <path d="M50 43 47 55 53 56" fill="none" stroke="#b37055" strokeWidth="2" strokeLinecap="round" />
      <path d={mouth} fill={title.includes('smile') || title.includes('laugh') ? '#fff4e8' : 'none'} stroke="#7f3d3b" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

