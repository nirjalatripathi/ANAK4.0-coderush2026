import { useEffect, useState } from 'react';
import { Link, useLocation, useParams } from 'react-router-dom';
import { donationService } from '../../services/donationService';
import DonationTimeline from '../../components/DonationTimeline';
import WhereDidItGo from '../../components/WhereDidItGo';
import StatusBadge from '../../components/StatusBadge';
import Loading from '../../components/Loading';
import ErrorState from '../../components/ErrorState';
import { formatNPR, getErrorMessage } from '../../utils/helpers';

export default function DonorDonationDetail() {
  const { id } = useParams();
  const location = useLocation();
  const [data, setData] = useState(null);
  const [error, setError] = useState('');
  const [showWhere, setShowWhere] = useState(false);

  useEffect(() => {
    donationService.details(id)
      .then(({ data: payload }) => setData(payload))
      .catch((err) => setError(getErrorMessage(err, 'Unable to load this donation.')));
  }, [id]);

  if (error) return <ErrorState title="Donation not available" body={error} />;
  if (!data?.donation) return <Loading />;

  const row = data.donation;
  const impact = data.impact?.[0];
  const proofs = (impact?.proofs || []).filter((item) => item.donorFacing);
  const printStatement = () => window.print();

  return (
    <div>
      {location.state?.justCreated ? (
        <p className="mb-6 rounded-lg bg-teal-50 px-4 py-3 text-teal-800" role="status">
          Thank you for supporting RAHAT. Donation ID {location.state.justCreated} has been recorded. We will notify you when it is allocated and used.
        </p>
      ) : null}
      <p className="font-mono text-xs text-ink-500">{row.donationId}</p>
      <div className="mt-2 flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="serif text-3xl text-navy-900">{row.kind === 'Money' ? formatNPR(row.amountNPR) : `${row.quantity} ${row.itemName}`}</h1>
          <p className="mt-2 text-ink-500">{row.camp?.name || 'Awaiting allocation'}</p>
        </div>
        <StatusBadge status={row.status} />
      </div>

      {row.kind === 'Money' ? (
        <dl className="card-gov mt-8 grid gap-4 p-6 sm:grid-cols-4">
          <div><dt className="text-xs uppercase text-ink-500">Donated</dt><dd className="font-semibold">{formatNPR(row.amountNPR)}</dd></div>
          <div><dt className="text-xs uppercase text-ink-500">Allocated</dt><dd className="font-semibold">{formatNPR(row.allocatedAmount)}</dd></div>
          <div><dt className="text-xs uppercase text-ink-500">Used</dt><dd className="font-semibold">{formatNPR(row.usedAmount)}</dd></div>
          <div><dt className="text-xs uppercase text-ink-500">Remaining</dt><dd className="font-semibold">{formatNPR(row.remainingAmount)}</dd></div>
        </dl>
      ) : null}

      <h2 className="serif mt-10 text-2xl">Tracking timeline</h2>
      <div className="mt-4">
        <DonationTimeline events={row.timeline} />
      </div>

      {row.status === 'Completed' || impact ? (
        <div className="mt-8 flex flex-wrap gap-3">
          <button type="button" className="btn-gold" onClick={() => setShowWhere((open) => !open)}>Where did my donation go?</button>
          <button type="button" className="btn-outline" onClick={printStatement}>Download impact statement</button>
        </div>
      ) : null}

      {showWhere ? <div className="mt-6"><WhereDidItGo donation={row} allocations={data.allocations} impact={data.impact} /></div> : null}

      {impact ? (
        <section className="card-gov mt-8 p-6 print:shadow-none" id="impact-statement">
          <p className="eyebrow text-teal-700">RAHAT impact statement</p>
          <h2 className="serif mt-2 text-2xl">Donation {row.donationId}</h2>
          <dl className="mt-5 grid gap-3 sm:grid-cols-2">
            <div><dt className="text-xs uppercase text-ink-500">Donor</dt><dd>{row.donorName}</dd></div>
            <div><dt className="text-xs uppercase text-ink-500">Contribution</dt><dd>{row.kind === 'Money' ? formatNPR(row.amountNPR) : `${row.quantity} ${row.itemName}`}</dd></div>
            <div><dt className="text-xs uppercase text-ink-500">Relief center</dt><dd>{row.camp?.name || impact.location || '—'}</dd></div>
            <div><dt className="text-xs uppercase text-ink-500">Need</dt><dd>{impact.itemName}</dd></div>
            <div><dt className="text-xs uppercase text-ink-500">Amount used</dt><dd>{formatNPR(impact.amountUsedNPR)}</dd></div>
            <div><dt className="text-xs uppercase text-ink-500">Relief delivered</dt><dd>{impact.quantityDelivered} {impact.unit}</dd></div>
            <div><dt className="text-xs uppercase text-ink-500">People supported</dt><dd>{impact.peopleSupported || 0}</dd></div>
            <div><dt className="text-xs uppercase text-ink-500">Status</dt><dd>Verified</dd></div>
            <div><dt className="text-xs uppercase text-ink-500">Verified by</dt><dd>{impact.verifiedBy?.fullName || 'RAHAT Administrator'}</dd></div>
          </dl>
          {proofs.length ? (
            <div className="mt-6">
              <p className="font-semibold">Supporting evidence</p>
              <ul className="mt-2 list-disc pl-5 text-sm text-ink-700">
                {proofs.map((proof, index) => <li key={`${proof.caption}-${index}`}>{proof.caption || proof.kind}{proof.url ? ` — ${proof.url}` : ''}</li>)}
              </ul>
            </div>
          ) : null}
        </section>
      ) : (
        <p className="mt-8 text-ink-500">Impact proof will appear here after an administrator verifies distribution.</p>
      )}

      <Link className="btn-outline mt-8" to="/donor/donations">Back to my donations</Link>
    </div>
  );
}
