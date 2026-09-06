import { useEffect, useState } from 'react';
import { campService } from '../../services/campService';
import { disasterService } from '../../services/disasterService';
import Loading from '../../components/Loading';
import { getErrorMessage } from '../../utils/helpers';

export default function AuthorityPopulation() {
  const [data, setData] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    Promise.all([
      disasterService.active(),
      campService.list({ active: 'true' }),
    ]).then(([dis, camps]) => {
      const disaster = dis.data.disasters?.[0] || null;
      const campList = camps.data.camps || [];
      const campPop = campList.reduce((sum, row) => sum + (row.currentPopulation || 0), 0);
      const estimated = disaster?.expectedPopulation || disaster?.estimatedAffectedPopulation || 0;
      setData({
        disaster,
        camps: campList,
        campPop,
        unaccounted: Math.max(0, estimated - campPop),
      });
    }).catch((err) => setError(getErrorMessage(err)));
  }, []);

  if (error) return <p className="text-red-800">{error}</p>;
  if (!data) return <Loading />;

  return (
    <div>
      <h1 className="serif text-3xl text-navy-900">Population response</h1>
      <p className="mt-2 text-ink-500">Unaccounted means a person’s current camp location has not been recorded. It does not mean missing.</p>
      <div className="mt-8 grid gap-5 sm:grid-cols-2">
        <article className="card-gov p-5"><p className="text-sm text-ink-500">Estimated affected</p><p className="mt-2 font-mono text-3xl">{data.disaster?.expectedPopulation || 0}</p></article>
        <article className="card-gov p-5"><p className="text-sm text-ink-500">Relief camp population</p><p className="mt-2 font-mono text-3xl">{data.campPop}</p></article>
        <article className="card-gov p-5"><p className="text-sm text-ink-500">Unaccounted response status</p><p className="mt-2 font-mono text-3xl">{data.unaccounted}</p></article>
      </div>
      <h2 className="serif mt-12 text-2xl">Relief camps</h2>
      <div className="mt-5 space-y-3">
        {data.camps.map((camp) => (
          <article key={camp._id} className="card-gov p-5">
            <p className="font-semibold">{camp.name}</p>
            <p className="text-sm text-ink-500">{camp.currentPopulation || 0} / {camp.capacity || 0}</p>
          </article>
        ))}
      </div>
    </div>
  );
}
