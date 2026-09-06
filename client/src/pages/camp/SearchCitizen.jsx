import { useState } from 'react';
import { Link } from 'react-router-dom';
import { campService } from '../../services/campService';
import StatusBadge from '../../components/StatusBadge';
import EmptyState from '../../components/EmptyState';
import { getErrorMessage } from '../../utils/helpers';

export default function SearchCitizen() {
  const [query, setQuery] = useState({ fullName: '', registrationId: '', householdId: '', nationalId: '', dob: '', phone: '' });
  const [results, setResults] = useState([]);
  const [message, setMessage] = useState('');
  const [searched, setSearched] = useState(false);

  const onSubmit = async (event) => {
    event.preventDefault();
    setMessage('');
    try {
      const { data } = await campService.searchCitizens(query);
      setResults(data.citizens || []);
      setSearched(true);
      if (data.message) setMessage(data.message);
    } catch (error) {
      setMessage(getErrorMessage(error));
    }
  };

  return (
    <div>
      <h1 className="serif text-3xl text-navy-900">Search the central registry</h1>
      <p className="mt-2 max-w-3xl text-ink-700">A person does not need to log in, carry a phone, or remember a password. Search by any known field and update their disaster status on their behalf.</p>
      <form className="card-gov mt-6 grid gap-3 p-6 md:grid-cols-2" onSubmit={onSubmit}>
        <div><label className="label-gov">Full name</label><input className="input-gov" value={query.fullName} onChange={(e) => setQuery({ ...query, fullName: e.target.value })} /></div>
        <div><label className="label-gov">Registration ID</label><input className="input-gov" value={query.registrationId} onChange={(e) => setQuery({ ...query, registrationId: e.target.value })} /></div>
        <div><label className="label-gov">Household ID</label><input className="input-gov" value={query.householdId} onChange={(e) => setQuery({ ...query, householdId: e.target.value })} /></div>
        <div><label className="label-gov">National ID / citizenship no.</label><input className="input-gov" value={query.nationalId} onChange={(e) => setQuery({ ...query, nationalId: e.target.value })} /></div>
        <div><label className="label-gov">Date of birth</label><input type="date" className="input-gov" value={query.dob} onChange={(e) => setQuery({ ...query, dob: e.target.value })} /></div>
        <div><label className="label-gov">Phone</label><input className="input-gov" value={query.phone} onChange={(e) => setQuery({ ...query, phone: e.target.value })} /></div>
        <button className="btn-gold md:col-span-2" type="submit">Search authorised records</button>
      </form>
      {message ? <p className="mt-4">{message}</p> : null}
      {searched && results.length === 0 ? <div className="mt-6"><EmptyState title="No matching citizen was found." body="If the person was never registered, open Unregistered People." /></div> : null}
      <div className="mt-6 overflow-x-auto card-gov">
        <table className="table-gov">
          <thead><tr><th>Name</th><th>IDs</th><th>Status</th><th>Household</th><th></th></tr></thead>
          <tbody>
            {results.map((person) => (
              <tr key={person._id}>
                <td>
                  <p className="font-semibold">{person.fullName}</p>
                  <p className="text-xs text-ink-500">{person.gender}{person.isVulnerable ? ' · Vulnerable' : ''}</p>
                </td>
                <td className="font-mono text-xs">{person.registrationId}<br />{person.phone || ''}</td>
                <td><StatusBadge status={person.disasterStatus} /></td>
                <td className="font-mono text-xs">{person.household?.householdId || '—'}</td>
                <td><Link className="btn-outline min-h-10" to={`/camp/update/${person._id}`}>Update</Link></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
