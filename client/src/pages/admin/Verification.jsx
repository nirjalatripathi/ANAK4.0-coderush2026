import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { adminService } from '../../services/notificationService';
import StatusBadge from '../../components/StatusBadge';
import EmptyState from '../../components/EmptyState';
import { getErrorMessage } from '../../utils/helpers';

export default function AdminVerification() {
  const [citizens, setCitizens] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    adminService.verification()
      .then(({ data }) => setCitizens(data.citizens || []))
      .catch((err) => setError(getErrorMessage(err)));
  }, []);

  return (
    <div>
      <h1 className="serif text-3xl text-navy-900">Identity verification queue</h1>
      {error ? <p className="text-red-800">{error}</p> : null}
      {citizens.length === 0 ? <div className="mt-6"><EmptyState title="No pending verification requests." /></div> : null}
      <ul className="mt-6 space-y-3">
        {citizens.map((citizen) => (
          <li key={citizen._id} className="card-gov flex items-center justify-between gap-4 p-4">
            <div>
              <p className="font-semibold">{citizen.fullName}</p>
              <p className="font-mono text-xs">{citizen.registrationId}</p>
              <StatusBadge status={citizen.verificationStatus} />
            </div>
            <Link className="btn-primary" to={`/admin/citizens/${citizen._id}`}>Review</Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
