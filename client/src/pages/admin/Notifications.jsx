import { useEffect, useState } from 'react';
import { notificationService } from '../../services/notificationService';
import { formatDateTime, getErrorMessage } from '../../utils/helpers';

export default function AdminNotifications() {
  const [items, setItems] = useState([]);
  const [form, setForm] = useState({ title: '', body: '', audience: 'all', type: 'emergency_announcement' });
  const [message, setMessage] = useState('');

  const load = async () => {
    const { data } = await notificationService.list();
    setItems(data.notifications || []);
  };

  useEffect(() => { load().catch((err) => setMessage(getErrorMessage(err))); }, []);

  return (
    <div>
      <h1 className="serif text-3xl text-navy-900">Notifications</h1>
      <form
        className="card-gov mt-6 grid gap-3 p-6"
        onSubmit={async (e) => {
          e.preventDefault();
          try {
            await notificationService.announce(form);
            setMessage('Announcement issued.');
            await load();
          } catch (error) {
            setMessage(getErrorMessage(error));
          }
        }}
      >
        <input className="input-gov" placeholder="Title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required />
        <textarea className="textarea-gov" rows="4" placeholder="Message" value={form.body} onChange={(e) => setForm({ ...form, body: e.target.value })} required />
        <button className="btn-primary" type="submit">Send announcement</button>
      </form>
      {message ? <p className="mt-4">{message}</p> : null}
      <ul className="mt-6 space-y-2">
        {items.map((item) => (
          <li key={item._id} className="card-gov p-4">
            <p className="font-semibold">{item.title}</p>
            <p>{item.body}</p>
            <p className="text-xs text-ink-500">{formatDateTime(item.createdAt)}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}
