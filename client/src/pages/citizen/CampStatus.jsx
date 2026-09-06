import { useEffect, useState } from 'react';
import { campService } from '../../services/campService';
import { useAuth } from '../../hooks/useAuth';

export default function CitizenCampStatus() {
  const { citizen } = useAuth();
  const [camps, setCamps] = useState([]);

  useEffect(() => {
    campService.list({ active: 'true' }).then(({ data }) => setCamps(data.camps || [])).catch(() => {});
  }, []);

  const assigned = camps.find((camp) => String(camp._id) === String(citizen?.currentCamp));

  return (
    <div>
      <h1 className="serif text-3xl text-navy-900">Relief camp status</h1>
      <p className="mt-2 text-ink-500">Your recorded camp location, if an official has checked you in.</p>
      <div className="card-gov mt-8 p-6">
        <p className="text-sm text-ink-500">Your status</p>
        <p className="mt-2 text-xl font-semibold">{citizen?.disasterStatus || 'Not recorded'}</p>
        <p className="mt-2 text-ink-700">{assigned?.name || citizen?.lastKnownLocation || 'No camp check-in is recorded yet.'}</p>
      </div>
      <h2 className="serif mt-12 text-2xl">Active camps</h2>
      <div className="mt-5 space-y-4">
        {camps.map((camp) => (
          <article key={camp._id} className="card-gov p-5">
            <p className="font-semibold">{camp.name}</p>
            <p className="mt-1 text-sm text-ink-500">{camp.currentPopulation || 0} / {camp.capacity || 0} · occupancy {camp.capacity ? Math.round(((camp.currentPopulation || 0) / camp.capacity) * 1000) / 10 : 0}%</p>
          </article>
        ))}
      </div>
    </div>
  );
}
