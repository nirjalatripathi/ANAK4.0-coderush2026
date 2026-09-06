import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { disasterService } from '../../services/disasterService';
import { useAuth } from '../../hooks/useAuth';
import DisasterLevelBadge from '../../components/DisasterLevelBadge';

export default function CitizenDashboard() {
  const { user, citizen } = useAuth();
  const [disaster, setDisaster] = useState(null);

  useEffect(() => {
    disasterService.active().then(({ data }) => setDisaster(data.disasters?.[0] || null)).catch(() => {});
  }, []);

  return (
    <div>
      <h1 className="serif text-3xl text-navy-900">Hello, {user?.fullName}</h1>
      <p className="mt-2 text-ink-500">Your recorded status and current disaster information.</p>
      {disaster ? (
        <div className="card-gov mt-8 p-6">
          <p className="text-sm text-ink-500">Current disaster</p>
          <p className="serif mt-1 text-2xl">{disaster.name}</p>
          <div className="mt-3"><DisasterLevelBadge level={disaster.disasterLevel} /></div>
        </div>
      ) : <p className="mt-8 text-ink-500">No active disaster is published.</p>}
      <div className="card-gov mt-6 p-6">
        <p className="text-sm text-ink-500">Your recorded location</p>
        <p className="mt-2 text-lg font-semibold">{citizen?.disasterStatus || 'Not checked in'}</p>
        <p className="text-sm text-ink-500">{citizen?.lastKnownLocation || 'An official can record your arrival without you logging in.'}</p>
      </div>
      <div className="mt-8 flex gap-3">
        <Link className="btn-outline" to="/relief-needs">Public relief needs</Link>
        <Link className="btn-outline" to="/citizen/profile">Profile</Link>
      </div>
    </div>
  );
}
