import { useEffect, useState } from 'react';
import { reliefService } from '../../services/reliefService';
import { donationService } from '../../services/donationService';
import { useAuth } from '../../hooks/useAuth';
import ReliefNeedCard from '../../components/ReliefNeedCard';
import EmptyState from '../../components/EmptyState';
import { getErrorMessage } from '../../utils/helpers';

export default function DonorNeeds() {
  const { user } = useAuth();
  const [needs, setNeeds] = useState([]);
  const [selected, setSelected] = useState(null);
  const [quantity, setQuantity] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    reliefService.needs()
      .then(({ data }) => setNeeds(data.needs || []))
      .catch((err) => setError(getErrorMessage(err)));
  }, []);

  const pledge = async (event) => {
    event.preventDefault();
    setMessage('');
    try {
      const { data } = await donationService.pledge({
        camp: selected.camp?._id || selected.camp,
        itemName: selected.itemName,
        quantity: Number(quantity),
        donorName: user?.fullName,
      });
      setMessage(`Pledge ${data.donation?.donationId} recorded${data.warning ? `. ${data.warning}` : '.'}`);
      setSelected(null);
      setQuantity('');
    } catch (err) {
      setMessage(getErrorMessage(err, 'Unable to record this pledge.'));
    }
  };

  return (
    <div>
      <h1 className="serif text-3xl text-navy-900">Verified relief needs</h1>
      <p className="mt-2 text-ink-500">Select a shortage, then pledge the quantity you can deliver.</p>
      {error ? <p className="mt-4 text-red-800">{error}</p> : null}
      {message ? <p className="mt-4">{message}</p> : null}
      {!needs.length ? <div className="mt-8"><EmptyState title="No active relief needs are currently registered." /></div> : null}
      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        {needs.map((need) => (
          <ReliefNeedCard key={need._id} need={need} onSelect={setSelected} />
        ))}
      </div>
      {selected ? (
        <form className="card-gov mt-10 max-w-xl p-6" onSubmit={pledge}>
          <h2 className="serif text-2xl">Pledge to {selected.itemName}</h2>
          <p className="mt-2 text-sm text-ink-500">
            {selected.camp?.name} · shortage {selected.projectedShortage || selected.shortage} {selected.unit || ''}
          </p>
          <label className="label-gov mt-5">Quantity</label>
          <input className="input-gov" type="number" min="1" value={quantity} onChange={(e) => setQuantity(e.target.value)} required />
          <div className="mt-5 flex gap-3">
            <button className="btn-gold" type="submit">Record pledge</button>
            <button className="btn-outline" type="button" onClick={() => setSelected(null)}>Cancel</button>
          </div>
        </form>
      ) : null}
    </div>
  );
}
