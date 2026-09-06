import { useEffect, useState } from 'react';
import { campService } from '../../services/campService';
import { inventoryService } from '../../services/inventoryService';
import StatusBadge from '../../components/StatusBadge';
import { getErrorMessage, shortage } from '../../utils/helpers';

export default function AdminInventory() {
  const [camps, setCamps] = useState([]);
  const [campId, setCampId] = useState('');
  const [items, setItems] = useState([]);
  const [message, setMessage] = useState('');

  useEffect(() => {
    campService.list().then(({ data }) => {
      setCamps(data.camps || []);
      if (data.camps?.[0]) setCampId(data.camps[0]._id);
    }).catch((err) => setMessage(getErrorMessage(err)));
  }, []);

  useEffect(() => {
    if (!campId) return;
    inventoryService.list(campId).then(({ data }) => setItems(data.items || [])).catch((err) => setMessage(getErrorMessage(err)));
  }, [campId]);

  return (
    <div>
      <h1 className="serif text-3xl text-navy-900">National inventory view</h1>
      <select className="select-gov mt-4 max-w-md" value={campId} onChange={(e) => setCampId(e.target.value)}>
        {camps.map((camp) => <option key={camp._id} value={camp._id}>{camp.name}</option>)}
      </select>
      <div className="mt-6 overflow-x-auto card-gov">
        <table className="table-gov">
          <thead><tr><th>Item</th><th>Current</th><th>Required</th><th>Shortage</th><th>Priority</th></tr></thead>
          <tbody>
            {items.map((item) => (
              <tr key={item._id}>
                <td>{item.itemName}</td>
                <td className="font-mono">{item.current}</td>
                <td className="font-mono">{item.required}</td>
                <td className="font-mono">{item.shortage ?? shortage(item)}</td>
                <td><StatusBadge status={item.priority} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {message ? <p className="mt-4">{message}</p> : null}
    </div>
  );
}
