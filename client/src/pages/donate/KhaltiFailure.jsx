import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { khaltiService } from '../../services/victimService';
import { getErrorMessage } from '../../utils/helpers';

const COPY = {
  CANCELED: {
    eyebrow: 'Payment canceled',
    title: 'The payment was canceled before completion.',
    body: 'No completed payment was recorded by RAHAT for this checkout.',
  },
  FAILED: {
    eyebrow: 'Payment not completed',
    title: 'Your payment was not confirmed.',
    body: 'Khalti reported that this transaction did not complete.',
  },
  PENDING: {
    eyebrow: 'Payment pending',
    title: 'Your payment has been initiated but has not yet been confirmed.',
    body: 'Do not start another payment until this reference has been checked.',
  },
  AMBIGUOUS: {
    eyebrow: 'Payment could not be verified',
    title: 'We received a response but could not verify the transaction.',
    body: 'Please do not retry immediately if your account may already have been charged.',
  },
  UNAVAILABLE: {
    eyebrow: 'Payment service temporarily unavailable',
    title: 'We could not confirm the payment service response.',
    body: 'RAHAT has not recorded a completed payment. If Khalti itself is unavailable, wait and check this reference before paying again.',
  },
  NOT_FOUND: {
    eyebrow: 'Payment not found',
    title: 'Khalti has no completed record for this checkout.',
    body: 'No completed payment was recorded.',
  },
  FULL_REFUND: {
    eyebrow: 'Payment refunded',
    title: 'Khalti reported a full refund for this transaction.',
    body: 'RAHAT will not treat this as a completed donation.',
  },
  PARTIAL_REFUND: {
    eyebrow: 'Partial refund',
    title: 'Khalti reported a partial refund for this transaction.',
    body: 'RAHAT will not treat this as a completed donation until staff review it.',
  },
};

export default function KhaltiFailure() {
  const [params] = useSearchParams();
  const [sandboxBusy, setSandboxBusy] = useState(false);
  const [report, setReport] = useState({
    outcome: params.get('outcome') || (params.get('status') === 'User canceled' ? 'CANCELED' : 'FAILED'),
    donation: null,
    error: '',
    checking: Boolean(params.get('pidx') || sessionStorage.getItem('rahat_khalti_pidx')),
  });

  const loadStatus = () => {
    const pidx = params.get('pidx') || sessionStorage.getItem('rahat_khalti_pidx') || '';
    if (!pidx) {
      setReport((prev) => ({ ...prev, checking: false }));
      return;
    }
    setReport((prev) => ({ ...prev, checking: true, error: '' }));
    khaltiService.status({ pidx })
      .then(({ data }) => {
        if (data.outcome === 'COMPLETE') {
          window.location.replace(`/donate/khalti/success?pidx=${encodeURIComponent(pidx)}&purchase_order_id=${encodeURIComponent(data.donation?.donationId || '')}`);
          return;
        }
        setReport({
          outcome: data.outcome || report.outcome,
          donation: data.donation,
          error: '',
          checking: false,
        });
      })
      .catch((err) => setReport((prev) => ({
        ...prev,
        checking: false,
        error: getErrorMessage(err, 'Unable to check this payment with Khalti.'),
        outcome: prev.outcome || 'UNAVAILABLE',
      })));
  };

  useEffect(() => {
    loadStatus();
  }, [params]);

  const copy = COPY[report.outcome] || COPY.FAILED;
  const reference = report.donation?.donationId || params.get('purchase_order_id') || sessionStorage.getItem('rahat_khalti_donation');

  return (
    <div className="page-wrap max-w-xl text-center overflow-x-hidden">
      <p className="eyebrow text-red-700">{copy.eyebrow}</p>
      <h1 className="serif mt-3 text-4xl text-navy-900">{copy.title}</h1>
      <p className="mt-4 text-ink-700">{copy.body}</p>
      {reference ? <p className="mt-3 text-sm text-ink-500">Reference: {reference}</p> : null}
      {report.checking ? <p className="mt-3 text-ink-500" role="status">Checking payment status…</p> : null}
      {report.error ? <p className="mt-3 text-red-800" role="alert">{report.error}</p> : null}
      <p className="mt-4 text-sm text-ink-500">
        A canceled or unavailable checkout does not automatically mean money was deducted. Check this reference before starting a new payment.
      </p>
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <button className="btn-gold" type="button" onClick={loadStatus} disabled={report.checking}>Check payment status</button>
        <button
          className="btn-khalti"
          type="button"
          disabled={sandboxBusy}
          onClick={() => {
            const pidx = params.get('pidx') || sessionStorage.getItem('rahat_khalti_pidx') || '';
            const purchaseOrderId = reference || '';
            setSandboxBusy(true);
            khaltiService.confirmSandbox({ pidx, purchase_order_id: purchaseOrderId })
              .then(({ data }) => {
                window.location.replace(`/donate/khalti/success?pidx=${encodeURIComponent(data.donation?.khaltiPidx || pidx)}&purchase_order_id=${encodeURIComponent(data.donation?.donationId || purchaseOrderId)}`);
              })
              .catch((err) => {
                setSandboxBusy(false);
                setReport((prev) => ({ ...prev, error: getErrorMessage(err, 'Unable to confirm this sandbox donation.') }));
              });
          }}
        >
          {sandboxBusy ? 'Recording sandbox donation...' : 'Khalti MPIN locked? Confirm sandbox donation'}
        </button>
        <Link className="btn-outline" to="/donate/money">Start a new payment</Link>
      </div>
    </div>
  );
}
