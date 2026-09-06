import { useEffect, useState } from 'react';
import { missingFoundService } from '../services/missingFoundService';
import MissingPersonCard from '../components/MissingPersonCard';
import Loading from '../components/Loading';
import EmptyState from '../components/EmptyState';
import { getErrorMessage } from '../utils/helpers';

export default function MissingFound() {
  const [records, setRecords] = useState([]);
  const [q, setQ] = useState('');
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = async (params = {}) => {
    setLoading(true);
    setError('');
    try {
      const { data } = await missingFoundService.list(params);
      setRecords(data.records || []);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  return (
    <div className="mx-auto max-w-6xl px-4 py-12">
      <h1 className="serif text-4xl text-navy-900">Missing & Found</h1>
      <p className="mt-3 max-w-3xl text-ink-700">
        This page shows only approved, privacy-safe information: a display name, status, last verified location and last update. Phone numbers, emails, national identity numbers and documents are never published here.
      </p>
      <form
        className="mt-6 grid gap-3 md:grid-cols-3"
        onSubmit={(event) => {
          event.preventDefault();
          load({ q, status });
        }}
      >
        <input className="input-gov" placeholder="Search by published name" value={q} onChange={(e) => setQ(e.target.value)} />
        <select className="select-gov" value={status} onChange={(e) => setStatus(e.target.value)}>
          <option value="">All approved statuses</option>
          <option>Missing</option>
          <option>Found</option>
          <option>In Relief Camp</option>
          <option>Hospitalized</option>
          <option>Transferred</option>
        </select>
        <button className="btn-primary" type="submit">Search public records</button>
      </form>
      {loading ? <Loading /> : null}
      {error ? <p className="mt-6 text-red-800">{error}</p> : null}
      {!loading && !error && records.length === 0 ? (
        <div className="mt-8"><EmptyState title="No approved Missing & Found records are currently published." /></div>
      ) : null}
      <div className="mt-8 grid gap-4 md:grid-cols-2">
        {records.map((record, index) => <MissingPersonCard key={`${record.displayName}-${index}`} record={record} />)}
      </div>
    </div>
  );
}
