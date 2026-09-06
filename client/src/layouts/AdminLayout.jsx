import AppShell from './AppShell';

const links = [
  { to: '/admin/dashboard', label: 'Dashboard' },
  { to: '/admin/disasters', label: 'Disasters' },
  { to: '/admin/safe-zones', label: 'Safe zones' },
  { to: '/admin/camps', label: 'Camps' },
  { to: '/admin/inventory', label: 'Inventory' },
  { to: '/admin/relief-needs', label: 'Relief needs' },
  { to: '/admin/donations', label: 'Donations' },
  { to: '/admin/transfers', label: 'Transfers' },
  { to: '/admin/citizens', label: 'Citizens' },
  { to: '/admin/reports', label: 'Reports' },
  { to: '/admin/audit-logs', label: 'Audit logs' },
  { to: '/admin/settings', label: 'Settings' },
];

export default function AdminLayout() {
  return <AppShell title="Administrator" links={links} homeTo="/admin/dashboard" />;
}
