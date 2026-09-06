import { useEffect, useState } from 'react';
import { emergencyService } from '../services/emergencyService';
import { campService } from '../services/campService';
import { useAuth } from '../hooks/useAuth';
import { getErrorMessage } from '../utils/helpers';

export default function Emergency() {
  const { user } = useAuth();
  const [camps, setCamps] = useState([]);
  const [message, setMessage] = useState('');
  const [form, setForm] = useState({
    reporterName: '',
    reporterPhone: '',
    reporterType: 'third_party',
    location: '',
    district: '',
    camp: '',
    onBehalfOfName: '',
    urgency: 'High',
    description: '',
  });

  useEffect(() => {
    campService.list({ active: 'true' }).then(({ data }) => setCamps(data.camps || [])).catch(() => {});
    if (user) {
      setForm((prev) => ({
        ...prev,
        reporterName: user.fullName || '',
        reporterType: user.role === 'camp_official' ? 'camp_official' : user.role === 'citizen' ? 'citizen' : 'third_party',
      }));
    }
  }, [user]);

  const onSubmit = async (event) => {
    event.preventDefault();
    setMessage('');
    try {
      const { data } = await emergencyService.create(form);
      setMessage(`Emergency report ${data.report.reportId} has been recorded.`);
      setForm((prev) => ({ ...prev, description: '', onBehalfOfName: '' }));
    } catch (error) {
      setMessage(getErrorMessage(error, 'Unable to submit this emergency report.'));
    }
  };

  return (
    <div className="mx-auto max-w-4xl px-4 py-12">
      <div className="border-l-8 border-red-700 bg-white p-6">
        <p className="text-xs font-bold uppercase tracking-[0.18em] text-red-700">SOS / Emergency</p>
        <h1 className="serif mt-2 text-4xl text-navy-900">Report an emergency</h1>
        <p className="mt-3 text-ink-700">
          This form works with a low-connectivity workflow: complete the essential fields, submit once, and keep the report ID. Camp officials can file a report on behalf of a person who cannot use RAHAT.
        </p>
        <p className="mt-2 font-semibold text-red-800">If life is in immediate danger, call 100 / 102 first, then record the case here.</p>
      </div>

      <form className="card-gov mt-8 p-6" onSubmit={onSubmit}>
        <div className="grid gap-4 md:grid-cols-2">
          <div><label className="label-gov">Your name</label><input className="input-gov" value={form.reporterName} onChange={(e) => setForm({ ...form, reporterName: e.target.value })} required /></div>
          <div><label className="label-gov">Phone</label><input className="input-gov" value={form.reporterPhone} onChange={(e) => setForm({ ...form, reporterPhone: e.target.value })} /></div>
          <div><label className="label-gov">Location</label><input className="input-gov" value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} /></div>
          <div><label className="label-gov">District</label><input className="input-gov" value={form.district} onChange={(e) => setForm({ ...form, district: e.target.value })} /></div>
          <div><label className="label-gov">Nearest camp if known</label>
            <select className="select-gov" value={form.camp} onChange={(e) => setForm({ ...form, camp: e.target.value })}>
              <option value="">Not specified</option>
              {camps.map((camp) => <option key={camp._id} value={camp._id}>{camp.name}</option>)}
            </select>
          </div>
          <div><label className="label-gov">Urgency</label>
            <select className="select-gov" value={form.urgency} onChange={(e) => setForm({ ...form, urgency: e.target.value })}>
              <option>Low</option><option>Medium</option><option>High</option><option>Critical</option>
            </select>
          </div>
          <div className="md:col-span-2"><label className="label-gov">If reporting on behalf of someone, their name</label>
            <input className="input-gov" value={form.onBehalfOfName} onChange={(e) => setForm({ ...form, onBehalfOfName: e.target.value })} />
          </div>
          <div className="md:col-span-2"><label className="label-gov">What is happening</label>
            <textarea className="textarea-gov" rows="6" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} required />
          </div>
        </div>
        {message ? <p className="mt-4">{message}</p> : null}
        <button className="btn-danger mt-5" type="submit">Submit emergency report</button>
      </form>
    </div>
  );
}
