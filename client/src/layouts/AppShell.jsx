import { Link, Outlet } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import { useAuth } from '../hooks/useAuth';

export default function AppShell({ title, links, homeTo = '/' }) {
  const { user, logout } = useAuth();
  return (
    <div className="min-h-screen bg-navy-50">
      <header className="flex items-center justify-between border-b border-navy-800 bg-navy-900 px-6 py-4 text-white">
        <div className="flex items-center gap-4">
          <Link to={homeTo} className="serif text-xl text-white no-underline">RAHAT</Link>
          <span className="hidden text-xs uppercase tracking-[0.16em] text-gold-500 sm:inline">{title}</span>
        </div>
        <div className="flex items-center gap-5 text-sm">
          <span className="hidden sm:inline">{user?.fullName}</span>
          <Link to="/" className="text-gold-500 no-underline">Public site</Link>
          <button type="button" className="rounded border border-white/30 px-4 py-2" onClick={logout}>Sign out</button>
        </div>
      </header>
      <div className="mx-auto flex min-h-[calc(100vh-65px)] max-w-[1320px] flex-col md:flex-row">
        <Sidebar title={title} links={links} />
        <div className="flex-1 px-6 py-8 md:px-10 md:py-10">
          <Outlet />
        </div>
      </div>
    </div>
  );
}
