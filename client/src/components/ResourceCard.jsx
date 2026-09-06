import { shortage } from '../utils/helpers';
import StatusBadge from './StatusBadge';

export default function ResourceCard({ item }) {
  const gap = item.shortage ?? shortage(item);
  return (
    <article className="card-gov p-4">
      <div className="flex items-start justify-between gap-3">
        <h3 className="font-semibold text-navy-900">{item.itemName}</h3>
        <StatusBadge status={item.priority} />
      </div>
      <dl className="mt-3 grid grid-cols-2 gap-2 text-sm">
        <div><dt className="text-ink-500">Current</dt><dd className="font-mono">{item.current ?? item.available ?? 0}</dd></div>
        <div><dt className="text-ink-500">Required</dt><dd className="font-mono">{item.required ?? 0}</dd></div>
        <div><dt className="text-ink-500">Shortage</dt><dd className="font-mono">{gap}</dd></div>
        <div><dt className="text-ink-500">Incoming</dt><dd className="font-mono">{item.incoming ?? 0}</dd></div>
      </dl>
    </article>
  );
}
