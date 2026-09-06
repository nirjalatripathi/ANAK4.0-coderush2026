import { formatNPR } from '../utils/helpers';

export default function DonationSummary({
  camp,
  item,
  amount,
  method = 'Khalti',
  reference,
}) {
  return (
    <section className="payment-summary" aria-labelledby="donation-summary-title">
      <h2 id="donation-summary-title">Donation summary</h2>
      <dl>
        {camp ? (
          <div>
            <dt>Camp</dt>
            <dd>{camp}</dd>
          </div>
        ) : null}
        {item ? (
          <div>
            <dt>Relief item</dt>
            <dd>{item}</dd>
          </div>
        ) : null}
        <div>
          <dt>Amount</dt>
          <dd>{formatNPR(amount)}</dd>
        </div>
        <div>
          <dt>Payment method</dt>
          <dd>{method}</dd>
        </div>
        {reference ? (
          <div>
            <dt>Reference</dt>
            <dd>{reference}</dd>
          </div>
        ) : null}
      </dl>
    </section>
  );
}
