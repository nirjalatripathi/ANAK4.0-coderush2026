import { useState } from 'react';
import { publicService } from '../services/notificationService';
import { getErrorMessage } from '../utils/helpers';
import CaptchaWidget from '../components/CaptchaWidget';

function ContactDetail({ icon, label, value, href }) {
  const content = (
    <div className="flex items-start gap-3">
      <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-navy-100 text-navy-700">
        {icon}
      </span>
      <div>
        <p className="text-xs font-semibold uppercase tracking-widest text-ink-500">{label}</p>
        <p className="mt-0.5 text-ink-900 font-medium">{value}</p>
      </div>
    </div>
  );

  return href ? (
    <a href={href} className="no-underline hover:opacity-80 transition-opacity">{content}</a>
  ) : content;
}

const contactDetails = [
  {
    icon: <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-5 w-5"><path d="M3 4a2 2 0 0 0-2 2v1.161l8.441 4.221a1.25 1.25 0 0 0 1.118 0L19 7.162V6a2 2 0 0 0-2-2H3Z"/><path d="m19 8.839-7.77 3.885a2.75 2.75 0 0 1-2.46 0L1 8.839V14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V8.839Z"/></svg>,
    label: 'General Help Desk',
    value: 'helpdesk@rahat.gov.np',
    href: 'mailto:helpdesk@rahat.gov.np',
  },
  {
    icon: <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-5 w-5"><path fillRule="evenodd" d="M9.661 2.237a.531.531 0 0 1 .678 0 11.947 11.947 0 0 0 7.078 2.749.5.5 0 0 1 .479.425c.069.52.104 1.05.104 1.589 0 5.162-3.26 9.563-7.834 11.256a.48.48 0 0 1-.332 0C5.26 16.563 2 12.162 2 7a11.067 11.067 0 0 1 .104-1.589.5.5 0 0 1 .48-.425 11.947 11.947 0 0 0 7.077-2.749Z" clipRule="evenodd" /></svg>,
    label: 'Relief Coordination',
    value: 'relief@rahat.gov.np',
    href: 'mailto:relief@rahat.gov.np',
  },
  {
    icon: <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-5 w-5"><path fillRule="evenodd" d="M3.5 2A1.5 1.5 0 0 0 2 3.5V5c0 1.149.15 2.263.43 3.326a13.022 13.022 0 0 0 9.244 9.244c1.063.28 2.177.43 3.326.43h1.5a1.5 1.5 0 0 0 1.5-1.5v-1.148a1.5 1.5 0 0 0-1.175-1.465l-3.223-.716a1.5 1.5 0 0 0-1.767 1.052l-.267.933c-.117.41-.555.643-.95.48a11.542 11.542 0 0 1-6.254-6.254c-.163-.395.07-.833.48-.95l.933-.267a1.5 1.5 0 0 0 1.052-1.767l-.716-3.223A1.5 1.5 0 0 0 4.648 2H3.5Z" clipRule="evenodd" /></svg>,
    label: 'Government Coordination',
    value: 'coordination@rahat.gov.np',
    href: 'mailto:coordination@rahat.gov.np',
  },
  {
    icon: <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-5 w-5"><path fillRule="evenodd" d="M18 10a8 8 0 1 1-16 0 8 8 0 0 1 16 0Zm-7-4a1 1 0 1 1-2 0 1 1 0 0 1 2 0ZM9 9a.75.75 0 0 0 0 1.5h.253a.25.25 0 0 1 .244.304l-.459 2.066A1.75 1.75 0 0 0 10.747 15H11a.75.75 0 0 0 0-1.5h-.253a.25.25 0 0 1-.244-.304l.459-2.066A1.75 1.75 0 0 0 9.253 9H9Z" clipRule="evenodd" /></svg>,
    label: 'Technical Support',
    value: 'support@rahat.gov.np',
    href: 'mailto:support@rahat.gov.np',
  },
];

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
              <div className="flex justify-between"><span className="text-ink-700">National Help Desk</span><strong className="text-ink-900">1149</strong></div>
            </div>
          </div>

          <h2 className="serif text-2xl text-navy-900 mb-6">RAHAT Support</h2>
          <div className="space-y-5">
            {contactDetails.map((d) => (
              <ContactDetail key={d.label} {...d} />
            ))}
          </div>

          <div className="mt-8 rounded-xl bg-navy-50 border border-line p-5">
            <p className="text-xs font-semibold uppercase tracking-widest text-ink-500 mb-2">Response Time</p>
            <p className="text-sm text-ink-700 leading-6">
              The RAHAT support desk responds within 2 business days. For urgent coordination
              matters, use the Government Coordination email.
            </p>
          </div>
        </aside>

        {/* Right: contact form */}
        <div className="card-gov lg:col-span-3 p-8">
          <h2 className="serif text-2xl text-navy-900 mb-6">Write to the Help Desk</h2>
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
