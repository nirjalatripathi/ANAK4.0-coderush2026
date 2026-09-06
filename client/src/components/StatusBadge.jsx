const styles = {
  Found: 'bg-emerald-100 text-emerald-800 border-emerald-300',
  Verified: 'bg-emerald-100 text-emerald-800 border-emerald-300',
  'In Relief Camp': 'bg-sky-100 text-sky-900 border-sky-300',
  'In Safe Zone': 'bg-teal-100 text-teal-900 border-teal-300',
  'Declared Safe': 'bg-emerald-100 text-emerald-800 border-emerald-300',
  Full: 'bg-red-100 text-red-800 border-red-300',
  Proposed: 'bg-slate-100 text-slate-700 border-slate-300',
  Allocated: 'bg-indigo-100 text-indigo-800 border-indigo-300',
  Prepared: 'bg-slate-100 text-slate-700 border-slate-300',
  Dispatched: 'bg-sky-100 text-sky-900 border-sky-300',
  'Partially Received': 'bg-amber-100 text-amber-900 border-amber-300',
  Verified: 'bg-emerald-100 text-emerald-800 border-emerald-300',
  Submitted: 'bg-sky-100 text-sky-900 border-sky-300',
  Recommended: 'bg-amber-100 text-amber-900 border-amber-300',
  Confirmed: 'bg-emerald-100 text-emerald-800 border-emerald-300',
  Available: 'bg-emerald-100 text-emerald-800 border-emerald-300',
  Busy: 'bg-amber-100 text-amber-900 border-amber-300',
  Unavailable: 'bg-red-100 text-red-800 border-red-300',
  'Emergency Only': 'bg-orange-100 text-orange-900 border-orange-300',
  Missing: 'bg-red-100 text-red-800 border-red-300',
  Critical: 'bg-red-100 text-red-800 border-red-300',
  CRITICAL: 'bg-red-100 text-red-800 border-red-300',
  Hospitalized: 'bg-violet-100 text-violet-800 border-violet-300',
  Transferred: 'bg-indigo-100 text-indigo-800 border-indigo-300',
  Deceased: 'bg-zinc-200 text-zinc-800 border-zinc-400',
  Unverified: 'bg-amber-100 text-amber-900 border-amber-300',
  'Pending Verification': 'bg-amber-100 text-amber-900 border-amber-300',
  'Requires Resubmission': 'bg-orange-100 text-orange-900 border-orange-300',
  Rejected: 'bg-red-100 text-red-800 border-red-300',
  Active: 'bg-red-100 text-red-800 border-red-300',
  'Under Control': 'bg-amber-100 text-amber-900 border-amber-300',
  Recovery: 'bg-sky-100 text-sky-900 border-sky-300',
  Closed: 'bg-zinc-100 text-zinc-700 border-zinc-300',
  Pledged: 'bg-amber-100 text-amber-900 border-amber-300',
  'In Transit': 'bg-sky-100 text-sky-900 border-sky-300',
  Received: 'bg-emerald-100 text-emerald-800 border-emerald-300',
  Distributed: 'bg-slate-100 text-slate-800 border-slate-300',
  HIGH: 'bg-orange-100 text-orange-900 border-orange-300',
  MEDIUM: 'bg-amber-100 text-amber-900 border-amber-300',
  LOW: 'bg-slate-100 text-slate-700 border-slate-300',
  Open: 'bg-red-100 text-red-800 border-red-300',
  Matched: 'bg-sky-100 text-sky-900 border-sky-300',
  Converted: 'bg-emerald-100 text-emerald-800 border-emerald-300',
};

export default function StatusBadge({ status }) {
  if (!status) return <span className="text-ink-500">—</span>;
  return (
    <span className={`inline-flex items-center border px-2 py-0.5 text-xs font-semibold tracking-wide ${styles[status] || 'bg-slate-100 text-slate-700 border-slate-300'}`}>
      {status}
    </span>
  );
}
