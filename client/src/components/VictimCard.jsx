import { Link } from 'react-router-dom';
import { npr } from '../services/victimService';

export default function VictimCard({ victim }) {
  const funded = victim.status === 'Fulfilled' || victim.percentRaised >= 100;
  return (
    <Link to={`/victims/${victim.id || victim._id}`} className="product-card">
      <div className="product-card-media">
        <img src={victim.photoUrl || '/rahat-motive.jpg'} alt="" />
        <span className="product-card-badge">{victim.category}</span>
      </div>
      <div className="flex flex-1 flex-col p-5">
        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-teal-700">Verified request</p>
        <h3 className="mt-2 text-xl font-semibold text-navy-900">{victim.displayName}</h3>
        <p className="mt-1 text-sm text-ink-500">{victim.municipality}, {victim.district}</p>
        <p className="mt-3 line-clamp-3 text-sm leading-6 text-ink-700">{victim.story}</p>
        <div className="mt-auto pt-5">
          <div className="progress-track">
            <div className="progress-fill" style={{ width: `${victim.percentRaised || 0}%` }} />
          </div>
          <div className="mt-3 flex items-end justify-between gap-3">
            <div>
              <p className="text-sm font-semibold text-navy-900">{npr(victim.amountRaisedNPR)} raised</p>
              <p className="text-xs text-ink-500">of {npr(victim.amountNeededNPR)}</p>
            </div>
            <span className={funded ? 'btn-outline h-10 min-h-10 px-4 text-sm' : 'btn-gold h-10 min-h-10 px-4 text-sm'}>
              {funded ? 'Funded' : 'Donate'}
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}
