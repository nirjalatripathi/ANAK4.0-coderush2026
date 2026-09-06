export function Privacy() {
  return (
    <div className="page-wrap max-w-3xl">
      <h1 className="serif text-4xl text-navy-900">Privacy</h1>
      <div className="mt-6 space-y-5 text-ink-700">
        <p>RAHAT stores citizen and operational records so authorised officials can manage disaster response. National IDs, citizenship numbers, identity documents, private phone numbers, emails, sensitive addresses and individual vulnerability information are never shown on public pages.</p>
        <p>Public transparency pages contain aggregated operational totals only.</p>
        <p>Public pages show operational totals only. Individual problems and identity details stay on authorised desks.</p>
      </div>
    </div>
  );
}

export function Terms() {
  return (
    <div className="page-wrap max-w-3xl">
      <h1 className="serif text-4xl text-navy-900">Terms of use</h1>
      <div className="mt-6 space-y-5 text-ink-700">
        <p>RAHAT is provided for local disaster response, relief-camp operations, verified needs, donations and resource transfers.</p>
        <p>Roles are assigned on the server. Public registration creates a citizen account. Donor registration creates a donor account. Administrator accounts are seeded or issued by an existing administrator.</p>
        <p>Users must submit accurate information to the best of their knowledge.</p>
      </div>
    </div>
  );
}

export function AccessDenied() {
  return (
    <div className="page-wrap max-w-2xl text-center">
      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-red-700">Restricted</p>
      <h1 className="serif mt-4 text-4xl text-navy-900">Access Denied</h1>
      <p className="mt-3 text-xl text-navy-900">Administrator privileges required.</p>
      <p className="mt-5 text-ink-700">This area is reserved for authenticated administrators. Other roles cannot open the admin panel.</p>
    </div>
  );
}
