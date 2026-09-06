import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { adminService } from '../../services/notificationService';
import { reliefService } from '../../services/reliefService';
import DisasterLevelBadge from '../../components/DisasterLevelBadge';
import ReliefNeedCard from '../../components/ReliefNeedCard';
import Loading from '../../components/Loading';
import ErrorState from '../../components/ErrorState';
import { formatDateTime, formatNPR, getErrorMessage } from '../../utils/helpers';

function Metric({ label, value, hint, tone = 'navy' }) {
  return (
    <article className={`admin-metric admin-metric--${tone}`}>
      <p>{label}</p>
      <strong>{value ?? 0}</strong>
      {hint ? <span>{hint}</span> : null}
    </article>
  );
}

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
    <div className="admin-dashboard">
      <div className="admin-dashboard__intro">
        <p className="eyebrow text-gold-600">Operations</p>
        <h1 className="serif mt-2 text-3xl text-navy-900 md:text-4xl">{disaster?.municipality || 'RAHAT administration'}</h1>
        <p className="mt-2 max-w-2xl text-ink-700">Live counts from MongoDB. Money donations go through Khalti and stay pending until payment is verified.</p>
      </div>

      {disaster ? (
        <section className="admin-disaster" aria-label="Active disaster">
          <div>
            <p className="eyebrow text-red-200">Active disaster</p>
            <h2 className="serif mt-2 text-2xl text-white md:text-3xl">{disaster.name}</h2>
            <p className="mt-2 text-white/70">{disaster.type} · {(disaster.affectedWards || []).join(', ') || '—'}</p>
          </div>
          <DisasterLevelBadge level={disaster.disasterLevel} />
        </section>
      ) : null}

      <div className="admin-metric-grid">
        <Metric label="Active disasters" value={s.activeDisasters ?? desk.stats?.activeDisasters} tone="red" />
        <Metric label="Affected population" value={s.affectedPeople} />
        <Metric label="Active camps" value={s.reliefCamps} tone="teal" />
        <Metric label="Camp population" value={s.campPopulation} />
        <Metric label="Critical needs" value={s.criticalNeeds} tone="red" />
        <Metric label="Donations in transit" value={s.donationsInTransit} tone="gold" />
        <Metric label="Received donations" value={s.receivedDonations} tone="teal" />
        <Metric label="Unmet needs" value={`${s.unfulfilledDemandPercent || 0}%`} tone="red" />
        <Metric label="Resource transfers" value={s.resourceTransfers} />
        <Metric label="Delivery discrepancies" value={s.deliveryDiscrepancies ?? desk.stats?.discrepancies} tone="gold" />
        <Metric label="Money recorded" value={desk.stats?.totalMoneyDonatedNPR ? formatNPR(desk.stats.totalMoneyDonatedNPR) : formatNPR(0)} tone="khalti" hint="Includes Khalti and recorded gifts" />
        <Metric label="Pending Khalti checks" value={desk.stats?.pendingPayments ?? 0} tone="khalti" hint="Initiated, not yet verified" />
      </div>

      <div className="admin-action-grid">
        <Link className="admin-action" to="/admin/reports?tab=transactions">
          <strong>Khalti payments</strong>
          <span>Review verified and pending Khalti transactions</span>
        </Link>
        <Link className="admin-action" to="/admin/donations?tab=pending">
          <strong>Verify payments</strong>
          <span>Confirm donations that are still pending</span>
        </Link>
        <Link className="admin-action" to="/admin/relief-needs">
          <strong>Relief needs</strong>
          <span>See shortages before allocating supplies</span>
        </Link>
        <Link className="admin-action" to="/admin/victims">
          <strong>Victim applications</strong>
          <span>Approve people before they appear publicly</span>
        </Link>
      </div>

      <h2 className="serif mt-12 text-2xl text-navy-900">Critical relief needs</h2>
      <div className="mt-6 grid gap-5 lg:grid-cols-2">
        {(center.criticalNeedRows || []).length
          ? (center.criticalNeedRows || []).map((need) => <ReliefNeedCard key={need._id} need={need} />)
          : <p className="text-ink-500">No critical needs are listed right now.</p>}
      </div>

      <h2 className="serif mt-12 text-2xl text-navy-900">Recent system activity</h2>
      <ul className="mt-6 space-y-3">
        {(desk.recentActivity || []).map((row) => (
          <li key={row._id} className="admin-activity">
            <span className="font-semibold text-navy-900">{row.action}</span>
            <span className="text-ink-500"> · {row.actorName} · {row.entityId} · {formatDateTime(row.createdAt)}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
