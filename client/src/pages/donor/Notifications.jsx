import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { notificationService } from '../../services/notificationService';
import EmptyState from '../../components/EmptyState';
import Loading from '../../components/Loading';
import ErrorState from '../../components/ErrorState';
import { formatDateTime, getErrorMessage } from '../../utils/helpers';

export default function DonorNotifications() {
  const [rows, setRows] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  const load = async () => {
    const { data } = await notificationService.list();
    setRows(data.notifications || []);
  };

  useEffect(() => {
    load().catch((err) => setError(getErrorMessage(err))).finally(() => setLoading(false));
  }, []);

  if (loading) return <Loading />;
  if (error) return <ErrorState title="Unable to load notifications" body={error} />;

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="serif text-3xl text-navy-900">Notifications</h1>
        {rows.some((row) => !row.isRead) ? (
          <button
            type="button"
            className="btn-outline"
            onClick={async () => {
              await notificationService.readAll();
              await load();
            }}
          >
            Mark all as read
          </button>
        ) : null}
      </div>
      <div className="mt-8 space-y-3">
        {rows.length ? rows.map((row) => (
          <article key={row._id} className={`card-gov p-5 ${row.isRead ? '' : 'border-teal-700'}`}>
            <div className="flex flex-wrap justify-between gap-3">
              <div>
                <p className="text-xs uppercase tracking-wide text-ink-500">{row.type.replaceAll('_', ' ')}</p>
                <h2 className="mt-1 font-semibold text-navy-900">{row.title}</h2>
                <p className="mt-2 text-ink-700">{row.body}</p>
                <p className="mt-2 text-xs text-ink-500">{formatDateTime(row.createdAt)}</p>
              </div>
              {!row.isRead ? (
                <button type="button" className="btn-outline min-h-10" onClick={async () => { await notificationService.read(row._id); await load(); }}>
                  Mark read
                </button>
              ) : null}
            </div>
            {row.relatedModel === 'Donation' && row.relatedId ? (
              <Link className="mt-3 inline-block text-sm font-semibold" to={`/donor/donations/${row.relatedId}`}>Open related donation</Link>
            ) : null}
          </article>
        )) : (
          <EmptyState title="No notifications yet." body="You will see confirmation, allocation, and impact updates here after you donate." />
        )}
      </div>
    </div>
  );
}
