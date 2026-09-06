import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { adminService } from '../../services/notificationService';
import StatusBadge from '../../components/StatusBadge';
import Loading from '../../components/Loading';
import { formatDateTime, formatNPR, getErrorMessage } from '../../utils/helpers';

const TABS = [
  { id: 'overview', label: 'Overview' },
  { id: 'donors', label: 'Donor report' },
  { id: 'transactions', label: 'Transactions' },
  { id: 'victims', label: 'Victims' },
  { id: 'users', label: 'Users' },
];

function Stat({ label, value }) {
  return (
    <article className="card-gov p-5">
      <p className="text-sm text-ink-500">{label}</p>
      <p className="mt-2 font-mono text-2xl text-navy-900">{value}</p>
    </article>
  );
}

export default function AdminReports() {
  const [params, setParams] = useSearchParams();
  const [data, setData] = useState(null);
  const requested = params.get('tab');
  const tab = TABS.some((item) => item.id === requested) ? requested : 'overview';
  const [error, setError] = useState('');
  const setTab = (id) => {
    const next = new URLSearchParams(params);
    if (id === 'overview') next.delete('tab');
    else next.set('tab', id);
    setParams(next, { replace: true });
  };

  useEffect(() => {
    adminService.reports()
      .then(({ data: payload }) => setData(payload))
      .catch((err) => setError(getErrorMessage(err)));
  }, []);

  if (error) return <p className="text-red-800">{error}</p>;
  if (!data) return <Loading />;
  const s = data.summary || {};

  return (
    <div>
      <h1 className="serif text-3xl text-navy-900">Reports</h1>
      <p className="mt-2 text-ink-700">Donor giving, Khalti transactions, victims, and user accounts from the live database.</p>
      <div className="mt-6 flex flex-wrap gap-2">
        {TABS.map((item) => (
          <button
            key={item.id}
            type="button"
            className={tab === item.id ? 'btn-primary h-10 min-h-10 px-4 text-sm' : 'btn-outline h-10 min-h-10 px-4 text-sm'}
            onClick={() => setTab(item.id)}
          >
            {item.label}
          </button>
        ))}
      </div>

      {tab === 'overview' ? (
        <div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <Stat label="Users" value={s.users || 0} />
          <Stat label="Donors" value={s.donors || 0} />
          <Stat label="Victim applications" value={s.victims || 0} />
          <Stat label="Public listings" value={s.publicVictims || 0} />
          <Stat label="Transactions" value={s.transactions || 0} />
          <Stat label="Verified payments" value={s.verifiedTransactions || 0} />
          <Stat label="Verified total" value={formatNPR(s.verifiedNPR)} />
          <Stat label="Pending checkout" value={formatNPR(s.pendingNPR)} />
          <Stat label="Amount requested" value={formatNPR(s.neededNPR)} />
          <Stat label="Amount raised on cards" value={formatNPR(s.raisedNPR)} />
        </div>
      ) : null}

      {tab === 'donors' ? (
        <div className="table-wrap mt-8">
          <table className="table-gov">
            <thead>
              <tr>
                <th>Donor</th>
                <th>Email</th>
                <th>Gifts</th>
                <th>Verified gifts</th>
                <th>Verified total</th>
                <th>Last gift</th>
              </tr>
            </thead>
            <tbody>
              {(data.donors || []).map((row) => (
                <tr key={`${row.email}-${row.name}`}>
                  <td className="font-semibold">{row.name}</td>
                  <td>{row.email || '—'}</td>
                  <td className="font-mono">{row.gifts}</td>
                  <td className="font-mono">{row.verifiedGifts}</td>
                  <td className="font-mono">{formatNPR(row.verifiedNPR)}</td>
                  <td>{formatDateTime(row.lastGiftAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : null}

      {tab === 'transactions' ? (
        <div className="table-wrap mt-8">
          <table className="table-gov">
            <thead>
              <tr>
                <th>Donation ID</th>
                <th>Donor</th>
                <th>Victim</th>
                <th>Amount</th>
                <th>Provider</th>
                <th>Khalti ref</th>
                <th>Status</th>
                <th>Date</th>
              </tr>
            </thead>
            <tbody>
              {(data.transactions || []).map((row) => (
                <tr key={row.id}>
                  <td className="font-mono text-xs">{row.donationId}</td>
                  <td>
                    <p className="font-semibold">{row.donorName}</p>
                    <p className="text-xs text-ink-500">{row.donorEmail}</p>
                  </td>
                  <td>
                    <p>{row.victimName}</p>
                    <p className="font-mono text-xs text-ink-500">{row.victimId}</p>
                  </td>
                  <td className="font-mono">{formatNPR(row.amountNPR)}</td>
                  <td className="uppercase">{row.provider}</td>
                  <td className="font-mono text-xs">{row.khaltiTxnId || row.khaltiPidx || '—'}</td>
                  <td><StatusBadge status={row.status} /></td>
                  <td>{formatDateTime(row.createdAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : null}

      {tab === 'victims' ? (
        <div className="table-wrap mt-8">
          <table className="table-gov">
            <thead>
              <tr>
                <th>ID</th>
                <th>Person</th>
                <th>Place</th>
                <th>Need</th>
                <th>Raised</th>
                <th>Remaining</th>
                <th>Gifts</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {(data.victims || []).map((row) => (
                <tr key={row.id}>
                  <td className="font-mono text-xs">{row.applicationId}</td>
                  <td>
                    <p className="font-semibold">{row.displayName}</p>
                    <p className="text-xs text-ink-500">{row.fullName}</p>
                  </td>
                  <td>{row.municipality}, {row.district}</td>
                  <td className="font-mono">{formatNPR(row.amountNeededNPR)}</td>
                  <td className="font-mono">{formatNPR(row.amountRaisedNPR)}</td>
                  <td className="font-mono">{formatNPR(row.remainingNPR)}</td>
                  <td className="font-mono">{row.gifts}</td>
                  <td><StatusBadge status={row.status} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : null}

      {tab === 'users' ? (
        <div className="table-wrap mt-8">
          <table className="table-gov">
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Role</th>
                <th>Active</th>
                <th>Joined</th>
              </tr>
            </thead>
            <tbody>
              {(data.users || []).map((row) => (
                <tr key={row._id}>
                  <td className="font-semibold">{row.fullName}</td>
                  <td>{row.email}</td>
                  <td className="capitalize">{row.role.replaceAll('_', ' ')}</td>
                  <td>{row.isActive ? 'Yes' : 'No'}</td>
                  <td>{formatDateTime(row.createdAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : null}
    </div>
  );
}
