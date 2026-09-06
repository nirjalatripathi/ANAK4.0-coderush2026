import { useEffect, useState } from 'react';
import { householdService } from '../../services/householdService';
import FamilyMemberCard from '../../components/FamilyMemberCard';
import Loading from '../../components/Loading';
import EmptyState from '../../components/EmptyState';
import { RELATIONSHIPS } from '../../utils/constants';
import { getErrorMessage } from '../../utils/helpers';

export default function MyHousehold() {
  const [household, setHousehold] = useState(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [member, setMember] = useState({ registrationId: '', relationship: 'Other' });

  const load = async () => {
    const { data } = await householdService.me();
    setHousehold(data.household);
  };

  useEffect(() => {
    load().catch((err) => setMessage(getErrorMessage(err))).finally(() => setLoading(false));
  }, []);

  if (loading) return <Loading />;
  if (!household) {
    return (
      <div>
        <EmptyState title="No household is linked to this account." body="Create one to record family relationships before a disaster." />
        <button className="btn-primary mt-4" type="button" onClick={async () => {
          try {
            await householdService.create({});
            await load();
          } catch (error) {
            setMessage(getErrorMessage(error));
          }
        }}>Create household</button>
        {message ? <p className="mt-3">{message}</p> : null}
      </div>
    );
  }

  return (
    <div>
      <h1 className="serif text-3xl text-navy-900">Household {household.householdId}</h1>
      <p className="mt-2 text-ink-700">Head of household and {household.memberCount} recorded members.</p>
      <div className="mt-6 grid gap-4 md:grid-cols-2">
        {household.members?.map((item) => (
          <FamilyMemberCard key={item.citizen?._id} member={item} relationship={item.relationship} />
        ))}
      </div>
      <form
        className="card-gov mt-8 grid gap-3 p-6 md:grid-cols-3"
        onSubmit={async (event) => {
          event.preventDefault();
          try {
            await householdService.addMember(member);
            setMessage('Member added.');
            await load();
          } catch (error) {
            setMessage(getErrorMessage(error));
          }
        }}
      >
        <div className="md:col-span-3 serif text-xl">Add a registered family member</div>
        <input className="input-gov" placeholder="Registration ID" value={member.registrationId} onChange={(e) => setMember({ ...member, registrationId: e.target.value })} required />
        <select className="select-gov" value={member.relationship} onChange={(e) => setMember({ ...member, relationship: e.target.value })}>
          {RELATIONSHIPS.map((rel) => <option key={rel}>{rel}</option>)}
        </select>
        <button className="btn-primary" type="submit">Add member</button>
      </form>
      {message ? <p className="mt-4">{message}</p> : null}
    </div>
  );
}
