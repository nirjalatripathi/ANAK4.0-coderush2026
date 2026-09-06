import { formatDateTime } from '../utils/helpers';
import StatusBadge from './StatusBadge';

export default function FamilyMemberCard({ member, relationship }) {
  const person = member.citizen || member;
  return (
    <article className="card-gov p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="font-semibold text-navy-900">{person.fullName}</h3>
          <p className="font-mono text-xs text-ink-500">{person.registrationId}</p>
          <p className="mt-1 text-sm text-ink-700">{relationship || person.relationshipToHead}</p>
        </div>
        <StatusBadge status={person.disasterStatus} />
      </div>
      <p className="mt-3 text-sm text-ink-500">Last update: {formatDateTime(person.statusUpdatedAt)}</p>
      {person.lastKnownLocation ? <p className="text-sm">Location: {person.lastKnownLocation}</p> : null}
    </article>
  );
}
