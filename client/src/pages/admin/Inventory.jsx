import { useEffect, useState } from 'react';
import { campService } from '../../services/campService';
import { inventoryService } from '../../services/inventoryService';
import StatusBadge from '../../components/StatusBadge';
import Loading from '../../components/Loading';
import { getErrorMessage, shortage } from '../../utils/helpers';
import { INVENTORY_ITEMS } from '../../utils/constants';

export default function AdminInventory() {
  const [camps, setCamps] = useState([]);
  const [campId, setCampId] = useState('');
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState(null);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  // New item form state
  const [newItem, setNewItem] = useState({
    itemName: INVENTORY_ITEMS[0] || 'Rice',
    customName: '',
    current: 0,
    required: 0,
    unit: 'units',
  });
  const [submittingNew, setSubmittingNew] = useState(false);

  const loadCamps = async () => {
    try {
      const { data } = await campService.list();
      const campList = data.camps || [];
      setCamps(campList);
      if (campList.length && !campId) {
        setCampId(campList[0]._id);
      }
    } catch (err) {
      setError(getErrorMessage(err, 'Failed to load camps.'));
    } finally {
      setLoading(false);
    }
  };

  const loadInventory = async (targetCampId) => {
    if (!targetCampId) return;
    try {
      const { data } = await inventoryService.list(targetCampId);
      setItems(data.items || []);
    } catch (err) {
      setError(getErrorMessage(err, 'Failed to load camp inventory.'));
    }
  };

  useEffect(() => {
    loadCamps();
  }, []);

  useEffect(() => {
    if (campId) {
      setError('');
      setMessage('');
      loadInventory(campId);
    }
  }, [campId]);

  const handleFieldChange = (index, field, value) => {
    const next = [...items];
    next[index] = { ...next[index], [field]: Number(value) };
    setItems(next);
  };

  const handleSaveRow = async (item) => {
    setSavingId(item._id);
    setMessage('');
    setError('');
    try {
      await inventoryService.update(campId, {
        itemName: item.itemName,
        current: Number(item.current) || 0,
        required: Number(item.required) || 0,
        incoming: Number(item.incoming) || 0,
        distributed: Number(item.distributed) || 0,
        unit: item.unit || 'units',
      });
      setMessage(`Successfully updated ${item.itemName} for this camp. Verified shortage published.`);
      await loadInventory(campId);
    } catch (err) {
      setError(getErrorMessage(err, 'Failed to save inventory item.'));
    } finally {
      setSavingId(null);
    }
  };

  const handleAddNewItem = async (e) => {
    e.preventDefault();
    const finalItemName = newItem.itemName === 'Other' ? newItem.customName.trim() : newItem.itemName;
    if (!finalItemName) {
      setError('Please provide a valid item name.');
      return;
    }
    setSubmittingNew(true);
    setMessage('');
    setError('');
    try {
      await inventoryService.update(campId, {
        itemName: finalItemName,
        current: Number(newItem.current) || 0,
        required: Number(newItem.required) || 0,
        unit: newItem.unit || 'units',
      });
      setMessage(`Added ${finalItemName} to camp inventory. Shortages calculated and synchronized.`);
      setNewItem({
        itemName: INVENTORY_ITEMS[0] || 'Rice',
        customName: '',
        current: 0,
        required: 0,
        unit: 'units',
      });
      await loadInventory(campId);
    } catch (err) {
      setError(getErrorMessage(err, 'Failed to add new inventory item.'));
    } finally {
      setSubmittingNew(false);
    }
  };

  const handleSyncNeeds = async () => {
    if (!campId) return;
    setMessage('');
    setError('');
    try {
      await inventoryService.refresh(campId);
      setMessage('Camp relief shortages successfully recalculated and synced.');
      await loadInventory(campId);
    } catch (err) {
      setError(getErrorMessage(err, 'Failed to sync relief shortages.'));
    }
  };

  const selectedCamp = camps.find((c) => c._id === campId);

  if (loading) {
    return <div className="py-12"><Loading /></div>;
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="serif text-3xl text-navy-900">National inventory & shortage management</h1>
        <p className="mt-2 text-ink-700 max-w-3xl">
          View, update, and add camp supplies. Any shortages entered here (where required exceeds current stock)
          are automatically published and displayed on the public Verified Camp Shortages section in real time.
        </p>
      </div>

      {message && (
        <div className="rounded-lg bg-teal-50 border border-teal-200 px-4 py-3 text-sm text-teal-900 flex items-center justify-between">
          <span>✓ {message}</span>
          <button type="button" onClick={() => setMessage('')} className="text-teal-700 hover:text-teal-900 font-bold ml-4">✕</button>
        </div>
      )}

      {error && (
        <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-900 flex items-center justify-between">
          <span>⚠ {error}</span>
          <button type="button" onClick={() => setError('')} className="text-red-700 hover:text-red-900 font-bold ml-4">✕</button>
        </div>
      )}

      {/* Camp selector and action bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 card-gov p-4">
        <div className="flex flex-wrap items-center gap-3">
          <label htmlFor="camp-select" className="text-sm font-semibold text-navy-900 shrink-0">
            Select Relief Camp:
          </label>
          <select
            id="camp-select"
            className="select-gov min-w-[260px]"
            value={campId}
            onChange={(e) => setCampId(e.target.value)}
          >
            {camps.map((camp) => (
              <option key={camp._id} value={camp._id}>
                {camp.name} ({camp.district || 'Unassigned'})
              </option>
            ))}
          </select>
        </div>

        <button
          type="button"
          className="btn-outline text-sm min-h-10"
          onClick={handleSyncNeeds}
          title="Recalculate shortages and sync public needs"
        >
          ↻ Recalculate & Sync Shortages
        </button>
      </div>

      {/* Inventory table */}
      <div className="card-gov overflow-hidden">
        <div className="p-4 border-b border-line bg-navy-50 flex items-center justify-between">
          <div>
            <h2 className="font-semibold text-navy-900">
              Inventory for {selectedCamp?.name || 'Selected Camp'}
            </h2>
            <p className="text-xs text-ink-500">
              Update Available or Required stock and click Save. Shortages update automatically.
            </p>
          </div>
          <span className="text-xs font-mono text-ink-500">{items.length} items recorded</span>
        </div>

        <div className="table-wrap overflow-x-auto border-0 rounded-none">
          <table className="table-gov">
            <thead>
              <tr>
                <th>Item</th>
                <th>Available</th>
                <th>Required</th>
                <th>Calculated Shortage</th>
                <th>Priority</th>
                <th className="text-right">Action</th>
              </tr>
            </thead>
            <tbody>
              {items.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-8 text-ink-500">
                    No items registered for this camp yet. Use the form below to add supplies.
                  </td>
                </tr>
              ) : (
                items.map((item, index) => {
                  const currentShortage = shortage(item);
                  const isSaving = savingId === item._id;
                  return (
                    <tr key={item._id}>
                      <td className="font-medium text-navy-900">
                        {item.itemName}
                        {item.unit && <span className="text-xs text-ink-500 ml-1">({item.unit})</span>}
                      </td>
                      <td>
                        <input
                          type="number"
                          min="0"
                          className="input-gov w-28 py-1 px-2.5 text-sm"
                          value={item.current ?? 0}
                          onChange={(e) => handleFieldChange(index, 'current', e.target.value)}
                        />
                      </td>
                      <td>
                        <input
                          type="number"
                          min="0"
                          className="input-gov w-28 py-1 px-2.5 text-sm"
                          value={item.required ?? 0}
                          onChange={(e) => handleFieldChange(index, 'required', e.target.value)}
                        />
                      </td>
                      <td>
                        <span className={`font-mono font-semibold ${currentShortage > 0 ? 'text-red-700' : 'text-teal-700'}`}>
                          {currentShortage.toLocaleString()} {item.unit || ''}
                        </span>
                      </td>
                      <td>
                        <StatusBadge status={item.priority} />
                      </td>
                      <td className="text-right">
                        <button
                          type="button"
                          className="btn-safe text-xs min-h-9 px-3.5"
                          disabled={isSaving}
                          onClick={() => handleSaveRow(item)}
                        >
                          {isSaving ? 'Saving…' : 'Save'}
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add New Item / Shortage Form */}
      <div className="card-gov p-6 bg-white">
        <h2 className="serif text-xl text-navy-900 mb-1">Add or Update Camp Supply Item</h2>
        <p className="text-sm text-ink-700 mb-5">
          Enter supply quantities for <strong>{selectedCamp?.name || 'this camp'}</strong>. Setting Required higher than Available will publish a verified shortage.
        </p>

        <form onSubmit={handleAddNewItem} className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5 items-end">
          <div>
            <label className="label-gov" htmlFor="item-name">Item Name</label>
            <select
              id="item-name"
              className="select-gov text-sm"
              value={newItem.itemName}
              onChange={(e) => setNewItem({ ...newItem, itemName: e.target.value })}
            >
              {INVENTORY_ITEMS.map((name) => (
                <option key={name} value={name}>{name}</option>
              ))}
            </select>
          </div>

          {newItem.itemName === 'Other' && (
            <div>
              <label className="label-gov" htmlFor="custom-name">Custom Item Name</label>
              <input
                id="custom-name"
                type="text"
                required
                className="input-gov text-sm"
                placeholder="e.g. Tarpaulins"
                value={newItem.customName}
                onChange={(e) => setNewItem({ ...newItem, customName: e.target.value })}
              />
            </div>
          )}

          <div>
            <label className="label-gov" htmlFor="item-available">Available Stock</label>
            <input
              id="item-available"
              type="number"
              min="0"
              className="input-gov text-sm"
              value={newItem.current}
              onChange={(e) => setNewItem({ ...newItem, current: e.target.value })}
            />
          </div>

          <div>
            <label className="label-gov" htmlFor="item-required">Required Amount</label>
            <input
              id="item-required"
              type="number"
              min="0"
              className="input-gov text-sm"
              value={newItem.required}
              onChange={(e) => setNewItem({ ...newItem, required: e.target.value })}
            />
          </div>

          <div>
            <label className="label-gov" htmlFor="item-unit">Unit</label>
            <input
              id="item-unit"
              type="text"
              className="input-gov text-sm"
              placeholder="e.g. units, kg, L"
              value={newItem.unit}
              onChange={(e) => setNewItem({ ...newItem, unit: e.target.value })}
            />
          </div>

          <div>
            <button
              type="submit"
              className="btn-primary w-full min-h-[44px] text-sm"
              disabled={submittingNew}
            >
              {submittingNew ? 'Saving…' : 'Add / Save Item'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
