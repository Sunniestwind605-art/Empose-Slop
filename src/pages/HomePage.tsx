import { ArrowRight, Camera, LockKeyhole, Move3d, ScanFace, ScanLine, UsersRound } from 'lucide-react';
import { Link } from 'react-router-dom';
import { PoseCard } from '../components/PoseCard';
import { poseById, poseStats, poses } from '../data/poses';
import PoseViewer from '../features/pose-viewer/PoseViewer';

const heroPose = poseById('fashion-counterline') ?? poses[0];
const picks = ['wall-lean', 'connected-walk', 'mirror-outfit-offset'].map((id) => poseById(id)!).filter(Boolean);

export function HomePage() {
  return (
    <div className="home-page">
      <section className="hero section-wrap">
        <div className="hero-copy">
          <span className="kicker">Your browser-based pose director</span>
          <h1>Stop wondering<br /><em>what to do</em><br />in the frame.</h1>
          <p>Describe the feeling, setting and shot. PosePilot builds a private shortlist, then renders every joint, angle and weight shift on a sculpted articulated mannequin.</p>
          <div className="hero-actions">
            <Link className="button primary" to="/generate">Generate my poses <ArrowRight size={18} /></Link>
            <Link className="button secondary" to="/explore">Browse all {poseStats.total}</Link>
          </div>
          <div className="privacy-chip"><LockKeyhole size={15} /> No face scanning. No account. No uploads.</div>
        </div>
        <div className="hero-stage">
          <div className="stage-label"><span>POSE BLUEPRINT</span><strong>{heroPose.title}</strong></div>
          <PoseViewer pose={heroPose} showCueRail={false} />
          <div className="stage-note"><ScanLine size={17} /><span>Switch views and follow the joint, gaze and weight markers.</span></div>
        </div>
      </section>

      <section className="route-strip section-wrap" aria-label="Quick pose paths">
        <Link to="/generate?subject=flexible"><span>01</span><div><strong>Just me</strong><small>Solo direction</small></div><ArrowRight /></Link>
        <Link to="/generate?subject=pair"><span>02</span><div><strong>Two of us</strong><small>Pair choreography</small></div><UsersRound /></Link>
        <Link to="/generate?movement=walking"><span>03</span><div><strong>In motion</strong><small>Capture the in-between</small></div><Move3d /></Link>
        <Link to="/selfie"><span>04</span><div><strong>Selfie studio</strong><small>Phone + expression</small></div><ScanFace /></Link>
      </section>

      <section className="editorial-section section-wrap">
        <div className="section-heading">
          <div><span className="kicker">Director's shortlist</span><h2>Three ways out of<br />“I don’t know how to stand.”</h2></div>
          <p>Start with a structure that feels comfortable. Make one tiny change at a time. Photograph the transitions—not only the final hold.</p>
        </div>
        <div className="pose-grid featured-grid">
          {picks.map((pose, index) => <div className={`featured-${index + 1}`} key={pose.id}><PoseCard pose={pose} /></div>)}
        </div>
      </section>

      <section className="how-section section-wrap">
        <div className="how-number">03</div>
        <div className="how-copy"><span className="kicker">From blank to frame-ready</span><h2>A clear direction in three beats.</h2></div>
        <ol>
          <li><span>01</span><Camera /><div><strong>Set the intention</strong><p>Choose who, where, mood and framing. No personal details required.</p></div></li>
          <li><span>02</span><ScanLine /><div><strong>Study the shape</strong><p>Read a smooth pseudo-3D mannequin with optional joint, head-direction, hand and balance markers.</p></div></li>
          <li><span>03</span><ArrowRight /><div><strong>Make it yours</strong><p>Follow concise cues, save a shortlist and move through your shoot plan.</p></div></li>
        </ol>
      </section>

      <section className="closing-cta section-wrap">
        <div><span className="kicker">Private by design</span><h2>Your photos stay yours.<br />We never ask to see them.</h2></div>
        <div><p>Every recommendation happens on your device. The only things saved are the favourites, answers and shoot plan you choose to keep in this browser.</p><Link className="button ink" to="/generate">Find a pose <ArrowRight size={18} /></Link></div>
      </section>
    </div>
  );
}

