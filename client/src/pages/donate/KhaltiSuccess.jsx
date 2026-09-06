import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { khaltiService } from '../../services/victimService';
import DonationSummary from '../../components/DonationSummary';
import { formatNPR, getErrorMessage } from '../../utils/helpers';

export default function KhaltiSuccess() {
  const [params] = useSearchParams();
  const [state, setState] = useState({ phase: 'verifying', error: '', donation: null, outcome: '' });

  useEffect(() => {
    const pidx = params.get('pidx') || sessionStorage.getItem('rahat_khalti_pidx') || '';
    const purchaseOrderId = params.get('purchase_order_id') || sessionStorage.getItem('rahat_khalti_donation') || '';
    const callbackStatus = params.get('status') || '';

    const apply = (body, fallbackError) => {
      const donation = body?.donation || (purchaseOrderId ? { donationId: purchaseOrderId } : null);
      const outcome = body?.outcome || '';
      if (outcome === 'COMPLETE' || body?.success) {
        setState({ phase: 'complete', error: '', donation, outcome: 'COMPLETE' });
        return;
      }
      if (['PENDING', 'AMBIGUOUS', 'UNAVAILABLE'].includes(outcome)) {
        setState({ phase: 'pending', error: '', donation, outcome });
        return;
      }
      setState({
        phase: 'failed',
        error: fallbackError || 'This payment has not been verified yet.',
        donation,
        outcome: outcome || (callbackStatus === 'User canceled' ? 'CANCELED' : 'FAILED'),
      });
    };

    if (!pidx && !purchaseOrderId) {
      setState({
        phase: 'failed',
        error: 'Khalti did not return a payment id, so RAHAT cannot confirm this transaction.',
        donation: null,
        outcome: 'UNAVAILABLE',
      });
      return;
    }

    khaltiService.verify({
      pidx,
      purchase_order_id: purchaseOrderId,
      amount: params.get('amount') || undefined,
    })
      .then(({ data: body }) => apply(body))
      .catch((err) => setState({
        phase: callbackStatus === 'User canceled' ? 'failed' : 'pending',
        error: getErrorMessage(err, 'Payment could not be verified with Khalti.'),
        donation: purchaseOrderId ? { donationId: purchaseOrderId } : null,
        outcome: callbackStatus === 'User canceled' ? 'CANCELED' : 'UNAVAILABLE',
      }));
  }, [params]);

  const refresh = () => {
    const pidx = params.get('pidx') || sessionStorage.getItem('rahat_khalti_pidx') || state.donation?.khaltiPidx;
    if (!pidx) return;
    setState((prev) => ({ ...prev, phase: 'verifying' }));
    khaltiService.status({ pidx })
      .then(({ data: body }) => {
        if (body.outcome === 'COMPLETE' || body.success) {
          setState({ phase: 'complete', error: '', donation: body.donation, outcome: 'COMPLETE' });
        } else {
          setState({ phase: 'pending', error: '', donation: body.donation, outcome: body.outcome });
        }
      })
      .catch((err) => setState((prev) => ({
        ...prev,
        phase: 'pending',
        error: getErrorMessage(err, 'The payment service did not return a confirmation.'),
        outcome: 'UNAVAILABLE',
      })));
  };

  if (state.phase === 'verifying') {
    return (
      <div className="page-wrap max-w-xl text-center" role="status" aria-live="polite">
        <p className="eyebrow text-gold-700">RAHAT</p>
        <h1 className="serif mt-3 text-4xl text-navy-900">Verifying payment</h1>
        <p className="mt-4 text-ink-700">Please wait while we confirm your transaction with Khalti.</p>
      </div>
    );
  }

  if (state.phase === 'complete') {
    return (
      <div className="page-wrap max-w-xl text-center" role="status" aria-live="polite">
        <p className="eyebrow text-teal-700">Payment verified</p>
        <h1 className="serif mt-3 text-4xl text-navy-900">Thank you for supporting relief efforts.</h1>
        <DonationSummary
          camp={state.donation?.campName || state.donation?.victimName || 'RAHAT relief'}
          item={state.donation?.itemName || state.donation?.purpose}
          amount={state.donation?.amountNPR}
          reference={state.donation?.donationId}
        />
        <dl className="mt-6 space-y-2 text-sm text-ink-700">
          <div><dt className="inline font-semibold">Donation reference: </dt><dd className="inline">{state.donation?.donationId || '—'}</dd></div>
          <div><dt className="inline font-semibold">Khalti transaction: </dt><dd className="inline">{state.donation?.khaltiTxnId || state.donation?.khaltiPidx || '—'}</dd></div>
          <div><dt className="inline font-semibold">Payment status: </dt><dd className="inline">Verified</dd></div>
        </dl>
        <p className="mt-4 text-sm text-ink-500">Payment confirmation is not the same as physical relief goods being received.</p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Link className="btn-gold" to="/donor/donations">View donation</Link>
          <Link className="btn-outline" to="/">Return to RAHAT</Link>
        </div>
      </div>
    );
  }

  if (state.phase === 'pending') {
    return (
      <div className="page-wrap max-w-xl text-center" role="status" aria-live="polite">
        <p className="eyebrow text-gold-700">Payment pending</p>
        <h1 className="serif mt-3 text-4xl text-navy-900">Your payment has been initiated but has not yet been confirmed.</h1>
        <p className="mt-4 text-ink-700">
          Reference: {state.donation?.donationId || state.donation?.khaltiPidx || 'unavailable'}.
          Do not start another payment yet if your Khalti account may already have been charged.
        </p>
        {state.error ? <p className="mt-3 text-red-800" role="alert">{state.error}</p> : null}
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <button className="btn-gold" type="button" onClick={refresh}>Check payment status</button>
          <Link className="btn-outline" to="/">Return to RAHAT</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="page-wrap max-w-xl text-center">
      <p className="eyebrow text-red-700">Payment could not be verified</p>
      <h1 className="serif mt-3 text-4xl text-navy-900">We received a response but could not confirm the transaction.</h1>
      <p className="mt-4 text-ink-700">{state.error}</p>
      <p className="mt-2 text-sm text-ink-500">Reference: {state.donation?.donationId || 'unavailable'}. Please do not retry immediately if your account may already have been charged.</p>
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <Link className="btn-outline" to="/donate/khalti/failure">View payment status</Link>
        <Link className="btn-gold" to="/">Return to RAHAT</Link>
      </div>
    </div>
  );
}
