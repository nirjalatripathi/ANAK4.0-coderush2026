import StatusBadge from './StatusBadge';

export default function ReliefNeedCard({ need, onSelect }) {
  const shortage = need.projectedShortage || need.shortage || 0;
  return (
    <article className="card-gov p-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-ink-500">{need.itemName}</p>
          <h3 className="serif mt-1 text-xl text-navy-900">{need.camp?.name || 'Relief camp'}</h3>
        </div>
        <StatusBadge status={need.priority} />
      </div>
      <p className="mt-3 font-mono text-2xl font-semibold text-red-800">{shortage.toLocaleString()} {need.unit || ''} shortage</p>
      <p className="mt-1 text-sm text-ink-500">
        {need.daysOfSupply ? `${need.daysOfSupply} days of supply` : 'Days of supply not calculated'}
        {need.available != null ? ` · current ${need.available}` : ''}
      </p>
      {need.priorityReason ? <p className="mt-3 rounded-xl bg-amber-50 p-3 text-sm text-amber-950">{need.priorityReason}</p> : null}
      {onSelect ? <button type="button" className="btn-gold mt-4 w-full" onClick={() => onSelect(need)}>Support this need</button> : null}
    </article>
  );
}
