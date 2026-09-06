import { useEffect, useState } from 'react';
import { reliefService } from '../../services/reliefService';
import { donationService } from '../../services/donationService';
import { campService } from '../../services/campService';
import ShipmentCard from '../../components/ShipmentCard';
import { getErrorMessage } from '../../utils/helpers';

export default function AdminShipments() {
  const [shipments, setShipments] = useState([]);
  const [donations, setDonations] = useState([]);
  const [camps, setCamps] = useState([]);
  const [form, setForm] = useState({ donationId: '', camp: '', origin: 'Ward 6 warehouse', destination: 'Camp A', transportType: 'Truck' });
  const [receive, setReceive] = useState({ receivedQuantity: 4700, damagedQuantity: 0, missingQuantity: 300 });
  const [message, setMessage] = useState('');

  const load = async () => {
    const [ship, don, camp] = await Promise.all([reliefService.shipments(), donationService.list(), campService.list({ active: 'true' })]);
    setShipments(ship.data.shipments || []);
    setDonations(don.data.donations || []);
    setCamps(camp.data.camps || []);
    if (!form.donationId && don.data.donations?.[0]) setForm((prev) => ({ ...prev, donationId: don.data.donations[0]._id, camp: don.data.donations[0].camp?._id || '' }));
  };

  useEffect(() => { load().catch((err) => setMessage(getErrorMessage(err))); }, []);

  return (
    <div>
      <h1 className="serif text-3xl text-navy-900">Shipments</h1>
      <p className="mt-2 text-ink-500">Partial delivery increases inventory only by usable received quantity.</p>
      <form
        className="card-gov mt-6 grid gap-3 p-6 md:grid-cols-2"
        onSubmit={async (e) => {
          e.preventDefault();
          try {
            await reliefService.createShipment(form);
            setMessage('Shipment prepared.');
            await load();
          } catch (error) {
            setMessage(getErrorMessage(error));
          }
        }}
      >
        <select className="select-gov" value={form.donationId} onChange={(e) => setForm({ ...form, donationId: e.target.value })}>
          <option value="">Donation</option>
          {donations.map((row) => <option key={row._id} value={row._id}>{row.donationId} · {row.itemName}</option>)}
        </select>
        <select className="select-gov" value={form.camp} onChange={(e) => setForm({ ...form, camp: e.target.value })}>
          <option value="">Camp</option>
          {camps.map((camp) => <option key={camp._id} value={camp._id}>{camp.name}</option>)}
        </select>
        <input className="input-gov" placeholder="Origin" value={form.origin} onChange={(e) => setForm({ ...form, origin: e.target.value })} />
        <input className="input-gov" placeholder="Destination" value={form.destination} onChange={(e) => setForm({ ...form, destination: e.target.value })} />
        <button className="btn-gold md:col-span-2" type="submit">Create shipment</button>
      </form>
      {message ? <p className="mt-4">{message}</p> : null}
      <div className="mt-6 grid gap-4 lg:grid-cols-2">
        {shipments.map((shipment) => (
          <div key={shipment._id} className="space-y-3">
            <ShipmentCard shipment={shipment} />
            <div className="flex flex-wrap gap-2">
              <button type="button" className="btn-outline min-h-10" onClick={async () => { await reliefService.dispatchShipment(shipment._id); await load(); }}>Dispatch</button>
              <button type="button" className="btn-safe min-h-10" onClick={async () => {
                await reliefService.receiveShipment(shipment._id, receive);
                setMessage('Received usable quantity posted to inventory. Shortage recalculated.');
                await load();
              }}>Receive usable qty</button>
            </div>
          </div>
        ))}
      </div>
      <div className="card-gov mt-6 grid gap-3 p-6 md:grid-cols-3">
        <div><label className="label-gov">Received</label><input className="input-gov" type="number" value={receive.receivedQuantity} onChange={(e) => setReceive({ ...receive, receivedQuantity: Number(e.target.value) })} /></div>
        <div><label className="label-gov">Damaged</label><input className="input-gov" type="number" value={receive.damagedQuantity} onChange={(e) => setReceive({ ...receive, damagedQuantity: Number(e.target.value) })} /></div>
        <div><label className="label-gov">Missing</label><input className="input-gov" type="number" value={receive.missingQuantity} onChange={(e) => setReceive({ ...receive, missingQuantity: Number(e.target.value) })} /></div>
      </div>
    </div>
  );
}
