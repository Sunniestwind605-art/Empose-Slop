import { Heart, Search, Trash2 } from 'lucide-react';
import { useMemo, useState } from 'react';
import { useApp } from '../AppContext';
import { PageIntro } from '../components/PageIntro';
import { PoseCard } from '../components/PoseCard';
import { poses } from '../data/poses';

export function FavouritesPage() {
  const { favourites, toggleFavourite } = useApp();
  const [search, setSearch] = useState('');
  const saved = useMemo(() => poses.filter((pose) => favourites.includes(pose.id) && `${pose.title} ${pose.tags.join(' ')}`.toLowerCase().includes(search.toLowerCase())), [favourites, search]);
  const clear = () => { if (window.confirm('Remove every favourite from this browser?')) favourites.forEach(toggleFavourite); };
  return (
    <div className="page section-wrap">
      <PageIntro eyebrow="Favourites" title="The poses worth coming back to." copy="Saved only in this browser—no account, cloud sync or tracking." aside={favourites.length ? <button className="button danger" onClick={clear}><Trash2 size={17} /> Clear favourites</button> : undefined} />
      {favourites.length > 0 && <label className="search-box favourites-search"><Search size={19} /><span className="sr-only">Search favourites</span><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search saved poses" /></label>}
      {saved.length ? <div className="pose-grid">{saved.map((pose) => <PoseCard key={pose.id} pose={pose} />)}</div> : (
        <div className="empty-state"><Heart /><h2>{favourites.length ? 'No saved pose matches that search.' : 'Your shortlist starts with a heart.'}</h2><p>{favourites.length ? 'Try a broader term.' : 'Tap the heart on any pose and it will wait here for your next shoot.'}</p><a className="button primary" href="#/explore">Explore poses</a></div>
      )}
    </div>
  );
}

