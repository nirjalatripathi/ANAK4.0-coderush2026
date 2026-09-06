export default function Loading({ label = 'Loading official records…' }) {
  return (
    <div className="flex items-center gap-3 py-10 text-navy-800" role="status" aria-live="polite">
      <span className="inline-block h-5 w-5 animate-spin rounded-full border-2 border-navy-200 border-t-navy-800" />
      <span className="font-medium">{label}</span>
    </div>
  );
}
