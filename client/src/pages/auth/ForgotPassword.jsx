import { useState } from 'react';
import { authService } from '../../services/authService';
import { getErrorMessage } from '../../utils/helpers';

export default function ForgotPassword() {
  const [form, setForm] = useState({ email: '', phone: '', newPassword: '' });
  const [message, setMessage] = useState('');

  const onSubmit = async (event) => {
    event.preventDefault();
    try {
      const { data } = await authService.forgotPassword(form);
      setMessage(data.message);
    } catch (error) {
      setMessage(getErrorMessage(error));
    }
  };

  return (
    <div className="mx-auto max-w-md px-4 py-16">
      <h1 className="serif text-4xl text-navy-900">Reset citizen password</h1>
      <p className="mt-2 text-ink-700">Confirm the email and phone number on the registration. Official accounts must be reset by an administrator.</p>
      <form className="card-gov mt-6 grid gap-3 p-6" onSubmit={onSubmit}>
        <label className="label-gov">Email</label>
        <input className="input-gov" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required />
        <label className="label-gov">Registered phone</label>
        <input className="input-gov" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} required />
        <label className="label-gov">New password</label>
        <input className="input-gov" type="password" minLength={8} value={form.newPassword} onChange={(e) => setForm({ ...form, newPassword: e.target.value })} required />
        {message ? <p>{message}</p> : null}
        <button className="btn-primary" type="submit">Update password</button>
      </form>
    </div>
  );
}
