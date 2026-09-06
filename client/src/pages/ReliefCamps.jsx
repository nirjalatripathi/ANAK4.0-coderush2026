import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { campService } from '../services/campService';
import CampCard from '../components/CampCard';
import Loading from '../components/Loading';
import EmptyState from '../components/EmptyState';
import ResourceCard from '../components/ResourceCard';
import { occupancy, getErrorMessage } from '../utils/helpers';
import StatusBadge from '../components/StatusBadge';

export function CampDetails() {
  const { id } = useParams();
  const [data, setData] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    campService.details(id)
      .then(({ data: payload }) => setData(payload))
      .catch((err) => setError(getErrorMessage(err)))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <div className="mx-auto max-w-5xl px-4 py-12"><Loading /></div>;
  if (error || !data?.camp) return <div className="mx-auto max-w-5xl px-4 py-12 text-red-800">{error || 'Camp not found.'}</div>;

  const camp = data.camp;
  return (
    <div className="mx-auto max-w-5xl px-4 py-12">
      <p className="font-mono text-xs text-ink-500">{camp.campId}</p>
      <h1 className="serif text-4xl text-navy-900">{camp.name}</h1>
      <p className="mt-2 text-ink-700">{camp.location}</p>
      <p className="text-ink-500">{[camp.municipality, camp.district, camp.ward && `Ward ${camp.ward}`].filter(Boolean).join(' · ')}</p>
      <div className="mt-6 grid gap-4 sm:grid-cols-3">
        <div className="card-gov p-4"><p className="text-xs uppercase text-ink-500">Population</p><p className="font-mono text-2xl">{camp.currentPopulation} / {camp.capacity}</p><p>Occupancy {occupancy(camp)}%</p></div>
        <div className="card-gov p-4"><p className="text-xs uppercase text-ink-500">Camp head</p><p className="font-semibold">{camp.campHead || '—'}</p><p className="text-sm">{camp.contactPhone}</p></div>
        <div className="card-gov p-4 space-y-1 text-sm">
          <p>Medical: {camp.medicalStatus}</p>
          <p>Food: {camp.foodStatus}</p>
          <p>Water: {camp.waterStatus}</p>
          <p>Sanitation: {camp.sanitationStatus}</p>
        </div>
      </div>
      <h2 className="serif mt-10 text-2xl text-navy-900">Published relief needs</h2>
      <div className="mt-4 grid gap-4 md:grid-cols-3">
        {(data.inventory || []).filter((item) => (item.shortage || 0) > 0).map((item) => (
          <ResourceCard key={item._id || item.itemName} item={item} />
        ))}
      </div>
      {(data.inventory || []).every((item) => !(item.shortage > 0)) ? (
        <p className="mt-4 text-ink-500">No published shortages for this camp.</p>
      ) : null}
    </div>
  );
}

export default function ReliefCamps() {
  const [camps, setCamps] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    campService.list({ active: 'true' })
      .then(({ data }) => setCamps(data.camps || []))
      .catch((err) => setError(getErrorMessage(err)))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="page-wrap">
      <h1 className="serif text-4xl text-navy-900">Relief camps</h1>
      <p className="mt-3 max-w-2xl text-ink-700">Public camp information includes location, occupancy and resource status. Identity records of people inside a camp are not published here.</p>
      {loading ? <Loading /> : null}
      {error ? <p className="mt-6 text-red-800">{error}</p> : null}
      {!loading && !error && camps.length === 0 ? (
        <div className="mt-8"><EmptyState title="No relief camps are currently registered." /></div>
      ) : null}
      <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {camps.map((camp) => <CampCard key={camp._id} camp={camp} />)}
      </div>
    </div>
  );
}

export function CampStatusPills({ camp }) {
  return (
    <div className="flex flex-wrap gap-2">
      <StatusBadge status={camp.medicalStatus} />
    </div>
  );
}
