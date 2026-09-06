import { useState } from 'react';
import { publicService } from '../services/notificationService';
import { getErrorMessage } from '../utils/helpers';
import CaptchaWidget from '../components/CaptchaWidget';

export default function Contact() {
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' });
  const [status, setStatus] = useState({ type: '', text: '' });
  const [busy, setBusy] = useState(false);
  const [captchaVerified, setCaptchaVerified] = useState(false);

  const onChange = (e) => setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const onSubmit = async (e) => {
    e.preventDefault();
    if (!captchaVerified) {
      setStatus({ type: 'err', text: 'Please complete the verification check before submitting.' });
      return;
    }
    setBusy(true);
    setStatus({ type: '', text: '' });
    try {
      const { data } = await publicService.contact(form);
      setStatus({ type: 'ok', text: data.message || 'Your message has been received. We will respond within 2 business days.' });
      setForm({ name: '', email: '', subject: '', message: '' });
      setCaptchaVerified(false);
    } catch (error) {
      setStatus({ type: 'err', text: getErrorMessage(error, 'Unable to send this message. Please try again.') });
    } finally {
      setBusy(false);
    }
  };

  return (
    <div>
      {/* Page header */}
      <section className="hero-panel py-16">
        <div className="section-inner px-6 relative z-10">
          <p className="eyebrow text-gold-400 mb-4">Contact</p>
          <h1 className="serif text-5xl text-white">Contact RAHAT</h1>
          <p className="mt-4 text-lg text-white/70 max-w-xl">
            Use this desk for non-life-threatening coordination. If someone is in immediate danger, call local emergency services first.
          </p>
        </div>
      </section>

      <div className="page-wrap grid gap-12 lg:grid-cols-5">
        {/* Left: contact information */}
        <aside className="lg:col-span-2">
          {/* Emergency banner */}
          <div className="rounded-xl bg-red-50 border border-red-200 p-5 mb-8">
            <p className="text-xs font-bold uppercase tracking-widest text-red-700 mb-3">⚠ Emergency Numbers</p>
            <div className="space-y-1.5 text-sm">
              <div className="flex justify-between"><span className="text-ink-700">Police</span><strong className="text-ink-900">100</strong></div>
              <div className="flex justify-between"><span className="text-ink-700">Ambulance</span><strong className="text-ink-900">102</strong></div>
            </div>
          </div>
        </aside>

        {/* Right: contact form */}
        <div className="card-gov lg:col-span-3 p-8">
          <h2 className="serif text-2xl text-navy-900 mb-6">Send a message</h2>
          <form onSubmit={onSubmit} noValidate>
            <div className="grid gap-5">
              <div className="grid gap-5 sm:grid-cols-2">
                <div>
                  <label className="label-gov" htmlFor="contact-name">Full Name</label>
                  <input
                    id="contact-name"
                    name="name"
                    className="input-gov"
                    value={form.name}
                    onChange={onChange}
                    required
                    autoComplete="name"
                    placeholder="Your full name"
                  />
                </div>
                <div>
                  <label className="label-gov" htmlFor="contact-email">Email Address</label>
                  <input
                    id="contact-email"
                    type="email"
                    name="email"
                    className="input-gov"
                    value={form.email}
                    onChange={onChange}
                    required
                    autoComplete="email"
                    placeholder="you@example.com"
                  />
                </div>
              </div>
              <div>
                <label className="label-gov" htmlFor="contact-subject">Subject</label>
                <input
                  id="contact-subject"
                  name="subject"
                  className="input-gov"
                  value={form.subject}
                  onChange={onChange}
                  required
                  placeholder="What is your message about?"
                />
              </div>
              <div>
                <label className="label-gov" htmlFor="contact-message">Message</label>
                <textarea
                  id="contact-message"
                  name="message"
                  rows={6}
                  className="textarea-gov"
                  value={form.message}
                  onChange={onChange}
                  required
                  placeholder="Please describe your request in detail…"
                />
              </div>

              {/* CAPTCHA */}
              <div>
                <label className="label-gov mb-2">Verification</label>
                <CaptchaWidget onVerify={(v) => setCaptchaVerified(v)} />
              </div>
            </div>

            {/* Status message */}
            {status.text && (
              <div className={`mt-5 rounded-lg p-4 text-sm ${status.type === 'ok' ? 'bg-teal-50 border border-teal-200 text-teal-800' : 'bg-red-50 border border-red-200 text-red-800'}`}>
                {status.type === 'ok' && '✓ '}{status.text}
              </div>
            )}

            <button
              type="submit"
              className="btn-primary mt-6 w-full"
              disabled={busy || !captchaVerified}
              aria-disabled={busy || !captchaVerified}
              style={{ opacity: captchaVerified ? 1 : 0.6 }}
            >
              {busy ? 'Sending…' : 'Send Message'}
            </button>
            {!captchaVerified && (
              <p className="mt-2 text-xs text-ink-500 text-center">Complete verification above to enable submission.</p>
            )}
          </form>
        </div>
      </div>
    </div>
  );
}
