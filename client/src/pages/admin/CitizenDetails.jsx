import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { adminService } from '../../services/notificationService';
import StatusBadge from '../../components/StatusBadge';
import Loading from '../../components/Loading';
import { formatDateTime, getErrorMessage } from '../../utils/helpers';

export default function CitizenDetails() {
  const { id } = useParams();
  const [bundle, setBundle] = useState(null);
  const [notes, setNotes] = useState('');
  const [message, setMessage] = useState('');

  const load = async () => {
    const { data } = await adminService.citizen(id);
    setBundle(data);
  };

  useEffect(() => { load().catch((err) => setMessage(getErrorMessage(err))); }, [id]);

  if (!bundle) return <Loading />;
  const { citizen, documents, history, household } = bundle;

  const decide = async (decision) => {
    try {
      await adminService.decide(id, { decision, notes });
      setMessage('Verification decision recorded.');
      await load();
    } catch (error) {
      setMessage(getErrorMessage(error));
    }
  };

  return (
    <div>
      <p className="font-mono text-xs">{citizen.registrationId}</p>
      <h1 className="serif text-3xl text-navy-900">{citizen.fullName}</h1>
      <div className="mt-2 flex flex-wrap gap-2">
        <StatusBadge status={citizen.verificationStatus} />
        <StatusBadge status={citizen.disasterStatus} />
        {citizen.isSuspended ? <StatusBadge status="Suspended" /> : null}
      </div>
      <div className="mt-6 grid gap-4 md:grid-cols-2">
        <article className="card-gov p-5 text-sm">
          <p>Phone: {citizen.phone || '—'}</p>
          <p>Email: {citizen.email || '—'}</p>
          <p>Household: {household?.householdId || '—'}</p>
          <p>Camp: {citizen.currentCamp?.name || '—'}</p>
          <p>National ID: {citizen.nationalId || '—'}</p>
          <p>Citizenship no.: {citizen.citizenshipNumber || '—'}</p>
          <p>Vulnerable: {(citizen.vulnerabilityTypes || []).join(', ') || 'No'}</p>
        </article>
        <article className="card-gov p-5">
          <h2 className="font-semibold">Verification action</h2>
          <textarea className="textarea-gov mt-3" rows="3" value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Review notes" />
          <div className="mt-3 flex flex-wrap gap-2">
            <button className="btn-primary" type="button" onClick={() => decide('approve')}>Verify</button>
            <button className="btn-outline" type="button" onClick={() => decide('resubmit')}>Request resubmission</button>
            <button className="btn-danger" type="button" onClick={() => decide('reject')}>Reject</button>
          </div>
        </article>
      </div>
      <h2 className="serif mt-8 text-2xl">Identity documents</h2>
      <ul className="mt-3 space-y-2">
        {documents?.map((doc) => (
          <li key={doc._id} className="card-gov p-3 text-sm">
            {doc.documentType} · {doc.reviewStatus} ·
            <button
              type="button"
              className="ml-2 underline"
              onClick={async () => {
                const token = localStorage.getItem('rahat_token');
                const response = await fetch(`/api/admin/documents/${doc._id}`, {
                  headers: { Authorization: `Bearer ${token}` },
                });
                if (!response.ok) {
                  setMessage('Unable to open this private document.');
                  return;
                }
                const blob = await response.blob();
                window.open(URL.createObjectURL(blob), '_blank', 'noopener');
              }}
            >Open privately</button>
          </li>
        ))}
      </ul>
      <h2 className="serif mt-8 text-2xl">Household</h2>
      <ul className="mt-3 text-sm">
        {household?.members?.map((m) => (
          <li key={m.citizen?._id}>{m.relationship}: {m.citizen?.fullName} · {m.citizen?.disasterStatus}</li>
        ))}
      </ul>
      <h2 className="serif mt-8 text-2xl">Status history</h2>
      <ul className="mt-3 space-y-2 text-sm">
        {history?.map((row) => (
          <li key={row._id} className="card-gov p-3">{row.previousStatus} → {row.newStatus} · {formatDateTime(row.createdAt)}</li>
        ))}
      </ul>
      <button
        className="btn-outline mt-6"
        type="button"
        onClick={async () => {
          await adminService.updateCitizen(id, { isSuspended: !citizen.isSuspended });
          await load();
        }}
      >{citizen.isSuspended ? 'Reinstate citizen' : 'Suspend citizen'}</button>
      {message ? <p className="mt-4">{message}</p> : null}
    </div>
  );
}
