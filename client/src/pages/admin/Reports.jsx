import { useEffect, useState } from 'react';
import { adminService } from '../../services/notificationService';
import Loading from '../../components/Loading';
import { getErrorMessage } from '../../utils/helpers';

export default function AdminReports() {
  const [data, setData] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    adminService.reports()
      .then(({ data: payload }) => setData(payload))
      .catch((err) => setError(getErrorMessage(err)));
  }, []);

  if (error) return <p className="text-red-800">{error}</p>;
  if (!data) return <Loading />;

  return (
    <div>
      <h1 className="serif text-3xl text-navy-900">Reports</h1>
      <p className="mt-2 text-ink-500">Database-backed operational extracts.</p>
      <div className="mt-8 grid gap-5 md:grid-cols-2">
        <article className="card-gov p-6">
          <h2 className="font-semibold">Citizens</h2>
          <p className="mt-2 font-mono text-3xl">{data.citizens?.length || 0}</p>
        </article>
        <article className="card-gov p-6">
          <h2 className="font-semibold">Camps</h2>
          <p className="mt-2 font-mono text-3xl">{data.camps?.length || 0}</p>
        </article>
        <article className="card-gov p-6">
          <h2 className="font-semibold">Donations</h2>
          <p className="mt-2 font-mono text-3xl">{data.donations?.length || 0}</p>
        </article>
        <article className="card-gov p-6">
          <h2 className="font-semibold">Inventory items</h2>
          <p className="mt-2 font-mono text-3xl">{data.inventory?.length || 0}</p>
        </article>
        <article className="card-gov p-6">
          <h2 className="font-semibold">Transfers</h2>
          <p className="mt-2 font-mono text-3xl">{data.transfers?.length || 0}</p>
        </article>
        <article className="card-gov p-6">
          <h2 className="font-semibold">Delivery records</h2>
          <p className="mt-2 font-mono text-3xl">{data.deliveries?.length || 0}</p>
        </article>
      </div>
    </div>
  );
}
