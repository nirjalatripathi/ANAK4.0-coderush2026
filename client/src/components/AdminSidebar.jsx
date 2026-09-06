import { NavLink, useLocation } from 'react-router-dom';

const groups = [
  {
    title: 'Overview',
    links: [
      { to: '/admin/dashboard', label: 'Dashboard', end: true, icon: 'grid' },
    ],
  },
  {
    title: 'Relief',
    links: [
      { to: '/admin/disasters', label: 'Disasters', icon: 'alert', end: true },
      { to: '/admin/disaster-records', label: 'Recorded disasters', icon: 'log' },
      { to: '/admin/camps', label: 'Camps', icon: 'camp' },
      { to: '/admin/inventory', label: 'Inventory', icon: 'box' },
      { to: '/admin/relief-needs', label: 'Relief needs', icon: 'need' },
    ],
  },
  {
    title: 'People',
    links: [
      { to: '/admin/victims', label: 'Victim applications', icon: 'people' },
      { to: '/admin/citizens', label: 'Citizens', icon: 'user' },
    ],
  },
  {
    title: 'Finance',
    links: [
      { to: '/admin/donations', label: 'Donations', icon: 'gift', end: true },
      { to: '/admin/reports?tab=transactions', label: 'Khalti payments', icon: 'khalti', match: 'transactions' },
      { to: '/admin/donations?tab=pending', label: 'Payment verification', icon: 'check', match: 'pending' },
    ],
  },
  {
    title: 'System',
    links: [
      { to: '/admin/transfers', label: 'Transfers', icon: 'move' },
      { to: '/admin/reports', label: 'Reports', icon: 'chart', end: true },
      { to: '/admin/audit-logs', label: 'Audit logs', icon: 'log' },
      { to: '/admin/settings', label: 'Settings', icon: 'gear' },
    ],
  },
];

function Icon({ name }) {
  const common = { width: 16, height: 16, fill: 'none', stroke: 'currentColor', strokeWidth: 1.8, strokeLinecap: 'round', strokeLinejoin: 'round', 'aria-hidden': true };
  if (name === 'grid') return <svg {...common} viewBox="0 0 24 24"><rect x="3" y="3" width="7" height="7" rx="1" /><rect x="14" y="3" width="7" height="7" rx="1" /><rect x="3" y="14" width="7" height="7" rx="1" /><rect x="14" y="14" width="7" height="7" rx="1" /></svg>;
  if (name === 'alert') return <svg {...common} viewBox="0 0 24 24"><path d="M12 3 3 19h18L12 3z" /><path d="M12 9v5" /><path d="M12 17h.01" /></svg>;
  if (name === 'camp') return <svg {...common} viewBox="0 0 24 24"><path d="M3 20h18" /><path d="m5 20 7-14 7 14" /><path d="M9.5 20 12 14l2.5 6" /></svg>;
  if (name === 'box') return <svg {...common} viewBox="0 0 24 24"><path d="M21 8H3v11a1 1 0 0 0 1 1h16a1 1 0 0 0 1-1V8z" /><path d="M3 8 12 3l9 5" /><path d="M12 3v17" /></svg>;
  if (name === 'need') return <svg {...common} viewBox="0 0 24 24"><path d="M12 21s-7-4.5-7-11a7 7 0 0 1 14 0c0 6.5-7 11-7 11z" /></svg>;
  if (name === 'people') return <svg {...common} viewBox="0 0 24 24"><circle cx="9" cy="8" r="3" /><path d="M3 19a6 6 0 0 1 12 0" /><circle cx="17" cy="9" r="2.5" /><path d="M16 19a5 5 0 0 1 5-4" /></svg>;
  if (name === 'user') return <svg {...common} viewBox="0 0 24 24"><circle cx="12" cy="8" r="3.5" /><path d="M5 19a7 7 0 0 1 14 0" /></svg>;
  if (name === 'gift') return <svg {...common} viewBox="0 0 24 24"><rect x="3" y="8" width="18" height="13" rx="1" /><path d="M12 8v13" /><path d="M3 12h18" /><path d="M12 8c0-3 2-5 4.5-5S21 6 12 8z" /><path d="M12 8c0-3-2-5-4.5-5S3 6 12 8z" /></svg>;
  if (name === 'khalti') return <svg {...common} viewBox="0 0 24 24"><rect x="2" y="5" width="20" height="14" rx="2" /><path d="M2 10h20" /><path d="M7 15h4" /></svg>;
  if (name === 'check') return <svg {...common} viewBox="0 0 24 24"><circle cx="12" cy="12" r="9" /><path d="m8 12 2.8 2.8L16 9.5" /></svg>;
  if (name === 'move') return <svg {...common} viewBox="0 0 24 24"><path d="M5 12h14" /><path d="m13 6 6 6-6 6" /></svg>;
  if (name === 'chart') return <svg {...common} viewBox="0 0 24 24"><path d="M4 19V5" /><path d="M4 19h16" /><path d="M8 16v-6" /><path d="M12 16V8" /><path d="M16 16v-3" /></svg>;
  if (name === 'log') return <svg {...common} viewBox="0 0 24 24"><path d="M8 6h12" /><path d="M8 12h12" /><path d="M8 18h12" /><path d="M4 6h.01" /><path d="M4 12h.01" /><path d="M4 18h.01" /></svg>;
  return <svg {...common} viewBox="0 0 24 24"><circle cx="12" cy="12" r="3" /><path d="M12 3v2" /><path d="M12 19v2" /><path d="M5 5l1.5 1.5" /><path d="M17.5 17.5 19 19" /><path d="M3 12h2" /><path d="M19 12h2" /></svg>;
}

function isLinkActive(link, pathname, search) {
  const url = new URL(link.to, 'http://local');
  const tab = new URLSearchParams(search).get('tab');
  if (link.match) return pathname === url.pathname && tab === link.match;
  if (pathname !== url.pathname && !pathname.startsWith(`${url.pathname}/`)) return false;
  if (url.pathname === '/admin/reports') return !tab;
  if (url.pathname === '/admin/donations') return tab !== 'pending';
  if (link.end) return pathname === url.pathname;
  return true;
}

export default function AdminSidebar() {
  const { pathname, search } = useLocation();

  return (
    <aside className="admin-sidebar">
      <div className="admin-sidebar__brand">
        <p className="admin-sidebar__kicker">Administrator</p>
        <p className="admin-sidebar__name">Command desk</p>
      </div>
      <nav className="admin-sidebar__nav" aria-label="Administrator">
        {groups.map((group) => (
          <div key={group.title} className="admin-sidebar__group">
            <p className="admin-sidebar__group-title">{group.title}</p>
            {group.links.map((link) => {
              const active = isLinkActive(link, pathname, search);
              return (
                <NavLink
                  key={link.to}
                  to={link.to}
                  end={Boolean(link.end)}
                  className={`admin-sidebar__link${active ? ' is-active' : ''}`}
                  aria-current={active ? 'page' : undefined}
                >
                  <Icon name={link.icon} />
                  <span>{link.label}</span>
                </NavLink>
              );
            })}
          </div>
        ))}
      </nav>
    </aside>
  );
}
