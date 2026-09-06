import { Link } from 'react-router-dom';
import { occupancy } from '../utils/helpers';
import StatusBadge from './StatusBadge';

export default function CampCard({ camp }) {
  const percent = occupancy(camp);
  return (
    <article className="card-gov flex h-full flex-col p-5">
      <p className="font-mono text-xs text-ink-500">{camp.campId}</p>
      <h3 className="serif mt-1 text-xl text-navy-900">{camp.name}</h3>
      <p className="mt-2 text-sm text-ink-700">{camp.location}</p>
      <p className="text-sm text-ink-500">{[camp.municipality, camp.district].filter(Boolean).join(', ')}</p>
      <div className="mt-4">
        <div className="mb-1 flex justify-between text-sm">
          <span>{camp.currentPopulation || 0} / {camp.capacity || 0} people</span>
          <span>Occupancy: {percent}%</span>
        </div>
        <div className="h-2 bg-navy-100">
          <div className={`h-2 ${percent >= 90 ? 'bg-red-700' : percent >= 70 ? 'bg-amber-600' : 'bg-navy-700'}`} style={{ width: `${Math.min(percent, 100)}%` }} />
        </div>
      </div>
      <div className="mt-4 flex flex-wrap gap-2 text-xs">
        <StatusBadge status={camp.foodStatus ? `Food: ${camp.foodStatus}` : null} />
        <span className="border border-line px-2 py-0.5">Water: {camp.waterStatus}</span>
        <span className="border border-line px-2 py-0.5">Medical: {camp.medicalStatus}</span>
      </div>
      <Link to={`/camps/${camp._id}`} className="btn-outline mt-5">View camp details</Link>
    </article>
  );
}
