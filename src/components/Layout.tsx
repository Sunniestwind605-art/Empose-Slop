import { Compass, Heart, Home, Menu, Sparkles, UserRound, X } from 'lucide-react';
import { useState } from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import { useApp } from '../AppContext';
import { BrandMark } from './BrandMark';

const nav = [
  { to: '/', label: 'Discover', icon: Home },
  { to: '/generate', label: 'Generate', icon: Sparkles },
  { to: '/explore', label: 'Explore', icon: Compass },
  { to: '/selfie', label: 'Selfie studio', icon: UserRound },
];

export function Layout() {
  const [menuOpen, setMenuOpen] = useState(false);
  const { favourites, session } = useApp();
  const linkClass = ({ isActive }: { isActive: boolean }) => `nav-link ${isActive ? 'active' : ''}`;
  return (
    <div className="app-shell">
      <a className="skip-link" href="#main-content">Skip to content</a>
      <header className="site-header">
        <NavLink to="/" className="logo-link"><BrandMark /></NavLink>
        <nav className="desktop-nav" aria-label="Primary navigation">
          {nav.map(({ to, label }) => <NavLink key={to} to={to} end={to === '/'} className={linkClass}>{label}</NavLink>)}
        </nav>
        <div className="header-actions">
          <NavLink className="session-link" to="/session">Shoot plan <span>{session.length}</span></NavLink>
          <NavLink className="favourite-link" to="/favourites" aria-label={`${favourites.length} favourite poses`}><Heart size={19} /> <span>{favourites.length}</span></NavLink>
          <button className="menu-button" onClick={() => setMenuOpen((value) => !value)} aria-label="Toggle menu" aria-expanded={menuOpen}>{menuOpen ? <X /> : <Menu />}</button>
        </div>
        {menuOpen && (
          <nav className="mobile-menu" aria-label="Mobile navigation">
            {nav.map(({ to, label }) => <NavLink key={to} to={to} end={to === '/'} onClick={() => setMenuOpen(false)} className={linkClass}>{label}</NavLink>)}
            <NavLink to="/session" onClick={() => setMenuOpen(false)} className={linkClass}>Shoot plan ({session.length})</NavLink>
            <NavLink to="/favourites" onClick={() => setMenuOpen(false)} className={linkClass}>Favourites ({favourites.length})</NavLink>
            <NavLink to="/about" onClick={() => setMenuOpen(false)} className={linkClass}>About & privacy</NavLink>
          </nav>
        )}
      </header>
      <main id="main-content"><Outlet /></main>
      <footer className="site-footer">
        <div><BrandMark /><p>A private pose coach that never needs your photos.</p></div>
        <div className="footer-links"><NavLink to="/about">About & privacy</NavLink><NavLink to="/session">Shoot plan</NavLink><a href="https://github.com/Sunniestwind605-art/Empose-Slop" target="_blank" rel="noreferrer">GitHub</a></div>
      </footer>
      <nav className="mobile-bottom-nav" aria-label="Quick navigation">
        {nav.map(({ to, label, icon: Icon }) => <NavLink key={to} to={to} end={to === '/'} className={linkClass}><Icon size={19} /><span>{label === 'Selfie studio' ? 'Selfie' : label}</span></NavLink>)}
      </nav>
    </div>
  );
}

