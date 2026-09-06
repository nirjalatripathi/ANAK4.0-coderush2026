import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { donationService } from '../../services/donationService';
import StatusBadge from '../../components/StatusBadge';
import Loading from '../../components/Loading';
import { getErrorMessage } from '../../utils/helpers';

const steps = ['Pledged', 'Confirmed', 'In Transit', 'Arrived', 'Received', 'In Inventory', 'Distributed'];

export default function DonorDonationDetail() {
  const { id } = useParams();
  const [row, setRow] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    donationService.mine()
      .then(({ data }) => {
        const found = (data.donations || []).find((item) => item._id === id || item.donationId === id);
        setRow(found || null);
        if (!found) setError('Donation not found.');
      })
      .catch((err) => setError(getErrorMessage(err)));
  }, [id]);

  if (error) return <p className="text-red-800">{error}</p>;
  if (!row) return <Loading />;

  const currentIndex = steps.findIndex((step) => step === row.status);
  const remaining = Math.max(0, (row.quantity || 0) - (row.distributedQuantity || 0));

  return (
    <div>
      <p className="font-mono text-xs text-ink-500">{row.donationId}</p>
      <h1 className="serif mt-2 text-3xl text-navy-900">{row.quantity} {row.itemName}</h1>
      <p className="mt-2 text-ink-500">{row.camp?.name}</p>
      <div className="mt-4"><StatusBadge status={row.status} /></div>
      <ol className="mt-10 space-y-3">
        {steps.map((step, index) => (
          <li key={step} className="card-gov flex items-center justify-between p-4">
            <span>{step}</span>
            <span className={index <= currentIndex ? 'text-teal-700' : 'text-ink-500'}>
              {index <= currentIndex ? 'Recorded' : 'Pending'}
            </span>
          </li>
        ))}
      </ol>
      {row.receivedQuantity != null ? (
        <div className="card-gov mt-8 p-6">
          <p>Received: {row.receivedQuantity}</p>
          <p className="mt-2">Distributed: {row.distributedQuantity || 0}</p>
          <p className="mt-2">Remaining: {remaining}</p>
        </div>
      ) : null}
    </div>
  );
}
