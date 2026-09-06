import { useEffect, useState } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { disasterService } from '../services/disasterService';
import { useAuth } from '../hooks/useAuth';

const publicLinks = [
  { to: '/', label: 'Home' },
  { to: '/about', label: 'About' },
  { to: '/disasters', label: 'Disasters' },
  { to: '/safe-zones', label: 'Safe Zones' },
  { to: '/camps', label: 'Relief Camps' },
  { to: '/relief-needs', label: 'Relief Needs' },
  { to: '/donations', label: 'Donations' },
  { to: '/transparency', label: 'Transparency' },
  { to: '/contact', label: 'Contact' },
];

function workspaceLink(user) {
  if (!user) return null;
  if (user.role === 'admin') return { to: '/admin/dashboard', label: 'Workspace' };
  if (user.role === 'local_authority' || user.role === 'local_admin') return { to: '/authority/dashboard', label: 'Workspace' };
  if (user.role === 'camp_official') return { to: '/camp/dashboard', label: 'Workspace' };
  if (user.role === 'donor') return { to: '/donor/dashboard', label: 'Workspace' };
  return { to: '/citizen/dashboard', label: 'Workspace' };
}

export default function Navbar() {
  const { user, logout } = useAuth();
  const [open, setOpen] = useState(false);
  const [disaster, setDisaster] = useState(null);
  const desk = workspaceLink(user);

  useEffect(() => {
    disasterService.active()
      .then(({ data }) => setDisaster(data.disasters?.[0] || null))
      .catch(() => {});
  }, []);

  return (
    <header className="sticky top-0 z-40 bg-white">
      {disaster ? (
        <div className="bg-red-800 px-6 py-2.5 text-center text-sm text-white">
          Active disaster: {disaster.type} — Level {disaster.disasterLevel || '—'} · {disaster.municipality || disaster.location}
        </div>
      ) : null}

      <div className="border-b border-line">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-8 px-6 py-5">
          <Link to="/" className="shrink-0 no-underline">
            <span className="serif block text-[1.75rem] leading-none text-navy-900">RAHAT</span>
            <span className="mt-1.5 block text-xs text-ink-500">Local disaster response</span>
          </Link>
          <div className="hidden items-center gap-5 lg:flex">
            {!user ? (
              <>
                <Link to="/login" className="text-sm text-navy-900 no-underline">Login</Link>
                <Link to="/register" className="btn-primary min-h-11 px-5">Register</Link>
              </>
            ) : (
              <>
                {desk ? <Link to={desk.to} className="text-sm text-navy-900 no-underline">{desk.label}</Link> : null}
                <button type="button" className="btn-outline min-h-11" onClick={logout}>Sign out</button>
              </>
            )}
          </div>
          <button type="button" className="btn-outline lg:hidden" aria-expanded={open} onClick={() => setOpen((v) => !v)}>Menu</button>
        </div>
      </div>

      <nav className="hidden border-b border-line bg-navy-50 lg:block" aria-label="Public">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-x-8 gap-y-2 px-6 py-3.5">
          {publicLinks.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.to === '/'}
              className={({ isActive }) => `py-1 text-sm no-underline ${isActive ? 'font-semibold text-navy-900' : 'text-ink-700 hover:text-navy-900'}`}
            >
              {link.label}
            </NavLink>
          ))}
        </div>
      </nav>

      {open ? (
        <nav className="space-y-1 border-b border-line px-6 py-5 lg:hidden">
          {publicLinks.map((link) => (
            <NavLink key={link.to} to={link.to} onClick={() => setOpen(false)} className="block py-2.5 text-navy-900 no-underline">{link.label}</NavLink>
          ))}
          {!user ? (
            <div className="flex gap-3 pt-4">
              <Link to="/login" className="btn-outline" onClick={() => setOpen(false)}>Login</Link>
              <Link to="/register" className="btn-primary" onClick={() => setOpen(false)}>Register</Link>
            </div>
          ) : (
            <button type="button" className="btn-outline mt-3" onClick={() => { setOpen(false); logout(); }}>Sign out</button>
          )}
        </nav>
      ) : null}
    </header>
  );
}
