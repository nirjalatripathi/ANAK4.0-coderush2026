import { useState } from 'react';
import { Link } from 'react-router-dom';
import { donationService } from '../../services/donationService';
import { formatNPR, getErrorMessage } from '../../utils/helpers';
import EmptyState from '../../components/EmptyState';

const ESSENTIALS = [
  { itemName: 'Drinking Water', why: 'Clean water is the first stock camps run out of.', unit: 'L' },
  { itemName: 'Rice', why: 'Staple food for displaced families.', unit: 'kg' },
  { itemName: 'Medicines', why: 'Clinic kits empty faster than general supplies.', unit: 'kits' },
  { itemName: 'Blankets', why: 'Needed for overnight shelter and cold weather.', unit: 'pcs' },
  { itemName: 'Tents', why: 'Temporary shelter when camps are over capacity.', unit: 'pcs' },
  { itemName: 'Baby Food', why: 'Infants cannot wait on general food stock.', unit: 'packs' },
];

export default function DonorRecommend() {
  const [amount, setAmount] = useState(10000);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const analyze = async (nextAmount = amount) => {
    setBusy(true);
    setError('');
    try {
      const { data } = await donationService.recommend({ amountNPR: nextAmount });
      setResult(data);
    } catch (err) {
      setError(getErrorMessage(err, 'Unable to analyse current shortages.'));
    } finally {
      setBusy(false);
    }
  };

  const published = result?.highlyNecessary?.length
    ? result.highlyNecessary
    : result?.recommended
      ? [result.recommended, ...(result.alternatives || [])]
      : [];

  const items = !result ? [] : (published.length ? published : ESSENTIALS);

  return (
    <div>
      <h1 className="serif text-3xl text-navy-900">What should I donate?</h1>
      <p className="mt-2 text-ink-700">These are the highly necessary items camps need first.</p>
      <form
        className="card-gov mt-8 max-w-xl p-6"
        onSubmit={(event) => {
          event.preventDefault();
          analyze(amount);
        }}
      >
        <label className="label-gov" htmlFor="have">I have</label>
        <input id="have" className="input-gov" type="number" min="1" value={amount} onChange={(e) => setAmount(e.target.value)} />
        {error ? <p className="mt-3 text-red-800">{error}</p> : null}
        <button className="btn-primary mt-5" type="submit" disabled={busy}>{busy ? 'Analysing…' : 'Show recommendations'}</button>
      </form>

      {busy && !result ? <p className="mt-8 text-ink-700">Finding highly necessary items…</p> : null}

      {items.length ? (
        <div className="mt-8 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {items.map((need) => (
            <article key={`${need.itemName}-${need.camp?.name || need.why || 'item'}`} className="card-gov p-6">
              <p className="eyebrow text-teal-700">Highly necessary</p>
              <h2 className="serif mt-2 text-2xl text-navy-900">{need.itemName}</h2>
              {need.camp?.name ? <p className="mt-1 text-ink-700">{need.camp.name}</p> : null}
              <p className="mt-3 text-sm text-ink-700">{need.priorityReason || need.why || `${need.priority || 'High'} priority`}</p>
              {need.projectedShortage || need.shortage ? (
                <p className="mt-2 text-sm font-semibold text-navy-900">
                  Still needed: {need.projectedShortage || need.shortage} {need.unit || ''}
                </p>
              ) : null}
              <Link className="btn-gold mt-5" to="/donor/donate/supplies">Donate this item</Link>
            </article>
          ))}
        </div>
      ) : result ? (
        <div className="mt-8">
          <EmptyState title="No verified shortages are currently published." body={result.reason}>
            <Link className="btn-outline" to="/donor/needs">Browse relief needs</Link>
          </EmptyState>
        </div>
      ) : null}

      {result?.reason && published.length ? (
        <p className="mt-6 text-sm text-ink-700">{result.reason} Amount considered: {formatNPR(result.amountNPR)}.</p>
      ) : null}
    </div>
  );
}
