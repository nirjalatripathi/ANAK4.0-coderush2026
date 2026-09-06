import { useEffect, useState } from 'react';
import { notificationService } from '../../services/notificationService';
import Loading from '../../components/Loading';
import EmptyState from '../../components/EmptyState';
import { formatDateTime, getErrorMessage } from '../../utils/helpers';

export default function CitizenNotifications() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = async () => {
    const { data } = await notificationService.list();
    setItems(data.notifications || []);
  };

  useEffect(() => {
    load().catch((err) => setError(getErrorMessage(err))).finally(() => setLoading(false));
  }, []);

  if (loading) return <Loading />;
  if (error) return <p className="text-red-800">{error}</p>;

  return (
    <div>
      <div className="flex items-center justify-between gap-4">
        <h1 className="serif text-3xl text-navy-900">Notifications</h1>
        <button className="btn-outline" type="button" onClick={async () => { await notificationService.readAll(); await load(); }}>Mark all read</button>
      </div>
      {items.length === 0 ? <div className="mt-6"><EmptyState title="No notifications yet." /></div> : null}
      <ul className="mt-6 space-y-3">
        {items.map((item) => (
          <li key={item._id} className="card-gov p-4">
            <p className="font-semibold text-navy-900">{item.title}</p>
            <p className="text-ink-700">{item.body}</p>
            <p className="mt-2 text-xs text-ink-500">{formatDateTime(item.createdAt)} · {item.type}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}
