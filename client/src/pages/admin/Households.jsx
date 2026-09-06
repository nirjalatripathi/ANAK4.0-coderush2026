import { useEffect, useState } from 'react';
import { adminService } from '../../services/notificationService';
import StatusBadge from '../../components/StatusBadge';
import { getErrorMessage } from '../../utils/helpers';

export default function AdminHouseholds() {
  const [rows, setRows] = useState([]);
  const [q, setQ] = useState('');
  const [error, setError] = useState('');

  const load = async () => {
    const { data } = await adminService.households({ q });
    setRows(data.households || []);
  };

  useEffect(() => { load().catch((err) => setError(getErrorMessage(err))); }, []);

  return (
    <div>
      <h1 className="serif text-3xl text-navy-900">Households</h1>
      <form className="mt-4 flex gap-3" onSubmit={(e) => { e.preventDefault(); load(); }}>
        <input className="input-gov" placeholder="Household ID" value={q} onChange={(e) => setQ(e.target.value)} />
        <button className="btn-primary" type="submit">Search</button>
      </form>
      {error ? <p className="mt-4 text-red-800">{error}</p> : null}
      <div className="mt-6 space-y-4">
        {rows.map((hh) => (
          <article key={hh._id} className="card-gov p-5">
            <p className="font-mono text-sm">{hh.householdId}</p>
            <p>Head: {hh.headOfHousehold?.fullName}</p>
            <p className="text-sm text-ink-500">{hh.memberCount} members</p>
            <ul className="mt-3 space-y-1 text-sm">
              {hh.members?.map((m) => (
                <li key={m.citizen?._id} className="flex justify-between gap-3">
                  <span>{m.relationship}: {m.citizen?.fullName}</span>
                  <StatusBadge status={m.citizen?.disasterStatus} />
                </li>
              ))}
            </ul>
          </article>
        ))}
      </div>
    </div>
  );
}
