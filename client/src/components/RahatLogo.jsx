/**
 * RahatLogo — emblem-only SVG icon for RAHAT.
 * No text is included. The word "RAHAT" must be displayed
 * separately alongside this component.
 *
 * Props:
 *   size   — number (pixel dimension, default 40)
 *   light  — boolean (renders in light colours for dark backgrounds)
 */
export default function RahatLogo({ size = 40, light = false }) {
  const primary = light ? '#ffffff' : '#0d1f38';
  const accent  = light ? '#5ecec5' : '#0f766e';
  const bg      = light ? 'rgba(255,255,255,0.15)' : '#e4ebf4';

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 100 100"
      width={size}
      height={size}
      aria-hidden="true"
      focusable="false"
      style={{ display: 'block', flexShrink: 0 }}
    >
      {/* Background circle */}
      <circle cx="50" cy="50" r="48" fill={bg} />

      {/* Protective hands (arching over the top) */}
      {/* Left hand */}
      <path
        d="M14 46 Q10 28 28 20 Q38 16 44 26"
        fill="none"
        stroke={accent}
        strokeWidth="7"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* Right hand */}
      <path
        d="M86 46 Q90 28 72 20 Q62 16 56 26"
        fill="none"
        stroke={accent}
        strokeWidth="7"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* Hands meeting at top */}
      <path
        d="M44 26 Q50 18 56 26"
        fill="none"
        stroke={accent}
        strokeWidth="7"
        strokeLinecap="round"
      />

      {/* Shelter / roof shape */}
      <path
        d="M28 58 L50 38 L72 58 Z"
        fill={primary}
        opacity="0.9"
      />

      {/* Building body */}
      <rect x="36" y="58" width="28" height="20" rx="2" fill={primary} opacity="0.9" />
      {/* Door */}
      <rect x="44" y="66" width="12" height="12" rx="2" fill={light ? 'rgba(255,255,255,0.3)' : '#e4ebf4'} />

      {/* Three community figures inside shelter */}
      {/* Left figure */}
      <circle cx="38" cy="54" r="3.5" fill={accent} />
      <path d="M38 58 L38 64" stroke={accent} strokeWidth="2.5" strokeLinecap="round" />

      {/* Centre figure (larger — focal point) */}
      <circle cx="50" cy="52" r="4" fill={accent} />
      <path d="M50 56 L50 64" stroke={accent} strokeWidth="2.5" strokeLinecap="round" />

      {/* Right figure */}
      <circle cx="62" cy="54" r="3.5" fill={accent} />
      <path d="M62 58 L62 64" stroke={accent} strokeWidth="2.5" strokeLinecap="round" />
    </svg>
  );
}
