import AppShell from './AppShell';

const links = [
  { to: '/donor/dashboard', label: 'Dashboard' },
  { to: '/donor/needs', label: 'Verified needs' },
  { to: '/donor/donations', label: 'My donations' },
];

export default function DonorLayout() {
  return <AppShell title="Donor desk" links={links} homeTo="/donor/dashboard" />;
}
