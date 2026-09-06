import { useEffect, useState } from 'react';
import { campService } from '../../services/campService';
import { getErrorMessage, occupancy } from '../../utils/helpers';

export default function AdminCamps() {
  const [camps, setCamps] = useState([]);
  const [message, setMessage] = useState('');
  const [form, setForm] = useState({
    name: '', location: '', district: '', municipality: '', ward: '',
    campHead: '', contactPhone: '', capacity: 200, beds: 150,
  });

  const load = async () => {
    const { data } = await campService.list();
    setCamps(data.camps || []);
  };

  useEffect(() => { load().catch((err) => setMessage(getErrorMessage(err))); }, []);

  return (
    <div>
      <h1 className="serif text-3xl text-navy-900">Relief camps</h1>
      <form
        className="card-gov mt-6 grid gap-3 p-6 md:grid-cols-2"
        onSubmit={async (e) => {
          e.preventDefault();
          try {
            await campService.create(form);
            setMessage('Camp created with default inventory.');
            await load();
          } catch (error) {
            setMessage(getErrorMessage(error));
          }
        }}
      >
        <input className="input-gov md:col-span-2" placeholder="Camp name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
        <input className="input-gov" placeholder="Location" value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} />
        <input className="input-gov" placeholder="District" value={form.district} onChange={(e) => setForm({ ...form, district: e.target.value })} />
        <input className="input-gov" placeholder="Municipality" value={form.municipality} onChange={(e) => setForm({ ...form, municipality: e.target.value })} />
        <input className="input-gov" placeholder="Ward" value={form.ward} onChange={(e) => setForm({ ...form, ward: e.target.value })} />
        <input className="input-gov" placeholder="Camp head" value={form.campHead} onChange={(e) => setForm({ ...form, campHead: e.target.value })} />
        <input className="input-gov" placeholder="Contact" value={form.contactPhone} onChange={(e) => setForm({ ...form, contactPhone: e.target.value })} />
        <input className="input-gov" type="number" placeholder="Capacity" value={form.capacity} onChange={(e) => setForm({ ...form, capacity: Number(e.target.value) })} />
        <button className="btn-primary md:col-span-2" type="submit">Create camp</button>
      </form>
      {message ? <p className="mt-4">{message}</p> : null}
      <div className="mt-6 overflow-x-auto card-gov">
        <table className="table-gov">
          <thead><tr><th>Camp</th><th>District</th><th>Population</th><th>Occupancy</th></tr></thead>
          <tbody>
            {camps.map((camp) => (
              <tr key={camp._id}>
                <td><p className="font-semibold">{camp.name}</p><p className="font-mono text-xs">{camp.campId}</p></td>
                <td>{camp.district}</td>
                <td className="font-mono">{camp.currentPopulation} / {camp.capacity}</td>
                <td>{occupancy(camp)}%</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
