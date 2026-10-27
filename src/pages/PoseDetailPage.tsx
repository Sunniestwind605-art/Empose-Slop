import { ArrowLeft, BookmarkPlus, Camera, Check, Heart, Sparkles } from 'lucide-react';
import { useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useApp } from '../AppContext';
import { PoseCard } from '../components/PoseCard';
import { poseById, poses } from '../data/poses';
import PoseViewer from '../features/pose-viewer/PoseViewer';

export function PoseDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const pose = poseById(id);
  const [showPhotographer, setShowPhotographer] = useState(false);
  const { favourites, toggleFavourite, session, addToSession } = useApp();
  const similar = useMemo(() => pose ? poses.filter((item) => item.id !== pose.id && (item.category === pose.category || item.moods.some((mood) => pose.moods.includes(mood)))).slice(0, 3) : [], [pose]);

  if (!pose) return <div className="page section-wrap empty-state"><h1>Pose not found.</h1><p>The guide may have moved.</p><Link className="button primary" to="/explore">Browse the library</Link></div>;
  const saved = favourites.includes(pose.id);
  const planned = session.includes(pose.id);
  return (
    <div className="page section-wrap detail-page">
      <button className="text-action detail-back" onClick={() => navigate(-1)}><ArrowLeft size={16} /> Back to previous view</button>
      <header className="detail-header">
        <div><span className="kicker">{pose.category} direction</span><h1>{pose.title}</h1><p>{pose.description}</p><div className="tag-row">{pose.moods.map((mood) => <span key={mood}>{mood}</span>)}<span>{pose.difficulty}</span><span>{pose.animation ? 'dynamic' : 'still'}</span></div></div>
        <div className="detail-actions">
          <button className={`button secondary ${saved ? 'active' : ''}`} onClick={() => toggleFavourite(pose.id)}><Heart size={18} fill={saved ? 'currentColor' : 'none'} /> {saved ? 'Saved' : 'Favourite'}</button>
          <button className={`button secondary ${planned ? 'active' : ''}`} onClick={() => addToSession(pose.id)}>{planned ? <Check size={18} /> : <BookmarkPlus size={18} />} {planned ? 'In shoot plan' : 'Add to plan'}</button>
        </div>
      </header>

      <section className="detail-main">
        <div className="detail-viewer">
          <PoseViewer pose={pose} showPhotographer={showPhotographer} />
          {pose.cameraGuide && (
            <button className={`photographer-toggle ${showPhotographer ? 'active' : ''}`} onClick={() => setShowPhotographer((value) => !value)} aria-pressed={showPhotographer}><Camera size={18} /> {showPhotographer ? 'Hide' : 'Show'} photographer guide</button>
          )}
        </div>
        <div className="detail-instructions">
          <div className="instruction-heading"><span>DIRECTOR’S NOTES</span><strong>{pose.framing.map((item) => item.replace('-', ' ')).join(' · ')}</strong></div>
          <ol>{pose.instructions.map((instruction, index) => <li key={instruction}><span>{String(index + 1).padStart(2, '0')}</span><p>{instruction}</p></li>)}</ol>
          <div className="coaching-grid">
            <article><span>Hands</span><p>{pose.handTips}</p></article>
            <article><span>Posture</span><p>{pose.postureTip}</p></article>
            <article><span>Head & gaze</span><p>{pose.gazeTip}</p></article>
            <article><span>Expression</span><p>{pose.expressionTips.join(' ')}</p></article>
          </div>
          {pose.selfieTip && <div className="director-note coral"><strong>Phone direction</strong><p>{pose.selfieTip}</p></div>}
          {pose.photographerTip && <div className="director-note"><strong>For the photographer</strong><p>{pose.photographerTip}</p></div>}
          {pose.cameraGuide && showPhotographer && <div className="camera-spec"><Camera size={20} /><div><strong>{pose.cameraGuide.angle.replace('-', ' ')} · {pose.cameraGuide.height} height · {pose.cameraGuide.distance}</strong><p>{pose.cameraGuide.composition}</p></div></div>}
        </div>
      </section>

      <section className="similar-section">
        <div className="section-heading compact"><div><span className="kicker">Stay in the direction</span><h2>Similar, not identical.</h2></div><Link className="text-action" to="/generate"><Sparkles size={16} /> Generate a new shortlist</Link></div>
        <div className="pose-grid">{similar.map((item) => <PoseCard key={item.id} pose={item} />)}</div>
      </section>
    </div>
  );
}

