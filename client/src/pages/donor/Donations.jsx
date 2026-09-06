import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { donationService } from '../../services/donationService';
import StatusBadge from '../../components/StatusBadge';
import EmptyState from '../../components/EmptyState';
import { getErrorMessage } from '../../utils/helpers';

export default function DonorDonations() {
  const [rows, setRows] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    donationService.mine()
      .then(({ data }) => setRows(data.donations || []))
      .catch((err) => setError(getErrorMessage(err)));
  }, []);

  return (
    <div>
      <h1 className="serif text-3xl text-navy-900">My donations</h1>
      {error ? <p className="mt-4 text-red-800">{error}</p> : null}
      <div className="mt-8 space-y-4">
        {rows.length ? rows.map((row) => (
          <article key={row._id} className="card-gov p-6">
            <div className="flex justify-between gap-3">
              <div>
                <p className="font-mono text-xs">{row.donationId}</p>
                <p className="mt-1 text-xl font-semibold">{row.quantity} {row.itemName}</p>
                <p className="text-sm text-ink-500">{row.camp?.name}</p>
              </div>
              <StatusBadge status={row.status} />
            </div>
            {row.receivedQuantity ? <p className="mt-3 text-sm text-teal-700">Received: {row.receivedQuantity}</p> : null}
            <Link className="mt-4 inline-block text-sm text-navy-900" to={`/donor/donations/${row._id}`}>View tracking</Link>
          </article>
        )) : <EmptyState title="No donations yet." />}
      </div>
    </div>
  );
}
