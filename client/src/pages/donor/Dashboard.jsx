import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { donationService } from '../../services/donationService';
import { notificationService } from '../../services/notificationService';
import { useAuth } from '../../hooks/useAuth';
import StatusBadge from '../../components/StatusBadge';
import Loading from '../../components/Loading';
import EmptyState from '../../components/EmptyState';
import ErrorState from '../../components/ErrorState';
import { donationProgress, formatNPR, getErrorMessage } from '../../utils/helpers';

export default function DonorDashboard() {
  const { user } = useAuth();
  const [donations, setDonations] = useState([]);
  const [notes, setNotes] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([donationService.mine(), notificationService.list({ unread: 'true' })])
      .then(([don, note]) => {
        setDonations(don.data.donations || []);
        setNotes(note.data.notifications || []);
      })
      .catch((err) => setError(getErrorMessage(err)))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <Loading />;
  if (error) return <ErrorState title="Unable to load your dashboard" body={error} />;

  const money = donations.filter((row) => row.kind === 'Money').reduce((sum, row) => sum + (row.amountNPR || 0), 0);
  const completed = donations.filter((row) => row.status === 'Completed').length;
  const pending = donations.filter((row) => !['Completed', 'Rejected', 'Cancelled'].includes(row.status)).length;
  const people = donations.reduce((sum, row) => sum + (row.peopleSupported || 0), 0);

  return (
    <div>
      <h1 className="serif text-3xl text-navy-900">Welcome back, {user?.fullName || 'donor'}</h1>
      <p className="mt-2 text-ink-700">Your contributions are helping turn relief into recovery.</p>
      <div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        <article className="card-gov p-5"><p className="text-xs uppercase text-ink-500">Total donated</p><p className="mt-2 text-2xl font-semibold">{money ? formatNPR(money) : 'No money recorded'}</p></article>
        <article className="card-gov p-5"><p className="text-xs uppercase text-ink-500">Donations</p><p className="mt-2 text-2xl font-semibold">{donations.length || 'None yet'}</p></article>
        <article className="card-gov p-5"><p className="text-xs uppercase text-ink-500">Completed</p><p className="mt-2 text-2xl font-semibold">{completed || 'None yet'}</p></article>
        <article className="card-gov p-5"><p className="text-xs uppercase text-ink-500">Pending</p><p className="mt-2 text-2xl font-semibold">{pending || 'None'}</p></article>
        <article className="card-gov p-5"><p className="text-xs uppercase text-ink-500">People supported</p><p className="mt-2 text-2xl font-semibold">{people || 'Not yet recorded'}</p></article>
      </div>
      <div className="mt-8 flex flex-wrap gap-3">
        <Link className="btn-gold" to="/donor/donate/money">Donate now</Link>
        <Link className="btn-outline" to="/donor/recommend">What should I donate?</Link>
        <Link className="btn-outline" to="/donor/notifications">Notifications{notes.length ? ` (${notes.length})` : ''}</Link>
      </div>
      <h2 className="serif mt-12 text-2xl">Recent donations</h2>
      <div className="mt-6 space-y-3">
        {donations.length ? donations.slice(0, 6).map((row) => {
          const progress = donationProgress(row.status, row.kind);
          return (
            <article key={row._id} className="card-gov p-5">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="font-mono text-xs">{row.donationId}</p>
                  <p className="mt-1 font-semibold">{row.kind === 'Money' ? formatNPR(row.amountNPR) : `${row.quantity} ${row.itemName}`}</p>
                  <p className="text-sm text-ink-500">{row.camp?.name || 'Awaiting allocation'} · {row.status}</p>
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
          <EmptyState title="You haven't made any donations yet." body="Start with money or physical supplies and RAHAT will keep you informed.">
            <Link className="btn-gold" to="/donate">Donate now</Link>
          </EmptyState>
        )}
      </div>
    </div>
  );
}
