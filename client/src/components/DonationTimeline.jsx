import { formatDateTime } from '../utils/helpers';

export default function DonationTimeline({ events = [], steps = [] }) {
  const byLabel = new Map((events || []).map((event) => [event.label, event]));
  const rows = steps.length
    ? steps.map((label) => byLabel.get(label) || { label, pending: true })
    : events;

  return (
    <ol className="space-y-3">
      {rows.map((event) => (
        <li key={event.key || event.label} className="card-gov flex items-start justify-between gap-4 p-4">
          <div>
            <p className="font-semibold text-navy-900">{event.pending ? event.label : event.label}</p>
            {event.description ? <p className="mt-1 text-sm text-ink-700">{event.description}</p> : null}
            {event.byName ? <p className="mt-1 text-xs text-ink-500">Recorded by {event.byName}</p> : null}
          </div>
          <div className="text-right text-sm">
            <p className={event.pending ? 'text-ink-500' : 'text-teal-700'}>{event.pending ? 'Pending' : 'Recorded'}</p>
            {!event.pending && event.at ? <p className="mt-1 text-xs text-ink-500">{formatDateTime(event.at)}</p> : null}
          </div>
        </li>
      ))}
    </ol>
  );
}
