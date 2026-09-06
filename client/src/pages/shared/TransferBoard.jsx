import { useEffect, useState } from 'react';
import { resourceTransferService } from '../../services/resourceTransferService';
import StatusBadge from '../../components/StatusBadge';
import EmptyState from '../../components/EmptyState';
import { getErrorMessage } from '../../utils/helpers';

export default function TransferBoard({ canCreate = false }) {
  const [recs, setRecs] = useState([]);
  const [rows, setRows] = useState([]);
  const [message, setMessage] = useState('');

  const load = async () => {
    const [a, b] = await Promise.all([
      resourceTransferService.recommendations(),
      resourceTransferService.list(),
    ]);
    setRecs(a.data.recommendations || []);
    setRows(b.data.transfers || []);
  };

  useEffect(() => { load().catch((err) => setMessage(getErrorMessage(err))); }, []);

  return (
    <div>
      <h1 className="serif text-3xl text-navy-900">Resource transfers</h1>
      <p className="mt-2 text-ink-500">Surplus at one camp can cover shortage at another. Approval is required.</p>
      {message ? <p className="mt-4">{message}</p> : null}
      <h2 className="serif mt-10 text-2xl">Recommendations</h2>
      <div className="mt-4 space-y-3">
        {recs.length ? recs.slice(0, 8).map((row, index) => (
          <article key={`${row.itemName}-${index}`} className="card-gov p-5">
            <p className="font-semibold">{row.quantity} {row.itemName}</p>
            <p className="mt-1 text-sm text-ink-700">{row.sourceCamp?.name} → {row.destinationCamp?.name}</p>
            <p className="mt-2 text-sm text-ink-500">{row.reason}</p>
            {canCreate ? (
              <button
                type="button"
                className="btn-safe mt-4"
                onClick={async () => {
                  await resourceTransferService.create({
                    itemName: row.itemName,
                    quantity: row.quantity,
                    sourceCamp: row.sourceCamp._id,
                    destinationCamp: row.destinationCamp._id,
                    reason: row.reason,
                    recommended: true,
                  });
                  setMessage('Transfer proposed.');
                  await load();
                }}
              >
                Propose transfer
              </button>
            ) : null}
          </article>
        )) : <EmptyState title="No surplus-to-shortage matches right now." />}
      </div>
      <h2 className="serif mt-12 text-2xl">Tracked transfers</h2>
      <div className="mt-4 space-y-3">
        {rows.map((row) => (
          <article key={row._id} className="card-gov flex flex-col gap-3 p-5 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="font-mono text-xs">{row.transferId}</p>
              <p className="font-semibold">{row.quantity} {row.itemName}</p>
              <p className="text-sm text-ink-500">{row.sourceCamp?.name} → {row.destinationCamp?.name}</p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <StatusBadge status={row.status} />
              {row.status === 'Proposed' && canCreate ? <button type="button" className="btn-outline min-h-10" onClick={async () => { await resourceTransferService.update(row._id, 'Approved'); await load(); }}>Approve</button> : null}
              {row.status === 'Approved' ? <button type="button" className="btn-outline min-h-10" onClick={async () => { await resourceTransferService.update(row._id, 'In Transit'); await load(); }}>Dispatch</button> : null}
              {row.status === 'In Transit' ? <button type="button" className="btn-safe min-h-10" onClick={async () => { await resourceTransferService.update(row._id, 'Received'); await load(); }}>Receive</button> : null}
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
