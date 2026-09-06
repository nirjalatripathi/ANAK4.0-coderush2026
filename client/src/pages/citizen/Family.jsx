import MyHousehold from './MyHousehold';

export default function Family() {
  return (
    <div>
      <p className="mb-4 text-sm text-ink-500">Family view uses the same household record. Statuses are updated by camp officials when a person cannot log in.</p>
      <MyHousehold />
    </div>
  );
}
