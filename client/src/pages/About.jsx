export default function About() {
  return (
    <div className="page-wrap max-w-3xl">
      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-ink-500">About</p>
      <h1 className="serif mt-3 text-4xl text-navy-900">Local disaster response, not a generic website</h1>
      <p className="mt-6 text-lg leading-8 text-ink-700">
        RAHAT helps local authorities move people to declared safe zones and relief camps, calculate real shortages, match donations to those needs, verify delivery, and update inventory.
      </p>
      <div className="mt-12 space-y-8">
        {[
          ['Need before donation', 'Donors respond to calculated camp shortages, not a camp popularity list.'],
          ['Verified receipt', 'Inventory rises by the quantity received, including discrepancies.'],
          ['Resource transfers', 'Surplus at one camp can be approved for a camp that is short.'],
          ['No family reunification or alerts', 'Those systems are out of scope. RAHAT displays disaster status; it does not broadcast alerts.'],
        ].map(([title, body]) => (
          <article key={title}>
            <h2 className="serif text-2xl text-navy-900">{title}</h2>
            <p className="mt-2 leading-7 text-ink-700">{body}</p>
          </article>
        ))}
      </div>
    </div>
  );
}
