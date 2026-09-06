import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { INVENTORY_ITEMS } from '../../utils/constants';
import { donationService } from '../../services/donationService';
import { campService } from '../../services/campService';
import { useAuth } from '../../hooks/useAuth';
import { getErrorMessage } from '../../utils/helpers';

const UNITS = ['units', 'L', 'kg', 'packs', 'kits'];

export default function DonateSupplies() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [camps, setCamps] = useState([]);
  const [match, setMatch] = useState(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState({
    itemName: 'Drinking Water',
    quantity: 50,
    unit: 'units',
    condition: 'New',
    availableDate: '',
    deliveryMethod: 'Drop-off',
    camp: '',
    donorName: user?.fullName || '',
    donorEmail: user?.email || '',
    excessOverride: false,
  });

  useEffect(() => {
    campService.list().then(({ data }) => setCamps(data.camps || data || [])).catch(() => {});
  }, []);

  const set = (key) => (event) => setForm((prev) => ({ ...prev, [key]: event.target.value }));

  const checkMatch = async () => {
    setBusy(true);
    setError('');
    try {
      const { data } = await donationService.recommend({ itemName: form.itemName, quantity: form.quantity });
      setMatch(data);
      setStep(5);
    } catch (err) {
      setError(getErrorMessage(err, 'Unable to check current demand.'));
    } finally {
      setBusy(false);
    }
  };

  const submit = async (anyway = false) => {
    setBusy(true);
    setError('');
    try {
      const { data } = await donationService.donatePhysical({
        ...form,
        quantity: Number(form.quantity),
        camp: form.camp || undefined,
        excessOverride: anyway || form.excessOverride,
      });
      navigate(`/donor/donations/${data.donation._id}`, { replace: true, state: { justCreated: data.donation.donationId } });
    } catch (err) {
      setError(getErrorMessage(err, 'Unable to register this supply donation.'));
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="max-w-2xl">
      <p className="eyebrow text-teal-700">Physical relief</p>
      <h1 className="serif mt-3 text-4xl text-navy-900">Donate supplies</h1>
      <p className="mt-3 text-ink-700">RAHAT checks current verified demand before accepting a pledge.</p>

      {step === 1 ? (
        <div className="card-gov mt-8 p-6">
          <h2 className="serif text-2xl">What are you donating?</h2>
          <label className="label-gov mt-5" htmlFor="item">Item</label>
          <select id="item" className="select-gov" value={form.itemName} onChange={set('itemName')}>
            {INVENTORY_ITEMS.map((item) => <option key={item}>{item}</option>)}
          </select>
          <button className="btn-primary mt-6" type="button" onClick={() => setStep(2)}>Continue</button>
        </div>
      ) : null}

      {step === 2 ? (
        <div className="card-gov mt-8 p-6">
          <h2 className="serif text-2xl">How much?</h2>
          <label className="label-gov mt-5" htmlFor="qty">Quantity</label>
          <input id="qty" className="input-gov" type="number" min="1" value={form.quantity} onChange={set('quantity')} />
          <label className="label-gov mt-4" htmlFor="unit">Unit</label>
          <select id="unit" className="select-gov" value={form.unit} onChange={set('unit')}>
            {UNITS.map((unit) => <option key={unit}>{unit}</option>)}
          </select>
          <label className="label-gov mt-4" htmlFor="condition">Condition</label>
          <select id="condition" className="select-gov" value={form.condition} onChange={set('condition')}>
            <option>New</option>
            <option>Gently used</option>
            <option>Packaged</option>
          </select>
          <div className="mt-6 flex gap-3">
            <button className="btn-outline" type="button" onClick={() => setStep(1)}>Back</button>
            <button className="btn-primary" type="button" onClick={() => setStep(3)}>Continue</button>
          </div>
        </div>
      ) : null}

      {step === 3 ? (
        <div className="card-gov mt-8 p-6">
          <h2 className="serif text-2xl">Where can you provide it?</h2>
          <label className="label-gov mt-5" htmlFor="method">Pickup or drop-off</label>
          <select id="method" className="select-gov" value={form.deliveryMethod} onChange={set('deliveryMethod')}>
            <option>Drop-off</option>
            <option>Pickup</option>
          </select>
          <label className="label-gov mt-4" htmlFor="date">Available date</label>
          <input id="date" type="date" className="input-gov" value={form.availableDate} onChange={set('availableDate')} />
          <label className="label-gov mt-4" htmlFor="camp">Preferred relief center (optional)</label>
          <select id="camp" className="select-gov" value={form.camp} onChange={set('camp')}>
            <option value="">Let RAHAT match a verified need</option>
            {camps.map((camp) => <option key={camp._id} value={camp._id}>{camp.name}</option>)}
          </select>
          <div className="mt-6 flex gap-3">
            <button className="btn-outline" type="button" onClick={() => setStep(2)}>Back</button>
            <button className="btn-primary" type="button" onClick={() => setStep(4)}>Continue</button>
          </div>
        </div>
      ) : null}

      {step === 4 ? (
        <div className="card-gov mt-8 p-6">
          <h2 className="serif text-2xl">Contact details</h2>
          <label className="label-gov mt-5" htmlFor="name">Name</label>
          <input id="name" className="input-gov" value={form.donorName} onChange={set('donorName')} required />
          <label className="label-gov mt-4" htmlFor="email">Email</label>
          <input id="email" type="email" className="input-gov" value={form.donorEmail} onChange={set('donorEmail')} />
          {error ? <p className="mt-4 text-red-800">{error}</p> : null}
          <div className="mt-6 flex gap-3">
            <button className="btn-outline" type="button" onClick={() => setStep(3)}>Back</button>
            <button className="btn-gold" type="button" disabled={busy} onClick={checkMatch}>{busy ? 'Checking demand…' : 'Check current need'}</button>
          </div>
        </div>
      ) : null}

      {step === 5 && match ? (
        <div className="card-gov mt-8 p-6">
          <h2 className="serif text-2xl">{match.oversupplied ? 'This item is currently sufficiently supplied' : 'Your donation can help'}</h2>
          <dl className="mt-5 grid gap-3 sm:grid-cols-2">
            <div><dt className="text-xs uppercase text-ink-500">Current demand</dt><dd className="text-xl font-semibold">{match.demand}</dd></div>
            <div><dt className="text-xs uppercase text-ink-500">Available</dt><dd className="text-xl font-semibold">{match.available}</dd></div>
            <div><dt className="text-xs uppercase text-ink-500">Incoming</dt><dd className="text-xl font-semibold">{match.incoming}</dd></div>
            <div><dt className="text-xs uppercase text-ink-500">Remaining shortage</dt><dd className="text-xl font-semibold">{match.remainingShortage}</dd></div>
          </dl>
          {match.oversupplied && match.alternatives?.length ? (
            <div className="mt-5">
              <p className="font-semibold">RAHAT recommends</p>
              <ul className="mt-2 list-disc pl-5 text-ink-700">
                {match.alternatives.map((alt) => (
                  <li key={`${alt.itemName}-${alt.camp}`}>{alt.itemName} · {alt.priority}{alt.camp ? ` · ${alt.camp}` : ''}</li>
                ))}
              </ul>
            </div>
          ) : null}
          {error ? <p className="mt-4 text-red-800">{error}</p> : null}
          <div className="mt-6 flex flex-wrap gap-3">
            <button className="btn-gold" type="button" disabled={busy} onClick={() => submit(false)}>Submit donation</button>
            {match.oversupplied ? (
              <button className="btn-outline" type="button" disabled={busy} onClick={() => submit(true)}>Donate anyway</button>
            ) : null}
            <Link className="btn-outline" to="/donor/recommend">View higher priority needs</Link>
          </div>
        </div>
      ) : null}
    </div>
  );
}
