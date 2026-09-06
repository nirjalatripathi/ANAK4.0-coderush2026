import { NavLink } from 'react-router-dom';

export default function Sidebar({ title, links }) {
  return (
    <aside className="border-b border-line bg-white md:min-h-full md:w-64 md:border-b-0 md:border-r">
      <div className="hidden border-b border-line px-6 py-5 md:block">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-gold-600">{title}</p>
      </div>
      <nav className="flex flex-wrap gap-1 p-3 md:flex-col md:p-3" aria-label={title}>
        {links.map((link) => (
          <NavLink
            key={link.to}
            to={link.to}
            className={({ isActive }) => `desk-nav-link${isActive ? ' is-active' : ''}`}
          >
            {link.label}
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}
