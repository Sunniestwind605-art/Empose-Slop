import { ArrowLeft, ArrowRight, Check, Grid2X2, List, RefreshCcw, SlidersHorizontal, Sparkles } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useApp } from '../AppContext';
import { PageIntro } from '../components/PageIntro';
import { PoseCard } from '../components/PoseCard';
import {
  expressiveOptions, framingOptions, helpOptions, locationOptions, modeOptions,
  moodOptions, movementOptions, occasionOptions, subjectOptions,
} from '../data/options';
import { poses } from '../data/poses';
import { recommendPoses } from '../features/recommendations/engine';
import type { QuestionnaireAnswers } from '../types';

const totalSteps = 9;

export function GeneratorPage() {
  const { answers, setAnswers } = useApp();
  const [params] = useSearchParams();
  const [step, setStep] = useState(1);
  const [complete, setComplete] = useState(false);
  const [seed, setSeed] = useState(12);
  const [history, setHistory] = useState<string[]>([]);
  const [limit, setLimit] = useState(8);
  const [sort, setSort] = useState<'relevance' | 'simple' | 'creative'>('relevance');
  const [view, setView] = useState<'grid' | 'list'>('grid');

  useEffect(() => {
    const subject = params.get('subject');
    const movement = params.get('movement');
    if (subject || movement) {
      setAnswers((current) => ({
        ...current,
        ...(subject && ['masculine', 'feminine', 'flexible', 'pair'].includes(subject) ? { subject: subject as QuestionnaireAnswers['subject'] } : {}),
        ...(movement && ['static', 'micro', 'walking', 'energetic'].includes(movement) ? { movement: movement as QuestionnaireAnswers['movement'] } : {}),
      }));
    }
    // URL defaults are applied once on entry.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const recommendations = useMemo(() => {
    const results = recommendPoses(poses, answers, { limit, excludeIds: history, seed });
    return [...results].sort((a, b) => sort === 'relevance'
      ? b.score - a.score
      : sort === 'simple'
        ? (a.pose.difficulty === 'easy' ? -1 : 1) - (b.pose.difficulty === 'easy' ? -1 : 1)
        : (b.pose.difficulty === 'experimental' ? 1 : 0) - (a.pose.difficulty === 'experimental' ? 1 : 0));
  }, [answers, history, limit, seed, sort]);

  const update = <K extends keyof QuestionnaireAnswers>(key: K, value: QuestionnaireAnswers[K]) => setAnswers((current) => ({ ...current, [key]: value }));
  const toggleList = <K extends 'secondaryMoods' | 'helpAreas'>(key: K, value: QuestionnaireAnswers[K][number]) => {
    const current = answers[key] as string[];
    update(key, (current.includes(value) ? current.filter((item) => item !== value) : [...current, value]) as QuestionnaireAnswers[K]);
  };
  const next = () => step === totalSteps ? setComplete(true) : setStep((value) => value + 1);
  const regenerate = () => {
    setHistory((current) => [...current, ...recommendations.map(({ pose }) => pose.id)].slice(-20));
    setSeed((value) => value + 19);
  };

  if (complete) {
    return (
      <div className="page section-wrap results-page">
        <PageIntro eyebrow="Your shortlist" title={`${recommendations.length} poses, directed for you.`} copy={`Built around a ${answers.primaryMood} feeling, ${answers.framing.replace('-', ' ')} framing and ${answers.mode.replace('-', ' ')} setup.`}
          aside={<button className="button secondary" onClick={() => setComplete(false)}><SlidersHorizontal size={17} /> Adjust answers</button>} />
        <div className="results-toolbar">
          <button className="button shuffle" onClick={regenerate}><RefreshCcw size={17} /> New mix</button>
          <label>Sort <select value={sort} onChange={(event) => setSort(event.target.value as typeof sort)}><option value="relevance">Best match</option><option value="simple">Simplest first</option><option value="creative">Most creative</option></select></label>
          <div className="view-toggle"><button className={view === 'grid' ? 'active' : ''} onClick={() => setView('grid')} aria-label="Grid view"><Grid2X2 size={18} /></button><button className={view === 'list' ? 'active' : ''} onClick={() => setView('list')} aria-label="Compact list view"><List size={18} /></button></div>
        </div>
        {recommendations.length ? (
          <div className={`pose-grid ${view === 'list' ? 'list-view' : ''}`}>
            {recommendations.map(({ pose, reasons }) => <PoseCard key={pose.id} pose={pose} compact={view === 'list'} reason={reasons.join(' · ')} />)}
          </div>
        ) : <div className="empty-state"><Sparkles /><h2>Let’s loosen one filter.</h2><p>No exact match was found. Try “any location” or a different movement level.</p><button className="button primary" onClick={() => { update('location', 'anywhere'); update('movement', 'micro'); }}>Relax lower-priority filters</button></div>}
        {limit < 16 && <button className="button secondary load-more" onClick={() => setLimit((value) => value + 4)}>Show more poses</button>}
      </div>
    );
  }

  return (
    <div className="page section-wrap generator-page">
      <div className="questionnaire-head">
        <div><span className="kicker">Pose generator</span><p>Step {step} of {totalSteps}</p></div>
        <div className="progress-track" aria-label={`Step ${step} of ${totalSteps}`}><span style={{ width: `${step / totalSteps * 100}%` }} /></div>
        <button className="text-action" onClick={() => setComplete(true)}>Use current answers <ArrowRight size={16} /></button>
      </div>
      <section className="question-card" key={step}>
        <QuestionStep step={step} answers={answers} update={update} toggleList={toggleList} />
      </section>
      <div className="question-actions">
        <button className="button secondary" onClick={() => setStep((value) => Math.max(1, value - 1))} disabled={step === 1}><ArrowLeft size={18} /> Back</button>
        <span>{step < totalSteps ? 'You can change this later.' : 'Ready when you are.'}</span>
        <button className="button primary" onClick={next}>{step === totalSteps ? 'Build my shortlist' : 'Continue'} <ArrowRight size={18} /></button>
      </div>
    </div>
  );
}

