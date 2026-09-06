import { useEffect, useState } from 'react';
import { emergencyService } from '../../services/emergencyService';
import StatusBadge from '../../components/StatusBadge';
import { formatDateTime, getErrorMessage } from '../../utils/helpers';

export default function CampEmergencyReports() {
  const [reports, setReports] = useState([]);
  const [message, setMessage] = useState('');
  const [form, setForm] = useState({ onBehalfOfName: '', location: '', description: '', urgency: 'High' });

  const load = async () => {
    const { data } = await emergencyService.list();
    setReports(data.reports || []);
  };

  useEffect(() => { load().catch((err) => setMessage(getErrorMessage(err))); }, []);

  return (
    <div>
      <h1 className="serif text-3xl text-navy-900">Emergency reports</h1>
      <form
        className="card-gov mt-6 grid gap-3 p-6"
        onSubmit={async (event) => {
          event.preventDefault();
          try {
            await emergencyService.create({ ...form, reporterType: 'camp_official' });
            setMessage('Report filed on behalf of a person who cannot use RAHAT.');
            setForm({ onBehalfOfName: '', location: '', description: '', urgency: 'High' });
            await load();
          } catch (error) {
            setMessage(getErrorMessage(error));
          }
        }}
      >
        <h2 className="serif text-xl">File on behalf of someone</h2>
        <input className="input-gov" placeholder="Person's name" value={form.onBehalfOfName} onChange={(e) => setForm({ ...form, onBehalfOfName: e.target.value })} />
        <input className="input-gov" placeholder="Location" value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} />
        <textarea className="textarea-gov" rows="4" placeholder="What is happening" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} required />
        <button className="btn-danger" type="submit">Create emergency record</button>
      </form>
      {message ? <p className="mt-4">{message}</p> : null}
      <ul className="mt-6 space-y-3">
        {reports.map((report) => (
          <li key={report._id} className="card-gov p-4">
            <div className="flex justify-between gap-3">
              <div>
                <p className="font-mono text-xs">{report.reportId}</p>
                <p className="font-semibold">{report.onBehalfOfName || report.reporterName}</p>
                <p className="text-sm">{report.description}</p>
                <p className="text-xs text-ink-500">{formatDateTime(report.createdAt)}</p>
              </div>
              <div className="text-right">
                <StatusBadge status={report.status} />
                <select
                  className="select-gov mt-2"
                  value={report.status}
                  onChange={async (e) => {
                    await emergencyService.update(report._id, { status: e.target.value });
                    await load();
                  }}
                >
                  <option>Open</option><option>Acknowledged</option><option>In Progress</option><option>Resolved</option>
                </select>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
