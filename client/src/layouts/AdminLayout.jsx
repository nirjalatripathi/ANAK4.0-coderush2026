import { Link, Outlet } from 'react-router-dom';
import AdminSidebar from '../components/AdminSidebar';
import RahatLogo from '../components/RahatLogo';
import { useAuth } from '../hooks/useAuth';

export default function AdminLayout() {
  const { user, logout } = useAuth();

  return (
    <div className="admin-desk">
      <header className="admin-topbar">
        <div className="flex items-center gap-4">
          <Link to="/admin/dashboard" className="flex items-center gap-2.5 text-xl text-white no-underline">
            <RahatLogo size={32} light />
            <span className="serif">RAHAT</span>
          </Link>
          <span className="hidden text-xs uppercase tracking-[0.18em] text-gold-400 sm:inline">Administrator</span>
        </div>
        <div className="flex items-center gap-4 text-sm">
          <span className="hidden text-white/80 sm:inline">{user?.fullName}</span>
          <Link to="/" className="text-gold-400 no-underline">Public site</Link>
          <button type="button" className="rounded-lg border border-white/25 px-4 py-2 text-white" onClick={logout}>Sign out</button>
        </div>
      </header>
      <div className="admin-desk__body">
        <AdminSidebar />
        <main className="admin-main">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
