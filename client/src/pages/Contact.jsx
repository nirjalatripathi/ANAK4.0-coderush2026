import { useState } from 'react';
import { publicService } from '../services/notificationService';
import { getErrorMessage } from '../utils/helpers';

export default function Contact() {
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' });
  const [status, setStatus] = useState({ type: '', text: '' });
  const [busy, setBusy] = useState(false);

  const onChange = (event) => setForm((prev) => ({ ...prev, [event.target.name]: event.target.value }));

  const onSubmit = async (event) => {
    event.preventDefault();
    setBusy(true);
    setStatus({ type: '', text: '' });
    try {
      const { data } = await publicService.contact(form);
      setStatus({ type: 'ok', text: data.message || 'Message received.' });
      setForm({ name: '', email: '', subject: '', message: '' });
    } catch (error) {
      setStatus({ type: 'err', text: getErrorMessage(error, 'Unable to send this message.') });
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="page-wrap grid gap-16 lg:grid-cols-5">
      <div className="lg:col-span-2">
        <h1 className="serif text-4xl text-navy-900">Contact RAHAT</h1>
        <p className="mt-3 text-ink-700">Use this desk for non-life-threatening coordination. If someone is in immediate danger, call local emergency services first.</p>
        <dl className="mt-6 space-y-4">
          <div className="card-gov p-4"><dt className="text-xs uppercase tracking-wider text-ink-500">Emergency contacts</dt><dd className="mt-1 font-semibold">Police 100 · Ambulance 102 · Help desk 1149</dd></div>
          <div className="card-gov p-4"><dt className="text-xs uppercase tracking-wider text-ink-500">Help desk</dt><dd className="mt-1">helpdesk@rahat.gov.np</dd></div>
          <div className="card-gov p-4"><dt className="text-xs uppercase tracking-wider text-ink-500">Government coordination</dt><dd className="mt-1">coordination@rahat.gov.np</dd></div>
          <div className="card-gov p-4"><dt className="text-xs uppercase tracking-wider text-ink-500">Relief coordination</dt><dd className="mt-1">relief@rahat.gov.np</dd></div>
        </dl>
      </div>
      <form className="card-gov lg:col-span-3 p-6" onSubmit={onSubmit}>
        <h2 className="serif text-2xl text-navy-900">Write to the help desk</h2>
        <div className="mt-4 grid gap-4">
          <div>
            <label className="label-gov" htmlFor="name">Name</label>
            <input id="name" name="name" className="input-gov" value={form.name} onChange={onChange} required />
          </div>
          <div>
            <label className="label-gov" htmlFor="email">Email</label>
            <input id="email" type="email" name="email" className="input-gov" value={form.email} onChange={onChange} required />
          </div>
          <div>
            <label className="label-gov" htmlFor="subject">Subject</label>
            <input id="subject" name="subject" className="input-gov" value={form.subject} onChange={onChange} required />
          </div>
          <div>
            <label className="label-gov" htmlFor="message">Message</label>
            <textarea id="message" name="message" rows="6" className="textarea-gov" value={form.message} onChange={onChange} required />
          </div>
        </div>
        {status.text ? <p className={`mt-4 ${status.type === 'ok' ? 'text-emerald-800' : 'text-red-800'}`}>{status.text}</p> : null}
        <button type="submit" className="btn-primary mt-5" disabled={busy}>{busy ? 'Sending…' : 'Send message'}</button>
      </form>
    </div>
  );
}
