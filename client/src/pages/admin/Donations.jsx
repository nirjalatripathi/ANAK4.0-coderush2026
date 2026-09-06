import { useEffect, useState } from 'react';
import { donationService } from '../../services/donationService';
import StatusBadge from '../../components/StatusBadge';
import { getErrorMessage } from '../../utils/helpers';

const nextByStatus = {
  Pledged: 'Confirmed',
  Confirmed: 'In Transit',
  'In Transit': 'Arrived',
  Arrived: 'Received',
};

export default function AdminDonations() {
  const [rows, setRows] = useState([]);
  const [message, setMessage] = useState('');

  const load = async () => {
    const { data } = await donationService.list();
    setRows(data.donations || []);
  };

  useEffect(() => { load().catch((err) => setMessage(getErrorMessage(err))); }, []);

  return (
    <div>
      <h1 className="serif text-3xl text-navy-900">Donations</h1>
      <p className="mt-2 text-ink-700">Status moves one step at a time. Receipt verification is done by the camp official and updates inventory from the received quantity.</p>
      {message ? <p className="mt-3">{message}</p> : null}
      <div className="card-gov mt-8 overflow-x-auto">
        <table className="table-gov">
          <thead>
            <tr>
              <th>Donation</th>
              <th>Camp / item</th>
              <th>Qty</th>
              <th>Status</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row._id}>
                <td>
                  <p className="font-semibold">{row.donorName}</p>
                  <p className="font-mono text-xs">{row.donationId}</p>
                </td>
                <td>{row.camp?.name}<br />{row.itemName}</td>
                <td className="font-mono">{row.quantity}</td>
                <td><StatusBadge status={row.status} /></td>
                <td>
                  {nextByStatus[row.status] ? (
                    <button
                      type="button"
                      className="btn-outline min-h-10"
                      onClick={async () => {
                        await donationService.updateStatus(row._id, nextByStatus[row.status]);
                        setMessage(`Donation moved to ${nextByStatus[row.status]}.`);
                        await load();
                      }}
                    >
                      Mark {nextByStatus[row.status]}
                    </button>
                  ) : '—'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
