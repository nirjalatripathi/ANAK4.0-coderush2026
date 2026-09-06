import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { victimService } from '../services/victimService';
import VictimCard from '../components/VictimCard';
import Loading from '../components/Loading';
import EmptyState from '../components/EmptyState';
import { getErrorMessage } from '../utils/helpers';

const steps = [
  { n: '01', title: 'Apply', body: 'A person asks for verified financial help after a disaster.' },
  { n: '02', title: 'Admin checks', body: 'RAHAT staff review the request before it is shown publicly.' },
  { n: '03', title: 'Donate', body: 'Donors choose a person and continue to official Khalti to pay.' },
  { n: '04', title: 'See progress', body: 'The card updates as money is received toward the requested amount.' },
];

export default function Home() {
  const [victims, setVictims] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    victimService.list()
      .then(({ data }) => setVictims(data.victims || []))
      .catch((err) => setError(getErrorMessage(err, 'Unable to load verified requests.')))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="bg-cream">
      <section className="hero-panel" aria-label="Support verified people">
        <div className="mx-auto grid max-w-7xl gap-10 px-4 py-12 sm:px-6 sm:py-16 lg:grid-cols-[1.1fr_0.9fr] lg:items-center lg:px-8 lg:py-20">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-gold-400">Verified people. Direct support.</p>
            <h1 className="serif mt-4 text-3xl leading-[1.15] text-white sm:text-5xl">Help someone who has already been checked by RAHAT.</h1>
            <p className="mt-5 max-w-xl text-base leading-7 text-white/75 sm:text-lg">
              Requests appear here only after an administrator approves them. You choose a person, give the amount still needed, and pay with Khalti.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <a href="#people" className="btn-gold btn-hero w-full sm:w-auto">Browse people</a>
              <Link to="/apply-support" className="btn-hero w-full border-white/30 bg-transparent text-white hover:bg-white/10 sm:w-auto" style={{ borderWidth: '1.5px' }}>
                Ask for support
              </Link>
            </div>
          </div>
          <figure className="overflow-hidden rounded-2xl border border-white/10 shadow-2xl">
            <img src="/rahat-hero.jpg" alt="Relief supplies being prepared for families" className="h-full w-full object-cover" style={{ maxHeight: 420 }} />
          </figure>
        </div>
      </section>

      <section className="section-gov bg-white" id="people" aria-labelledby="people-heading">
        <div className="section-inner">
          <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div>
              <h2 id="people-heading" className="section-title text-teal-700">People who need support</h2>
              <p className="mt-3 max-w-2xl text-lg font-semibold text-navy-900 sm:text-2xl">Listed like a shop — one card, one verified request.</p>
            </div>
            <Link className="btn-outline" to="/victims">View all</Link>
          </div>

          <div className="mt-10">
            {loading ? <Loading /> : null}
            {error ? <p className="text-red-800">{error}</p> : null}
            {!loading && !error && !victims.length ? (
              <EmptyState title="No verified requests are public yet." body="When an administrator approves an application, it will appear here for donors.">
                <Link className="btn-outline" to="/apply-support">Submit an application</Link>
              </EmptyState>
            ) : null}
            <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
              {victims.slice(0, 6).map((victim) => (
                <VictimCard key={victim.id} victim={victim} />
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="section-gov bg-cream" aria-labelledby="how-heading">
        <div className="section-inner">
          <h2 id="how-heading" className="section-title text-teal-700">How support works</h2>
          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {steps.map((step) => (
              <article key={step.n} className="rounded-2xl border border-line bg-white p-6">
                <p className="font-mono text-sm text-teal-700">{step.n}</p>
                <h3 className="mt-3 text-xl font-semibold text-navy-900">{step.title}</h3>
                <p className="mt-3 text-sm leading-6 text-ink-700">{step.body}</p>
              </article>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
