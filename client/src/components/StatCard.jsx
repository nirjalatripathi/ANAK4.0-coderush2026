export default function StatCard({ label, value, hint, tone = 'navy' }) {
  const tones = {
    navy: 'border-l-navy-800',
    red: 'border-l-red-700',
    green: 'border-l-emerald-700',
    amber: 'border-l-amber-600',
    gold: 'border-l-gold-500',
  };
  return (
    <article className={`card-gov border-l-4 p-5 ${tones[tone]}`}>
      <p className="text-xs font-semibold uppercase tracking-[0.14em] text-ink-500">{label}</p>
      <p className="mt-2 font-mono text-3xl font-medium text-navy-900">{value ?? 0}</p>
      {hint ? <p className="mt-1 text-sm text-ink-500">{hint}</p> : null}
    </article>
  );
}
