import { Link } from 'react-router-dom';

const steps = [
  { n: '1', title: 'A person applies', body: 'They describe what happened and how much money they still need.' },
  { n: '2', title: 'Admin reviews', body: 'Nothing is public until a RAHAT administrator approves the request.' },
  { n: '3', title: 'The card appears', body: 'Approved people are listed on the homepage like products: photo, story, progress.' },
  { n: '4', title: 'A donor pays with Khalti', body: 'RAHAT starts the donation, then the donor confirms payment on official Khalti. The remaining need updates only after verification.' },
  { n: '5', title: 'Progress updates', body: 'When the goal is reached, the card is marked funded.' },
];

export default function HowItWorks() {
  return (
    <div className="page-wrap bg-cream">
      <h1 className="section-title text-teal-700">How RAHAT works</h1>
      <p className="mt-3 text-2xl font-semibold text-navy-900">Apply. Verify. Donate to a person. Watch the amount fill.</p>
      <ol className="mt-12 grid gap-5 md:grid-cols-5">
        {steps.map((step) => (
          <li key={step.n} className="card-gov p-5">
            <p className="font-mono text-sm text-teal-700">{step.n}</p>
            <h2 className="serif mt-2 text-2xl text-navy-900">{step.title}</h2>
            <p className="mt-2 text-sm text-ink-700">{step.body}</p>
          </li>
        ))}
      </ol>
      <div className="mt-10 flex flex-wrap gap-3">
        <Link className="btn-gold" to="/victims">See verified people</Link>
        <Link className="btn-outline" to="/apply-support">Apply for support</Link>
      </div>
    </div>
  );
}
