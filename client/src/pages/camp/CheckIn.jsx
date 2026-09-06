import { useEffect, useState } from 'react';
import { campService } from '../../services/campService';
import { safeZoneService } from '../../services/safeZoneService';
import { unregisteredService } from '../../services/unregisteredService';
import StatusBadge from '../../components/StatusBadge';
import EmptyState from '../../components/EmptyState';
import { getErrorMessage } from '../../utils/helpers';

const emptyArrival = {
  name: '',
  age: '',
  gender: 'Female',
  problems: '',
};

export default function CheckIn() {
  const [zones, setZones] = useState([]);
  const [query, setQuery] = useState({ householdId: '', fullName: '', registrationId: '' });
  const [results, setResults] = useState([]);
  const [arrival, setArrival] = useState(emptyArrival);
  const [form, setForm] = useState({ safeZoneId: '', currentCondition: 'Stable', notes: '' });
  const [message, setMessage] = useState('');

  useEffect(() => {
    safeZoneService.list().then(({ data }) => {
      setZones(data.safeZones || []);
      if (data.safeZones?.[0]) setForm((prev) => ({ ...prev, safeZoneId: data.safeZones[0]._id }));
    }).catch((err) => setMessage(getErrorMessage(err)));
  }, []);

  const search = async (event) => {
    event.preventDefault();
    try {
      const { data } = await campService.searchCitizens(query);
      setResults(data.citizens || []);
      setMessage(data.message || `${(data.citizens || []).length} record(s) found.`);
    } catch (error) {
      setMessage(getErrorMessage(error));
    }
  };

  const recordArrival = async (event) => {
    event.preventDefault();
    if (!arrival.name.trim()) {
      setMessage('Enter the person’s name.');
      return;
    }
    try {
      const { data } = await unregisteredService.create({
        name: arrival.name.trim(),
        approximateAge: arrival.age,
        gender: arrival.gender,
        problems: arrival.problems,
        notes: arrival.problems,
        currentLocation: zones.find((zone) => zone._id === form.safeZoneId)?.name || '',
      });
      if (form.safeZoneId) {
        await safeZoneService.checkIn(form.safeZoneId, {
          unregisteredId: data.person._id,
          safeZoneId: form.safeZoneId,
          currentCondition: form.currentCondition,
          specialNeeds: arrival.problems,
          notes: form.notes,
        });
      }
      setMessage(`${arrival.name} recorded${data.person?.temporaryId ? ` as ${data.person.temporaryId}` : ''}.`);
      setArrival(emptyArrival);
    } catch (error) {
      setMessage(getErrorMessage(error, 'Unable to record this person.'));
    }
  };

  const checkPerson = async (citizenId) => {
    try {
      await safeZoneService.checkIn(form.safeZoneId, {
        citizenId,
        safeZoneId: form.safeZoneId,
        currentCondition: form.currentCondition,
        specialNeeds: arrival.problems,
        notes: form.notes,
        familyMembersCount: 1,
      });
      setMessage('Person checked in. Occupancy was recalculated from check-in records.');
    } catch (error) {
      setMessage(getErrorMessage(error));
    }
  };

  return (
    <div>
      <h1 className="serif text-3xl text-navy-900">Check-in</h1>
      <p className="mt-2 max-w-2xl text-ink-700">
        Enter the person’s name, age and problems. They do not need a RAHAT account.
      </p>

      <form className="card-gov mt-8 grid gap-5 p-8 md:grid-cols-2" onSubmit={recordArrival}>
        <div className="md:col-span-2 serif text-xl text-navy-900">Record a person</div>
        <div>
          <label className="label-gov">Name</label>
          <input className="input-gov" value={arrival.name} onChange={(e) => setArrival({ ...arrival, name: e.target.value })} required />
        </div>
        <div>
          <label className="label-gov">Age</label>
          <input className="input-gov" type="number" min="0" max="120" value={arrival.age} onChange={(e) => setArrival({ ...arrival, age: e.target.value })} required />
        </div>
        <div>
          <label className="label-gov">Gender</label>
          <select className="select-gov" value={arrival.gender} onChange={(e) => setArrival({ ...arrival, gender: e.target.value })}>
            <option>Female</option><option>Male</option><option>Other</option><option>Unknown</option>
          </select>
        </div>
        <div>
          <label className="label-gov">Safe zone</label>
          <select className="select-gov" value={form.safeZoneId} onChange={(e) => setForm({ ...form, safeZoneId: e.target.value })}>
            {zones.map((zone) => <option key={zone._id} value={zone._id}>{zone.name}</option>)}
          </select>
        </div>
        <div className="md:col-span-2">
          <label className="label-gov">Problems</label>
          <textarea
            className="textarea-gov"
            rows="3"
            value={arrival.problems}
            onChange={(e) => setArrival({ ...arrival, problems: e.target.value })}
            placeholder="Injury, medicine needed, disability, pregnancy, or other assistance"
          />
        </div>
        <button className="btn-safe md:col-span-2" type="submit">Save arrival</button>
      </form>

      <form className="card-gov mt-10 grid gap-5 p-8 md:grid-cols-3" onSubmit={search}>
        <div className="md:col-span-3 serif text-xl text-navy-900">Find an existing record</div>
        <div>
          <label className="label-gov">Household ID</label>
          <input className="input-gov" value={query.householdId} onChange={(e) => setQuery({ ...query, householdId: e.target.value })} />
        </div>
        <div>
          <label className="label-gov">Name</label>
          <input className="input-gov" value={query.fullName} onChange={(e) => setQuery({ ...query, fullName: e.target.value })} />
        </div>
        <div>
          <label className="label-gov">Registration ID</label>
          <input className="input-gov" value={query.registrationId} onChange={(e) => setQuery({ ...query, registrationId: e.target.value })} />
        </div>
        <button className="btn-outline md:col-span-3" type="submit">Search</button>
      </form>

      {message ? <p className="mt-6">{message}</p> : null}
      {!results.length ? <div className="mt-6"><EmptyState title="No search results yet." /></div> : null}
      <div className="mt-6 space-y-3">
        {results.map((person) => (
          <article key={person._id} className="card-gov flex flex-col gap-3 p-5 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="font-semibold">{person.fullName}</p>
              <p className="font-mono text-xs">{person.registrationId}</p>
              <StatusBadge status={person.disasterStatus} />
            </div>
            <button type="button" className="btn-primary" onClick={() => checkPerson(person._id)}>Check this person in</button>
          </article>
        ))}
      </div>
    </div>
  );
}
