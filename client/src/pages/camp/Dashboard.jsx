import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { campService } from '../../services/campService';
import { inventoryService } from '../../services/inventoryService';
import { disasterService } from '../../services/disasterService';
import { useAuth } from '../../hooks/useAuth';
import StatCard from '../../components/StatCard';
import ResourceCard from '../../components/ResourceCard';
import Loading from '../../components/Loading';
import { getErrorMessage } from '../../utils/helpers';

export default function CampDashboard() {
  const { campOfficial } = useAuth();
  const [data, setData] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    const campId = campOfficial?.assignedCamp?._id || campOfficial?.assignedCamp;
    if (!campId) return;
    Promise.all([
      campService.population(campId),
      inventoryService.list(campId),
      disasterService.active(),
    ]).then(([pop, inv, dis]) => {
      setData({
        camp: pop.data.camp,
        people: pop.data.people || [],
        inventory: inv.data.items || [],
        disasters: dis.data.disasters || [],
      });
    }).catch((err) => setError(getErrorMessage(err)));
  }, [campOfficial]);

  if (error) return <p className="text-red-800">{error}</p>;
  if (!campOfficial?.assignedCamp) return <Loading label="Loading assigned camp…" />;
  if (!data) return <Loading />;

  const critical = data.inventory.filter((i) => ['CRITICAL', 'HIGH'].includes(i.priority) && (i.shortage || 0) > 0);

  return (
    <div>
      <p className="text-xs uppercase tracking-[0.16em] text-ink-500">Assigned camp</p>
      <h1 className="serif mt-2 text-3xl text-navy-900">{data.camp.name}</h1>
      <p className="text-ink-500">{data.camp.campId} · {data.camp.currentPopulation || 0} / {data.camp.capacity || 0}</p>
      <div className="mt-8 grid gap-5 sm:grid-cols-3">
        <StatCard label="Population" value={data.camp.currentPopulation} />
        <StatCard label="People on record" value={data.people.length} />
        <StatCard label="Critical / high shortages" value={critical.length} tone="red" />
      </div>
      <div className="mt-8 flex flex-wrap gap-3">
        <Link className="btn-safe" to="/camp/check-in">Check people in</Link>
        <Link className="btn-outline" to="/camp/deliveries">Verify deliveries</Link>
        <Link className="btn-outline" to="/camp/inventory">Inventory</Link>
      </div>
      <h2 className="serif mt-12 text-2xl">Shortages</h2>
      <div className="mt-5 grid gap-5 md:grid-cols-2">
        {critical.length ? critical.map((item) => <ResourceCard key={item._id} item={item} />) : <p>No critical shortages.</p>}
      </div>
    </div>
  );
}
