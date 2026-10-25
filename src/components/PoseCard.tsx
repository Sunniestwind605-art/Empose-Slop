import { ArrowUpRight, BookmarkPlus, Check, Heart } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useApp } from '../AppContext';
import type { Pose } from '../types';
import { PoseGlyph } from '../features/pose-viewer/PoseGlyph';

export function PoseCard({ pose, reason, compact = false }: { pose: Pose; reason?: string; compact?: boolean }) {
  const { favourites, toggleFavourite, session, addToSession } = useApp();
  const saved = favourites.includes(pose.id);
  const planned = session.includes(pose.id);
  return (
    <article className={`pose-card ${compact ? 'compact' : ''}`}>
      <Link to={`/pose/${pose.id}`} className="pose-card-visual"><PoseGlyph pose={pose} compact={compact} /></Link>
      <div className="pose-card-body">
        <div className="eyebrow-row"><span>{pose.category}</span><span>{pose.difficulty}</span>{pose.animation && <span>motion</span>}</div>
        <h3><Link to={`/pose/${pose.id}`}>{pose.title}</Link></h3>
        <p>{pose.description}</p>
        {reason && <p className="recommendation-reason"><Spark /> {reason}</p>}
        <div className="pose-card-actions">
          <Link className="text-action" to={`/pose/${pose.id}`}>Open guide <ArrowUpRight size={16} /></Link>
          <button onClick={() => addToSession(pose.id)} className={`icon-button ${planned ? 'active' : ''}`} aria-pressed={planned} aria-label={planned ? `${pose.title} is in shoot plan` : `Add ${pose.title} to shoot plan`} title="Add to shoot plan">{planned ? <Check size={17} /> : <BookmarkPlus size={17} />}</button>
          <button onClick={() => toggleFavourite(pose.id)} className={`icon-button heart-button ${saved ? 'active' : ''}`} aria-pressed={saved} aria-label={saved ? `Remove ${pose.title} from favourites` : `Add ${pose.title} to favourites`} title="Favourite"><Heart size={17} fill={saved ? 'currentColor' : 'none'} /></button>
        </div>
      </div>
    </article>
  );
}

function Spark() {
  return <span aria-hidden="true">✦</span>;
}

