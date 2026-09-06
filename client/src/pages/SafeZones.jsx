import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { safeZoneService } from '../services/safeZoneService';
import SafeZoneCard from '../components/SafeZoneCard';
import ResponseMap from '../components/ResponseMap';
import StatusBadge from '../components/StatusBadge';
import Loading from '../components/Loading';
import EmptyState from '../components/EmptyState';
import ErrorState from '../components/ErrorState';
import { DISASTER_TYPES } from '../utils/constants';
import { getErrorMessage } from '../utils/helpers';

export function SafeZoneDetails() {
  const { id } = useParams();
  const [zone, setZone] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    safeZoneService.details(id)
      .then(({ data }) => setZone(data.safeZone))
      .catch((err) => setError(getErrorMessage(err)));
  }, [id]);

  if (error) return <div className="mx-auto max-w-4xl px-4 py-12"><ErrorState body={error} /></div>;
  if (!zone) return <Loading />;
  const available = Math.max(0, (zone.capacity || 0) - (zone.currentOccupancy || 0));

  return (
    <div className="mx-auto max-w-4xl px-4 py-12">
      <p className="font-mono text-sm text-teal-700">{zone.safeZoneId}</p>
      <h1 className="serif mt-2 text-4xl text-navy-900">{zone.name}</h1>
      <p className="mt-2 text-ink-700">Ward {zone.ward} · {zone.location}</p>
      <div className="mt-4"><StatusBadge status={zone.status} /></div>
      <div className="mt-6 grid gap-3 sm:grid-cols-3">
        <article className="card-gov p-5"><p className="text-xs text-ink-500">Capacity</p><p className="font-mono text-3xl">{zone.capacity}</p></article>
        <article className="card-gov p-5"><p className="text-xs text-ink-500">Current</p><p className="font-mono text-3xl">{zone.currentOccupancy}</p></article>
        <article className="card-gov p-5"><p className="text-xs text-ink-500">Available</p><p className="font-mono text-3xl text-teal-700">{available}</p></article>
      </div>
      <div className="card-gov mt-6 p-6">
        <h2 className="serif text-2xl">Facilities</h2>
        <ul className="mt-3 grid gap-2 sm:grid-cols-2">
          {(zone.facilities || []).map((item) => <li key={item} className="text-ink-700">✓ {item}</li>)}
        </ul>
      </div>
      {zone.latitude && zone.longitude ? (
        <a
          className="btn-safe mt-6"
          href={`https://www.openstreetmap.org/directions?to=${zone.latitude}%2C${zone.longitude}`}
          target="_blank"
          rel="noreferrer"
        >
          Get directions
        </a>
      ) : null}
    </div>
  );
}

export default function SafeZones() {
  const [filters, setFilters] = useState({ ward: '', type: 'Flood', municipality: '' });
  const [zones, setZones] = useState([]);
  const [map, setMap] = useState({ disasters: [], safeZones: [], camps: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = async (coords) => {
    setLoading(true);
    try {
      const params = { public: 'true', ...filters };
      if (coords?.lat) {
        params.lat = coords.lat;
        params.lng = coords.lng;
      }
      const [{ data }, mapRes] = await Promise.all([
        safeZoneService.list(params),
        safeZoneService.map(),
      ]);
      setZones(data.safeZones || []);
      setMap({
        disasters: mapRes.data.disasters || [],
        safeZones: mapRes.data.safeZones || [],
        camps: mapRes.data.camps || [],
      });
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  return (
    <div className="page-wrap">
      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-teal-700">Public safety</p>
      <h1 className="serif mt-2 text-4xl text-navy-900">Find a safe zone</h1>
      <p className="mt-3 max-w-3xl text-ink-700">Declared safe zones for the active disaster. Private citizen records are never shown here.</p>
      <form
        className="card-gov mt-6 grid gap-3 p-5 md:grid-cols-4"
        onSubmit={(e) => { e.preventDefault(); load(); }}
      >
        <div>
          <label className="label-gov">Local government</label>
          <input className="input-gov" value={filters.municipality} onChange={(e) => setFilters({ ...filters, municipality: e.target.value })} placeholder="Suryabinayak" />
        </div>
        <div>
          <label className="label-gov">Ward</label>
          <input className="input-gov" value={filters.ward} onChange={(e) => setFilters({ ...filters, ward: e.target.value })} placeholder="6" />
        </div>
        <div>
          <label className="label-gov">Disaster type</label>
          <select className="select-gov" value={filters.type} onChange={(e) => setFilters({ ...filters, type: e.target.value })}>
            {DISASTER_TYPES.map((type) => <option key={type}>{type}</option>)}
          </select>
        </div>
        <button className="btn-safe self-end" type="submit">Show safe zones</button>
      </form>
      <button
        type="button"
        className="btn-outline mt-3"
        onClick={() => {
          if (!navigator.geolocation) return;
          navigator.geolocation.getCurrentPosition((pos) => load({ lat: pos.coords.latitude, lng: pos.coords.longitude }));
        }}
      >
        Use my current location
      </button>
      {loading ? <div className="mt-8"><Loading /></div> : null}
      {error ? <div className="mt-8"><ErrorState body={error} /></div> : null}
      {!loading && !zones.length ? <div className="mt-8"><EmptyState title="No active safe zones match these filters." /></div> : null}
      <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {zones.map((zone) => <SafeZoneCard key={zone._id} zone={zone} to={`/safe-zones/${zone._id}`} />)}
      </div>
      <div className="mt-10">
        <ResponseMap disasters={map.disasters} safeZones={map.safeZones} camps={map.camps} />
      </div>
      <p className="mt-6 text-sm text-ink-500">Need a camp after check-in? Officials use Transfer to Relief Camp. Public visitors can also <Link className="underline" to="/camps">view relief camps</Link>.</p>
    </div>
  );
}
