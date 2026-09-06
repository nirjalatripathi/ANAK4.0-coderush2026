import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { donationService } from '../../services/donationService';
import StatusBadge from '../../components/StatusBadge';
import EmptyState from '../../components/EmptyState';
import Loading from '../../components/Loading';
import ErrorState from '../../components/ErrorState';
import { donationProgress, formatDate, formatNPR, getErrorMessage } from '../../utils/helpers';

const FILTERS = [
  { id: 'all', label: 'All' },
  { id: 'Money', label: 'Money' },
  { id: 'Physical', label: 'Supplies' },
  { id: 'pending', label: 'Pending' },
  { id: 'progress', label: 'In progress' },
  { id: 'Completed', label: 'Completed' },
  { id: 'Disputed', label: 'Disputed' },
];

export default function DonorDonations() {
  const [rows, setRows] = useState([]);
  const [filter, setFilter] = useState('all');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    donationService.mine()
      .then(({ data }) => setRows(data.donations || []))
      .catch((err) => setError(getErrorMessage(err)))
      .finally(() => setLoading(false));
  }, []);

  const visible = useMemo(() => rows.filter((row) => {
    if (filter === 'all') return true;
    if (filter === 'Money' || filter === 'Physical' || filter === 'Completed' || filter === 'Disputed') {
      return row.kind === filter || row.status === filter;
    }
    if (filter === 'pending') return ['Pending', 'Pledged'].includes(row.status);
    if (filter === 'progress') return !['Completed', 'Rejected', 'Cancelled'].includes(row.status);
    return true;
  }), [rows, filter]);

  if (loading) return <Loading />;
  if (error) return <ErrorState title="Unable to load donations" body={error} />;

  return (
    <div>
      <h1 className="serif text-3xl text-navy-900">My donations</h1>
      <div className="mt-6 flex flex-wrap gap-2">
        {FILTERS.map((item) => (
          <button key={item.id} type="button" className={filter === item.id ? 'btn-primary min-h-10 px-3' : 'btn-outline min-h-10 px-3'} onClick={() => setFilter(item.id)}>
            {item.label}
          </button>
        ))}
      </div>
      <div className="mt-8 space-y-4">
        {visible.length ? visible.map((row) => {
          const progress = donationProgress(row.status, row.kind);
          return (
            <article key={row._id} className="card-gov p-6">
              <div className="flex flex-wrap justify-between gap-3">
                <div>
                  <p className="font-mono text-xs">{row.donationId}</p>
                  <p className="mt-1 text-xl font-semibold">{row.kind === 'Money' ? formatNPR(row.amountNPR) : `${row.quantity} ${row.itemName}`}</p>
                  <p className="text-sm text-ink-500">{formatDate(row.createdAt)} · {row.camp?.name || 'Not yet allocated'}</p>
                </div>
                <StatusBadge status={row.status} />
              </div>
              <div className="mt-4 h-2 overflow-hidden rounded bg-navy-100">
                <div className="h-full bg-teal-700" style={{ width: `${progress.percent}%` }} />
              </div>
              <Link className="mt-4 inline-block text-sm font-semibold text-navy-900" to={`/donor/donations/${row._id}`}>View details</Link>
            </article>
          );
        }) : (
          <EmptyState title="No donations match this filter.">
            <Link className="btn-gold" to="/donate">Donate now</Link>
          </EmptyState>
        )}
      </div>
    </div>
  );
}
