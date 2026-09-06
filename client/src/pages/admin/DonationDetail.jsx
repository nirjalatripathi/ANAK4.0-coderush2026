import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { donationService } from '../../services/donationService';
import { reliefService } from '../../services/reliefService';
import DonationTimeline from '../../components/DonationTimeline';
import WhereDidItGo from '../../components/WhereDidItGo';
import StatusBadge from '../../components/StatusBadge';
import Loading from '../../components/Loading';
import ErrorState from '../../components/ErrorState';
import { formatNPR, getErrorMessage } from '../../utils/helpers';

export default function AdminDonationDetail() {
  const { id } = useParams();
  const [data, setData] = useState(null);
  const [needs, setNeeds] = useState([]);
  const [needId, setNeedId] = useState('');
  const [impactForm, setImpactForm] = useState({
    amountUsedNPR: '',
    quantityDelivered: '',
    unit: 'L',
    peopleSupported: '150',
    location: '',
    notes: '',
    caption: 'Group relief distribution photo / delivery record',
    donorFacing: true,
  });
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const load = async () => {
    const [{ data: payload }, needRes] = await Promise.all([donationService.details(id), reliefService.needs()]);
    setData(payload);
    setNeeds(needRes.data.needs || []);
    setImpactForm((prev) => ({
      ...prev,
      amountUsedNPR: payload.donation.allocatedAmount || payload.donation.amountNPR || '',
      location: payload.donation.camp?.name || prev.location,
    }));
  };

  useEffect(() => {
    load().catch((err) => setError(getErrorMessage(err, 'Unable to load donation.')));
  }, [id]);

  if (error) return <ErrorState title="Unable to open donation" body={error} />;
  if (!data?.donation) return <Loading />;

  const row = data.donation;
  const run = async (action, success) => {
    setMessage('');
    try {
      await action();
      setMessage(success);
      await load();
    } catch (err) {
      setMessage(getErrorMessage(err, 'This action could not be completed.'));
    }
  };

  return (
    <div>
      <Link className="text-sm" to="/admin/donations">← All donations</Link>
      <p className="mt-4 font-mono text-xs">{row.donationId}</p>
      <div className="mt-2 flex flex-wrap justify-between gap-3">
        <h1 className="serif text-3xl text-navy-900">{row.kind === 'Money' ? formatNPR(row.amountNPR) : `${row.quantity} ${row.itemName}`}</h1>
        <StatusBadge status={row.status} />
      </div>
      <p className="mt-2 text-ink-700">{row.donorName} · {row.kind}</p>
      {row.notes ? <p className="mt-2 text-sm text-ink-500">{row.notes}</p> : null}
      {message ? <p className="mt-4">{message}</p> : null}

      <div className="mt-8 flex flex-wrap gap-3">
        {row.kind === 'Money' && row.status === 'Pending' ? (
          <button type="button" className="btn-gold" onClick={() => run(() => donationService.verifyPayment(row._id), 'Payment marked verified. This is a demo confirmation, not a bank settlement.')}>
            Verify payment
          </button>
        ) : null}
        {['Payment Verified', 'Accepted', 'Pledged'].includes(row.status) ? (
          <form
            className="card-gov flex flex-wrap items-end gap-3 p-4"
            onSubmit={(event) => {
              event.preventDefault();
              run(() => donationService.allocate(row._id, { needId: needId || undefined }), 'Donation allocated to a verified need.');
            }}
          >
            <div>
              <label className="label-gov" htmlFor="need">Allocate to need</label>
              <select id="need" className="select-gov min-w-72" value={needId} onChange={(e) => setNeedId(e.target.value)}>
                <option value="">Highest priority verified need</option>
                {needs.map((need) => (
                  <option key={need._id} value={need._id}>{need.itemName} · {need.camp?.name} · {need.priority}</option>
                ))}
              </select>
            </div>
            <button className="btn-primary" type="submit">Allocate</button>
          </form>
        ) : null}
        {row.status === 'Allocated' ? (
          <button type="button" className="btn-outline" onClick={() => run(() => donationService.updateStatus(row._id, 'In Use'), 'Marked in use.')}>
            Mark in use
          </button>
        ) : null}
      </div>

      {['Allocated', 'In Use', 'Impact Verified'].includes(row.status) ? (
        <form
          className="card-gov mt-8 grid gap-4 p-6 md:grid-cols-2"
          onSubmit={(event) => {
            event.preventDefault();
            run(() => donationService.recordImpact(row._id, {
              amountUsedNPR: Number(impactForm.amountUsedNPR || 0),
              quantityDelivered: Number(impactForm.quantityDelivered || 0),
              unit: impactForm.unit,
              peopleSupported: Number(impactForm.peopleSupported || 0),
              location: impactForm.location,
              notes: impactForm.notes,
              donorFacing: impactForm.donorFacing,
              proofs: [{ kind: 'photo', caption: impactForm.caption, donorFacing: impactForm.donorFacing, url: '' }],
            }), 'Impact recorded and the donor has been notified.');
          }}
        >
          <h2 className="serif text-2xl md:col-span-2">Record impact and proof</h2>
          <div><label className="label-gov">Amount used (NPR)</label><input className="input-gov" type="number" value={impactForm.amountUsedNPR} onChange={(e) => setImpactForm({ ...impactForm, amountUsedNPR: e.target.value })} /></div>
          <div><label className="label-gov">Quantity delivered</label><input className="input-gov" type="number" value={impactForm.quantityDelivered} onChange={(e) => setImpactForm({ ...impactForm, quantityDelivered: e.target.value })} /></div>
          <div><label className="label-gov">Unit</label><input className="input-gov" value={impactForm.unit} onChange={(e) => setImpactForm({ ...impactForm, unit: e.target.value })} /></div>
          <div><label className="label-gov">People supported</label><input className="input-gov" type="number" value={impactForm.peopleSupported} onChange={(e) => setImpactForm({ ...impactForm, peopleSupported: e.target.value })} /></div>
          <div className="md:col-span-2"><label className="label-gov">Location</label><input className="input-gov" value={impactForm.location} onChange={(e) => setImpactForm({ ...impactForm, location: e.target.value })} /></div>
          <div className="md:col-span-2"><label className="label-gov">Verification notes</label><textarea className="textarea-gov" rows="3" value={impactForm.notes} onChange={(e) => setImpactForm({ ...impactForm, notes: e.target.value })} /></div>
          <div className="md:col-span-2"><label className="label-gov">Proof caption</label><input className="input-gov" value={impactForm.caption} onChange={(e) => setImpactForm({ ...impactForm, caption: e.target.value })} /></div>
          <label className="flex items-center gap-2 md:col-span-2">
            <input type="checkbox" checked={impactForm.donorFacing} onChange={(e) => setImpactForm({ ...impactForm, donorFacing: e.target.checked })} />
            Appropriate for donor-facing display
          </label>
          <button className="btn-gold md:col-span-2" type="submit">Verify impact and notify donor</button>
        </form>
      ) : null}

      <div className="mt-10">
        <DonationTimeline events={row.timeline} />
      </div>
      <div className="mt-8">
        <WhereDidItGo donation={row} allocations={data.allocations} impact={data.impact} />
      </div>
    </div>
  );
}
