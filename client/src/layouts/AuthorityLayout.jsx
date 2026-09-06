import AppShell from './AppShell';

const links = [
  { to: '/authority/dashboard', label: 'Dashboard' },
  { to: '/authority/disasters', label: 'Disasters' },
  { to: '/authority/safe-zones', label: 'Safe zones' },
  { to: '/authority/camps', label: 'Camps' },
  { to: '/authority/population', label: 'Population' },
  { to: '/authority/relief-needs', label: 'Relief needs' },
  { to: '/authority/transfers', label: 'Resource transfers' },
];

export default function AuthorityLayout() {
  return <AppShell title="Local authority" links={links} homeTo="/authority/dashboard" />;
}
