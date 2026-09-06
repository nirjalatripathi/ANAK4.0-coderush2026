import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { publicService } from '../services/notificationService';
import EmptyState from '../components/EmptyState';
import Loading from '../components/Loading';
import ErrorState from '../components/ErrorState';
import { formatDate, formatNPR, getErrorMessage } from '../utils/helpers';

export default function ImpactStories() {
  const [stories, setStories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    publicService.impactStories()
      .then(({ data }) => setStories(data.stories || []))
      .catch((err) => setError(getErrorMessage(err, 'Unable to load verified impact stories.')))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="page-wrap">
      <h1 className="section-title text-teal-700">Verified impact</h1>
      <p className="mt-3 text-2xl font-semibold text-navy-900">Impact stories</p>
      <p className="mt-3 max-w-2xl text-ink-700">Only donor-facing, verified records are shown. Sensitive beneficiary details are not published.</p>
      {loading ? <div className="mt-10"><Loading /></div> : null}
      {error ? <div className="mt-10"><ErrorState title="Unable to load stories" body={error} /></div> : null}
      {!loading && !error && !stories.length ? (
        <div className="mt-10">
          <EmptyState title="No verified impact stories have been published yet." body="When a donation is allocated, delivered, and verified for donor display, it will appear here.">
            <Link className="btn-gold" to="/donate">Donate now</Link>
          </EmptyState>
        </div>
      ) : null}
      <div className="mt-10 grid gap-6 md:grid-cols-2">
        {stories.map((story) => (
          <article key={story.id} className="card-gov p-6">
            <p className="text-xs font-semibold uppercase tracking-wide text-teal-700">{story.verified ? 'Verified distribution' : 'Recorded'}</p>
            <h2 className="serif mt-2 text-2xl text-navy-900">{story.itemName}</h2>
            <p className="mt-2 text-ink-700">{story.camp || story.location}</p>
            <p className="mt-3 text-sm">{story.amountUsedNPR ? formatNPR(story.amountUsedNPR) : `${story.quantityDelivered || 0} ${story.unit || ''}`}</p>
            <p className="mt-1 text-sm text-ink-500">{formatDate(story.date)} · {story.peopleSupported || 0} people supported</p>
            {story.notes ? <p className="mt-4 text-ink-700">{story.notes}</p> : null}
          </article>
        ))}
      </div>
    </div>
  );
}
