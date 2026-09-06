import { useEffect, useState } from 'react';
import { campService } from '../../services/campService';
import { safeZoneService } from '../../services/safeZoneService';
import { useAuth } from '../../hooks/useAuth';
import StatusBadge from '../../components/StatusBadge';
import { getErrorMessage } from '../../utils/helpers';

export default function TransferPeople() {
  const { campOfficial } = useAuth();
  const [zones, setZones] = useState([]);
  const [query, setQuery] = useState({ householdId: 'HH-2026-000001', fullName: '' });
  const [results, setResults] = useState([]);
  const [fromSafeZoneId, setFromSafeZoneId] = useState('');
  const [reason, setReason] = useState('Shelter capacity and relief services');
  const [transport, setTransport] = useState('Municipal vehicle');
  const [message, setMessage] = useState('');
  const campId = campOfficial?.assignedCamp?._id || campOfficial?.assignedCamp;

  useEffect(() => {
    safeZoneService.list().then(({ data }) => {
      setZones(data.safeZones || []);
      if (data.safeZones?.[0]) setFromSafeZoneId(data.safeZones[0]._id);
    }).catch((err) => setMessage(getErrorMessage(err)));
  }, []);

  return (
    <div>
      <h1 className="serif text-3xl text-navy-900">Transfer to relief camp</h1>
      <p className="mt-2 max-w-3xl text-ink-700">When a person leaves a safe zone, occupancy falls and camp population rises. The person cannot remain marked present in two places.</p>
      <form
        className="card-gov mt-6 grid gap-3 p-6 md:grid-cols-2"
        onSubmit={async (e) => {
          e.preventDefault();
          try {
            const { data } = await campService.searchCitizens(query);
            setResults(data.citizens || []);
          } catch (error) {
            setMessage(getErrorMessage(error));
          }
        }}
      >
        <div><label className="label-gov">Household ID</label><input className="input-gov" value={query.householdId} onChange={(e) => setQuery({ ...query, householdId: e.target.value })} /></div>
        <div><label className="label-gov">Name</label><input className="input-gov" value={query.fullName} onChange={(e) => setQuery({ ...query, fullName: e.target.value })} /></div>
        <div>
          <label className="label-gov">From safe zone</label>
          <select className="select-gov" value={fromSafeZoneId} onChange={(e) => setFromSafeZoneId(e.target.value)}>
            {zones.map((zone) => <option key={zone._id} value={zone._id}>{zone.name}</option>)}
          </select>
        </div>
        <div><label className="label-gov">Transport</label><input className="input-gov" value={transport} onChange={(e) => setTransport(e.target.value )} /></div>
        <div className="md:col-span-2"><label className="label-gov">Reason</label><input className="input-gov" value={reason} onChange={(e) => setReason(e.target.value)} /></div>
        <button className="btn-gold md:col-span-2" type="submit">Search people</button>
      </form>
      {message ? <p className="mt-4">{message}</p> : null}
      <div className="mt-6 space-y-3">
        {results.map((person) => (
          <article key={person._id} className="card-gov flex flex-col gap-3 p-4 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="font-semibold">{person.fullName}</p>
              <p className="font-mono text-xs">{person.registrationId}</p>
              <StatusBadge status={person.disasterStatus} />
            </div>
            <button
              type="button"
              className="btn-primary"
              onClick={async () => {
                try {
                  await safeZoneService.transfer({
                    citizenId: person._id,
                    fromSafeZoneId,
                    toCampId: campId,
                    reason,
                    transport,
                  });
                  setMessage(`${person.fullName} transferred to the assigned camp. Population and occupancy updated.`);
                } catch (error) {
                  setMessage(getErrorMessage(error));
                }
              }}
            >
              Transfer to my camp
            </button>
          </article>
        ))}
      </div>
    </div>
  );
}
