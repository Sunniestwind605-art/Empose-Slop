import { ArrowDown, ArrowUp, Download, Printer, Trash2, X } from 'lucide-react';
import { useApp } from '../AppContext';
import { PageIntro } from '../components/PageIntro';
import { poses } from '../data/poses';
import { PoseGlyph } from '../features/pose-viewer/PoseGlyph';

export function SessionPage() {
  const { session, removeFromSession, moveSessionItem, clearSession } = useApp();
  const plan = session.map((id) => poses.find((pose) => pose.id === id)).filter(Boolean) as typeof poses;
  const exportPlan = () => {
    const data = plan.map(({ id, title, description, instructions, photographerTip, selfieTip }) => ({ id, title, description, instructions, photographerTip, selfieTip }));
    const url = URL.createObjectURL(new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' }));
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = 'posepilot-shoot-plan.json';
    anchor.click();
    URL.revokeObjectURL(url);
  };
  return (
    <div className="page section-wrap session-page">
      <PageIntro eyebrow="Shoot session" title="One less thing to think about on set." copy="Arrange a short sequence with varied framing and direction. Everything stays saved in this browser." aside={plan.length ? <div className="session-actions"><button className="button secondary" onClick={() => window.print()}><Printer size={17} /> Print</button><button className="button secondary" onClick={exportPlan}><Download size={17} /> JSON</button></div> : undefined} />
      {plan.length ? (
        <>
          <div className="session-summary"><span>{plan.length} scenes</span><span>{plan.filter((pose) => pose.animation).length} movement sequences</span><span>{new Set(plan.flatMap((pose) => pose.framing)).size} framing options</span><button className="text-action danger-text" onClick={() => window.confirm('Clear the entire shoot plan?') && clearSession()}><Trash2 size={15} /> Clear plan</button></div>
          <ol className="session-list">{plan.map((pose, index) => <li key={pose.id}><div className="session-order">{String(index + 1).padStart(2, '0')}</div><div className="session-glyph"><PoseGlyph pose={pose} compact /></div><div className="session-copy"><span>{pose.category} · {pose.framing[0].replace('-', ' ')}</span><h2>{pose.title}</h2><p>{pose.instructions[1]}</p><small>{pose.photographerTip ?? pose.selfieTip}</small></div><div className="reorder-controls"><button onClick={() => moveSessionItem(pose.id, -1)} disabled={index === 0} aria-label={`Move ${pose.title} earlier`}><ArrowUp /></button><button onClick={() => moveSessionItem(pose.id, 1)} disabled={index === plan.length - 1} aria-label={`Move ${pose.title} later`}><ArrowDown /></button><button onClick={() => removeFromSession(pose.id)} aria-label={`Remove ${pose.title} from plan`}><X /></button></div></li>)}</ol>
        </>
      ) : <div className="empty-state"><Printer /><h2>Your shoot plan is empty.</h2><p>Add poses from recommendations or the library, then reorder and print the sequence here.</p><a className="button primary" href="#/generate">Generate a shortlist</a></div>}
    </div>
  );
}

