import { formatDateTime } from '../utils/helpers';
import StatusBadge from './StatusBadge';

export default function MissingPersonCard({ record }) {
  return (
    <article className="card-gov p-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="serif text-xl text-navy-900">{record.displayName}</h3>
          <p className="text-sm text-ink-500">Approved public record</p>
        </div>
        <StatusBadge status={record.status} />
      </div>
      <dl className="mt-4 grid gap-2 text-sm">
        <div><dt className="text-ink-500">Last verified location</dt><dd>{record.lastVerifiedLocation || 'Not published'}</dd></div>
        <div><dt className="text-ink-500">Last updated</dt><dd>{formatDateTime(record.lastUpdated)}</dd></div>
        {record.campName ? <div><dt className="text-ink-500">Camp</dt><dd>{record.campName}</dd></div> : null}
      </dl>
    </article>
  );
}
