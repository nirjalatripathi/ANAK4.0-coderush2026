import { useRef, useState } from 'react';
import { victimService } from '../services/victimService';
import { useAuth } from '../hooks/useAuth';
import { getErrorMessage } from '../utils/helpers';

const empty = {
  fullName: '',
  displayName: '',
  phone: '',
  email: '',
  district: '',
  municipality: '',
  ward: '',
  householdSize: '1',
  category: 'Food',
  amountNeededNPR: '',
  story: '',
  additionalPhone: '',
  additionalEmail: '',
};

export default function ApplySupport() {
  const { user } = useAuth();
  const [form, setForm] = useState({
    ...empty,
    fullName: user?.fullName || '',
    email: user?.email || '',
  });
  const [evidence, setEvidence] = useState(null);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const evidenceInput = useRef(null);

  const set = (key) => (event) => setForm((prev) => ({ ...prev, [key]: event.target.value }));

  const onSubmit = async (event) => {
    event.preventDefault();
    setBusy(true);
    setError('');
    setMessage('');
    try {
      let data;
      if (evidence) {
        const payload = new FormData();
        Object.entries(form).forEach(([key, value]) => payload.append(key, value ?? ''));
        payload.append('evidence', evidence);
        ({ data } = await victimService.apply(payload));
      } else {
        ({ data } = await victimService.apply(form));
      }
      setMessage(`${data?.message || 'Your application was received.'} Reference: ${data?.applicationId || ''}`);
      setForm({ ...empty, fullName: user?.fullName || '', email: user?.email || '' });
      setEvidence(null);
      if (evidenceInput.current) evidenceInput.current.value = '';
    } catch (err) {
      setError(getErrorMessage(err, 'Unable to submit this application.'));
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="page-wrap max-w-3xl">
      <p className="eyebrow eyebrow-lg text-teal-700">Ask for help</p>
      <h1 className="serif mt-3 text-4xl text-navy-900">Apply for financial support</h1>
      <p className="mt-4 text-ink-700">
        An administrator will review this before it is shown on the homepage. Do not include bank passwords, citizenship numbers, or other people’s private details.
      </p>
      <form className="card-gov mt-10 grid gap-5 p-6 sm:p-8 md:grid-cols-2" onSubmit={onSubmit}>
        <div className="md:col-span-2">
          <label className="label-gov">Full name</label>
          <input className="input-gov" value={form.fullName} onChange={set('fullName')} required />
        </div>
        <div>
          <label className="label-gov">Public display name</label>
          <input className="input-gov" placeholder="Sita M." value={form.displayName} onChange={set('displayName')} />
        </div>
        <div>
          <label className="label-gov">Phone</label>
          <input className="input-gov" value={form.phone} onChange={set('phone')} required />
        </div>
        <div>
          <label className="label-gov">Email</label>
          <input className="input-gov" type="email" value={form.email} onChange={set('email')} required />
        </div>
        <div>
          <label className="label-gov">Need type</label>
          <select className="select-gov" value={form.category} onChange={set('category')}>
            <option>Food</option><option>Shelter</option><option>Medical</option><option>Livelihood</option><option>Education</option><option>Other</option>
          </select>
        </div>
        <div>
          <label className="label-gov">District</label>
          <input className="input-gov" value={form.district} onChange={set('district')} required />
        </div>
        <div>
          <label className="label-gov">Municipality</label>
          <input className="input-gov" value={form.municipality} onChange={set('municipality')} required />
        </div>
        <div>
          <label className="label-gov">Ward</label>
          <input className="input-gov" value={form.ward} onChange={set('ward')} />
        </div>
        <div>
          <label className="label-gov">Household size</label>
          <input className="input-gov" type="number" min="1" value={form.householdSize} onChange={set('householdSize')} />
        </div>
        <div>
          <label className="label-gov">Amount needed (NPR)</label>
          <input className="input-gov" type="number" min="100" value={form.amountNeededNPR} onChange={set('amountNeededNPR')} required />
        </div>
        <div className="md:col-span-2">
          <label className="label-gov">What happened, and what the money is for</label>
          <textarea className="textarea-gov" rows="5" value={form.story} onChange={set('story')} required />
        </div>
        <div className="md:col-span-2">
          <p className="mb-2 text-sm font-semibold text-red-700">
            Important: The phone number and email above must be correct. Verification is done by calling or emailing you.
          </p>
          <p className="mb-4 text-sm text-ink-700">
            You can also add another contact, or a photo, video, or document.
          </p>
          <div className="relative z-10 grid gap-5 sm:grid-cols-2">
            <div>
              <label className="label-gov" htmlFor="additional-phone">Additional phone</label>
              <input
                id="additional-phone"
                className="input-gov"
                type="tel"
                autoComplete="tel"
                value={form.additionalPhone}
                onChange={set('additionalPhone')}
              />
            </div>
            <div>
              <label className="label-gov" htmlFor="additional-email">Additional email</label>
              <input
                id="additional-email"
                className="input-gov"
                type="email"
                autoComplete="email"
                value={form.additionalEmail}
                onChange={set('additionalEmail')}
              />
            </div>
          </div>
          <div className="relative mt-5">
            <input
              ref={evidenceInput}
              hidden
              type="file"
              accept="image/jpeg,image/png,image/webp,application/pdf,video/mp4,video/webm,video/quicktime"
              onChange={(event) => setEvidence(event.target.files?.[0] || null)}
            />
            <button
              type="button"
              className={`evidence-add${evidence ? ' is-added' : ''}`}
              onClick={() => evidenceInput.current?.click()}
              aria-label="Add a photo, video, or document"
            >
              <span aria-hidden="true">+</span>
            </button>
          </div>
        </div>
        {error ? <p className="md:col-span-2 text-red-800">{error}</p> : null}
        {message ? <p className="md:col-span-2 text-teal-800">{message}</p> : null}
        <button className="btn-gold md:col-span-2" type="submit" disabled={busy}>{busy ? 'Sending…' : 'Submit for review'}</button>
      </form>
    </div>
  );
}
