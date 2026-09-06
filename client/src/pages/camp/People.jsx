import { useEffect, useState } from 'react';
import { campService } from '../../services/campService';
import { useAuth } from '../../hooks/useAuth';
import StatusBadge from '../../components/StatusBadge';
import Loading from '../../components/Loading';
import EmptyState from '../../components/EmptyState';
import { ageFromDob, getErrorMessage } from '../../utils/helpers';

export default function CampPeople() {
  const { campOfficial } = useAuth();
  const [people, setPeople] = useState([]);
  const [unregistered, setUnregistered] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const campId = campOfficial?.assignedCamp?._id || campOfficial?.assignedCamp;
    if (!campId) return;
    campService.population(campId)
      .then(({ data }) => {
        setPeople(data.people || []);
        setUnregistered(data.unregistered || []);
      })
      .catch((err) => setError(getErrorMessage(err)))
      .finally(() => setLoading(false));
  }, [campOfficial]);

  if (loading) return <Loading />;
  if (error) return <p className="text-red-800">{error}</p>;

  return (
    <div>
      <h1 className="serif text-3xl text-navy-900">People at this camp</h1>
      <p className="mt-2 text-ink-500">Records entered at check-in. Use Check-in to add a name, age and problems.</p>
      {!people.length && !unregistered.length ? (
        <div className="mt-8"><EmptyState title="No people have been recorded at this camp yet." /></div>
      ) : null}
      <div className="card-gov mt-8 overflow-x-auto">
        <table className="table-gov">
          <thead>
            <tr>
              <th>Name</th>
              <th>Age</th>
              <th>Problems</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {people.map((person) => (
              <tr key={person._id}>
                <td>{person.fullName}</td>
                <td>{ageFromDob(person.dateOfBirth) ?? '—'}</td>
                <td>{person.specialAssistanceNotes || person.currentCondition || '—'}</td>
                <td><StatusBadge status={person.disasterStatus} /></td>
              </tr>
            ))}
            {unregistered.map((person) => (
              <tr key={person._id}>
                <td>{person.name}</td>
                <td>{person.approximateAge || '—'}</td>
                <td>{person.problems || person.notes || '—'}</td>
                <td><StatusBadge status={person.disasterStatus || person.status} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
