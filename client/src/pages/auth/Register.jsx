import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { getErrorMessage } from '../../utils/helpers';

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [form, setForm] = useState({
    fullName: '',
    dateOfBirth: '',
    gender: 'Female',
    phone: '',
    email: '',
    password: '',
    district: '',
    municipality: '',
    ward: '',
    permanentStreet: '',
    problems: '',
  });

  const set = (key) => (event) => setForm((prev) => ({ ...prev, [key]: event.target.value }));

  const onSubmit = async (event) => {
    event.preventDefault();
    setBusy(true);
    setError('');
    try {
      await register({
        ...form,
        permanentAddress: {
          street: form.permanentStreet,
          district: form.district,
          municipality: form.municipality,
          ward: form.ward,
        },
        currentAddress: {
          street: form.permanentStreet,
          district: form.district,
          municipality: form.municipality,
          ward: form.ward,
        },
        specialAssistanceNotes: form.problems,
        problems: form.problems,
      });
      navigate('/citizen/dashboard');
    } catch (err) {
      setError(getErrorMessage(err, 'Unable to complete registration.'));
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="page-wrap max-w-2xl">
      <h1 className="serif text-4xl text-navy-900">Register</h1>
      <p className="mt-4 text-ink-700">
        Public registration creates a citizen account. Donor registration is separate below. Roles cannot be chosen by the visitor.
      </p>
      <form className="card-gov mt-10 grid gap-5 p-8 md:grid-cols-2" onSubmit={onSubmit}>
        <div className="md:col-span-2 serif text-xl text-navy-900">Citizen account</div>
        <div className="md:col-span-2">
          <label className="label-gov">Full name</label>
          <input className="input-gov" value={form.fullName} onChange={set('fullName')} required />
        </div>
        <div>
          <label className="label-gov">Date of birth</label>
          <input type="date" className="input-gov" value={form.dateOfBirth} onChange={set('dateOfBirth')} required />
        </div>
        <div>
          <label className="label-gov">Gender</label>
          <select className="select-gov" value={form.gender} onChange={set('gender')}>
            <option>Female</option><option>Male</option><option>Other</option><option>Prefer not to say</option>
          </select>
        </div>
        <div>
          <label className="label-gov">Phone</label>
          <input className="input-gov" value={form.phone} onChange={set('phone')} required />
        </div>
        <div>
          <label className="label-gov">Email</label>
          <input type="email" className="input-gov" value={form.email} onChange={set('email')} required />
        </div>
        <div className="md:col-span-2">
          <label className="label-gov">Password</label>
          <input type="password" className="input-gov" value={form.password} onChange={set('password')} required minLength={8} />
        </div>
        <div className="md:col-span-2">
          <label className="label-gov">Address</label>
          <input className="input-gov" value={form.permanentStreet} onChange={set('permanentStreet')} />
        </div>
        <div>
          <label className="label-gov">District</label>
          <input className="input-gov" value={form.district} onChange={set('district')} required />
        </div>
        <div>
          <label className="label-gov">Municipality</label>
          <input className="input-gov" value={form.municipality} onChange={set('municipality')} />
        </div>
        <div>
          <label className="label-gov">Ward</label>
          <input className="input-gov" value={form.ward} onChange={set('ward')} />
        </div>
        <div className="md:col-span-2">
          <label className="label-gov">Problems</label>
          <textarea className="textarea-gov" rows="3" value={form.problems} onChange={set('problems')} placeholder="Injury, medicine, disability, or other assistance needed" />
        </div>
        {error ? <p className="md:col-span-2 text-red-800">{error}</p> : null}
        <button className="btn-primary md:col-span-2" type="submit" disabled={busy}>{busy ? 'Registering…' : 'Create citizen account'}</button>
      </form>
      <DonorBlock />
    </div>
  );
}

function DonorBlock() {
  const { registerDonor } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ fullName: '', email: '', password: '' });
  const [error, setError] = useState('');
  return (
    <form
      className="card-gov mt-16 p-8"
      onSubmit={async (e) => {
        e.preventDefault();
        try {
          await registerDonor(form);
          navigate('/donor/dashboard', { replace: true });
        } catch (err) {
          setError(getErrorMessage(err));
        }
      }}
    >
      <h2 className="serif text-2xl text-navy-900">Register as a donor</h2>
      <p className="mt-2 text-sm text-ink-500">The server assigns the donor role.</p>
      <div className="mt-6 grid gap-4">
        <input className="input-gov" placeholder="Full name" value={form.fullName} onChange={(e) => setForm({ ...form, fullName: e.target.value })} required />
        <input className="input-gov" type="email" placeholder="Email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required />
        <input className="input-gov" type="password" placeholder="Password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} required />
      </div>
      {error ? <p className="mt-4 text-red-800">{error}</p> : null}
      <button className="btn-gold mt-6" type="submit">Create donor account</button>
    </form>
  );
}
