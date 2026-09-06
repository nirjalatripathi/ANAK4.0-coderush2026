import { useEffect, useState } from 'react';
import { citizenService } from '../../services/citizenService';
import StatusBadge from '../../components/StatusBadge';
import Loading from '../../components/Loading';
import { ageFromDob, getErrorMessage } from '../../utils/helpers';

export default function CitizenProfile() {
  const [citizen, setCitizen] = useState(null);
  const [message, setMessage] = useState('');
  const [form, setForm] = useState({
    fullName: '',
    dateOfBirth: '',
    gender: 'Female',
    phone: '',
    email: '',
    street: '',
    district: '',
    municipality: '',
    ward: '',
    problems: '',
  });

  const load = async () => {
    const { data } = await citizenService.me();
    const c = data.citizen;
    setCitizen(c);
    setForm({
      fullName: c.fullName || '',
      dateOfBirth: c.dateOfBirth ? String(c.dateOfBirth).slice(0, 10) : '',
      gender: c.gender || 'Female',
      phone: c.phone || '',
      email: c.email || '',
      street: c.currentAddress?.street || '',
      district: c.currentAddress?.district || '',
      municipality: c.currentAddress?.municipality || '',
      ward: c.currentAddress?.ward || '',
      problems: c.specialAssistanceNotes || c.currentCondition || '',
    });
  };

  useEffect(() => { load().catch((err) => setMessage(getErrorMessage(err))); }, []);

  if (!citizen) return <Loading />;

  const save = async (event) => {
    event.preventDefault();
    const payload = new FormData();
    payload.append('fullName', form.fullName);
    payload.append('dateOfBirth', form.dateOfBirth);
    payload.append('gender', form.gender);
    payload.append('phone', form.phone);
    payload.append('email', form.email);
    payload.append('problems', form.problems);
    payload.append('specialAssistanceNotes', form.problems);
    payload.append('currentCondition', form.problems);
    payload.append('currentAddress', JSON.stringify({
      street: form.street, district: form.district, municipality: form.municipality, ward: form.ward,
    }));
    try {
      await citizenService.updateMe(payload);
      setMessage('Profile saved.');
      await load();
    } catch (error) {
      setMessage(getErrorMessage(error));
    }
  };

  return (
    <div>
      <h1 className="serif text-3xl text-navy-900">Your profile</h1>
      <p className="mt-2 text-ink-500">Enter your name, age and any problems you need help with.</p>
      <div className="mt-4 flex gap-2">
        <StatusBadge status={citizen.verificationStatus} />
        <StatusBadge status={citizen.disasterStatus} />
      </div>

      <form className="card-gov mt-8 grid gap-5 p-8 md:grid-cols-2" onSubmit={save}>
        <div className="md:col-span-2">
          <label className="label-gov">Name</label>
          <input className="input-gov" value={form.fullName} onChange={(e) => setForm({ ...form, fullName: e.target.value })} required />
        </div>
        <div>
          <label className="label-gov">Date of birth</label>
          <input type="date" className="input-gov" value={form.dateOfBirth} onChange={(e) => setForm({ ...form, dateOfBirth: e.target.value })} required />
          {ageFromDob(form.dateOfBirth) != null ? <p className="mt-1 text-sm text-ink-500">Age {ageFromDob(form.dateOfBirth)}</p> : null}
        </div>
        <div>
          <label className="label-gov">Gender</label>
          <select className="select-gov" value={form.gender} onChange={(e) => setForm({ ...form, gender: e.target.value })}>
            <option>Female</option><option>Male</option><option>Other</option><option>Prefer not to say</option>
          </select>
        </div>
        <div>
          <label className="label-gov">Phone</label>
          <input className="input-gov" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
        </div>
        <div>
          <label className="label-gov">Email</label>
          <input className="input-gov" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
        </div>
        <div className="md:col-span-2">
          <label className="label-gov">Problems</label>
          <textarea
            className="textarea-gov"
            rows="3"
            value={form.problems}
            onChange={(e) => setForm({ ...form, problems: e.target.value })}
            placeholder="Injury, medicine, disability, or other assistance needed"
          />
        </div>
        <div className="md:col-span-2">
          <label className="label-gov">Address</label>
          <input className="input-gov" value={form.street} onChange={(e) => setForm({ ...form, street: e.target.value })} />
        </div>
        <div>
          <label className="label-gov">District</label>
          <input className="input-gov" value={form.district} onChange={(e) => setForm({ ...form, district: e.target.value })} />
        </div>
        <div>
          <label className="label-gov">Municipality</label>
          <input className="input-gov" value={form.municipality} onChange={(e) => setForm({ ...form, municipality: e.target.value })} />
        </div>
        <div>
          <label className="label-gov">Ward</label>
          <input className="input-gov" value={form.ward} onChange={(e) => setForm({ ...form, ward: e.target.value })} />
        </div>
        <button className="btn-primary md:col-span-2" type="submit">Save</button>
      </form>
      {message ? <p className="mt-4">{message}</p> : null}
    </div>
  );
}
