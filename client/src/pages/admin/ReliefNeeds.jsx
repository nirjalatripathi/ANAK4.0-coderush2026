import { useEffect, useState } from 'react';
import { reliefService } from '../../services/reliefService';
import ReliefNeedCard from '../../components/ReliefNeedCard';
import StatusBadge from '../../components/StatusBadge';
import { getErrorMessage } from '../../utils/helpers';

export default function AdminReliefNeeds() {
  const [needs, setNeeds] = useState([]);
  const [requests, setRequests] = useState([]);
  const [message, setMessage] = useState('');

  const load = async () => {
    const [need, req] = await Promise.all([reliefService.needs(), reliefService.requests()]);
    setNeeds(need.data.needs || []);
    setRequests(req.data.requests || []);
  };

  useEffect(() => { load().catch((err) => setMessage(getErrorMessage(err))); }, []);

  return (
    <div>
      <h1 className="serif text-3xl text-navy-900">Relief needs & requests</h1>
      <p className="mt-2 text-ink-500">Shortage and priority are calculated. Officials verify requests; they do not type a shortage number.</p>
      {message ? <p className="mt-4">{message}</p> : null}
      <div className="mt-6 grid gap-4 lg:grid-cols-3">
        {needs.map((need) => <ReliefNeedCard key={need._id} need={need} />)}
      </div>
      <h2 className="serif mt-10 text-2xl">Camp requests</h2>
      <div className="mt-4 space-y-3">
        {requests.map((request) => (
          <article key={request._id} className="card-gov flex flex-col gap-3 p-4 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="font-semibold">{request.itemName} · {request.camp?.name}</p>
              <p className="font-mono text-xs">{request.requestId}</p>
              <p className="text-sm text-ink-500">{request.priorityReason}</p>
            </div>
            <div className="flex items-center gap-3">
              <StatusBadge status={request.status} />
              {request.status !== 'Verified' ? (
                <button type="button" className="btn-safe min-h-10" onClick={async () => {
                  await reliefService.verifyRequest(request._id);
                  await load();
                }}>Verify</button>
              ) : null}
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
