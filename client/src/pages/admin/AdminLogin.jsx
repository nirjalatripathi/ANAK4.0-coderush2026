import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { getErrorMessage } from '../../utils/helpers';

export default function AdminLogin() {
  const { adminLogin, login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const onSubmit = async (event) => {
    event.preventDefault();
    setBusy(true);
    setError('');
    try {
      await adminLogin(form);
      navigate('/admin/dashboard', { replace: true });
    } catch (err) {
      setError(getErrorMessage(err, 'Access Denied — Administrator privileges required.'));
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="page-wrap max-w-md">
      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-gold-600">Restricted government desk</p>
      <h1 className="serif mt-2 text-4xl text-navy-900">Administrator sign-in</h1>
      <p className="mt-2 text-ink-700">This page is not listed in public navigation. Access requires a seeded or issued administrator account and a valid JWT. There is no skip-login path.</p>
      <form className="card-gov mt-6 p-6" onSubmit={onSubmit}>
        <label className="label-gov">Official email</label>
        <input className="input-gov" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required />
        <label className="label-gov mt-4">Password</label>
        <input className="input-gov" type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} required />
        {error ? <p className="mt-3 text-red-800">{error}</p> : null}
        <button className="btn-primary mt-5 w-full" type="submit" disabled={busy}>{busy ? 'Verifying…' : 'Authenticate'}</button>
        <div className="mt-3 grid grid-cols-2 gap-3">
          <button
            className="btn-outline"
            type="button"
            disabled={busy}
            onClick={async () => {
              setForm({ email: 'admin@rahat.gov.np', password: 'RahatAdmin@2026' });
              setBusy(true);
              setError('');
              try {
                await adminLogin({ email: 'admin@rahat.gov.np', password: 'RahatAdmin@2026' });
                navigate('/admin/dashboard', { replace: true });
              } catch (err) {
                setError(getErrorMessage(err, 'Access Denied — Administrator privileges required.'));
              } finally {
                setBusy(false);
              }
            }}
          >
            Login as Admin
          </button>
          <button
            className="btn-outline"
            type="button"
            disabled={busy}
            onClick={async () => {
              setForm({ email: 'vendor.demo@rahat.test', password: 'VendorDemo@2026' });
              setBusy(true);
              setError('');
              try {
                await login({ email: 'vendor.demo@rahat.test', password: 'VendorDemo@2026' });
                navigate('/donor/dashboard', { replace: true });
              } catch (err) {
                setError(getErrorMessage(err, 'Unable to sign in as vendor.'));
              } finally {
                setBusy(false);
              }
            }}
          >
            Login as Vendor
          </button>
        </div>
      </form>
    </div>
  );
}
