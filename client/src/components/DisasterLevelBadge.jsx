const levels = {
  1: { label: 'LEVEL 1 — LOCAL / LOW', className: 'bg-sky-100 text-sky-900 border-sky-300' },
  2: { label: 'LEVEL 2 — MODERATE', className: 'bg-amber-100 text-amber-900 border-amber-300' },
  3: { label: 'LEVEL 3 — HIGH', className: 'bg-orange-100 text-orange-950 border-orange-300' },
  4: { label: 'LEVEL 4 — SEVERE / EMERGENCY', className: 'bg-red-100 text-red-900 border-red-300' },
};

export default function DisasterLevelBadge({ level }) {
  const meta = levels[Number(level)] || { label: 'Level not declared', className: 'bg-slate-100 text-slate-700 border-slate-300' };
  return (
    <span className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-bold tracking-wide ${meta.className}`}>
      {meta.label}
    </span>
  );
}
