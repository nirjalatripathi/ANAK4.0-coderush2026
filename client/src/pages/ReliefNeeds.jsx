import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { reliefService } from '../services/reliefService';
import ReliefNeedCard from '../components/ReliefNeedCard';
import Loading from '../components/Loading';
import EmptyState from '../components/EmptyState';
import ErrorState from '../components/ErrorState';
import { getErrorMessage } from '../utils/helpers';

export default function ReliefNeeds() {
  const [needs, setNeeds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    reliefService.needs()
      .then(({ data }) => setNeeds(data.needs || []))
      .catch((err) => setError(getErrorMessage(err)))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="page-wrap">
      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-teal-700">Verified demand</p>
      <h1 className="serif mt-2 text-4xl text-navy-900">Relief needs</h1>
      <p className="mt-3 max-w-3xl text-ink-700">
        These shortages are calculated from camp inventory: projected available = current + incoming − expected distribution. Donors pledge against a verified need, not a camp popularity contest.
      </p>
      {loading ? <div className="mt-8"><Loading /></div> : null}
      {error ? <div className="mt-8"><ErrorState body={error} /></div> : null}
      {!loading && !needs.length ? <div className="mt-8"><EmptyState title="No active relief needs have been reported." /></div> : null}
      <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {needs.map((need) => <ReliefNeedCard key={need._id} need={need} />)}
      </div>
      <Link to="/donations" className="btn-gold mt-8">Pledge against a verified need</Link>
    </div>
  );
}
