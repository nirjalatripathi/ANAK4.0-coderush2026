import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { reliefService } from '../../services/reliefService';
import { donationService } from '../../services/donationService';
import ReliefNeedCard from '../../components/ReliefNeedCard';
import StatusBadge from '../../components/StatusBadge';
import Loading from '../../components/Loading';
import EmptyState from '../../components/EmptyState';
import { getErrorMessage } from '../../utils/helpers';

export default function DonorDashboard() {
  const [needs, setNeeds] = useState([]);
  const [donations, setDonations] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    Promise.all([reliefService.needs(), donationService.mine()])
      .then(([need, don]) => {
        setNeeds(need.data.needs || []);
        setDonations(don.data.donations || []);
      })
      .catch((err) => setError(getErrorMessage(err)));
  }, []);

  if (error) return <p className="text-red-800">{error}</p>;
  if (!needs && !donations) return <Loading />;

  return (
    <div>
      <h1 className="serif text-3xl text-navy-900">Donor desk</h1>
      <p className="mt-2 text-ink-500">Pledge only against verified shortages.</p>
      <div className="mt-8 flex gap-3">
        <Link className="btn-gold" to="/donor/needs">View verified needs</Link>
        <Link className="btn-outline" to="/donor/donations">My donations</Link>
      </div>
      <h2 className="serif mt-12 text-2xl">Critical and high needs</h2>
      <div className="mt-6 grid gap-5 lg:grid-cols-2">
        {needs.filter((n) => ['CRITICAL', 'HIGH'].includes(n.priority)).slice(0, 4).map((need) => (
          <ReliefNeedCard key={need._id} need={need} />
        ))}
      </div>
      <h2 className="serif mt-12 text-2xl">My donations</h2>
      <div className="mt-6 space-y-3">
        {donations.length ? donations.slice(0, 5).map((row) => (
          <article key={row._id} className="card-gov flex justify-between p-5">
            <div>
              <p className="font-semibold">{row.quantity} {row.itemName}</p>
              <p className="text-sm text-ink-500">{row.camp?.name} · {row.donationId}</p>
            </div>
            <StatusBadge status={row.status} />
          </article>
        )) : <EmptyState title="You have not pledged yet." />}
      </div>
    </div>
  );
}
