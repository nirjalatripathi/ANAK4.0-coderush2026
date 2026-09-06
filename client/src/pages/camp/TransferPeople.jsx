import { useState } from 'react';
import { campService } from '../../services/campService';
import { useAuth } from '../../hooks/useAuth';
import StatusBadge from '../../components/StatusBadge';
import { getErrorMessage } from '../../utils/helpers';

export default function TransferPeople() {
  const { campOfficial } = useAuth();
  const [query, setQuery] = useState({ householdId: '', fullName: '' });
  const [results, setResults] = useState([]);
  const [reason, setReason] = useState('Shelter capacity and relief services');
  const [message, setMessage] = useState('');
  const campName = campOfficial?.assignedCamp?.name || 'Assigned relief camp';

  return (
    <div>
      <h1 className="serif text-3xl text-navy-900">Record arrival at relief camp</h1>
      <p className="mt-2 max-w-3xl text-ink-700">Search for a person and mark them present at {campName}.</p>
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
                  await campService.updateStatus(person._id, {
                    disasterStatus: 'In Relief Camp',
                    currentLocation: campName,
                    notes: reason,
                  });
                  setMessage(`${person.fullName} recorded at ${campName}.`);
                } catch (error) {
                  setMessage(getErrorMessage(error));
                }
              }}
            >
              Record at my camp
            </button>
          </article>
        ))}
      </div>
    </div>
  );
}
