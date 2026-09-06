import { Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { formatDate } from '../../utils/helpers';

export default function DonorProfile() {
  const { user } = useAuth();

  return (
    <div>
      <h1 className="serif text-3xl text-navy-900">Profile</h1>
      <section className="card-gov mt-8 max-w-xl p-6">
        <dl className="grid gap-4">
          <div><dt className="text-xs uppercase text-ink-500">Name</dt><dd className="font-semibold">{user?.fullName}</dd></div>
          <div><dt className="text-xs uppercase text-ink-500">Email</dt><dd>{user?.email}</dd></div>
          <div><dt className="text-xs uppercase text-ink-500">Role</dt><dd>Donor</dd></div>
          <div><dt className="text-xs uppercase text-ink-500">Account created</dt><dd>{formatDate(user?.createdAt)}</dd></div>
        </dl>
        <p className="mt-6 text-sm text-ink-500">Notification preferences currently follow in-app updates for donation events. Email delivery is optional and not required for this demo.</p>
      </section>
      <div className="mt-8 flex flex-wrap gap-3">
        <Link className="btn-outline" to="/donor/donations">My donations</Link>
        <Link className="btn-outline" to="/donor/impact">My impact</Link>
        <Link className="btn-outline" to="/donor/notifications">Notifications</Link>
      </div>
    </div>
  );
}
