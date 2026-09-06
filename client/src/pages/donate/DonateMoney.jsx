import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { donationConfig } from '../../config/donationConfig';
import { INVENTORY_ITEMS } from '../../utils/constants';
import { useAuth } from '../../hooks/useAuth';
import { formatNPR, getErrorMessage } from '../../utils/helpers';
import { khaltiService, rememberKhaltiCheckout } from '../../services/victimService';
import { campService } from '../../services/campService';
import DonationSummary from '../../components/DonationSummary';

export default function DonateMoney() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [amount, setAmount] = useState(500);
  const [custom, setCustom] = useState('');
  const [camps, setCamps] = useState([]);
  const [form, setForm] = useState({
    donorName: user?.fullName || '',
    donorEmail: user?.email || '',
    purpose: 'Highest Priority Need',
    message: '',
    camp: '',
    itemName: '',
  });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    campService.list({ active: 'true' })
      .then(({ data }) => setCamps(data.camps || data || []))
      .catch(() => setCamps([]));
  }, []);

  const selected = custom ? Number(custom) : amount;
  const amountValid = Number.isFinite(selected) && selected >= 10;
  const selectedCamp = camps.find((camp) => String(camp._id) === form.camp);
  const campLabel = selectedCamp
    ? `${selectedCamp.name}${selectedCamp.district ? ` — ${selectedCamp.district}` : ''}`
    : 'Highest priority verified need';

  const submit = async (event) => {
    event.preventDefault();
    if (busy || !amountValid) return;
    setBusy(true);
    setError('');
    try {
      const { data } = await khaltiService.initiate({
        amountNPR: selected,
        donorName: form.donorName,
        donorEmail: form.donorEmail,
        purpose: form.purpose,
        message: form.message,
        category: form.purpose,
        camp: form.camp || undefined,
        itemName: form.itemName || undefined,
      });
      rememberKhaltiCheckout(data.payment, {
        donationId: data.donationId,
        amountNPR: selected,
        purpose: form.purpose,
      });
      navigate('/donate/khalti/checkout');
    } catch (err) {
      setError(getErrorMessage(err, 'Unable to start Khalti checkout.'));
      setBusy(false);
    }
  };

  return (
    <div className="page-wrap max-w-3xl overflow-x-hidden">
      <p className="eyebrow text-gold-700">Relief donation</p>
      <h1 className="serif mt-3 text-4xl text-navy-900">Contribute financially</h1>
      <p className="mt-3 text-ink-700">
        RAHAT records your donation, then you continue on the official Khalti page to confirm payment.
        Completing payment does not mean relief goods have been received at a camp.
      </p>

      <form className="card-gov mt-8 p-6 md:p-8" onSubmit={submit}>
        <fieldset>
          <legend className="label-gov">Donation amount</legend>
          <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-4">
            {donationConfig.presetAmounts.map((value) => (
              <button
                key={value}
                type="button"
                className={selected === value && !custom ? 'btn-gold' : 'btn-outline'}
                onClick={() => { setAmount(value); setCustom(''); }}
              >
                {formatNPR(value)}
              </button>
            ))}
          </div>
          <label className="label-gov mt-5" htmlFor="custom-amount">Custom amount</label>
          <input
            id="custom-amount"
            className="input-gov"
            type="number"
            min="10"
            step="0.01"
            placeholder="Enter NPR amount"
            value={custom}
            onChange={(e) => setCustom(e.target.value)}
          />
        </fieldset>

        <label className="label-gov mt-5" htmlFor="camp">Camp</label>
        <select id="camp" className="select-gov" value={form.camp} onChange={(e) => setForm({ ...form, camp: e.target.value })}>
          <option value="">Highest priority verified need</option>
          {camps.map((camp) => (
            <option key={camp._id} value={camp._id}>
              {camp.name}{camp.district ? ` — ${camp.district}` : ''}
            </option>
          ))}
        </select>

        <label className="label-gov mt-4" htmlFor="item">Relief item</label>
        <select id="item" className="select-gov" value={form.itemName} onChange={(e) => setForm({ ...form, itemName: e.target.value })}>
          <option value="">General financial support</option>
          {INVENTORY_ITEMS.map((item) => <option key={item} value={item}>{item}</option>)}
        </select>

        <label className="label-gov mt-5" htmlFor="donor-name">Name</label>
        <input id="donor-name" className="input-gov" value={form.donorName} onChange={(e) => setForm({ ...form, donorName: e.target.value })} required />
        <label className="label-gov mt-4" htmlFor="donor-email">Email</label>
        <input id="donor-email" type="email" className="input-gov" value={form.donorEmail} onChange={(e) => setForm({ ...form, donorEmail: e.target.value })} />
        <label className="label-gov mt-4" htmlFor="purpose">Choose where your donation goes</label>
        <select id="purpose" className="select-gov" value={form.purpose} onChange={(e) => setForm({ ...form, purpose: e.target.value })}>
          {donationConfig.categories.map((item) => <option key={item}>{item}</option>)}
        </select>
        <label className="label-gov mt-4" htmlFor="message">Optional message</label>
        <textarea id="message" className="textarea-gov" rows="3" value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} />

        <DonationSummary
          camp={campLabel}
          item={form.itemName || form.purpose}
          amount={amountValid ? selected : 0}
        />

        {error ? <p className="mt-4 text-red-800" role="alert">{error}</p> : null}
        <button className="btn-khalti mt-6 w-full" type="submit" disabled={busy || !amountValid} aria-busy={busy}>
          {busy ? 'Connecting to Khalti...' : error ? `Try again — Pay ${formatNPR(selected || 0)} with Khalti` : `Pay ${formatNPR(selected || 0)} with Khalti`}
        </button>
        <p className="mt-3 text-center text-sm text-ink-500">Secure payment through Khalti. You will leave RAHAT to confirm on Khalti.</p>
        <Link className="btn-outline mt-3 w-full" to="/donate">Back to donation options</Link>
      </form>
    </div>
  );
}
