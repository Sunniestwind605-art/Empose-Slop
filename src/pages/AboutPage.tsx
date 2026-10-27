import { Database, EyeOff, HardDrive, LockKeyhole, RefreshCcw, ShieldCheck } from 'lucide-react';
import { useApp } from '../AppContext';
import { PageIntro } from '../components/PageIntro';
import { poseStats } from '../data/poses';

export function AboutPage() {
  const { clearLocalData } = useApp();
  const clear = () => {
    if (window.confirm('Clear favourites, questionnaire answers and the shoot plan saved in this browser?')) clearLocalData();
  };
  return (
    <div className="page section-wrap about-page">
      <PageIntro eyebrow="About PosePilot" title="Creative direction without surveillance." copy="PosePilot turns a few creative choices into practical pose direction. It is a static, open-source browser app—not a camera, social network or facial-analysis tool." />
      <section className="about-manifesto">
        <div className="manifesto-number">{poseStats.total}</div>
        <div><span>original local pose guides</span><h2>The intelligence is transparent.</h2><p>Each pose has structured tags, authored coaching and its own articulated joint configuration, rendered as a readable 2D blueprint. A weighted local algorithm compares those tags with your answers. There is no remote model pretending to know you.</p></div>
      </section>
      <section className="privacy-grid">
        <article><EyeOff /><span>01</span><h3>We never see you.</h3><p>No webcam access, photo uploads, face scanning, recognition or biometric processing.</p></article>
        <article><Database /><span>02</span><h3>Nothing leaves.</h3><p>Answers are scored locally. There are no analytics, ad trackers, external AI calls or questionnaire submissions.</p></article>
        <article><HardDrive /><span>03</span><h3>You choose what stays.</h3><p>Favourites, recent answers and shoot plans use browser local storage so they can survive a refresh.</p></article>
        <article><ShieldCheck /><span>04</span><h3>You can erase it.</h3><p>Clear all PosePilot data from this browser at any time with the control below.</p></article>
      </section>
      <section className="clear-data-panel">
        <div><LockKeyhole /><div><h2>Local data controls</h2><p>This clears only PosePilot’s saved favourites, questionnaire answers and shoot plan on this device.</p></div></div>
        <button className="button danger" onClick={clear}><RefreshCcw size={17} /> Clear my local data</button>
      </section>
      <section className="about-copy-grid">
        <div><span className="kicker">How recommendations work</span><h2>A match, not a judgment.</h2></div>
        <div><p>Subject direction and camera mode establish the relevant pool. Primary mood, framing and movement carry the most weight. Occasion, location, supporting moods and help areas refine the order.</p><p>If a perfect match does not exist, PosePilot keeps the hard camera/subject requirements and relaxes lower-priority preferences. It never evaluates how anyone looks.</p></div>
      </section>
    </div>
  );
}

