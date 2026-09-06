import { useEffect, useState } from 'react';
import { adminService } from '../../services/notificationService';
import { campService } from '../../services/campService';
import { getErrorMessage } from '../../utils/helpers';

export default function AdminCampOfficials() {
  const [officials, setOfficials] = useState([]);
  const [camps, setCamps] = useState([]);
  const [message, setMessage] = useState('');
  const [form, setForm] = useState({ email: '', password: '', fullName: '', assignedCamp: '', phone: '', designation: 'Camp Official' });

  const load = async () => {
    const [off, camp] = await Promise.all([adminService.officials(), campService.list()]);
    setOfficials(off.data.officials || []);
    setCamps(camp.data.camps || []);
  };

  useEffect(() => { load().catch((err) => setMessage(getErrorMessage(err))); }, []);

  return (
    <div>
      <h1 className="serif text-3xl text-navy-900">Camp officials</h1>
      <form
        className="card-gov mt-6 grid gap-3 p-6 md:grid-cols-2"
        onSubmit={async (e) => {
          e.preventDefault();
          try {
            await adminService.createOfficial(form);
            setMessage('Official account created with a server-assigned camp_official role.');
            await load();
          } catch (error) {
            setMessage(getErrorMessage(error));
          }
        }}
      >
        <input className="input-gov" placeholder="Full name" value={form.fullName} onChange={(e) => setForm({ ...form, fullName: e.target.value })} required />
        <input className="input-gov" type="email" placeholder="Email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required />
        <input className="input-gov" type="password" placeholder="Temporary password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} required />
        <select className="select-gov" value={form.assignedCamp} onChange={(e) => setForm({ ...form, assignedCamp: e.target.value })} required>
          <option value="">Assigned camp</option>
          {camps.map((camp) => <option key={camp._id} value={camp._id}>{camp.name}</option>)}
        </select>
        <button className="btn-primary md:col-span-2" type="submit">Issue official account</button>
      </form>
      {message ? <p className="mt-4">{message}</p> : null}
      <div className="mt-6 overflow-x-auto card-gov">
        <table className="table-gov">
          <thead><tr><th>Official</th><th>Camp</th><th>Email</th><th>Active</th></tr></thead>
          <tbody>
            {officials.map((row) => (
              <tr key={row._id}>
                <td>{row.fullName}<br /><span className="font-mono text-xs">{row.officialId}</span></td>
                <td>{row.assignedCamp?.name}</td>
                <td>{row.user?.email}</td>
                <td>{row.isActive ? 'Yes' : 'No'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
