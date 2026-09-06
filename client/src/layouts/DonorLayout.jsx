import AppShell from './AppShell';

const links = [
  { to: '/donor/dashboard', label: 'Dashboard' },
  { to: '/donate', label: 'Donate' },
  { to: '/donor/needs', label: 'Relief needs' },
  { to: '/donor/donations', label: 'My donations' },
  { to: '/donor/impact', label: 'My impact' },
  { to: '/donor/notifications', label: 'Notifications' },
  { to: '/donor/profile', label: 'Profile' },
];

export default function DonorLayout() {
  return <AppShell title="Donor desk" links={links} homeTo="/donor/dashboard" />;
}
