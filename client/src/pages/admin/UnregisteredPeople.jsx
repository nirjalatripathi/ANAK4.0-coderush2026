import { useEffect, useState } from 'react';
import { unregisteredService } from '../../services/unregisteredService';
import StatusBadge from '../../components/StatusBadge';
import { getErrorMessage } from '../../utils/helpers';

export default function AdminUnregistered() {
  const [people, setPeople] = useState([]);
  const [message, setMessage] = useState('');
  const [form, setForm] = useState({});

  const load = async () => {
    const { data } = await unregisteredService.list();
    setPeople(data.people || []);
  };

  useEffect(() => { load().catch((err) => setMessage(getErrorMessage(err))); }, []);

  return (
    <div>
      <h1 className="serif text-3xl text-navy-900">Unregistered people</h1>
      <p className="mt-2 text-ink-700">Match a temporary record to a citizen or household, verify identity, or convert into a citizen record.</p>
      {message ? <p className="mt-3">{message}</p> : null}
      <div className="mt-6 space-y-4">
        {people.map((person) => (
          <article key={person._id} className="card-gov p-5">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="font-mono text-xs">{person.temporaryId}</p>
                <h2 className="serif text-2xl">{person.name}</h2>
                <p className="text-sm">{person.countryOfOrigin} · {person.currentCamp?.name}</p>
              </div>
              <StatusBadge status={person.status} />
            </div>
            <div className="mt-4 grid gap-2 md:grid-cols-3">
              <input className="input-gov" placeholder="Citizen registration ID" onChange={(e) => setForm({ ...form, [person._id]: { ...form[person._id], registrationId: e.target.value } })} />
              <button className="btn-outline" type="button" onClick={async () => {
                await unregisteredService.matchCitizen(person._id, { registrationId: form[person._id]?.registrationId });
                setMessage('Matched to citizen.');
                await load();
              }}>Match citizen</button>
              <button className="btn-primary" type="button" onClick={async () => {
                await unregisteredService.verify(person._id, { notes: 'Verified by administrator' });
                setMessage('Record verified.');
                await load();
              }}>Verify</button>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
