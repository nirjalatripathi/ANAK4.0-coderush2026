import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="mt-auto border-t border-line bg-white">
      <div className="mx-auto grid max-w-6xl gap-10 px-6 py-14 md:grid-cols-3">
        <div>
          <p className="serif text-2xl text-navy-900">RAHAT</p>
          <p className="mt-3 max-w-sm text-sm leading-7 text-ink-700">
            From disaster declaration to verified relief delivery, RAHAT helps local communities coordinate safe zones, camps, needs, and donations.
          </p>
        </div>
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-ink-500">Pages</p>
          <ul className="mt-4 space-y-2 text-sm text-ink-700">
            <li><Link to="/disasters">Disaster information</Link></li>
            <li><Link to="/safe-zones">Safe zones</Link></li>
            <li><Link to="/camps">Relief camps</Link></li>
            <li><Link to="/relief-needs">Relief needs</Link></li>
            <li><Link to="/donations">Donations</Link></li>
            <li><Link to="/transparency">Transparency</Link></li>
            <li><Link to="/contact">Contact</Link></li>
          </ul>
        </div>
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-ink-500">Also</p>
          <ul className="mt-4 space-y-2 text-sm text-ink-700">
            <li><Link to="/about">About</Link></li>
            <li><Link to="/privacy">Privacy</Link></li>
            <li><Link to="/terms">Terms</Link></li>
          </ul>
        </div>
      </div>
      <div className="border-t border-line py-4 text-center text-xs text-ink-500">
        © 2026 RAHAT — Local Disaster Response & Smart Relief Coordination
      </div>
    </footer>
  );
}
