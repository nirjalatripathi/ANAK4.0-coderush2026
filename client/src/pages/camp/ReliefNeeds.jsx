import { useEffect, useState } from 'react';
import { inventoryService } from '../../services/inventoryService';
import { reliefService } from '../../services/reliefService';
import { useAuth } from '../../hooks/useAuth';
import StatusBadge from '../../components/StatusBadge';
import EmptyState from '../../components/EmptyState';
import { INVENTORY_ITEMS } from '../../utils/constants';
import { getErrorMessage } from '../../utils/helpers';

export default function CampReliefNeeds() {
  const { campOfficial } = useAuth();
  const [needs, setNeeds] = useState([]);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [form, setForm] = useState({ itemName: 'Drinking Water', required: 10000, dailyConsumption: 1500, unit: 'L', notes: '' });
  const campId = campOfficial?.assignedCamp?._id || campOfficial?.assignedCamp;

  const load = () => inventoryService.needs().then(({ data }) => setNeeds(data.needs || []));

  useEffect(() => {
    load().catch((err) => setError(getErrorMessage(err)));
  }, []);

  return (
    <div>
      <h1 className="serif text-3xl text-navy-900">Relief needs</h1>
      <p className="mt-2 text-ink-500">Submit required stock and daily consumption. RAHAT calculates shortage, days of supply and priority.</p>
      <form
        className="card-gov mt-6 grid gap-3 p-6 md:grid-cols-2"
        onSubmit={async (e) => {
          e.preventDefault();
          try {
            const { data } = await reliefService.createRequest({ ...form, campId });
            setMessage(`Request ${data.request?.requestId} submitted. Priority: ${data.evaluation?.priority || data.request?.priority}.`);
            await load();
          } catch (err) {
            setMessage(getErrorMessage(err));
          }
        }}
      >
        <select className="select-gov" value={form.itemName} onChange={(e) => setForm({ ...form, itemName: e.target.value })}>
          {INVENTORY_ITEMS.map((item) => <option key={item}>{item}</option>)}
        </select>
        <input className="input-gov" type="number" placeholder="Required stock" value={form.required} onChange={(e) => setForm({ ...form, required: Number(e.target.value) })} />
        <input className="input-gov" type="number" placeholder="Daily consumption" value={form.dailyConsumption} onChange={(e) => setForm({ ...form, dailyConsumption: Number(e.target.value) })} />
        <input className="input-gov" placeholder="Unit" value={form.unit} onChange={(e) => setForm({ ...form, unit: e.target.value })} />
        <textarea className="textarea-gov md:col-span-2" rows="2" placeholder="Notes" value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
        <button className="btn-gold md:col-span-2" type="submit">Submit relief request</button>
      </form>
      {message ? <p className="mt-4">{message}</p> : null}
      {error ? <p className="text-red-800">{error}</p> : null}
      {needs.length === 0 ? <div className="mt-6"><EmptyState title="No published shortages." /></div> : null}
      <div className="mt-6 overflow-x-auto card-gov">
        <table className="table-gov">
          <thead><tr><th>Camp</th><th>Item</th><th>Available</th><th>Required</th><th>Shortage</th><th>Days</th><th>Priority</th></tr></thead>
          <tbody>
            {needs.map((need) => (
              <tr key={need._id}>
                <td>{need.camp?.name}</td>
                <td>{need.itemName}</td>
                <td className="font-mono">{need.available}</td>
                <td className="font-mono">{need.required}</td>
                <td className="font-mono">{need.projectedShortage || need.shortage}</td>
                <td className="font-mono">{need.daysOfSupply || '—'}</td>
                <td><StatusBadge status={need.priority} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
