import { useEffect, useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { donationService } from '../../services/donationService';
import StatusBadge from '../../components/StatusBadge';
import EmptyState from '../../components/EmptyState';
import Loading from '../../components/Loading';
import { formatNPR, getErrorMessage } from '../../utils/helpers';

const TABS = [
  { id: 'all', label: 'All' },
  { id: 'pending', label: 'Payment verification' },
  { id: 'allocate', label: 'Allocation' },
  { id: 'impact', label: 'Impact verification' },
  { id: 'discrepancy', label: 'Discrepancies' },
];

export default function AdminDonations() {
  const [rows, setRows] = useState([]);
  const [params, setParams] = useSearchParams();
  const tab = params.get('tab') || 'all';
  const setTab = (id) => {
    const next = new URLSearchParams(params);
    if (id === 'all') next.delete('tab');
    else next.set('tab', id);
    setParams(next, { replace: true });
  };
  const [query, setQuery] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(true);

  const load = async () => {
    const { data } = await donationService.list();
    setRows(data.donations || []);
  };

  useEffect(() => {
    load().catch((err) => setMessage(getErrorMessage(err))).finally(() => setLoading(false));
  }, []);

  const visible = useMemo(() => rows.filter((row) => {
    const hay = `${row.donationId} ${row.donorName} ${row.itemName} ${row.camp?.name || ''}`.toLowerCase();
    if (query && !hay.includes(query.toLowerCase())) return false;
    if (tab === 'pending') return row.status === 'Pending';
    if (tab === 'allocate') return ['Payment Verified', 'Pledged', 'Accepted'].includes(row.status);
    if (tab === 'impact') return ['Allocated', 'In Use'].includes(row.status);
    if (tab === 'discrepancy') return ['Partially Received', 'Disputed'].includes(row.status);
    return true;
  }), [rows, tab, query]);

  if (loading) return <Loading />;

  return (
    <div>
      <h1 className="serif text-3xl text-navy-900">Donation management</h1>
      <p className="mt-2 text-ink-700">Verify payments, allocate to published needs, and record donor-facing impact. Financial records are not deleted.</p>
      {message ? <p className="mt-3">{message}</p> : null}
      <div className="mt-6 flex flex-wrap gap-2">
        {TABS.map((item) => (
          <button key={item.id} type="button" className={tab === item.id ? 'btn-primary min-h-10 px-3' : 'btn-outline min-h-10 px-3'} onClick={() => setTab(item.id)}>
            {item.label}
          </button>
        ))}
      </div>
      <label className="label-gov mt-6" htmlFor="search">Search donations</label>
      <input id="search" className="input-gov max-w-md" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Donation ID, donor, item, center" />
      <div className="card-gov mt-8 overflow-x-auto">
        {visible.length ? (
          <table className="table-gov">
            <thead>
              <tr>
                <th>Donation</th>
                <th>Type</th>
                <th>Destination</th>
                <th>Value</th>
                <th>Status</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {visible.map((row) => (
                <tr key={row._id}>
                  <td>
                    <p className="font-semibold">{row.donorName}</p>
                    <p className="font-mono text-xs">{row.donationId}</p>
                    {row.isDemo ? <p className="text-xs text-ink-500">Demo record</p> : null}
                  </td>
                  <td>{row.kind}</td>
                  <td>{row.camp?.name || 'Unallocated'}<br />{row.itemName || row.purpose}</td>
                  <td className="font-mono">{row.kind === 'Money' ? formatNPR(row.amountNPR) : row.quantity}</td>
                  <td><StatusBadge status={row.status} /></td>
                  <td><Link className="btn-outline min-h-10" to={`/admin/donations/${row._id}`}>Open</Link></td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <EmptyState title="No donations in this view." body="When donors submit money or supplies, they will appear here for verification." />
        )}
      </div>
    </div>
  );
}
