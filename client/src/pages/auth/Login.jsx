import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { getErrorMessage, workspacePath } from '../../utils/helpers';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const onSubmit = async (event) => {
    event.preventDefault();
    setBusy(true);
    setError('');
    try {
      const data = await login(form);
      const dest = location.state?.from || workspacePath(data.user.role);
      navigate(dest, { replace: true });
    } catch (err) {
      setError(getErrorMessage(err, 'Unable to sign in.'));
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="page-wrap max-w-md">
      <h1 className="serif text-4xl text-navy-900">Sign in to RAHAT</h1>
      <p className="mt-3 text-ink-700">Citizens, donors, camp officials and local authorities use this page. The administrator desk is separate and is not listed in public navigation.</p>
      <form className="card-gov mt-6 p-6" onSubmit={onSubmit}>
        <label className="label-gov" htmlFor="email">Email</label>
        <input id="email" type="email" className="input-gov" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required />
        <label className="label-gov mt-4" htmlFor="password">Password</label>
        <input id="password" type="password" className="input-gov" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} required />
        {error ? <p className="mt-3 text-red-800">{error}</p> : null}
        <button className="btn-primary mt-5 w-full" type="submit" disabled={busy}>{busy ? 'Signing in…' : 'Sign in'}</button>
        <div className="mt-4 flex justify-between text-sm">
          <Link to="/forgot-password">Forgot password</Link>
          <Link to="/register">Create an account</Link>
        </div>
      </form>
    </div>
  );
}
