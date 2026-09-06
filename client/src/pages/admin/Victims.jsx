import { useEffect, useState } from 'react';
import { npr, victimService } from '../../services/victimService';
import StatusBadge from '../../components/StatusBadge';
import { getErrorMessage } from '../../utils/helpers';

export default function AdminVictims() {
  const [rows, setRows] = useState([]);
  const [status, setStatus] = useState('Pending');
  const [message, setMessage] = useState('');

  const load = async (nextStatus = status) => {
    const { data } = await victimService.adminList(nextStatus ? { status: nextStatus } : {});
    setRows(data.applications || []);
  };

  useEffect(() => {
    load().catch((err) => setMessage(getErrorMessage(err)));
  }, []);

  const decide = async (id, decision) => {
    try {
      await victimService.review(id, { decision });
      setMessage(`${decision}.`);
      await load();
    } catch (err) {
      setMessage(getErrorMessage(err));
    }
  };

  return (
    <div>
      <h1 className="serif text-3xl text-navy-900">Support applications</h1>
      <p className="mt-2 text-ink-700">Approve a request to list that person on the homepage. Rejected requests stay private.</p>
      <div className="mt-6 flex flex-wrap gap-2">
        {['Pending', 'Approved', 'Rejected', 'Fulfilled', ''].map((value) => (
          <button
            key={value || 'all'}
            type="button"
            className={status === value ? 'btn-primary h-10 min-h-10 px-4 text-sm' : 'btn-outline h-10 min-h-10 px-4 text-sm'}
            onClick={() => {
              setStatus(value);
              load(value).catch((err) => setMessage(getErrorMessage(err)));
            }}
          >
            {value || 'All'}
          </button>
        ))}
      </div>
      {message ? <p className="mt-4">{message}</p> : null}
      <div className="mt-6 space-y-4">
        {rows.map((row) => (
          <article key={row._id} className="card-gov p-6">
            <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
              <div>
                <p className="font-mono text-xs text-teal-700">{row.applicationId}</p>
                <h2 className="mt-1 text-xl font-semibold text-navy-900">{row.fullName}</h2>
                <p className="text-sm text-ink-500">Public name: {row.displayName} · {row.municipality}, {row.district}</p>
                <p className="mt-3 max-w-3xl text-ink-700">{row.story}</p>
                <p className="mt-3 font-semibold">{npr(row.amountRaisedNPR)} / {npr(row.amountNeededNPR)} · {row.category}</p>
                {row.phone || row.email ? <p className="mt-1 text-sm text-ink-500">{row.phone} {row.email}</p> : null}
              </div>
              <StatusBadge status={row.status} />
            </div>
            {row.status === 'Pending' ? (
              <div className="mt-4 flex flex-wrap gap-3">
                <button type="button" className="btn-safe" onClick={() => decide(row._id, 'Approved')}>Approve and publish</button>
                <button type="button" className="btn-danger" onClick={() => decide(row._id, 'Rejected')}>Reject</button>
              </div>
            ) : null}
          </article>
        ))}
        {!rows.length ? <p className="text-ink-500">No applications in this filter.</p> : null}
      </div>
    </div>
  );
}
