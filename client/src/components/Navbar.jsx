import { Link, NavLink } from 'react-router-dom';
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

const links = [
  { to: '/', label: 'Home', end: true },
  { to: '/about', label: 'About Us' },
  { to: '/disasters', label: 'Disasters' },
  { to: '/victims', label: 'People' },
  { to: '/donate', label: 'Donate' },
  { to: '/apply-support', label: 'Ask for Support' },
  { to: '/how-it-works', label: 'How It Works' },
  { to: '/impact', label: 'Impact' },
];

const linkClass = ({ isActive }) =>
  `shrink-0 whitespace-nowrap px-2 py-2 text-[15px] font-medium no-underline sm:text-base ${
    isActive ? 'font-semibold text-navy-900' : 'text-ink-700 hover:text-navy-900'
  }`;

export default function Navbar() {
  const { user, logout } = useAuth();
  const desk = workspaceLink(user);

  return (
    <header className="sticky top-0 z-40 bg-white">
      <div className="border-b border-line bg-cream">
        <div className="mx-auto flex max-w-7xl flex-col gap-3 px-4 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8">
          <Link to="/" className="flex items-center gap-4 no-underline" aria-label="RAHAT Home">
            <RahatLogo size={80} />
            <div>
              <span className="block text-2xl font-semibold leading-none text-navy-900 sm:text-3xl">RAHAT</span>
              <span className="mt-1.5 block text-xs uppercase tracking-[0.16em] text-ink-500 sm:text-sm">Disaster Relief</span>
            </div>
          </Link>

          <div className="flex flex-wrap items-center gap-2 sm:justify-end">
            {!user ? (
              <>
                <Link to="/donate" className="btn-gold h-10 min-h-10 flex-1 px-3 text-sm sm:flex-none sm:px-5">Donate Now</Link>
                <Link to="/login" className="btn-outline h-10 min-h-10 flex-1 px-3 text-sm sm:flex-none sm:px-5">Sign In</Link>
              </>
            ) : (
              <>
                <Link to="/donate" className="btn-gold h-10 min-h-10 px-3 text-sm sm:px-5">Donate Now</Link>
                {desk ? (
                  <Link to={desk.to} className="px-2 py-2 text-sm font-medium text-navy-900 no-underline hover:text-teal-700 sm:text-[15px]">
                    {desk.label}
                  </Link>
                ) : null}
                <button type="button" className="btn-outline h-10 min-h-10 px-3 text-sm sm:px-5" onClick={logout}>Sign Out</button>
              </>
            )}
          </div>
        </div>
      </div>

      <div className="border-b border-line">
        <nav className="mx-auto flex max-w-7xl gap-1 overflow-x-auto px-3 py-2 sm:flex-wrap sm:justify-center sm:gap-x-5 sm:px-6 sm:py-3 lg:justify-start lg:px-8" aria-label="Primary navigation">
          {links.map((item) => (
            <NavLink key={item.to} to={item.to} end={item.end} className={linkClass}>
              {item.label}
            </NavLink>
          ))}
        </nav>
      </div>
    </header>
  );
}
