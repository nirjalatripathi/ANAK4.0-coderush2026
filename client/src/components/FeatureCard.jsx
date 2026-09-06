/**
 * FeatureCard — reusable feature highlight card.
 *
 * Props:
 *   icon     — SVG/JSX icon element
 *   title    — card heading
 *   body     — description text
 *   accent   — colour class for icon bg: 'navy'|'teal'|'gold'|'red' (default 'teal')
 *   onClick  — optional click handler
 *   href     — optional link target (renders an <a> wrapper if provided)
 */
import { Link } from 'react-router-dom';

const accentMap = {
  navy: { bg: 'bg-navy-100', color: 'text-navy-800' },
  teal: { bg: 'bg-teal-50',  color: 'text-teal-700' },
  gold: { bg: 'bg-gold-100', color: 'text-gold-600' },
  red:  { bg: 'bg-red-50',   color: 'text-red-700'  },
};

export default function FeatureCard({ icon, title, body, accent = 'teal', to, children }) {
  const { bg, color } = accentMap[accent] || accentMap.teal;

  const inner = (
    <>
      <div className={`${bg} ${color} flex h-12 w-12 items-center justify-center rounded-xl`}>
        {icon}
      </div>
      <h3 className="serif text-xl text-navy-900">{title}</h3>
      {body && <p className="text-ink-700 leading-7">{body}</p>}
      {children}
    </>
  );

  if (to) {
    return (
      <Link to={to} className="feature-card no-underline block">
        {inner}
      </Link>
    );
  }

  return <div className="feature-card">{inner}</div>;
}
