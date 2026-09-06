import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { khaltiService, npr, rememberKhaltiCheckout, victimService } from '../services/victimService';
import Loading from '../components/Loading';
import DonationSummary from '../components/DonationSummary';
import { formatNPR, getErrorMessage } from '../utils/helpers';
import { useAuth } from '../hooks/useAuth';

export default function VictimDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [victim, setVictim] = useState(null);
  const [amount, setAmount] = useState('');
  const [donorName, setDonorName] = useState(user?.fullName || '');
  const [donorEmail, setDonorEmail] = useState(user?.email || '');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    victimService.details(id)
      .then(({ data }) => {
        setVictim(data.victim);
        if (data.victim?.remainingNPR) setAmount(String(Math.min(500, data.victim.remainingNPR)));
      })
      .catch((err) => setError(getErrorMessage(err)));
  }, [id]);

  if (!victim && !error) return <div className="page-wrap"><Loading /></div>;
  if (!victim) return <div className="page-wrap"><p className="text-red-800" role="alert">{error}</p></div>;

  const funded = victim.remainingNPR <= 0;
  const selected = Number(amount);
  const amountValid = Number.isFinite(selected) && selected >= 10 && selected <= victim.remainingNPR;

  const pay = async (event) => {
    event.preventDefault();
    if (busy || !amountValid) return;
    setBusy(true);
    setError('');
    try {
      const { data } = await khaltiService.initiate({
        victimId: victim.id,
        amountNPR: selected,
        donorName,
        donorEmail,
      });
      rememberKhaltiCheckout(data.payment, {
        donationId: data.donationId,
        amountNPR: selected,
        purpose: `Support for ${victim.displayName}`,
      });
      navigate('/donate/khalti/checkout');
    } catch (err) {
      setError(getErrorMessage(err, 'Unable to start Khalti checkout.'));
      setBusy(false);
    }
  };

  return (
    <div className="page-wrap overflow-x-hidden">
      <Link to="/victims" className="text-sm font-medium text-teal-700 no-underline">← All verified people</Link>
      <div className="mt-6 grid gap-8 lg:grid-cols-[1.15fr_0.85fr]">
        <article className="overflow-hidden rounded-2xl border border-line bg-white shadow-sm">
          <img src={victim.photoUrl} alt="" className="h-72 w-full object-cover" />
          <div className="p-6 sm:p-8">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-teal-700">{victim.category} · {victim.applicationId}</p>
            <h1 className="serif mt-3 text-4xl text-navy-900">{victim.displayName}</h1>
            <p className="mt-2 text-ink-500">{victim.municipality}, {victim.district}{victim.ward ? ` · Ward ${victim.ward}` : ''} · {victim.householdSize} in household</p>
            <p className="mt-6 leading-8 text-ink-700">{victim.story}</p>
            <div className="mt-8">
              <div className="progress-track">
                <div className="progress-fill" style={{ width: `${victim.percentRaised}%` }} />
              </div>
              <p className="mt-3 font-semibold text-navy-900">{npr(victim.amountRaisedNPR)} of {npr(victim.amountNeededNPR)}</p>
              <p className="text-sm text-ink-500">{npr(victim.remainingNPR)} still needed</p>
            </div>
          </div>
        </article>

        <aside className="card-gov h-fit p-6 sm:p-8">
          <h2 className="text-2xl font-semibold text-navy-900">{funded ? 'This request is funded' : 'Relief donation'}</h2>
          <p className="mt-2 text-sm text-ink-700">
            You will leave RAHAT and confirm payment on the official Khalti page. RAHAT does not collect Khalti passwords, MPIN, or OTP.
          </p>
          {funded ? (
            <Link className="btn-outline mt-6 w-full" to="/victims">Support someone else</Link>
          ) : (
            <form className="mt-6 grid gap-4" onSubmit={pay}>
              <div>
                <label className="label-gov" htmlFor="victim-donor-name">Your name</label>
                <input id="victim-donor-name" className="input-gov" value={donorName} onChange={(e) => setDonorName(e.target.value)} required />
              </div>
              <div>
                <label className="label-gov" htmlFor="victim-donor-email">Email</label>
                <input id="victim-donor-email" className="input-gov" type="email" value={donorEmail} onChange={(e) => setDonorEmail(e.target.value)} />
              </div>
              <div>
                <label className="label-gov" htmlFor="victim-amount">Amount (NPR)</label>
                <input id="victim-amount" className="input-gov" type="number" min="10" step="0.01" max={victim.remainingNPR} value={amount} onChange={(e) => setAmount(e.target.value)} required />
              </div>
              <DonationSummary
                camp={`${victim.municipality}, ${victim.district}`}
                item={victim.displayName}
                amount={amountValid ? selected : 0}
              />
              {error ? <p className="text-red-800" role="alert">{error}</p> : null}
              <button className="btn-khalti w-full" type="submit" disabled={busy || !amountValid} aria-busy={busy}>
                {busy ? 'Connecting to Khalti...' : error ? 'Try again' : `Pay ${formatNPR(amountValid ? selected : 0)} with Khalti`}
              </button>
              <p className="text-center text-sm text-ink-500">Secure payment through Khalti</p>
            </form>
          )}
        </aside>
      </div>
    </div>
  );
}
