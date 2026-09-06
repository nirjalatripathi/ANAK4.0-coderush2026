import { useEffect, useState } from 'react';
import { disasterService } from '../../services/disasterService';
import { campService } from '../../services/campService';
import { useAuth } from '../../hooks/useAuth';
import DisasterLevelBadge from '../../components/DisasterLevelBadge';

export default function CitizenDisasterStatus() {
  const { citizen } = useAuth();
  const [disaster, setDisaster] = useState(null);
  const [camps, setCamps] = useState([]);

  useEffect(() => {
    disasterService.active().then(({ data }) => setDisaster(data.disasters?.[0] || null)).catch(() => {});
    campService.list({ active: 'true' }).then(({ data }) => setCamps(data.camps || [])).catch(() => {});
  }, []);

  return (
    <div>
      <h1 className="serif text-3xl text-navy-900">Disaster and camp status</h1>
      <div className="card-gov mt-8 p-6">
        <p className="text-sm text-ink-500">Your recorded status</p>
        <p className="mt-2 text-xl font-semibold">{citizen?.disasterStatus || 'Not recorded'}</p>
      </div>
      {disaster ? (
        <div className="card-gov mt-6 p-6">
          <p className="serif text-2xl">{disaster.name}</p>
          <div className="mt-3"><DisasterLevelBadge level={disaster.disasterLevel} /></div>
          <p className="mt-3 text-ink-700">{disaster.description}</p>
        </div>
      ) : null}
      <h2 className="serif mt-12 text-2xl">Active relief camps</h2>
      <div className="mt-4 space-y-3">
        {camps.map((camp) => (
          <article key={camp._id} className="card-gov p-5">
            <p className="font-semibold">{camp.name}</p>
            <p className="text-sm text-ink-500">{camp.currentPopulation || 0} / {camp.capacity || 0}</p>
          </article>
        ))}
      </div>
    </div>
  );
}
