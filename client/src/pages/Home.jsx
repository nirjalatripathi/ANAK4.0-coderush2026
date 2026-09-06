import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import StatCard from '../components/StatCard';
import { publicService } from '../services/notificationService';

const flow = [
  'Disaster',
  'Safe zone',
  'Relief camp',
  'Needs',
  'Donation',
  'Delivery',
  'Verified',
  'Shortage reduced',
];

export default function Home() {
  const [stats, setStats] = useState({
    activeDisasters: 0,
    activeSafeZones: 0,
    activeReliefCamps: 0,
    peopleInReliefCamps: 0,
    criticalReliefNeeds: 0,
    donationsInTransit: 0,
  });

  useEffect(() => {
    publicService.stats()
      .then(({ data }) => setStats((prev) => ({ ...prev, ...(data.stats || {}) })))
      .catch(() => {});
  }, []);

  return (
    <div>
      <section className="hero-panel">
        <div className="mx-auto max-w-6xl px-6 py-24 md:py-32">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-gold-500">Local disaster response</p>
          <h1 className="serif mt-5 text-5xl leading-tight md:text-6xl">RAHAT</h1>
          <p className="serif mt-5 max-w-xl text-2xl leading-snug text-white/85">
            Local Disaster Response & Smart Relief Coordination
          </p>
          <p className="mt-8 max-w-xl text-lg leading-8 text-white/75">
            From disaster declaration to verified relief delivery, RAHAT helps local communities coordinate safe zones, relief camps, real needs, resources, and donations.
          </p>
          <div className="mt-12 flex flex-wrap gap-4">
            <Link to="/login" className="btn-gold">Enter RAHAT Portal</Link>
            <Link to="/relief-needs" className="btn-outline border-white/30 bg-transparent text-white">View Relief Needs</Link>
          </div>
        </div>
      </section>

      <section className="page-wrap !pt-20">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-ink-500">Live operations</p>
        <h2 className="serif mt-3 text-3xl text-navy-900">Counts from the RAHAT database</h2>
        <div className="mt-12 grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
          <StatCard label="Active disasters" value={stats.activeDisasters} tone="red" />
          <StatCard label="Active safe zones" value={stats.activeSafeZones} tone="green" />
          <StatCard label="Active relief camps" value={stats.activeReliefCamps} />
          <StatCard label="People in relief camps" value={stats.peopleInReliefCamps} />
          <StatCard label="Critical relief needs" value={stats.criticalReliefNeeds} tone="red" />
          <StatCard label="Donations in transit" value={stats.donationsInTransit} tone="amber" />
        </div>
      </section>

      <section className="border-t border-line bg-white">
        <div className="mx-auto max-w-6xl px-6 py-24">
          <h2 className="serif text-3xl text-navy-900">How RAHAT works</h2>
          <p className="mt-4 max-w-2xl text-ink-700">
            One operational chain: know the disaster, move people to safety, calculate the real need, then verify that the right resources arrived.
          </p>
          <ol className="mt-12 grid gap-x-10 gap-y-8 sm:grid-cols-2 lg:grid-cols-4">
            {flow.map((step, index) => (
              <li key={step}>
                <p className="font-mono text-xs text-teal-700">{String(index + 1).padStart(2, '0')}</p>
                <p className="mt-2 text-lg font-semibold text-navy-900">{step}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>
    </div>
  );
}
