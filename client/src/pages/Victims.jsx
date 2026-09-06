import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { victimService } from '../services/victimService';
import VictimCard from '../components/VictimCard';
import Loading from '../components/Loading';
import EmptyState from '../components/EmptyState';
import { getErrorMessage } from '../utils/helpers';

export default function Victims() {
  const [victims, setVictims] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    victimService.list()
      .then(({ data }) => setVictims(data.victims || []))
      .catch((err) => setError(getErrorMessage(err)))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="page-wrap bg-cream">
      <p className="text-sm font-semibold uppercase tracking-[0.16em] text-teal-700">Verified requests</p>
      <h1 className="serif mt-3 text-4xl text-navy-900">Choose someone to support</h1>
      <p className="mt-4 max-w-2xl text-ink-700">These people were reviewed by a RAHAT administrator. Phone numbers and private documents are never shown here.</p>
      <div className="mt-10">
        {loading ? <Loading /> : null}
        {error ? <p className="text-red-800">{error}</p> : null}
        {!loading && !victims.length ? (
          <EmptyState title="No public requests yet.">
            <Link className="btn-outline" to="/apply-support">Apply for support</Link>
          </EmptyState>
        ) : null}
        <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
          {victims.map((victim) => <VictimCard key={victim.id} victim={victim} />)}
        </div>
      </div>
    </div>
  );
}
