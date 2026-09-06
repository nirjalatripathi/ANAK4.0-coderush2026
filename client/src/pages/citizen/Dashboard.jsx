import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { disasterService } from '../../services/disasterService';
import { safeZoneService } from '../../services/safeZoneService';
import { useAuth } from '../../hooks/useAuth';
import DisasterLevelBadge from '../../components/DisasterLevelBadge';
import SafeZoneCard from '../../components/SafeZoneCard';

export default function CitizenDashboard() {
  const { user, citizen } = useAuth();
  const [disaster, setDisaster] = useState(null);
  const [zones, setZones] = useState([]);

  useEffect(() => {
    disasterService.active().then(({ data }) => setDisaster(data.disasters?.[0] || null)).catch(() => {});
    safeZoneService.list({ public: 'true' }).then(({ data }) => setZones((data.safeZones || []).slice(0, 3))).catch(() => {});
  }, []);

  return (
    <div>
      <h1 className="serif text-3xl text-navy-900">Hello, {user?.fullName}</h1>
      <p className="mt-2 text-ink-500">Your check-in status and the nearest declared safe zones.</p>
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
      <h2 className="serif mt-12 text-2xl">Designated safe zones</h2>
      <div className="mt-6 grid gap-5 lg:grid-cols-3">
        {zones.map((zone) => <SafeZoneCard key={zone._id} zone={zone} to={`/safe-zones/${zone._id}`} />)}
      </div>
      <div className="mt-8 flex gap-3">
        <Link className="btn-outline" to="/relief-needs">Public relief needs</Link>
        <Link className="btn-outline" to="/citizen/profile">Profile</Link>
      </div>
    </div>
  );
}
