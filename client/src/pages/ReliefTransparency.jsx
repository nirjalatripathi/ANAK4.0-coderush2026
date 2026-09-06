import { useEffect, useState } from 'react';
import { reliefService } from '../services/reliefService';
import { disasterService } from '../services/disasterService';
import { publicService } from '../services/notificationService';
import StatusBadge from '../components/StatusBadge';
import Loading from '../components/Loading';
import EmptyState from '../components/EmptyState';
import ErrorState from '../components/ErrorState';
import { getErrorMessage } from '../utils/helpers';

export default function ReliefTransparency() {
  const [disaster, setDisaster] = useState(null);
  const [stats, setStats] = useState(null);
  const [needs, setNeeds] = useState([]);
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    Promise.all([
      disasterService.active(),
      publicService.stats(),
      reliefService.needs({ priority: 'CRITICAL' }),
      reliefService.supplyDemand(),
    ]).then(([dis, pub, need, supply]) => {
      setDisaster(dis.data.disasters?.[0] || null);
      setStats(pub.data.stats || {});
      setNeeds(need.data.needs || []);
      setRows(supply.data.rows || []);
    }).catch((err) => setError(getErrorMessage(err))).finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="page-wrap"><Loading /></div>;
  if (error) return <div className="page-wrap"><ErrorState body={error} /></div>;

  const required = rows.reduce((sum, row) => sum + (row.required || 0), 0);
  const gap = rows.reduce((sum, row) => sum + (row.remainingGap || 0), 0);
  const covered = required ? Math.round(((required - gap) / required) * 1000) / 10 : 0;

  return (
    <div className="page-wrap">
      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-ink-500">Public accountability</p>
      <h1 className="serif mt-3 text-4xl text-navy-900">Relief transparency</h1>
      <p className="mt-4 max-w-2xl text-ink-700">
        Aggregated operational totals only. Citizen identities, phone numbers, emails, national IDs and vulnerability records are never published here.
      </p>

      <div className="card-gov mt-10 p-6">
        <h2 className="serif text-2xl">{disaster ? disaster.name : 'No active disaster'}</h2>
        {disaster ? (
          <p className="mt-2 text-ink-700">{disaster.type} · Level {disaster.disasterLevel} · {(disaster.affectedWards || []).join(', ')}</p>
        ) : <EmptyState title="No active public disaster is declared." />}
      </div>

      <div className="mt-8 grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
        <article className="card-gov p-5"><p className="text-sm text-ink-500">Affected population</p><p className="mt-2 font-mono text-3xl">{disaster?.expectedPopulation || 0}</p></article>
        <article className="card-gov p-5"><p className="text-sm text-ink-500">Active safe zones</p><p className="mt-2 font-mono text-3xl">{stats?.activeSafeZones || 0}</p></article>
        <article className="card-gov p-5"><p className="text-sm text-ink-500">Active relief camps</p><p className="mt-2 font-mono text-3xl">{stats?.activeReliefCamps || 0}</p></article>
        <article className="card-gov p-5"><p className="text-sm text-ink-500">Critical needs</p><p className="mt-2 font-mono text-3xl">{stats?.criticalReliefNeeds || 0}</p></article>
        <article className="card-gov p-5"><p className="text-sm text-ink-500">Donations in transit</p><p className="mt-2 font-mono text-3xl">{stats?.donationsInTransit || 0}</p></article>
        <article className="card-gov p-5"><p className="text-sm text-ink-500">Needs covered</p><p className="mt-2 font-mono text-3xl">{covered}%</p><p className="mt-1 text-sm text-ink-500">Unmet {Math.max(0, Math.round((100 - covered) * 10) / 10)}%</p></article>
      </div>

      <h2 className="serif mt-16 text-2xl">Supply versus demand</h2>
      <div className="card-gov mt-5 overflow-x-auto">
        <table className="table-gov">
          <thead>
            <tr>
              <th>Item</th><th>Required</th><th>Available</th><th>Incoming</th><th>Remaining gap</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.itemName}>
                <td>{row.itemName}</td>
                <td className="font-mono">{row.required}</td>
                <td className="font-mono">{row.available}</td>
                <td className="font-mono">{row.incoming}</td>
                <td className="font-mono font-semibold text-red-800">{row.remainingGap}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <h2 className="serif mt-16 text-2xl">Critical shortages</h2>
      <div className="mt-5 grid gap-4 md:grid-cols-2">
        {needs.map((need) => (
          <article key={need._id} className="card-gov p-5">
            <div className="flex justify-between gap-3">
              <p className="font-semibold">{need.itemName} · {need.camp?.name}</p>
              <StatusBadge status={need.priority} />
            </div>
            <p className="mt-2 font-mono">{need.projectedShortage || need.shortage} {need.unit}</p>
          </article>
        ))}
      </div>
    </div>
  );
}
