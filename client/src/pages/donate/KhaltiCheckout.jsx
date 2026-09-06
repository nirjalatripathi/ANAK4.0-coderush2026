import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { continueToKhalti, khaltiService } from '../../services/victimService';
import { formatNPR, getErrorMessage } from '../../utils/helpers';
import DonationSummary from '../../components/DonationSummary';

function readCheckout() {
  return {
    donationId: sessionStorage.getItem('rahat_khalti_donation') || '',
    pidx: sessionStorage.getItem('rahat_khalti_pidx') || '',
    paymentUrl: sessionStorage.getItem('rahat_khalti_url') || '',
    amount: sessionStorage.getItem('rahat_khalti_amount') || '',
    purpose: sessionStorage.getItem('rahat_khalti_purpose') || 'RAHAT relief donation',
    sandboxFallback: sessionStorage.getItem('rahat_khalti_sandbox') === 'true',
  };
}

export default function KhaltiCheckout() {
  const navigate = useNavigate();
  const checkout = readCheckout();
  const [busy, setBusy] = useState('');
  const [error, setError] = useState('');

  const openKhalti = () => {
    if (!checkout.paymentUrl) {
      setError('Khalti checkout URL is missing. Start the donation again.');
      return;
    }
    continueToKhalti({ paymentUrl: checkout.paymentUrl, pidx: checkout.pidx }, { donationId: checkout.donationId });
  };

  const confirmSandbox = async () => {
    if (busy) return;
    setBusy('sandbox');
    setError('');
    try {
      const { data } = await khaltiService.confirmSandbox({
        pidx: checkout.pidx,
        purchase_order_id: checkout.donationId,
      });
      navigate(`/donate/khalti/success?pidx=${encodeURIComponent(data.donation?.khaltiPidx || checkout.pidx)}&purchase_order_id=${encodeURIComponent(data.donation?.donationId || checkout.donationId)}`, { replace: true });
    } catch (err) {
      setError(getErrorMessage(err, 'Unable to confirm this sandbox donation.'));
      setBusy('');
    }
  };

  if (!checkout.donationId && !checkout.pidx) {
    return (
      <div className="page-wrap max-w-xl text-center">
        <h1 className="serif text-4xl text-navy-900">No checkout in progress</h1>
        <p className="mt-4 text-ink-700">Start a donation first, then RAHAT will open Khalti.</p>
        <Link className="btn-khalti mt-8" to="/donate/money">Start a donation</Link>
      </div>
    );
  }

  return (
    <div className="page-wrap max-w-xl overflow-x-hidden">
      <p className="eyebrow text-gold-700">Relief donation</p>
      <h1 className="serif mt-3 text-4xl text-navy-900">Continue to Khalti</h1>
      <p className="mt-3 text-ink-700">
        Official Khalti test wallets often lock the shared MPIN. RAHAT does not collect Khalti MPIN.
        Use official Khalti if you can, or confirm this sandbox donation here.
      </p>

      <div className="card-gov mt-8 p-6">
        <DonationSummary
          item={checkout.purpose}
          amount={Number(checkout.amount) || 0}
          reference={checkout.donationId}
        />
        {error ? <p className="mt-4 text-red-800" role="alert">{error}</p> : null}
        <button className="btn-khalti mt-6 w-full" type="button" onClick={openKhalti} disabled={Boolean(busy)}>
          {busy === 'khalti' ? 'Connecting to Khalti...' : `Continue to official Khalti${checkout.amount ? ` — ${formatNPR(checkout.amount)}` : ''}`}
        </button>
        {checkout.sandboxFallback ? (
          <>
            <button className="btn-gold mt-3 w-full" type="button" onClick={confirmSandbox} disabled={Boolean(busy)} aria-busy={busy === 'sandbox'}>
              {busy === 'sandbox' ? 'Recording sandbox donation...' : 'Khalti MPIN locked? Confirm sandbox donation'}
            </button>
            <p className="mt-3 text-sm text-ink-500">
              This records the donation in RAHAT only. It is not a live Khalti charge. Use it when Khalti says the test MPIN is locked.
            </p>
          </>
        ) : null}
        <Link className="btn-outline mt-3 w-full" to="/donate/money">Cancel</Link>
      </div>
    </div>
  );
}
