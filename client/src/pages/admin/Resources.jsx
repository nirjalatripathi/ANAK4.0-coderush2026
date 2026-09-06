import { useEffect, useState } from 'react';
import { resourceService } from '../../services/resourceService';
import StatCard from '../../components/StatCard';
import StatusBadge from '../../components/StatusBadge';
import { getErrorMessage } from '../../utils/helpers';

export default function AdminResources() {
  const [resources, setResources] = useState([]);
  const [readiness, setReadiness] = useState(null);
  const [warehouses, setWarehouses] = useState([]);
  const [message, setMessage] = useState('');
  const [form, setForm] = useState({ name: '', type: 'Ambulance', ward: '6', availability: 'Available', location: '' });

  const load = async () => {
    const [res, ready] = await Promise.all([resourceService.list(), resourceService.readiness()]);
    setResources(res.data.resources || []);
    setReadiness(ready.data.readiness);
    setWarehouses(ready.data.warehouses || []);
  };

  useEffect(() => { load().catch((err) => setMessage(getErrorMessage(err))); }, []);

  return (
    <div>
      <h1 className="serif text-3xl text-navy-900">Local response resources</h1>
      {readiness ? (
        <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard label="Safe zones" value={readiness.safeZones} tone="green" />
          <StatCard label="Shelter capacity" value={readiness.shelterCapacity} />
          <StatCard label="Medical preparedness" value={`${readiness.medicalPreparedness}%`} tone="amber" />
          <StatCard label="Transport availability" value={`${readiness.transportAvailability}%`} />
        </div>
      ) : null}
      <form
        className="card-gov mt-6 grid gap-3 p-6 md:grid-cols-2"
        onSubmit={async (e) => {
          e.preventDefault();
          try {
            await resourceService.create(form);
            setMessage('Resource recorded.');
            await load();
          } catch (error) {
            setMessage(getErrorMessage(error));
          }
        }}
      >
        <input className="input-gov" placeholder="Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
        <select className="select-gov" value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}>
          <option>Ambulance</option><option>Hospital</option><option>Fire service</option><option>Police station</option><option>Health post</option><option>Rescue team</option>
        </select>
        <input className="input-gov" placeholder="Ward" value={form.ward} onChange={(e) => setForm({ ...form, ward: e.target.value })} />
        <select className="select-gov" value={form.availability} onChange={(e) => setForm({ ...form, availability: e.target.value })}>
          <option>Available</option><option>Busy</option><option>Unavailable</option><option>Emergency Only</option>
        </select>
        <button className="btn-gold md:col-span-2" type="submit">Register resource</button>
      </form>
      {message ? <p className="mt-4">{message}</p> : null}
      <div className="mt-6 overflow-x-auto card-gov">
        <table className="table-gov">
          <thead><tr><th>Resource</th><th>Type</th><th>Ward</th><th>Availability</th></tr></thead>
          <tbody>
            {resources.map((row) => (
              <tr key={row._id}>
                <td>{row.name}</td>
                <td>{row.type}</td>
                <td>{row.ward}</td>
                <td><StatusBadge status={row.availability} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <h2 className="serif mt-10 text-2xl">Pre-positioned stock</h2>
      <div className="mt-4 grid gap-4 md:grid-cols-2">
        {warehouses.map((warehouse) => (
          <article key={warehouse._id} className="card-gov p-5">
            <h3 className="font-semibold">{warehouse.name}</h3>
            <ul className="mt-2 text-sm text-ink-700">
              {(warehouse.stock || []).map((item) => <li key={item.itemName}>{item.itemName}: {item.quantity} {item.unit}</li>)}
            </ul>
          </article>
        ))}
      </div>
    </div>
  );
}
