/**
 * CaptchaWidget — UI integration point for CAPTCHA verification.
 *
 * This is a FRONTEND PLACEHOLDER ONLY.
 * It provides the visual "I'm not a robot" checkbox UX with a
 * simulated verification animation.
 *
 * TO INTEGRATE A REAL CAPTCHA:
 *   1. Install: npm install react-google-recaptcha   (or react-hcaptcha)
 *   2. Obtain a site key from https://www.google.com/recaptcha/admin
 *      or https://www.hcaptcha.com/
 *   3. Replace this component with the real widget and pass the
 *      token back to your contact/form API endpoint for server-side
 *      verification.
 *
 * Props:
 *   onVerify(verified: boolean) — called when verification state changes
 */
import { useState } from 'react';

export default function CaptchaWidget({ onVerify }) {
  const [state, setState] = useState('idle'); // 'idle' | 'checking' | 'verified'

  const handleCheck = () => {
    if (state !== 'idle') return;
    setState('checking');
    // Simulate a brief verification delay
    setTimeout(() => {
      setState('verified');
      onVerify?.(true);
    }, 900);
  };

  return (
    <div className="captcha-widget" role="group" aria-label="Human verification">
      <div className="relative flex h-6 w-6 shrink-0 items-center justify-center">
        {state === 'idle' && (
          <input
            type="checkbox"
            id="captcha-check"
            onChange={handleCheck}
            className="h-5 w-5 cursor-pointer accent-teal-700"
            aria-label="I am not a robot"
          />
        )}
        {state === 'checking' && (
          <span
            className="animate-spin block h-5 w-5 rounded-full border-2 border-navy-200 border-t-teal-700"
            aria-label="Verifying…"
          />
        )}
        {state === 'verified' && (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 20 20"
            fill="#0f766e"
            className="h-6 w-6"
            aria-hidden="true"
          >
            <path
              fillRule="evenodd"
              d="M16.704 4.153a.75.75 0 0 1 .143 1.052l-8 10.5a.75.75 0 0 1-1.127.075l-4.5-4.5a.75.75 0 0 1 1.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 0 1 1.05-.143Z"
              clipRule="evenodd"
            />
          </svg>
        )}
      </div>

      <label htmlFor={state === 'idle' ? 'captcha-check' : undefined} className="flex-1 cursor-pointer select-none">
        <span className={`font-medium ${state === 'verified' ? 'text-teal-700' : 'text-ink-900'}`}>
          {state === 'idle'     && "I'm not a robot"}
          {state === 'checking' && 'Verifying…'}
          {state === 'verified' && 'Verified'}
        </span>
      </label>

      {/* reCAPTCHA branding placeholder */}
      <div className="ml-auto flex flex-col items-center gap-0.5 text-center opacity-40 pointer-events-none select-none">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="28" aria-hidden="true">
          <circle cx="32" cy="32" r="30" fill="#4a90d9" />
          <text x="50%" y="54%" dominantBaseline="middle" textAnchor="middle" fontSize="20" fill="white" fontFamily="Arial">r</text>
        </svg>
        <span className="text-[9px] leading-tight text-ink-500">reCAPTCHA<br/>Privacy · Terms</span>
      </div>
    </div>
  );
}