type StepProps = {
  step: number;
  answers: QuestionnaireAnswers;
  update: <K extends keyof QuestionnaireAnswers>(key: K, value: QuestionnaireAnswers[K]) => void;
  toggleList: <K extends 'secondaryMoods' | 'helpAreas'>(key: K, value: QuestionnaireAnswers[K][number]) => void;
};

function QuestionStep({ step, answers, update, toggleList }: StepProps) {
  if (step === 1) return <ChoiceStep number="01" title="Who’s in the frame?" copy="Choose a styling direction. The same practical coaching works across bodies and identities."><ChoiceGrid options={subjectOptions} value={answers.subject} onChange={(value) => update('subject', value as QuestionnaireAnswers['subject'])} /></ChoiceStep>;
  if (step === 2) return <ChoiceStep number="02" title="How should the photo feel?" copy="Pick the main creative direction, then add up to three supporting moods."><ChoiceGrid options={moodOptions} value={answers.primaryMood} onChange={(value) => update('primaryMood', value as QuestionnaireAnswers['primaryMood'])} large /> <div className="secondary-choices"><strong>Optional supporting moods</strong><div className="chip-group">{moodOptions.filter((item) => item.value !== answers.primaryMood).map((item) => <button key={item.value} aria-pressed={answers.secondaryMoods.includes(item.value)} className={answers.secondaryMoods.includes(item.value) ? 'selected' : ''} onClick={() => toggleList('secondaryMoods', item.value)} disabled={!answers.secondaryMoods.includes(item.value) && answers.secondaryMoods.length >= 3}>{answers.secondaryMoods.includes(item.value) && <Check size={14} />}{item.label}</button>)}</div></div></ChoiceStep>;
  if (step === 3) return <ChoiceStep number="03" title="What’s the occasion?" copy="No personal details needed—just the kind of frame you’re making."><ChoiceGrid options={occasionOptions} value={answers.occasion} onChange={(value) => update('occasion', value as QuestionnaireAnswers['occasion'])} /></ChoiceStep>;
  if (step === 4) return <ChoiceStep number="04" title="Where will you shoot?" copy="We only use this as a creative context. We never request your precise location."><ChoiceGrid options={locationOptions} value={answers.location} onChange={(value) => update('location', value as QuestionnaireAnswers['location'])} /></ChoiceStep>;
  if (step === 5) return <ChoiceStep number="05" title="Who holds the camera?" copy="This changes both pose selection and the guidance you’ll see."><ChoiceGrid options={modeOptions} value={answers.mode} onChange={(value) => { const mode = value as QuestionnaireAnswers['mode']; update('mode', mode); if (mode === 'mirror-selfie') update('location', 'full-mirror'); if (mode.includes('selfie') && !answers.helpAreas.includes('phone')) update('helpAreas', [...answers.helpAreas, 'phone']); }} /></ChoiceStep>;
  if (step === 6) return <ChoiceStep number="06" title="How much of the scene?" copy="Choose the crop you want to build the pose around."><ChoiceGrid options={framingOptions} value={answers.framing} onChange={(value) => update('framing', value as QuestionnaireAnswers['framing'])} /></ChoiceStep>;
  if (step === 7) {
    const applicable = helpOptions.filter((item) => answers.mode.includes('selfie') ? item.value !== 'composition' || true : item.value !== 'phone');
    return <ChoiceStep number="07" title="Where would direction help most?" copy="Choose as many as you like. We’ll favour poses with specific coaching in these areas."><div className="multi-grid">{applicable.map((item) => <button key={item.value} aria-pressed={answers.helpAreas.includes(item.value)} className={answers.helpAreas.includes(item.value) ? 'selected' : ''} onClick={() => toggleList('helpAreas', item.value)}>{answers.helpAreas.includes(item.value) && <Check size={17} />}{item.label}</button>)}</div></ChoiceStep>;
  }
  if (step === 8) return <ChoiceStep number="08" title="How expressive?" copy="There’s no correct setting—just choose how much visual tension you want."><div className="range-choices">{expressiveOptions.map((item, index) => <button key={item.value} aria-pressed={answers.expressiveness === item.value} className={answers.expressiveness === item.value ? 'selected' : ''} onClick={() => update('expressiveness', item.value)}><span>{index + 1}</span>{item.label}</button>)}</div></ChoiceStep>;
  return <ChoiceStep number="09" title="Stillness or motion?" copy="Dynamic poses include real three-stage animations and capture cues."><ChoiceGrid options={movementOptions} value={answers.movement} onChange={(value) => update('movement', value as QuestionnaireAnswers['movement'])} /><label className="prop-select">Optional prop <select value={answers.prop} onChange={(event) => update('prop', event.target.value)}><option value="none">No prop preference</option><option value="chair">Chair</option><option value="bag">Bag</option><option value="jacket">Jacket</option><option value="sunglasses">Sunglasses</option><option value="coffee cup">Coffee cup</option></select></label></ChoiceStep>;
}

function ChoiceStep({ number, title, copy, children }: { number: string; title: string; copy: string; children: React.ReactNode }) {
  return <><span className="question-number">{number}</span><div className="question-copy"><h1>{title}</h1><p>{copy}</p></div><div className="question-options">{children}</div></>;
}

function ChoiceGrid({ options, value, onChange, large = false }: { options: { value: string; label: string; note?: string }[]; value: string; onChange: (value: string) => void; large?: boolean }) {
  return <div className={`choice-grid ${large ? 'large' : ''}`}>{options.map((option, index) => <button key={option.value} aria-pressed={value === option.value} className={value === option.value ? 'selected' : ''} onClick={() => onChange(option.value)}><span className="choice-index">{String(index + 1).padStart(2, '0')}</span><strong>{option.label}</strong>{option.note && <small>{option.note}</small>}{value === option.value && <Check className="choice-check" size={18} />}</button>)}</div>;
}

