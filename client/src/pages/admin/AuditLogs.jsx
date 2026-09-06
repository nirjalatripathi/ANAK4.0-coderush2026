import { useEffect, useState } from 'react';
import { adminService } from '../../services/notificationService';
import { formatDateTime, getErrorMessage } from '../../utils/helpers';

export default function AdminAuditLogs() {
  const [items, setItems] = useState([]);
  const [q, setQ] = useState('');
  const [error, setError] = useState('');

  const load = async () => {
    const { data } = await adminService.auditLogs({ q });
    setItems(data.items || []);
  };

  useEffect(() => { load().catch((err) => setError(getErrorMessage(err))); }, []);

  return (
    <div>
      <h1 className="serif text-3xl text-navy-900">Audit logs</h1>
      <p className="mt-2 text-ink-700">Visible only to authenticated administrators. Sensitive actions are written by the server, not the browser.</p>
      <form className="mt-4 flex gap-3" onSubmit={(e) => { e.preventDefault(); load(); }}>
        <input className="input-gov" placeholder="Search action or actor" value={q} onChange={(e) => setQ(e.target.value)} />
        <button className="btn-primary" type="submit">Search</button>
      </form>
      {error ? <p className="mt-4 text-red-800">{error}</p> : null}
      <div className="mt-6 overflow-x-auto card-gov">
        <table className="table-gov">
          <thead><tr><th>When</th><th>Actor</th><th>Action</th><th>Record</th></tr></thead>
          <tbody>
            {items.map((row) => (
              <tr key={row._id}>
                <td>{formatDateTime(row.createdAt)}</td>
                <td>{row.actorName}<br /><span className="text-xs text-ink-500">{row.role}</span></td>
                <td>{row.action}</td>
                <td className="font-mono text-xs">{row.entityType} {row.entityId}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
