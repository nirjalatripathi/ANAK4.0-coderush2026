import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { disasterService } from '../../services/disasterService';
import StatusBadge from '../../components/StatusBadge';
import EmptyState from '../../components/EmptyState';
import Loading from '../../components/Loading';
import { formatDate, getErrorMessage } from '../../utils/helpers';

export default function AdminDisasterRecords() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    disasterService.adminList()
      .then(({ data }) => setRows(data.disasters || []))
      .catch((err) => setError(getErrorMessage(err, 'Unable to load recorded disasters.')))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div>
      <h1 className="serif text-3xl text-navy-900">Recorded disasters</h1>
      <p className="mt-2 text-ink-700">Every disaster created in RAHAT is stored here. The public Disasters page shows the same records.</p>
      <Link className="btn-outline mt-4" to="/admin/disasters">Create a disaster</Link>
      {loading ? <Loading /> : null}
      {error ? <p className="mt-4 text-red-800">{error}</p> : null}
      {!loading && !rows.length ? (
        <div className="mt-8">
          <EmptyState title="No disasters have been recorded yet." body="Create one from the Disasters page." />
        </div>
      ) : null}
      <div className="mt-8 space-y-4">
        {rows.map((row) => (
          <article key={row._id} className="card-gov p-6">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="font-mono text-xs text-teal-700">{row.disasterId}</p>
                <h2 className="serif mt-1 text-2xl text-navy-900">{row.name}</h2>
                <p className="text-ink-700">{row.type} · Level {row.disasterLevel || '—'} · {row.severity}</p>
              </div>
              <StatusBadge status={row.status} />
            </div>
            {row.description ? <p className="mt-3 text-ink-700">{row.description}</p> : null}
            <p className="mt-3 text-sm text-ink-500">
              {row.location || row.district || 'Location not set'} · Date: {formatDate(row.date)}
            </p>
            {row.affectedWards?.length ? <p className="mt-1 text-sm text-ink-700">Wards: {row.affectedWards.join(', ')}</p> : null}
            {row.affectedAreas?.length ? <p className="mt-1 text-sm text-ink-700">Affected areas: {row.affectedAreas.join(', ')}</p> : null}
          </article>
        ))}
      </div>
    </div>
  );
}
