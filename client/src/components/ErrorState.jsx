export default function ErrorState({ title = 'Unable to load this information.', body = 'Please try again. If the problem continues, use the nearest official desk.' }) {
  return (
    <div className="card-gov border-l-4 border-l-red-700 px-6 py-8">
      <p className="serif text-xl text-navy-900">{title}</p>
      <p className="mt-2 text-ink-500">{body}</p>
    </div>
  );
}
