export default function EmptyState({ title, body, children }) {
  return (
    <div className="card-gov px-6 py-10 text-center">
      <p className="serif text-xl text-navy-900">{title}</p>
      {body ? <p className="mt-2 text-ink-500">{body}</p> : null}
      {children ? <div className="mt-5">{children}</div> : null}
    </div>
  );
}
