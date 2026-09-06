import { useEffect, useRef, useState } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { disasterService } from '../services/disasterService';
import { useAuth } from '../hooks/useAuth';
import RahatLogo from './RahatLogo';

function workspaceLink(user) {
  if (!user) return null;
  if (user.role === 'admin') return { to: '/admin/dashboard', label: 'Admin Workspace' };
  if (user.role === 'local_authority' || user.role === 'local_admin') return { to: '/authority/dashboard', label: 'Authority Workspace' };
  if (user.role === 'camp_official') return { to: '/camp/dashboard', label: 'Camp Workspace' };
  if (user.role === 'donor') return { to: '/donor/dashboard', label: 'Donor Workspace' };
  return { to: '/citizen/dashboard', label: 'My Dashboard' };
}

function ChevronDown() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4 shrink-0" aria-hidden="true">
      <path fillRule="evenodd" d="M5.22 8.22a.75.75 0 0 1 1.06 0L10 11.94l3.72-3.72a.75.75 0 1 1 1.06 1.06l-4.25 4.25a.75.75 0 0 1-1.06 0L5.22 9.28a.75.75 0 0 1 0-1.06Z" clipRule="evenodd" />
    </svg>
  );
}

function MenuIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="h-5 w-5" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="h-5 w-5" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
    </svg>
  );
}

function DropdownMenu({ label, items, isMobile = false }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    if (!open) return;
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  if (isMobile) {
    return (
      <div>
        <button
          type="button"
          className="block w-full py-2.5 text-left text-navy-900 font-semibold text-sm"
          onClick={() => setOpen((v) => !v)}
        >
          {label}
        </button>
        {open && (
          <div className="pl-4 border-l-2 border-teal-700 space-y-1 mb-2">
            {items.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className="block py-1.5 text-sm text-ink-700 no-underline hover:text-teal-700"
              >
                {item.label}
              </NavLink>
            ))}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        className="flex items-center gap-1 py-1 text-sm text-ink-700 hover:text-navy-900 transition-colors"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-haspopup="true"
      >
        {label}
        <ChevronDown />
      </button>
      {open && (
        <div className="nav-dropdown" role="menu">
          {items.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              role="menuitem"
              onClick={() => setOpen(false)}
              className={({ isActive }) =>
                `flex items-center gap-2 w-full px-3 py-2.5 rounded-lg text-sm no-underline transition-colors
                ${isActive ? 'bg-navy-50 font-semibold text-navy-900' : 'text-ink-700 hover:bg-navy-50 hover:text-navy-900'}`
              }
            >
              {item.icon && <span className="text-teal-700">{item.icon}</span>}
              {item.label}
            </NavLink>
          ))}
        </div>
      )}
    </div>
  );
}

