import { useState } from 'react';
import { Link } from 'react-router-dom';
import { donationService } from '../../services/donationService';
import { formatNPR, getErrorMessage } from '../../utils/helpers';
import EmptyState from '../../components/EmptyState';

export default function DonorRecommend() {
  const [amount, setAmount] = useState(10000);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const analyze = async (event) => {
    event.preventDefault();
    setBusy(true);
    setError('');
    try {
      const { data } = await donationService.recommend({ amountNPR: amount });
      setResult(data);
    } catch (err) {
      setError(getErrorMessage(err, 'Unable to analyse current shortages.'));
    } finally {
      setBusy(false);
    }
  };

  const card = (need, label) => (
    <article className="card-gov p-6">
      <p className="eyebrow text-teal-700">{label}</p>
      <h2 className="serif mt-2 text-2xl text-navy-900">{need.itemName}</h2>
      <p className="mt-1 text-ink-700">{need.camp?.name}</p>
      <p className="mt-3 text-sm">Priority: {need.priority}</p>
      <p className="mt-1 text-sm">Still needed: {need.projectedShortage || need.shortage} {need.unit || ''}</p>
      <Link className="btn-gold mt-5" to="/donor/donate/money">Support this need</Link>
    </article>
  );

  return (
    <div>
      <h1 className="serif text-3xl text-navy-900">What should I donate?</h1>
      <p className="mt-2 text-ink-700">Recommendations use published verified shortages, not hardcoded lists.</p>
      <form className="card-gov mt-8 max-w-xl p-6" onSubmit={analyze}>
        <label className="label-gov" htmlFor="have">I have</label>
        <input id="have" className="input-gov" type="number" min="1" value={amount} onChange={(e) => setAmount(e.target.value)} />
        {error ? <p className="mt-3 text-red-800">{error}</p> : null}
        <button className="btn-primary mt-5" type="submit" disabled={busy}>{busy ? 'Analysing…' : 'Show recommendations'}</button>
      </form>
      {result?.recommended ? (
        <div className="mt-8 grid gap-5 lg:grid-cols-3">
          {card(result.recommended, 'Recommended')}
          {(result.alternatives || []).map((need) => card(need, 'Alternative'))}
        </div>
      ) : result ? (
        <div className="mt-8">
          <EmptyState title="No verified shortages are currently published." body={result.reason}>
            <Link className="btn-outline" to="/donor/needs">Browse relief needs</Link>
          </EmptyState>
        </div>
      ) : null}
      {result?.reason && result.recommended ? <p className="mt-6 text-sm text-ink-700">{result.reason} Amount considered: {formatNPR(result.amountNPR)}.</p> : null}
    </div>
  );
}
