import { Link } from 'react-router-dom';
import RahatLogo from './RahatLogo';

const quickLinks = [
  { to: '/',             label: 'Home' },
  { to: '/about',        label: 'About Us' },
  { to: '/disasters',    label: 'Disaster Information' },
  { to: '/safe-zones',   label: 'Safe Zones' },
  { to: '/camps',        label: 'Relief Camps' },
  { to: '/relief-needs', label: 'Relief Needs' },
  { to: '/donations',    label: 'Donations' },
  { to: '/contact',      label: 'Contact' },
];

const resources = [
  { to: '/disasters',    label: 'Disaster Information' },
  { to: '/safe-zones',   label: 'Safe Zones' },
  { to: '/camps',        label: 'Relief Camps' },
  { to: '/relief-needs', label: 'Relief Needs' },
  { to: '/donations',    label: 'Donation Coordination' },
  { to: '/transparency', label: 'Relief Transparency' },
];

const support = [
  { to: '/contact', label: 'Contact Us' },
  { to: '/about',   label: 'About RAHAT' },
  { to: '/privacy', label: 'Privacy Policy' },
  { to: '/terms',   label: 'Terms of Use' },
];

function FooterSection({ title, links }) {
  return (
    <div>
      <p className="eyebrow text-ink-500 mb-4">{title}</p>
      <ul className="space-y-2.5">
        {links.map((link) => (
          <li key={link.to}>
            <Link
              to={link.to}
              className="text-sm text-ink-700 no-underline hover:text-teal-700 transition-colors leading-snug"
            >
              {link.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default function Footer() {
  return (
    <footer className="mt-auto border-t border-line bg-navy-950 text-white">
      {/* Main footer grid */}
      <div className="mx-auto grid max-w-7xl gap-12 px-6 py-16 md:grid-cols-4 lg:gap-16">
        {/* Brand column */}
        <div className="md:col-span-1">
          <Link to="/" className="flex items-center gap-2.5 no-underline mb-4" aria-label="RAHAT Home">
            <RahatLogo size={36} light />
            <span className="serif text-xl text-white tracking-wide">RAHAT</span>
          </Link>
          <p className="text-sm leading-7 text-white/65 max-w-xs">
            A local disaster relief coordination platform helping communities move from disaster response to verified, targeted relief delivery.
          </p>
          {/* Emergency callout */}
          <div className="mt-5 rounded-lg border border-white/10 bg-white/5 p-4">
            <p className="text-xs font-semibold uppercase tracking-widest text-gold-400 mb-1.5">Emergency Numbers</p>
            <p className="text-sm text-white/80">Police <strong className="text-white">100</strong></p>
            <p className="text-sm text-white/80">Ambulance <strong className="text-white">102</strong></p>
            <p className="text-sm text-white/80">Help Desk <strong className="text-white">1149</strong></p>
          </div>
        </div>

        {/* Quick Links */}
        <div className="text-white/70 hover:[&_a]:text-white">
          <FooterSection title="Quick Links" links={quickLinks} />
        </div>

        {/* Resources */}
        <div className="text-white/70 hover:[&_a]:text-white">
          <FooterSection title="Resources" links={resources} />
        </div>

        {/* Support */}
        <div className="text-white/70 hover:[&_a]:text-white">
          <FooterSection title="Support" links={support} />
          <div className="mt-8">
            <p className="eyebrow text-ink-500 mb-3">Help Desk</p>
            <a href="mailto:helpdesk@rahat.gov.np" className="text-sm text-white/65 hover:text-teal-400 transition-colors no-underline block">
              helpdesk@rahat.gov.np
            </a>
            <a href="mailto:relief@rahat.gov.np" className="text-sm text-white/65 hover:text-teal-400 transition-colors no-underline block mt-1">
              relief@rahat.gov.np
            </a>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-white/10">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4 px-6 py-5">
          <p className="text-xs text-white/40">
            © 2026 RAHAT — Local Disaster Relief Coordination Platform
          </p>
          <p className="text-xs text-white/30 italic">
            Coordinating relief where it is needed most.
          </p>
        </div>
      </div>
    </footer>
  );
}
