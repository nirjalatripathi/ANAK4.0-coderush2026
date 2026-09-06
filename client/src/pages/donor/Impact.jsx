import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { donationService } from '../../services/donationService';
import EmptyState from '../../components/EmptyState';
import Loading from '../../components/Loading';
import ErrorState from '../../components/ErrorState';
import { formatNPR, getErrorMessage } from '../../utils/helpers';

const CATEGORIES = [
  { key: 'Water', match: ['Drinking Water'] },
  { key: 'Food', match: ['Rice', 'Baby Food', 'Food Packages', 'Cooking Supplies'] },
  { key: 'Medicine', match: ['Medicines', 'First Aid Kits'] },
  { key: 'Hygiene', match: ['Hygiene Kits', 'Sanitary Products'] },
  { key: 'Shelter', match: ['Blankets', 'Clothes', 'Tents'] },
];

export default function DonorImpact() {
  const [rows, setRows] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    donationService.mine()
      .then(({ data }) => setRows(data.donations || []))
      .catch((err) => setError(getErrorMessage(err)))
      .finally(() => setLoading(false));
  }, []);

  const stats = useMemo(() => {
    const money = rows.filter((row) => row.kind === 'Money').reduce((sum, row) => sum + (row.amountNPR || 0), 0);
    const completed = rows.filter((row) => row.status === 'Completed').length;
    const people = rows.reduce((sum, row) => sum + (row.peopleSupported || 0), 0);
    const categories = CATEGORIES.map((cat) => ({
      ...cat,
      count: rows.filter((row) => cat.match.includes(row.itemName)).length,
    }));
    return { money, completed, people, categories };
  }, [rows]);

  if (loading) return <Loading />;
  if (error) return <ErrorState title="Unable to load impact" body={error} />;

  return (
    <div>
      <h1 className="serif text-3xl text-navy-900">Your impact</h1>
      <div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <article className="card-gov p-5"><p className="text-xs uppercase text-ink-500">Contributed</p><p className="mt-2 text-2xl font-semibold">{stats.money ? formatNPR(stats.money) : 'No money recorded yet'}</p></article>
        <article className="card-gov p-5"><p className="text-xs uppercase text-ink-500">Contributions</p><p className="mt-2 text-2xl font-semibold">{rows.length || 'None yet'}</p></article>
        <article className="card-gov p-5"><p className="text-xs uppercase text-ink-500">Completed</p><p className="mt-2 text-2xl font-semibold">{stats.completed || 'None yet'}</p></article>
        <article className="card-gov p-5"><p className="text-xs uppercase text-ink-500">People supported</p><p className="mt-2 text-2xl font-semibold">{stats.people || 'Not yet recorded'}</p></article>
      </div>
      <h2 className="serif mt-12 text-2xl">Categories you have supported</h2>
      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        {stats.categories.map((cat) => (
          <article key={cat.key} className="card-gov p-5">
            <p className="font-semibold">{cat.key}</p>
            <p className="mt-2 text-ink-700">{cat.count ? `${cat.count} donation${cat.count === 1 ? '' : 's'}` : 'No donations in this category yet'}</p>
          </article>
        ))}
      </div>
      {!rows.length ? (
        <div className="mt-10">
          <EmptyState title="Your impact history will appear after you donate.">
            <Link className="btn-gold" to="/donate">Donate now</Link>
          </EmptyState>
        </div>
      ) : (
        <Link className="btn-outline mt-10" to="/donor/donations">Open donation history</Link>
      )}
    </div>
  );
}
