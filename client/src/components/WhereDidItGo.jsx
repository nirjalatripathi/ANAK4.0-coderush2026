import { formatNPR } from '../utils/helpers';

export default function WhereDidItGo({ donation, allocations = [], impact = [] }) {
  const record = impact[0];
  const allocation = allocations[0];
  const camp = donation.camp?.name || record?.location || 'Awaiting allocation';
  const need = donation.itemName || allocation?.itemName || donation.category || 'Highest priority verified need';

  const chain = [
    { label: 'Your donation', value: donation.kind === 'Money' ? formatNPR(donation.amountNPR) : `${donation.quantity} ${donation.itemName}` },
    { label: 'Allocated to', value: need },
    { label: 'Relief center', value: camp },
    { label: 'Used / delivered', value: record ? (donation.kind === 'Money' ? formatNPR(record.amountUsedNPR) : `${record.quantityDelivered} ${record.unit || ''}`.trim()) : 'Not yet recorded' },
    { label: 'Verified', value: record?.verifiedAt ? new Date(record.verifiedAt).toLocaleDateString('en-NP', { year: 'numeric', month: 'long', day: 'numeric' }) : 'Awaiting verification' },
    { label: 'Impact', value: record ? `Supported approximately ${record.peopleSupported || 0} people` : 'Impact not yet recorded' },
  ];

  return (
    <section className="card-gov p-6" aria-labelledby="where-heading">
      <h2 id="where-heading" className="serif text-2xl text-navy-900">Where did my donation go?</h2>
      <p className="mt-2 text-sm text-ink-500">This chain is built from allocation, delivery, and impact records.</p>
      <ol className="mt-6 space-y-0">
        {chain.map((step, index) => (
          <li key={step.label} className="flex gap-4">
            <div className="flex flex-col items-center">
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-navy-900 text-xs font-semibold text-white">{index + 1}</span>
              {index < chain.length - 1 ? <span className="min-h-8 w-px flex-1 bg-line" /> : null}
            </div>
            <div className="pb-5">
              <p className="text-xs uppercase tracking-wide text-ink-500">{step.label}</p>
              <p className="mt-1 font-semibold text-navy-900">{step.value}</p>
            </div>
          </li>
        ))}
      </ol>
    </section>
  );
}
