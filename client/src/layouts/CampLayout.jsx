import AppShell from './AppShell';

const links = [
  { to: '/camp/dashboard', label: 'Dashboard' },
  { to: '/camp/check-in', label: 'Check-in' },
  { to: '/camp/people', label: 'People' },
  { to: '/camp/inventory', label: 'Inventory' },
  { to: '/camp/needs', label: 'Needs' },
  { to: '/camp/deliveries', label: 'Deliveries' },
  { to: '/camp/transfers', label: 'Transfers' },
];

export default function CampLayout() {
  return <AppShell title="Camp official" links={links} homeTo="/camp/dashboard" />;
}
