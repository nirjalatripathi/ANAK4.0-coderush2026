import { Link } from 'react-router-dom';
import StatusBadge from './StatusBadge';

export default function SafeZoneCard({ zone, to }) {
  const available = Math.max(0, (zone.capacity || 0) - (zone.currentOccupancy || 0));
  const percent = zone.occupancyPercent ?? (zone.capacity ? Math.round((zone.currentOccupancy / zone.capacity) * 1000) / 10 : 0);
  const bar = percent >= 100 ? 'bg-red-600' : percent >= 80 ? 'bg-amber-500' : 'bg-teal-600';
  return (
    <article className="card-gov p-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="font-mono text-xs text-teal-700">{zone.safeZoneId}</p>
          <h3 className="serif mt-1 text-xl text-navy-900">{zone.name}</h3>
          <p className="text-sm text-ink-500">Ward {zone.ward || '—'} · {zone.location}</p>
        </div>
        <StatusBadge status={zone.status} />
      </div>
      <div className="mt-4 grid grid-cols-3 gap-2 text-center">
        <div className="rounded-xl bg-navy-50 p-3">
          <p className="text-xs text-ink-500">Capacity</p>
          <p className="font-mono text-lg font-semibold">{zone.capacity || 0}</p>
        </div>
        <div className="rounded-xl bg-teal-50 p-3">
          <p className="text-xs text-ink-500">Current</p>
          <p className="font-mono text-lg font-semibold">{zone.currentOccupancy || 0}</p>
        </div>
        <div className="rounded-xl bg-emerald-50 p-3">
          <p className="text-xs text-ink-500">Available</p>
          <p className="font-mono text-lg font-semibold text-teal-700">{available}</p>
        </div>
      </div>
      <div className="occupancy-bar mt-3"><span className={bar} style={{ width: `${Math.min(100, percent)}%` }} /></div>
      <p className="mt-2 text-xs text-ink-500">{percent}% occupied{zone.distanceKm != null ? ` · ${zone.distanceKm} km` : ''}</p>
      {to ? <Link to={to} className="btn-safe mt-4 w-full">View details</Link> : null}
    </article>
  );
}
