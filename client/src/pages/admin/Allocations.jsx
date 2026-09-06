import { useEffect, useState } from 'react';
import { reliefService } from '../../services/reliefService';
import { INVENTORY_ITEMS } from '../../utils/constants';
import StatusBadge from '../../components/StatusBadge';
import { getErrorMessage } from '../../utils/helpers';

export default function AdminAllocations() {
  const [itemName, setItemName] = useState('Drinking Water');
  const [availableQuantity, setAvailableQuantity] = useState(10000);
  const [rows, setRows] = useState([]);
  const [message, setMessage] = useState('');

  const load = async () => {
    const { data } = await reliefService.allocations();
    setRows(data.allocations || []);
  };

  useEffect(() => { load().catch((err) => setMessage(getErrorMessage(err))); }, []);

  return (
    <div>
      <h1 className="serif text-3xl text-navy-900">Relief allocation</h1>
      <p className="mt-2 text-ink-500">Recommended shares follow verified priority and shortage. Confirm before dispatch.</p>
      <form
        className="card-gov mt-6 grid gap-3 p-6 md:grid-cols-3"
        onSubmit={async (e) => {
          e.preventDefault();
          try {
            await reliefService.recommendAllocation({ itemName, availableQuantity: Number(availableQuantity) });
            setMessage('Recommended allocation created from current verified needs.');
            await load();
          } catch (error) {
            setMessage(getErrorMessage(error));
          }
        }}
      >
        <select className="select-gov" value={itemName} onChange={(e) => setItemName(e.target.value)}>
          {INVENTORY_ITEMS.map((item) => <option key={item}>{item}</option>)}
        </select>
        <input className="input-gov" type="number" min="1" value={availableQuantity} onChange={(e) => setAvailableQuantity(e.target.value)} />
        <button className="btn-gold" type="submit">Recommend allocation</button>
      </form>
      {message ? <p className="mt-4">{message}</p> : null}
      <div className="mt-6 space-y-4">
        {rows.map((row) => (
          <article key={row._id} className="card-gov p-5">
            <div className="flex justify-between gap-3">
              <p className="font-semibold">{row.allocationId} · {row.itemName}</p>
              <StatusBadge status={row.status} />
            </div>
            <ul className="mt-3 space-y-1 text-sm">
              {(row.lines || []).map((line, index) => (
                <li key={index}>{line.camp?.name || 'Camp'} → {line.quantity} · {line.reason}</li>
              ))}
            </ul>
            {row.status !== 'Confirmed' ? (
              <button type="button" className="btn-safe mt-4" onClick={async () => {
                await reliefService.confirmAllocation(row._id);
                await load();
              }}>Confirm allocation</button>
            ) : null}
          </article>
        ))}
      </div>
    </div>
  );
}
