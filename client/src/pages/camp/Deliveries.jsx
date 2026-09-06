import { useEffect, useState } from 'react';
import { donationService } from '../../services/donationService';
import { useAuth } from '../../hooks/useAuth';
import StatusBadge from '../../components/StatusBadge';
import { getErrorMessage } from '../../utils/helpers';

export default function CampDeliveries() {
  const { campOfficial } = useAuth();
  const campId = campOfficial?.assignedCamp?._id || campOfficial?.assignedCamp;
  const [donations, setDonations] = useState([]);
  const [deliveries, setDeliveries] = useState([]);
  const [qty, setQty] = useState({});
  const [message, setMessage] = useState('');

  const load = async () => {
    const [d, v] = await Promise.all([
      donationService.list({ campId }),
      donationService.deliveries({ campId }),
    ]);
    setDonations(d.data.donations || []);
    setDeliveries(v.data.deliveries || []);
  };

  useEffect(() => { if (campId) load().catch((err) => setMessage(getErrorMessage(err))); }, [campId]);

  return (
    <div>
      <h1 className="serif text-3xl text-navy-900">Delivery verification</h1>
      <p className="mt-2 text-ink-500">Record the quantity that actually arrived. Inventory updates from the received amount only.</p>
      {message ? <p className="mt-4">{message}</p> : null}
      <div className="mt-8 space-y-4">
        {donations.filter((d) => ['In Transit', 'Arrived', 'Pledged', 'Confirmed'].includes(d.status)).map((row) => (
          <article key={row._id} className="card-gov p-5">
            <div className="flex justify-between gap-3">
              <div>
                <p className="font-semibold">{row.quantity} {row.itemName}</p>
                <p className="font-mono text-xs">{row.donationId}</p>
              </div>
              <StatusBadge status={row.status} />
            </div>
            <div className="mt-4 flex flex-wrap gap-3">
              <input className="input-gov max-w-40" type="number" placeholder="Received qty" value={qty[row._id] ?? row.quantity} onChange={(e) => setQty({ ...qty, [row._id]: e.target.value })} />
              <button type="button" className="btn-safe" onClick={async () => {
                const { data } = await donationService.receive(row._id, {
                  expectedQuantity: row.quantity,
                  receivedQuantity: Number(qty[row._id] ?? row.quantity),
                });
                setMessage(data.discrepancy
                  ? `Discrepancy recorded: expected ${row.quantity}, received ${data.delivery.receivedQuantity}, difference ${data.discrepancy}.`
                  : `Received and posted to inventory. Remaining shortage ${data.impact?.remainingShortage}.`);
                await load();
              }}>Verify receipt</button>
            </div>
          </article>
        ))}
      </div>
      <h2 className="serif mt-12 text-2xl">Verified deliveries</h2>
      <div className="mt-4 space-y-3">
        {deliveries.map((row) => (
          <article key={row._id} className="card-gov p-4 text-sm">
            <p className="font-semibold">{row.donation?.donationId} · expected {row.expectedQuantity} · received {row.receivedQuantity}</p>
            {row.discrepancy ? <p className="text-red-800">Discrepancy: {row.discrepancy}</p> : <p className="text-teal-700">No discrepancy</p>}
          </article>
        ))}
      </div>
    </div>
  );
}
