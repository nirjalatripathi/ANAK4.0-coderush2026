/**
 * SectionHeader — reusable section heading block.
 *
 * Props:
 *   eyebrow  — small uppercase label (optional)
 *   title    — main heading text
 *   body     — supporting paragraph (optional)
 *   centered — boolean, center-aligns text (default false)
 *   light    — boolean, white text for dark backgrounds (default false)
 *   as       — heading element tag, e.g. 'h1'|'h2'|'h3' (default 'h2')
 */
export default function SectionHeader({ eyebrow, title, body, centered = false, light = false, as: Tag = 'h2' }) {
  const align   = centered ? 'text-center' : '';
  const textCol = light    ? 'text-white'  : 'text-navy-900';
  const bodyCol = light    ? 'text-white/75' : 'text-ink-700';

  return (
    <div className={align}>
      {eyebrow && (
        <p className={`eyebrow mb-3 ${light ? 'text-gold-400' : 'text-teal-700'}`}>
          {eyebrow}
        </p>
      )}
      <Tag className={`serif text-3xl leading-snug md:text-4xl ${textCol}`}>
        {title}
      </Tag>
      {body && (
        <p className={`mt-4 max-w-2xl text-lg leading-8 ${bodyCol} ${centered ? 'mx-auto' : ''}`}>
          {body}
        </p>
      )}
    </div>
  );
}
