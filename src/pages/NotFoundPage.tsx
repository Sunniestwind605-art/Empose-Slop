import { Link } from 'react-router-dom';

export function NotFoundPage() {
  return <div className="page section-wrap empty-state"><span className="kicker">404 · out of frame</span><h1>That page isn’t in the shot.</h1><p>Return to Discover or open the pose library.</p><Link className="button primary" to="/">Back home</Link></div>;
}

