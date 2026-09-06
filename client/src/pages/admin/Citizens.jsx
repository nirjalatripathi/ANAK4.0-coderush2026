import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { adminService } from '../../services/notificationService';
import StatusBadge from '../../components/StatusBadge';
import Loading from '../../components/Loading';
import { getErrorMessage } from '../../utils/helpers';

export default function AdminCitizens() {
  const [rows, setRows] = useState([]);
  const [q, setQ] = useState('');
  const [verificationStatus, setVerificationStatus] = useState('');
  const [disasterStatus, setDisasterStatus] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = async () => {
    setLoading(true);
    try {
      const { data } = await adminService.citizens({ q, verificationStatus, disasterStatus });
      setRows(data.citizens || []);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  return (
    <div>
      <h1 className="serif text-3xl text-navy-900">Citizen registry</h1>
      <form className="mt-4 grid gap-3 md:grid-cols-4" onSubmit={(e) => { e.preventDefault(); load(); }}>
        <input className="input-gov" placeholder="Name, ID or phone" value={q} onChange={(e) => setQ(e.target.value)} />
        <select className="select-gov" value={verificationStatus} onChange={(e) => setVerificationStatus(e.target.value)}>
          <option value="">All verification</option>
          <option>Pending Verification</option><option>Verified</option><option>Rejected</option><option>Requires Resubmission</option>
        </select>
        <select className="select-gov" value={disasterStatus} onChange={(e) => setDisasterStatus(e.target.value)}>
          <option value="">All disaster status</option>
          <option>Missing</option><option>Found</option><option>In Relief Camp</option><option>Hospitalized</option><option>Unverified</option>
        </select>
        <button className="btn-primary" type="submit">Filter</button>
      </form>
      {loading ? <Loading /> : null}
      {error ? <p className="mt-4 text-red-800">{error}</p> : null}
      <div className="mt-6 overflow-x-auto card-gov">
        <table className="table-gov">
          <thead><tr><th>Citizen</th><th>Verification</th><th>Status</th><th>Household</th><th></th></tr></thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row._id}>
                <td><p className="font-semibold">{row.fullName}</p><p className="font-mono text-xs">{row.registrationId}</p></td>
                <td><StatusBadge status={row.verificationStatus} /></td>
                <td><StatusBadge status={row.disasterStatus} /></td>
                <td className="font-mono text-xs">{row.household?.householdId || '—'}</td>
                <td><Link to={`/admin/citizens/${row._id}`}>Open</Link></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
