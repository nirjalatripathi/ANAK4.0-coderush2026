import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { getErrorMessage, workspacePath } from '../../utils/helpers';

const DEMO = {
  admin: { email: 'admin@rahat.gov.np', password: 'RahatAdmin@2026' },
  vendor: { email: 'vendor.demo@rahat.test', password: 'VendorDemo@2026' },
};

export default function Login() {
  const { login, adminLogin } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [busy, setBusy] = useState('');

  const finish = (data) => {
    const dest = location.state?.from || workspacePath(data.user.role);
    navigate(dest, { replace: true });
  };

  const onSubmit = async (event) => {
    event.preventDefault();
    setBusy('form');
    setError('');
    try {
      finish(await login(form));
    } catch (err) {
      setError(getErrorMessage(err, 'Unable to sign in.'));
    } finally {
      setBusy('');
    }
  };

  const demoLogin = async (kind) => {
    setBusy(kind);
    setError('');
    setForm(DEMO[kind]);
    try {
      if (kind === 'admin') {
        await adminLogin(DEMO.admin);
        navigate('/admin/dashboard', { replace: true });
        return;
      }
      finish(await login(DEMO.vendor));
    } catch (err) {
      setError(getErrorMessage(err, 'Unable to sign in with the demo account.'));
    } finally {
      setBusy('');
    }
  };

  return (
    <div className="page-wrap max-w-md">
      <h1 className="serif text-4xl text-navy-900">Sign in to RAHAT</h1>
      <p className="mt-3 text-ink-700">Use your account, or open a demo desk as administrator or vendor.</p>
      <form className="card-gov mt-6 p-6" onSubmit={onSubmit}>
        <label className="label-gov" htmlFor="email">Email</label>
        <input id="email" type="email" className="input-gov" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required />
        <label className="label-gov mt-4" htmlFor="password">Password</label>
        <input id="password" type="password" className="input-gov" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} required />
        {error ? <p className="mt-3 text-red-800">{error}</p> : null}
        <button className="btn-primary mt-5 w-full" type="submit" disabled={Boolean(busy)}>{busy === 'form' ? 'Signing in…' : 'Sign in'}</button>
        <div className="mt-3 grid grid-cols-2 gap-3">
          <button className="btn-outline" type="button" disabled={Boolean(busy)} onClick={() => demoLogin('admin')}>
            {busy === 'admin' ? 'Opening…' : 'Login as Admin'}
          </button>
          <button className="btn-outline" type="button" disabled={Boolean(busy)} onClick={() => demoLogin('vendor')}>
            {busy === 'vendor' ? 'Opening…' : 'Login as Vendor'}
          </button>
        </div>
        <div className="mt-4 flex justify-between text-sm">
          <Link to="/forgot-password">Forgot password</Link>
          <Link to="/register">Create an account</Link>
        </div>
      </form>
    </div>
  );
}
