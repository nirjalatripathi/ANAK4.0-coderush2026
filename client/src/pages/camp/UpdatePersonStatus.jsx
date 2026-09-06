import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { campService } from '../../services/campService';
import { useAuth } from '../../hooks/useAuth';
import StatusBadge from '../../components/StatusBadge';
import Loading from '../../components/Loading';
import { PERSON_STATUS } from '../../utils/constants';
import { formatDateTime, getErrorMessage } from '../../utils/helpers';

export default function UpdatePersonStatus() {
  const { id } = useParams();
  const { user, campOfficial } = useAuth();
  const [citizen, setCitizen] = useState(null);
  const [history, setHistory] = useState([]);
  const [message, setMessage] = useState('');
  const [form, setForm] = useState({
    status: 'Found',
    location: '',
    notes: '',
  });

  const load = async () => {
    const { data } = await campService.getCitizen(id);
    setCitizen(data.citizen);
    setHistory(data.history || []);
    setForm((prev) => ({
      ...prev,
      status: data.citizen.disasterStatus === 'Unverified' ? 'Found' : data.citizen.disasterStatus,
      location: campOfficial?.assignedCamp?.name || data.citizen.lastKnownLocation || '',
    }));
  };

  useEffect(() => { load().catch((err) => setMessage(getErrorMessage(err))); }, [id]);

  if (!citizen) return <Loading />;

  const save = async (event) => {
    event.preventDefault();
    try {
      await campService.updateStatus(id, {
        ...form,
        campId: campOfficial?.assignedCamp?._id || campOfficial?.assignedCamp,
      });
      setMessage('Status recorded. Household visibility and audit log have been updated.');
      await load();
    } catch (error) {
      setMessage(getErrorMessage(error));
    }
  };

  return (
    <div>
      <h1 className="serif text-3xl text-navy-900">Update person status</h1>
      <div className="card-gov mt-4 p-5">
        <p className="font-mono text-xs">{citizen.registrationId} · Household {citizen.household?.householdId || '—'}</p>
        <h2 className="serif text-2xl">{citizen.fullName}</h2>
        <div className="mt-2 flex gap-2"><StatusBadge status={citizen.disasterStatus} /><StatusBadge status={citizen.verificationStatus} /></div>
        {citizen.isVulnerable ? <p className="mt-2 text-sm text-amber-800">Vulnerable: {(citizen.vulnerabilityTypes || []).join(', ')}</p> : null}
      </div>
      <form className="card-gov mt-6 grid gap-4 p-6" onSubmit={save}>
        <div><label className="label-gov">New status</label>
          <select className="select-gov" value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>
            {PERSON_STATUS.filter((status) => status !== 'Deceased' || user?.role === 'admin').map((status) => (
              <option key={status}>{status}</option>
            ))}
          </select>
        </div>
        <div><label className="label-gov">Current location / camp</label><input className="input-gov" value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} /></div>
        <div><label className="label-gov">Notes</label><textarea className="textarea-gov" rows="4" value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} /></div>
        <p className="text-sm text-ink-500">Official: {user?.fullName}. This write creates Person Status History and an Audit Log.</p>
        <button className="btn-gold" type="submit">Record status</button>
      </form>
      {message ? <p className="mt-4">{message}</p> : null}
      <h2 className="serif mt-10 text-2xl">Status history</h2>
      <ul className="mt-4 space-y-2">
        {history.map((row) => (
          <li key={row._id} className="card-gov p-4 text-sm">
            {row.previousStatus || '—'} → {row.newStatus} · {row.location || row.camp?.name || '—'} · {formatDateTime(row.createdAt)}
            {row.notes ? <p className="mt-1 text-ink-500">{row.notes}</p> : null}
          </li>
        ))}
      </ul>
    </div>
  );
}
