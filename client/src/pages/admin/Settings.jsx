import { useEffect, useState } from 'react';
import { adminService } from '../../services/notificationService';
import { getErrorMessage } from '../../utils/helpers';

export default function AdminSettings() {
  const [form, setForm] = useState({
    portalName: 'RAHAT',
    helpDeskEmail: '',
    emergencyHotline: '',
    allowPublicRegistration: true,
    maintenanceMode: false,
  });
  const [message, setMessage] = useState('');

  useEffect(() => {
    adminService.settings().then(({ data }) => setForm((prev) => ({ ...prev, ...data.settings }))).catch((err) => setMessage(getErrorMessage(err)));
  }, []);

  return (
    <div>
      <h1 className="serif text-3xl text-navy-900">System settings</h1>
      <form
        className="card-gov mt-6 grid gap-4 p-6"
        onSubmit={async (e) => {
          e.preventDefault();
          try {
            await adminService.updateSettings(form);
            setMessage('Settings saved and written to the audit log.');
          } catch (error) {
            setMessage(getErrorMessage(error));
          }
        }}
      >
        <div><label className="label-gov">Portal name</label><input className="input-gov" value={form.portalName} onChange={(e) => setForm({ ...form, portalName: e.target.value })} /></div>
        <div><label className="label-gov">Help desk email</label><input className="input-gov" value={form.helpDeskEmail} onChange={(e) => setForm({ ...form, helpDeskEmail: e.target.value })} /></div>
        <div><label className="label-gov">Emergency hotline</label><input className="input-gov" value={form.emergencyHotline} onChange={(e) => setForm({ ...form, emergencyHotline: e.target.value })} /></div>
        <label className="flex items-center gap-2"><input type="checkbox" checked={form.allowPublicRegistration} onChange={(e) => setForm({ ...form, allowPublicRegistration: e.target.checked })} /> Allow public registration</label>
        <label className="flex items-center gap-2"><input type="checkbox" checked={form.maintenanceMode} onChange={(e) => setForm({ ...form, maintenanceMode: e.target.checked })} /> Maintenance mode</label>
        <button className="btn-primary" type="submit">Save settings</button>
      </form>
      {message ? <p className="mt-4">{message}</p> : null}
    </div>
  );
}
