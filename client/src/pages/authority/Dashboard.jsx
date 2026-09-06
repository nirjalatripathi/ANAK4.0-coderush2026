import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { disasterService } from '../../services/disasterService';
import { safeZoneService } from '../../services/safeZoneService';
import { campService } from '../../services/campService';
import { reliefService } from '../../services/reliefService';
import { useAuth } from '../../hooks/useAuth';
import StatCard from '../../components/StatCard';
import DisasterLevelBadge from '../../components/DisasterLevelBadge';
import Loading from '../../components/Loading';
import { getErrorMessage } from '../../utils/helpers';

export default function AuthorityDashboard() {
  const { localAuthority, user } = useAuth();
  const [data, setData] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    Promise.all([
      disasterService.active(),
      safeZoneService.list({ public: 'true' }),
      campService.list({ active: 'true' }),
      reliefService.needs({ priority: 'CRITICAL' }),
    ]).then(([dis, zones, camps, needs]) => {
      setData({
        disaster: dis.data.disasters?.[0] || null,
        zones: zones.data.safeZones || [],
        camps: camps.data.camps || [],
        needs: needs.data.needs || [],
      });
    }).catch((err) => setError(getErrorMessage(err)));
  }, []);

  if (error) return <p className="text-red-800">{error}</p>;
  if (!data) return <Loading />;

  return (
    <div>
      <p className="text-xs uppercase tracking-[0.16em] text-ink-500">Local authority</p>
      <h1 className="serif mt-2 text-3xl text-navy-900">{localAuthority?.municipality || user?.fullName}</h1>
      <p className="mt-1 text-ink-500">{localAuthority?.district}</p>
      {data.disaster ? (
        <div className="card-gov mt-8 flex flex-col gap-3 p-6 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-sm text-ink-500">Active local disaster</p>
            <p className="serif text-2xl">{data.disaster.name}</p>
            <p className="text-ink-700">{(data.disaster.affectedWards || []).join(', ')}</p>
          </div>
          <DisasterLevelBadge level={data.disaster.disasterLevel} />
        </div>
      ) : null}
      <div className="mt-8 grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Safe zones" value={data.zones.length} tone="green" />
        <StatCard label="Relief camps" value={data.camps.length} />
        <StatCard label="Critical needs" value={data.needs.length} tone="red" />
        <StatCard label="Camp population" value={data.camps.reduce((s, c) => s + (c.currentPopulation || 0), 0)} />
      </div>
      <div className="mt-8 flex flex-wrap gap-3">
        <Link className="btn-primary" to="/authority/disasters">Manage disasters</Link>
        <Link className="btn-safe" to="/authority/safe-zones">Declare safe zones</Link>
        <Link className="btn-outline" to="/authority/population">Population</Link>
        <Link className="btn-outline" to="/authority/transfers">Resource transfers</Link>
      </div>
    </div>
  );
}
