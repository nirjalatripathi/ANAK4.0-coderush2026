import { useEffect, useState } from 'react';
import { disasterService } from '../services/disasterService';
import Loading from '../components/Loading';
import EmptyState from '../components/EmptyState';
import StatusBadge from '../components/StatusBadge';
import { formatDate, getErrorMessage } from '../utils/helpers';

export default function DisasterInformation() {
  const [disasters, setDisasters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    disasterService.list()
      .then(({ data }) => setDisasters(data.disasters || []))
      .catch((err) => setError(getErrorMessage(err)))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="page-wrap">
      <h1 className="serif text-4xl text-navy-900">Disaster information</h1>
      <p className="mt-3 max-w-2xl text-ink-700">Only approved, public disaster records are shown. Administrators create and close these records; citizens cannot alter them.</p>
      {loading ? <Loading /> : null}
      {error ? <p className="mt-6 text-red-800">{error}</p> : null}
      {!loading && !error && disasters.length === 0 ? (
        <div className="mt-8"><EmptyState title="No public disaster records are currently published." body="When an administrator activates a disaster, it will appear here." /></div>
      ) : null}
      <div className="mt-8 grid gap-4">
        {disasters.map((disaster) => (
          <article key={disaster._id} className="card-gov p-6">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="font-mono text-xs text-ink-500">{disaster.disasterId}</p>
                <h2 className="serif text-2xl text-navy-900">{disaster.name}</h2>
                <p className="text-ink-700">{disaster.type} · Level {disaster.disasterLevel || '—'} · {disaster.district || disaster.location}</p>
              </div>
              <StatusBadge status={disaster.status} />
            </div>
            <p className="mt-3 text-ink-700">{disaster.description}</p>
            <p className="mt-3 text-sm text-ink-500">Date: {formatDate(disaster.date)} · Severity: {disaster.severity}</p>
            {disaster.affectedAreas?.length ? <p className="mt-2 text-sm">Affected areas: {disaster.affectedAreas.join(', ')}</p> : null}
            {disaster.activeCamps?.length ? (
              <p className="mt-2 text-sm">Linked camps: {disaster.activeCamps.map((camp) => camp.name).join(', ')}</p>
            ) : null}
          </article>
        ))}
      </div>
    </div>
  );
}