const disasterItems = [
  { to: '/disasters',  label: 'Disaster Information', icon: <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4"><path fillRule="evenodd" d="M8.485 2.495c.673-1.167 2.357-1.167 3.03 0l6.28 10.875c.673 1.167-.17 2.625-1.516 2.625H3.72c-1.347 0-2.189-1.458-1.515-2.625L8.485 2.495ZM10 5a.75.75 0 0 1 .75.75v3.5a.75.75 0 0 1-1.5 0v-3.5A.75.75 0 0 1 10 5Zm0 9a1 1 0 1 0 0-2 1 1 0 0 0 0 2Z" clipRule="evenodd" /></svg> },
  { to: '/safe-zones', label: 'Safe Zones',           icon: <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4"><path fillRule="evenodd" d="M9.661 2.237a.531.531 0 0 1 .678 0 11.947 11.947 0 0 0 7.078 2.749.5.5 0 0 1 .479.425c.069.52.104 1.05.104 1.589 0 5.162-3.26 9.563-7.834 11.256a.48.48 0 0 1-.332 0C5.26 16.563 2 12.162 2 7a11.067 11.067 0 0 1 .104-1.589.5.5 0 0 1 .48-.425 11.947 11.947 0 0 0 7.077-2.749Zm4.196 5.954a.75.75 0 0 0-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 1 0-1.06 1.061l2.5 2.5a.75.75 0 0 0 1.137-.089l4-5.5Z" clipRule="evenodd" /></svg> },
];

const reliefItems = [
  { to: '/camps',        label: 'Relief Camps',   icon: <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4"><path d="M10.75 10.818v2.614A3.13 3.13 0 0 0 11.888 13c.482-.315.612-.648.612-.875 0-.227-.13-.56-.612-.875a3.13 3.13 0 0 0-1.138-.432ZM8.33 8.62c.053.055.115.11.18.155A3.13 3.13 0 0 0 9.75 9.214V6.972a3.13 3.13 0 0 0-1.138.432c-.482.315-.612.648-.612.875 0 .227.13.56.612.875.054.039.109.074.168.108l.55-.642Z"/><path fillRule="evenodd" d="M10 2a8 8 0 1 0 0 16A8 8 0 0 0 10 2ZM9.75 4.38V6.25H8.56a1.5 1.5 0 0 0 0 3h1.19v2.638a3.13 3.13 0 0 1-1.138-.432C8.13 11.14 7.75 10.5 7.75 10.25c0-.25.38-.89.862-1.206a.75.75 0 1 0-.862-1.228c-.865.578-1.5 1.524-1.5 2.434 0 .91.635 1.856 1.5 2.434a4.63 4.63 0 0 0 2 .754V15.62a.75.75 0 0 0 1.5 0v-2.153a4.63 4.63 0 0 0 2-.754c.865-.578 1.5-1.524 1.5-2.434 0-.91-.635-1.856-1.5-2.434a4.63 4.63 0 0 0-2-.754V6.25h1.194a1.5 1.5 0 0 0 0-3H11.25V4.38a.75.75 0 0 0-1.5 0Z" clipRule="evenodd" /></svg> },
  { to: '/relief-needs', label: 'Relief Needs',   icon: <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4"><path d="M2 3a1 1 0 0 0-1 1v1a1 1 0 0 0 1 1h16a1 1 0 0 0 1-1V4a1 1 0 0 0-1-1H2Z"/><path fillRule="evenodd" d="M2 7.5h16l-.811 7.71a2 2 0 0 1-1.99 1.79H4.802a2 2 0 0 1-1.99-1.79L2 7.5Zm5.22 1.72a.75.75 0 0 1 1.06 0L10 10.94l1.72-1.72a.75.75 0 1 1 1.06 1.06L11.06 12l1.72 1.72a.75.75 0 1 1-1.06 1.06L10 13.06l-1.72 1.72a.75.75 0 0 1-1.06-1.06L8.94 12 7.22 10.28a.75.75 0 0 1 0-1.06Z" clipRule="evenodd" /></svg> },
  { to: '/donations',    label: 'Donations',      icon: <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4"><path d="M1 8.25a1.25 1.25 0 1 1 2.5 0v7.5a1.25 1.25 0 1 1-2.5 0v-7.5ZM11 3V1.7c0-.268.14-.526.395-.607A2 2 0 0 1 14 3c0 .995-.182 1.948-.514 2.826-.204.54.166 1.174.744 1.174h2.52c1.243 0 2.261 1.01 2.146 2.247a23.864 23.864 0 0 1-1.341 5.974C17.153 16.323 16.072 17 14.9 17H8.9c-1.358 0-2.115-1.55-2.115-1.55L4.28 12.5A1 1 0 0 1 4.5 11H6c.53 0 .886.32 1.179.64L8.5 13.5V3.5C8.5 2.67 9.17 2 10 2c.55 0 .99.45 1 1Z"/></svg> },
];

export default function Navbar() {
  const { user, logout } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [disaster, setDisaster] = useState(null);
  const desk = workspaceLink(user);

  useEffect(() => {
    disasterService.active()
      .then(({ data }) => setDisaster(data.disasters?.[0] || null))
      .catch(() => {});
  }, []);

  return (
    <header className="sticky top-0 z-40 bg-white shadow-sm">
      {/* Active disaster alert banner */}
      {disaster && (
        <div className="alert-banner px-4 py-2 text-center text-sm text-white font-medium">
          <span className="mr-2">⚠</span>
          Active disaster: <strong>{disaster.type}</strong> — Level {disaster.disasterLevel || '—'} ·{' '}
          {disaster.municipality || disaster.location}
          <Link to="/disasters" className="ml-3 underline text-white/90 hover:text-white text-xs">
            View details →
          </Link>
        </div>
      )}

      {/* Main navbar */}
      <div className="border-b border-line">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3 lg:px-6">
          {/* Brand */}
          <Link to="/" className="flex items-center gap-2.5 no-underline shrink-0" aria-label="RAHAT Home">
            <RahatLogo size={38} />
            <div>
              <span className="serif block text-xl leading-none text-navy-900 tracking-wide">RAHAT</span>
              <span className="block text-[10px] text-ink-500 leading-tight mt-0.5 tracking-wide uppercase">Disaster Relief</span>
            </div>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden lg:flex items-center gap-6" aria-label="Primary navigation">
            <NavLink
              to="/"
              end
              className={({ isActive }) => `text-sm no-underline transition-colors ${isActive ? 'font-semibold text-navy-900' : 'text-ink-700 hover:text-navy-900'}`}
            >
              Home
            </NavLink>
            <NavLink
              to="/about"
              className={({ isActive }) => `text-sm no-underline transition-colors ${isActive ? 'font-semibold text-navy-900' : 'text-ink-700 hover:text-navy-900'}`}
            >
              About
            </NavLink>
            <DropdownMenu label="Disaster" items={disasterItems} />
            <DropdownMenu label="Relief" items={reliefItems} />
            <NavLink
              to="/contact"
              className={({ isActive }) => `text-sm no-underline transition-colors ${isActive ? 'font-semibold text-navy-900' : 'text-ink-700 hover:text-navy-900'}`}
            >
              Contact
            </NavLink>
          </nav>

          {/* Desktop auth actions */}
          <div className="hidden lg:flex items-center gap-3">
            {!user ? (
              <>
                <Link to="/login" className="text-sm font-medium text-navy-900 no-underline hover:text-teal-700 transition-colors px-2 py-1">
                  Sign In
                </Link>
                <Link to="/register" className="btn-primary btn-hero text-sm px-5">
                  Create Account
                </Link>
              </>
            ) : (
              <>
                {desk && (
                  <Link to={desk.to} className="text-sm font-medium text-navy-900 no-underline hover:text-teal-700 transition-colors px-2 py-1">
                    {desk.label}
                  </Link>
                )}
                <button type="button" className="btn-outline text-sm" onClick={logout}>
                  Sign Out
                </button>
              </>
            )}
          </div>

          {/* Mobile hamburger */}
          <button
            type="button"
            className="btn-outline lg:hidden min-h-10 px-3"
            aria-expanded={mobileOpen}
            aria-controls="mobile-menu"
            aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
            onClick={() => setMobileOpen((v) => !v)}
          >
            {mobileOpen ? <CloseIcon /> : <MenuIcon />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <nav
          id="mobile-menu"
          className="lg:hidden border-b border-line bg-white px-4 py-4 space-y-1"
          aria-label="Mobile navigation"
        >
          <NavLink to="/" end onClick={() => setMobileOpen(false)} className="block py-2.5 text-sm text-navy-900 no-underline font-medium">Home</NavLink>
          <NavLink to="/about" onClick={() => setMobileOpen(false)} className="block py-2.5 text-sm text-navy-900 no-underline font-medium">About</NavLink>
          <DropdownMenu label="Disaster" items={disasterItems} isMobile />
          <DropdownMenu label="Relief" items={reliefItems} isMobile />
          <NavLink to="/contact" onClick={() => setMobileOpen(false)} className="block py-2.5 text-sm text-navy-900 no-underline font-medium">Contact</NavLink>

          <div className="border-t border-line pt-4 mt-3 flex flex-col gap-2">
            {!user ? (
              <>
                <Link to="/login" onClick={() => setMobileOpen(false)} className="btn-outline text-sm w-full justify-center">Sign In</Link>
                <Link to="/register" onClick={() => setMobileOpen(false)} className="btn-primary text-sm w-full justify-center">Create Account</Link>
              </>
            ) : (
              <>
                {desk && <Link to={desk.to} onClick={() => setMobileOpen(false)} className="btn-outline text-sm w-full justify-center">{desk.label}</Link>}
                <button type="button" className="btn-danger text-sm" onClick={() => { setMobileOpen(false); logout(); }}>Sign Out</button>
              </>
            )}
          </div>
        </nav>
      )}
    </header>
  );
}
