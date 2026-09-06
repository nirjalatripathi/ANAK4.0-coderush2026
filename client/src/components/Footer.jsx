import { Link } from 'react-router-dom';
import RahatLogo from './RahatLogo';

const quickLinks = [
  { to: '/', label: 'Home' },
  { to: '/about', label: 'About Us' },
  { to: '/victims', label: 'People' },
  { to: '/donate', label: 'Donate' },
  { to: '/apply-support', label: 'Ask for Support' },
  { to: '/how-it-works', label: 'How It Works' },
  { to: '/impact', label: 'Impact' },
];

const resources = [
  { to: '/relief-needs', label: 'Relief Needs' },
  { to: '/camps', label: 'Relief Camps' },
  { to: '/donations', label: 'Donations' },
  { to: '/transparency', label: 'Relief Transparency' },
  { to: '/disasters', label: 'Disasters' },
];

const support = [
  { to: '/about', label: 'About RAHAT' },
  { to: '/privacy', label: 'Privacy Policy' },
  { to: '/terms', label: 'Terms of Use' },
];

function FooterSection({ title, links }) {
  return (
    <div>
      <p className="mb-4 text-xs font-semibold uppercase tracking-[0.16em] text-white/80">{title}</p>
      <ul className="space-y-3">
        {links.map((link) => (
          <li key={`${title}-${link.to}`}>
            <Link
              to={link.to}
              className="inline-block text-base text-white underline-offset-4 hover:text-gold-400 hover:underline"
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
    <footer className="mt-auto bg-navy-900 text-white">
      <div className="mx-auto grid max-w-7xl gap-12 px-6 py-16 md:grid-cols-4 lg:gap-16">
        <div>
          <Link to="/" className="mb-4 flex items-center gap-2.5 no-underline" aria-label="RAHAT Home">
            <RahatLogo size={44} />
            <span className="text-xl font-semibold tracking-wide text-white">RAHAT</span>
          </Link>
          <p className="max-w-xs text-base leading-7 text-white/80">
            A disaster-relief donation platform that connects contributions to verified needs and shows donors what happened afterward.
          </p>
          <div className="mt-5 rounded-lg border border-white/15 bg-white/10 p-4">
            <p className="mb-1.5 text-xs font-semibold uppercase tracking-widest text-gold-400">Emergency Numbers</p>
            <p className="text-base text-white">Police <strong>100</strong></p>
            <p className="text-base text-white">Ambulance <strong>102</strong></p>
          </div>
        </div>

        <FooterSection title="Quick Links" links={quickLinks} />
        <FooterSection title="Resources" links={resources} />
        <div>
          <FooterSection title="Support" links={support} />
        </div>
      </div>

      <div className="bg-[#E8EDF3] text-navy-900">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4 px-6 py-5">
          <p className="text-sm font-medium text-navy-900">
            © 2026 RAHAT — Local Disaster Relief Coordination Platform
          </p>
          <p className="text-sm text-ink-700">
            Coordinating relief where it is needed most.
          </p>
        </div>
      </div>
    </footer>
  );
}
