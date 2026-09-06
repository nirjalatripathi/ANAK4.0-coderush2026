import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { donationService } from '../services/donationService';
import { reliefService } from '../services/reliefService';
import Loading from '../components/Loading';
import EmptyState from '../components/EmptyState';
import ErrorState from '../components/ErrorState';
import StatusBadge from '../components/StatusBadge';
import ReliefNeedCard from '../components/ReliefNeedCard';
import { useAuth } from '../hooks/useAuth';
import { getErrorMessage } from '../utils/helpers';

export default function Donations() {
  const { user } = useAuth();
  const [needs, setNeeds] = useState([]);
  const [donations, setDonations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    Promise.all([reliefService.needs(), donationService.list()])
      .then(([needRes, donRes]) => {
        setNeeds(needRes.data.needs || []);
        setDonations(donRes.data.donations || []);
      })
      .catch((err) => setError(getErrorMessage(err)))
      .finally(() => setLoading(false));
  }, []);

  const pledgeTo = user?.role === 'donor' || user?.role === 'admin' ? '/donor/needs' : '/login';

  return (
    <div className="page-wrap">
      <h1 className="serif text-4xl text-navy-900">Donate to verified needs</h1>
      <p className="mt-4 max-w-2xl text-ink-700">
        RAHAT does not accept generic camp donations. Donors respond to a calculated shortage, then officials verify the quantity that actually arrived.
      </p>
      <div className="mt-8">
        <Link to={pledgeTo} className="btn-gold">
          {user?.role === 'donor' || user?.role === 'admin' ? 'Pledge from donor desk' : 'Sign in as a donor to pledge'}
        </Link>
      </div>

      {loading ? <div className="mt-10"><Loading /></div> : null}
      {error ? <div className="mt-10"><ErrorState body={error} /></div> : null}
      {!loading && !needs.length ? <div className="mt-10"><EmptyState title="No active relief needs are currently registered." /></div> : null}

      <div className="mt-12 grid gap-6 md:grid-cols-2">
        {needs.map((need) => (
          <ReliefNeedCard key={need._id} need={need} />
        ))}
      </div>

      <h2 className="serif mt-16 text-2xl text-navy-900">Donation status</h2>
      <p className="mt-2 text-sm text-ink-500">Only donations recorded after administrator verification are listed. Private donor contact details are not published.</p>
      <div className="mt-6 space-y-4">
        {donations.length ? donations.slice(0, 8).map((donation) => (
          <article key={donation._id} className="card-gov p-5">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="font-semibold">{donation.kind === 'Money' ? `NPR ${donation.amountNPR}` : `${donation.quantity} ${donation.itemName}`}</p>
                <p className="mt-1 text-sm text-ink-500">{donation.camp?.name || 'Awaiting allocation'}</p>
                <p className="font-mono text-xs">{donation.donationId}</p>
              </div>
              <StatusBadge status={donation.status} />
            </div>
          </article>
        )) : (
          <EmptyState title="No donations have been recorded yet." body="When a donor submits a contribution, it will appear here after it is saved in the system." />
        )}
      </div>
    </div>
  );
}
