import { Search, SlidersHorizontal, X } from 'lucide-react';
import { useMemo, useState } from 'react';
import { PageIntro } from '../components/PageIntro';
import { PoseCard } from '../components/PoseCard';
import { framingOptions, modeOptions, moodOptions, movementOptions, subjectOptions } from '../data/options';
import { poseStats, poses } from '../data/poses';
import { filterPoses, type LibraryFilters } from '../features/recommendations/engine';

const emptyFilters: LibraryFilters = { collection: '', subject: '', mood: '', movement: '', framing: '', mode: '', difficulty: '' };
const collections = [
  { value: '', label: 'All collections', count: poseStats.total },
  { value: 'essentials', label: 'Essentials', count: poseStats.collections.essentials },
  { value: 'editorial', label: 'Editorial', count: poseStats.collections.editorial },
  { value: 'romantic', label: 'Romantic', count: poseStats.collections.romantic },
  { value: 'masculine', label: 'Masculine full body', count: poseStats.collections.masculine },
];

export function ExplorePage() {
  const [search, setSearch] = useState('');
  const [filters, setFilters] = useState<LibraryFilters>(emptyFilters);
  const [sort, setSort] = useState<'curated' | 'title' | 'simple'>('curated');
  const [showFilters, setShowFilters] = useState(false);
  const activeFilters = Object.values(filters).filter(Boolean).length;
  const results = useMemo(() => {
    const filtered = filterPoses(poses, search, filters);
    return [...filtered].sort((a, b) => sort === 'title'
      ? a.title.localeCompare(b.title)
      : sort === 'simple'
        ? ['easy', 'moderate', 'experimental'].indexOf(a.difficulty) - ['easy', 'moderate', 'experimental'].indexOf(b.difficulty)
        : 0);
  }, [filters, search, sort]);

  const setFilter = (key: keyof LibraryFilters, value: string) => setFilters((current) => ({ ...current, [key]: value }));

  return (
    <div className="page section-wrap explore-page">
      <PageIntro eyebrow="Pose library" title="A useful idea for every kind of frame." copy={`${poseStats.total} original pose guides organized into Essentials, Editorial, Romantic and Masculine full-body collections. Every guide is available offline after the first visit.`} />
      <nav className="collection-tabs" aria-label="Pose collections">
        {collections.map((collection) => <button key={collection.value || 'all'} className={filters.collection === collection.value ? 'active' : ''} onClick={() => setFilter('collection', collection.value)}><span>{collection.label}</span><strong>{collection.count}</strong></button>)}
      </nav>
      <div className="library-toolbar">
        <label className="search-box"><Search size={19} /><span className="sr-only">Search poses</span><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search: hands, walk, editorial…" />{search && <button onClick={() => setSearch('')} aria-label="Clear search"><X size={16} /></button>}</label>
        <button className={`button filter-button ${activeFilters ? 'active' : ''}`} onClick={() => setShowFilters((value) => !value)} aria-expanded={showFilters}><SlidersHorizontal size={18} /> Filters {activeFilters > 0 && <span>{activeFilters}</span>}</button>
        <label className="sort-control">Sort <select value={sort} onChange={(event) => setSort(event.target.value as typeof sort)}><option value="curated">Curated</option><option value="title">A–Z</option><option value="simple">Simplest</option></select></label>
      </div>
      {showFilters && (
        <div className="filter-panel">
          <Filter label="Collection" value={filters.collection} options={collections.slice(1)} onChange={(value) => setFilter('collection', value)} />
          <Filter label="Subject" value={filters.subject} options={subjectOptions} onChange={(value) => setFilter('subject', value)} />
          <Filter label="Mood" value={filters.mood} options={moodOptions} onChange={(value) => setFilter('mood', value)} />
          <Filter label="Movement" value={filters.movement} options={movementOptions} onChange={(value) => setFilter('movement', value)} />
          <Filter label="Framing" value={filters.framing} options={framingOptions} onChange={(value) => setFilter('framing', value)} />
          <Filter label="Camera" value={filters.mode} options={modeOptions} onChange={(value) => setFilter('mode', value)} />
          <Filter label="Difficulty" value={filters.difficulty} options={[{ value: 'easy', label: 'Easy' }, { value: 'moderate', label: 'Moderate' }, { value: 'experimental', label: 'Experimental' }]} onChange={(value) => setFilter('difficulty', value)} />
          <button className="text-action reset-filter" onClick={() => setFilters(emptyFilters)} disabled={!activeFilters}>Reset filters</button>
        </div>
      )}
      <div className="active-filter-row">
        <strong>{results.length} poses</strong>
        {Object.entries(filters).filter(([, value]) => value).map(([key, value]) => <button key={key} onClick={() => setFilter(key as keyof LibraryFilters, '')}>{value.replace('-', ' ')} <X size={13} /></button>)}
      </div>
      {results.length ? <div className="pose-grid">{results.map((pose) => <PoseCard key={pose.id} pose={pose} />)}</div> : (
        <div className="empty-state"><Search /><h2>No pose uses every one of those filters.</h2><p>Clear one or two filters and the library will open back up.</p><button className="button primary" onClick={() => { setFilters(emptyFilters); setSearch(''); }}>Reset library</button></div>
      )}
    </div>
  );
}

function Filter({ label, value, options, onChange }: { label: string; value: string; options: { value: string; label: string }[]; onChange: (value: string) => void }) {
  return <label><span>{label}</span><select value={value} onChange={(event) => onChange(event.target.value)}><option value="">All</option>{options.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}</select></label>;
}

