import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { adminService } from '../../services/notificationService';
import { reliefService } from '../../services/reliefService';
import StatCard from '../../components/StatCard';
import DisasterLevelBadge from '../../components/DisasterLevelBadge';
import ReliefNeedCard from '../../components/ReliefNeedCard';
import Loading from '../../components/Loading';
import ErrorState from '../../components/ErrorState';
import { formatDateTime, getErrorMessage } from '../../utils/helpers';

export default function AdminDashboard() {
  const [desk, setDesk] = useState(null);
  const [center, setCenter] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    Promise.all([adminService.dashboard(), reliefService.commandCenter()])
      .then(([dash, cmd]) => {
        setDesk(dash.data);
        setCenter(cmd.data);
      })
      .catch((err) => setError(getErrorMessage(err, 'Access Denied — Administrator privileges required.')));
  }, []);

  if (error) return <ErrorState title="Access Denied" body="Administrator privileges required." />;
  if (!desk || !center) return <Loading />;
  const s = center.stats || {};
  const disaster = center.disaster;

  return (
    <div>
      <p className="text-xs uppercase tracking-[0.16em] text-teal-700">Operations</p>
      <h1 className="serif mt-2 text-3xl text-navy-900">{disaster?.municipality || 'RAHAT administration'}</h1>
      <p className="mt-2 text-ink-500">All figures are counted from MongoDB. Empty collections show 0.</p>

      {disaster ? (
        <div className="card-gov mt-8 flex flex-col gap-4 p-6 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-red-800">Active disaster</p>
            <p className="serif mt-1 text-2xl text-navy-900">{disaster.name}</p>
            <p className="mt-1 text-ink-500">{disaster.type} · {(disaster.affectedWards || []).join(', ') || '—'}</p>
          </div>
          <DisasterLevelBadge level={disaster.disasterLevel} />
        </div>
      ) : null}

      <div className="mt-8 grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
        <StatCard label="Active disasters" value={s.activeDisasters ?? desk.stats?.activeDisasters} tone="red" />
        <StatCard label="Affected population" value={s.affectedPeople} />
        <StatCard label="Active safe zones" value={s.safeZones} tone="green" />
        <StatCard label="Safe-zone capacity" value={s.safeZoneCapacity} hint={s.safeZoneDeficit ? `${s.safeZoneDeficit} additional spaces required` : null} />
        <StatCard label="Active camps" value={s.reliefCamps} />
        <StatCard label="Camp population" value={s.campPopulation} />
        <StatCard label="Critical needs" value={s.criticalNeeds} tone="red" />
        <StatCard label="Donations in transit" value={s.donationsInTransit} tone="amber" />
        <StatCard label="Received donations" value={s.receivedDonations} tone="green" />
        <StatCard label="Unmet needs" value={`${s.unfulfilledDemandPercent || 0}%`} tone="red" />
        <StatCard label="Resource transfers" value={s.resourceTransfers} />
        <StatCard label="Delivery discrepancies" value={s.deliveryDiscrepancies} tone="amber" />
      </div>

      <div className="mt-8 flex flex-wrap gap-3">
        <Link className="btn-primary" to="/admin/disasters">Disasters</Link>
        <Link className="btn-safe" to="/admin/relief-needs">Relief needs</Link>
        <Link className="btn-outline" to="/admin/transfers">Transfers</Link>
        <Link className="btn-outline" to="/admin/audit-logs">Audit logs</Link>
      </div>

      <h2 className="serif mt-14 text-2xl">Critical relief needs</h2>
      <div className="mt-6 grid gap-5 lg:grid-cols-2">
        {(center.criticalNeedRows || []).map((need) => <ReliefNeedCard key={need._id} need={need} />)}
      </div>

      <h2 className="serif mt-14 text-2xl">Recent system activity</h2>
      <ul className="mt-6 space-y-3">
        {(desk.recentActivity || []).map((row) => (
          <li key={row._id} className="card-gov p-5 text-sm">
            <span className="font-semibold">{row.action}</span> · {row.actorName} · {row.entityId} · {formatDateTime(row.createdAt)}
          </li>
        ))}
      </ul>
    </div>
  );
}
