import { useEffect, useState } from 'react';
import { disasterService } from '../../services/disasterService';
import StatusBadge from '../../components/StatusBadge';
import { getErrorMessage } from '../../utils/helpers';

const types = ['Earthquake', 'Flood', 'Landslide', 'Fire', 'Storm', 'Avalanche', 'Building Collapse', 'Epidemic', 'Other'];

export default function AdminDisasters() {
  const [rows, setRows] = useState([]);
  const [message, setMessage] = useState('');
  const [form, setForm] = useState({
    name: '', type: 'Earthquake', location: '', district: '', municipality: '', ward: '',
    date: '', severity: 'High', description: '', status: 'Active', affectedAreas: '',
    disasterLevel: 3, affectedWards: '5,6,7', expectedPopulation: 2840,
  });

  const load = async () => {
    const { data } = await disasterService.list();
    setRows(data.disasters || []);
  };

  useEffect(() => { load().catch((err) => setMessage(getErrorMessage(err))); }, []);

  return (
    <div>
      <h1 className="serif text-3xl text-navy-900">Disasters</h1>
      <form
        className="card-gov mt-6 grid gap-3 p-6 md:grid-cols-2"
        onSubmit={async (e) => {
          e.preventDefault();
          try {
            await disasterService.create({
              ...form,
              disasterLevel: Number(form.disasterLevel),
              expectedPopulation: Number(form.expectedPopulation || 0),
              affectedWards: form.affectedWards.split(',').map((s) => s.trim()).filter(Boolean),
              affectedAreas: form.affectedAreas.split(',').map((s) => s.trim()).filter(Boolean),
            });
            setMessage('Disaster record created.');
            await load();
          } catch (error) {
            setMessage(getErrorMessage(error));
          }
        }}
      >
        <input className="input-gov md:col-span-2" placeholder="Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
        <select className="select-gov" value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}>
          {types.map((t) => <option key={t}>{t}</option>)}
        </select>
        <select className="select-gov" value={form.severity} onChange={(e) => setForm({ ...form, severity: e.target.value })}>
          <option>Low</option><option>Moderate</option><option>High</option><option>Critical</option>
        </select>
        <select className="select-gov" value={form.disasterLevel} onChange={(e) => setForm({ ...form, disasterLevel: Number(e.target.value) })}>
          <option value={1}>Level 1 — Local / Low</option>
          <option value={2}>Level 2 — Moderate</option>
          <option value={3}>Level 3 — High</option>
          <option value={4}>Level 4 — Severe</option>
        </select>
        <input className="input-gov" type="number" placeholder="Expected population" value={form.expectedPopulation} onChange={(e) => setForm({ ...form, expectedPopulation: e.target.value })} />
        <input className="input-gov md:col-span-2" placeholder="Affected wards, comma separated" value={form.affectedWards} onChange={(e) => setForm({ ...form, affectedWards: e.target.value })} />
        <input className="input-gov" placeholder="Location" value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} />
        <input className="input-gov" placeholder="District" value={form.district} onChange={(e) => setForm({ ...form, district: e.target.value })} />
        <input type="date" className="input-gov" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} required />
        <select className="select-gov" value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>
          <option>Active</option><option>Under Control</option><option>Recovery</option><option>Closed</option>
        </select>
        <textarea className="textarea-gov md:col-span-2" rows="3" placeholder="Description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
        <input className="input-gov md:col-span-2" placeholder="Affected areas, comma separated" value={form.affectedAreas} onChange={(e) => setForm({ ...form, affectedAreas: e.target.value })} />
        <button className="btn-gold md:col-span-2" type="submit">Create / activate disaster</button>
      </form>
      {message ? <p className="mt-4">{message}</p> : null}
      <div className="mt-6 space-y-3">
        {rows.map((row) => (
          <article key={row._id} className="card-gov flex items-center justify-between gap-4 p-4">
            <div>
              <p className="font-semibold">{row.name}</p>
              <p className="text-sm text-ink-500">{row.disasterId} · {row.type} · Level {row.disasterLevel || '—'}</p>
            </div>
            <div className="flex items-center gap-3">
              <StatusBadge status={row.status} />
              <select className="select-gov" value={row.status} onChange={async (e) => {
                await disasterService.update(row._id, { status: e.target.value });
                await load();
              }}>
                <option>Active</option><option>Under Control</option><option>Recovery</option><option>Closed</option>
              </select>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
