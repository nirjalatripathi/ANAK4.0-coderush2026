import { Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

export default function DonateChoice() {
  const { user } = useAuth();
  const canDonate = user?.role === 'donor' || user?.role === 'admin';
  const supplyTo = !user ? '/login' : canDonate ? '/donor/donate/supplies' : '/register';
  const recommendTo = !user ? '/login' : canDonate ? '/donor/recommend' : '/register';

  return (
    <div className="page-wrap">
      <p className="eyebrow text-teal-700">Make your contribution count</p>
      <h1 className="serif mt-3 text-4xl text-navy-900 md:text-5xl">Donate to a verified person, or send supplies.</h1>
      <p className="mt-4 max-w-2xl text-lg text-ink-700">
        Money for an approved person goes through Khalti. Supply donations still go to a published camp need.
      </p>
      <div className="mt-10 grid gap-6 md:grid-cols-3">
        <Link to="/victims" className="card-hover no-underline p-8">
          <p className="eyebrow text-gold-700">People</p>
          <h2 className="serif mt-3 text-3xl text-navy-900">Support someone on the homepage</h2>
          <p className="mt-3 text-ink-700">Pick a verified card and pay the remaining amount with Khalti.</p>
          <span className="btn-khalti mt-6">Browse people</span>
        </Link>
        <Link to="/donate/money" className="card-hover no-underline p-8">
          <p className="eyebrow text-gold-700">Khalti</p>
          <h2 className="serif mt-3 text-3xl text-navy-900">Pay a general donation</h2>
          <p className="mt-3 text-ink-700">Send money through the official Khalti checkout. RAHAT records it after Khalti confirms.</p>
          <span className="btn-khalti mt-6">Pay with Khalti</span>
        </Link>
        <Link to={supplyTo} state={!user ? { from: '/donor/donate/supplies' } : undefined} className="card-hover no-underline p-8">
          <p className="eyebrow text-teal-700">Physical relief</p>
          <h2 className="serif mt-3 text-3xl text-navy-900">I want to donate goods</h2>
          <p className="mt-3 text-ink-700">See whether an item is still needed before you pledge supplies.</p>
          <span className="btn-primary mt-6">Donate supplies</span>
        </Link>
      </div>
      <div className="mt-8">
        <Link className="btn-outline" to={recommendTo} state={!user ? { from: '/donor/recommend' } : undefined}>
          What should I donate?
        </Link>
      </div>
    </div>
  );
}
