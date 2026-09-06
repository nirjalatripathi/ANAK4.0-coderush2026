import AppShell from './AppShell';

const links = [
  { to: '/citizen/dashboard', label: 'Dashboard' },
  { to: '/citizen/profile', label: 'Profile' },
  { to: '/citizen/safe-zones', label: 'Safe zones' },
  { to: '/citizen/disaster-status', label: 'Disaster status' },
  { to: '/citizen/camp-status', label: 'Camp status' },
];

export default function CitizenLayout() {
  return <AppShell title="Citizen" links={links} homeTo="/citizen/dashboard" />;
}
