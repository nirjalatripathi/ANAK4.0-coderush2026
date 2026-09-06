import { useEffect, useState } from 'react';
import { unregisteredService } from '../../services/unregisteredService';
import StatusBadge from '../../components/StatusBadge';
import EmptyState from '../../components/EmptyState';
import { getErrorMessage } from '../../utils/helpers';

export default function CampUnregistered() {
  const [people, setPeople] = useState([]);
  const [message, setMessage] = useState('');
  const [form, setForm] = useState({
    name: '',
    approximateAge: '',
    gender: 'Unknown',
    currentLocation: '',
    previousLocation: '',
    countryOfOrigin: '',
    districtOfOrigin: '',
    familyInformation: '',
    emergencyName: '',
    emergencyPhone: '',
    availableId: '',
    notes: '',
  });
  const [photo, setPhoto] = useState(null);

  const load = async () => {
    const { data } = await unregisteredService.list();
    setPeople(data.people || []);
  };

  useEffect(() => { load().catch((err) => setMessage(getErrorMessage(err))); }, []);

  const onSubmit = async (event) => {
    event.preventDefault();
    const payload = new FormData();
    Object.entries(form).forEach(([key, value]) => payload.append(key, value));
    if (photo) payload.append('photo', photo);
    try {
      const { data } = await unregisteredService.create(payload);
      setMessage(`Created ${data.person.temporaryId}. Status: Unverified.`);
      await load();
    } catch (error) {
      setMessage(getErrorMessage(error));
    }
  };

  return (
    <div>
      <h1 className="serif text-3xl text-navy-900">Unregistered people</h1>
      <p className="mt-2 text-ink-700">For visitors, migrant workers and people who never registered. They receive a temporary UNREG identity and remain Unverified until an administrator matches or converts the record.</p>
      <form className="card-gov mt-6 grid gap-3 p-6 md:grid-cols-2" onSubmit={onSubmit}>
        <div><label className="label-gov">Name if known</label><input className="input-gov" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></div>
        <div><label className="label-gov">Approximate age</label><input className="input-gov" value={form.approximateAge} onChange={(e) => setForm({ ...form, approximateAge: e.target.value })} /></div>
        <div><label className="label-gov">Gender</label>
          <select className="select-gov" value={form.gender} onChange={(e) => setForm({ ...form, gender: e.target.value })}>
            <option>Unknown</option><option>Female</option><option>Male</option><option>Other</option>
          </select>
        </div>
        <div><label className="label-gov">Current location</label><input className="input-gov" value={form.currentLocation} onChange={(e) => setForm({ ...form, currentLocation: e.target.value })} /></div>
        <div><label className="label-gov">Previous location</label><input className="input-gov" value={form.previousLocation} onChange={(e) => setForm({ ...form, previousLocation: e.target.value })} /></div>
        <div><label className="label-gov">Country of origin</label><input className="input-gov" value={form.countryOfOrigin} onChange={(e) => setForm({ ...form, countryOfOrigin: e.target.value })} /></div>
        <div className="md:col-span-2"><label className="label-gov">Family information</label><textarea className="textarea-gov" rows="3" value={form.familyInformation} onChange={(e) => setForm({ ...form, familyInformation: e.target.value })} /></div>
        <div><label className="label-gov">Emergency contact</label><input className="input-gov" value={form.emergencyName} onChange={(e) => setForm({ ...form, emergencyName: e.target.value })} /></div>
        <div><label className="label-gov">Available ID</label><input className="input-gov" value={form.availableId} onChange={(e) => setForm({ ...form, availableId: e.target.value })} /></div>
        <div className="md:col-span-2"><label className="label-gov">Photograph</label><input type="file" accept="image/*" onChange={(e) => setPhoto(e.target.files?.[0])} /></div>
        <button className="btn-gold md:col-span-2" type="submit">Create UNREG record</button>
      </form>
      {message ? <p className="mt-4">{message}</p> : null}
      {people.length === 0 ? <div className="mt-6"><EmptyState title="No unregistered people recorded for this desk." /></div> : null}
      <div className="mt-6 overflow-x-auto card-gov">
        <table className="table-gov">
          <thead><tr><th>Temporary ID</th><th>Name</th><th>Origin</th><th>Status</th></tr></thead>
          <tbody>
            {people.map((person) => (
              <tr key={person._id}>
                <td className="font-mono">{person.temporaryId}</td>
                <td>{person.name}</td>
                <td>{person.countryOfOrigin || person.districtOfOrigin || '—'}</td>
                <td><StatusBadge status={person.status} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
