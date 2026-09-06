import { useEffect, useState } from 'react';
import { safeZoneService } from '../../services/safeZoneService';
import { disasterService } from '../../services/disasterService';
import SafeZoneCard from '../../components/SafeZoneCard';
import StatusBadge from '../../components/StatusBadge';
import { DISASTER_TYPES } from '../../utils/constants';
import { getErrorMessage } from '../../utils/helpers';

export default function AdminSafeZones() {
  const [zones, setZones] = useState([]);
  const [disasters, setDisasters] = useState([]);
  const [message, setMessage] = useState('');
  const [form, setForm] = useState({
    name: '', ward: '6', location: '', capacity: 400, municipality: 'Suryabinayak Municipality',
    district: 'Bhaktapur', latitude: 27.67, longitude: 85.43, suitableDisasterTypes: ['Flood'],
    facilities: ['Drinking water', 'Toilets', 'Lighting'], assignedWards: '5,6,7', disaster: '',
  });

  const load = async () => {
    const [{ data }, dis] = await Promise.all([safeZoneService.list(), disasterService.list()]);
    setZones(data.safeZones || []);
    setDisasters(dis.data.disasters || []);
    if (!form.disaster && dis.data.disasters?.[0]) setForm((prev) => ({ ...prev, disaster: dis.data.disasters[0]._id }));
  };

  useEffect(() => { load().catch((err) => setMessage(getErrorMessage(err))); }, []);

  return (
    <div>
      <h1 className="serif text-3xl text-navy-900">Safe zones</h1>
      <p className="mt-2 text-ink-500">Assess, declare, publish. Every declaration writes an audit record.</p>
      <form
        className="card-gov mt-6 grid gap-3 p-6 md:grid-cols-2"
        onSubmit={async (e) => {
          e.preventDefault();
          try {
            await safeZoneService.create({
              ...form,
              capacity: Number(form.capacity),
              latitude: Number(form.latitude),
              longitude: Number(form.longitude),
              assignedWards: form.assignedWards.split(',').map((s) => s.trim()).filter(Boolean),
              isPublic: true,
              status: 'Proposed',
            });
            setMessage('Safe zone created as Proposed. Declare it active when compatible with the disaster.');
            await load();
          } catch (error) {
            setMessage(getErrorMessage(error));
          }
        }}
      >
        <input className="input-gov md:col-span-2" placeholder="Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
        <input className="input-gov" placeholder="Ward" value={form.ward} onChange={(e) => setForm({ ...form, ward: e.target.value })} />
        <input className="input-gov" type="number" placeholder="Capacity" value={form.capacity} onChange={(e) => setForm({ ...form, capacity: e.target.value })} />
        <input className="input-gov md:col-span-2" placeholder="Location" value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} />
        <select className="select-gov" value={form.suitableDisasterTypes[0]} onChange={(e) => setForm({ ...form, suitableDisasterTypes: [e.target.value] })}>
          {DISASTER_TYPES.map((type) => <option key={type}>{type}</option>)}
        </select>
        <select className="select-gov" value={form.disaster} onChange={(e) => setForm({ ...form, disaster: e.target.value })}>
          {disasters.map((row) => <option key={row._id} value={row._id}>{row.name}</option>)}
        </select>
        <button className="btn-gold md:col-span-2" type="submit">Create safe zone</button>
      </form>
      {message ? <p className="mt-4">{message}</p> : null}
      <div className="mt-8 grid gap-4 lg:grid-cols-2">
        {zones.map((zone) => (
          <div key={zone._id} className="space-y-3">
            <SafeZoneCard zone={zone} />
            <div className="flex flex-wrap gap-2">
              <StatusBadge status={zone.status} />
              <button type="button" className="btn-safe min-h-10" onClick={async () => {
                try {
                  await safeZoneService.declare(zone._id, { status: 'Active', isPublic: true, disaster: form.disaster || zone.disaster?._id || zone.disaster });
                  setMessage(`${zone.name} declared active and published.`);
                  await load();
                } catch (error) {
                  setMessage(getErrorMessage(error));
                }
              }}>Declare safe / activate</button>
              <button type="button" className="btn-outline min-h-10" onClick={async () => {
                await safeZoneService.declare(zone._id, { status: 'Closed' });
                await load();
              }}>Close</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
