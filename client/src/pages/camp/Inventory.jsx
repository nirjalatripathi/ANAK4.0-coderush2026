import { useEffect, useState } from 'react';
import { inventoryService } from '../../services/inventoryService';
import { useAuth } from '../../hooks/useAuth';
import StatusBadge from '../../components/StatusBadge';
import Loading from '../../components/Loading';
import { getErrorMessage, shortage } from '../../utils/helpers';

export default function CampInventory() {
  const { campOfficial } = useAuth();
  const [items, setItems] = useState([]);
  const [message, setMessage] = useState('');
  const campId = campOfficial?.assignedCamp?._id || campOfficial?.assignedCamp;

  const load = async () => {
    if (!campId) return;
    const { data } = await inventoryService.list(campId);
    setItems(data.items || []);
  };

  useEffect(() => { load().catch((err) => setMessage(getErrorMessage(err))); }, [campId]);

  if (!campId) return <Loading />;

  return (
    <div>
      <h1 className="serif text-3xl text-navy-900">Camp inventory</h1>
      <p className="mt-2 text-ink-700">Shortage is calculated as required minus current. Priority updates automatically when you save.</p>
      <div className="mt-6 overflow-x-auto card-gov">
        <table className="table-gov">
          <thead><tr><th>Item</th><th>Current</th><th>Required</th><th>Incoming</th><th>Distributed</th><th>Shortage</th><th>Priority</th><th></th></tr></thead>
          <tbody>
            {items.map((item, index) => (
              <tr key={item._id}>
                <td>{item.itemName}</td>
                {['current', 'required', 'incoming', 'distributed'].map((field) => (
                  <td key={field}>
                    <input
                      className="input-gov w-24"
                      type="number"
                      min="0"
                      value={item[field]}
                      onChange={(e) => {
                        const next = [...items];
                        next[index] = { ...item, [field]: Number(e.target.value) };
                        setItems(next);
                      }}
                    />
                  </td>
                ))}
                <td className="font-mono">{shortage(item)}</td>
                <td><StatusBadge status={item.priority} /></td>
                <td>
                  <button
                    className="btn-outline min-h-10"
                    type="button"
                    onClick={async () => {
                      try {
                        await inventoryService.update(campId, item);
                        setMessage(`${item.itemName} updated.`);
                        await load();
                      } catch (error) {
                        setMessage(getErrorMessage(error));
                      }
                    }}
                  >Save</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {message ? <p className="mt-4">{message}</p> : null}
    </div>
  );
}
