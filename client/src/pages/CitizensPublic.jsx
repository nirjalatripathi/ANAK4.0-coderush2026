import { Link } from 'react-router-dom';

export default function CitizensPublic() {
  return (
    <div className="mx-auto max-w-5xl px-4 py-12">
      <h1 className="serif text-4xl text-navy-900">Citizen registration</h1>
      <p className="mt-3 text-lg text-ink-700">
        RAHAT does not publish a public citizen directory. The central registry is searched only by authorised camp officials and administrators when a person needs to be found.
      </p>
      <div className="mt-8 grid gap-4 md:grid-cols-2">
        <article className="card-gov p-6">
          <h2 className="serif text-2xl text-navy-900">Register before disaster</h2>
          <p className="mt-2 text-ink-700">Create a household record, add family relationships, and upload the identity documents required for your age.</p>
          <ul className="mt-4 list-disc space-y-2 pl-5 text-ink-700">
            <li>Under 16: birth certificate and a recent photograph</li>
            <li>16 and above: citizenship certificate or national ID, plus a recent photograph</li>
          </ul>
          <Link to="/register" className="btn-primary mt-6">Register now</Link>
        </article>
        <article className="card-gov p-6">
          <h2 className="serif text-2xl text-navy-900">Already registered</h2>
          <p className="mt-2 text-ink-700">Sign in to update a phone number, current address, emergency contact or household members. Identity changes still require administrative review.</p>
          <Link to="/login" className="btn-outline mt-6">Citizen login</Link>
        </article>
      </div>
    </div>
  );
}
