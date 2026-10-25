export function PageIntro({ eyebrow, title, copy, aside }: { eyebrow: string; title: string; copy: string; aside?: React.ReactNode }) {
  return (
    <header className="page-intro">
      <div><span className="kicker">{eyebrow}</span><h1>{title}</h1><p>{copy}</p></div>
      {aside && <div className="page-intro-aside">{aside}</div>}
    </header>
  );
}

