import StatusBadge from './StatusBadge';

export default function ShipmentCard({ shipment }) {
  return (
    <article className="card-gov p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="font-mono text-xs text-navy-700">{shipment.shipmentId}</p>
          <p className="mt-1 font-semibold text-navy-900">{shipment.quantity} {shipment.itemName}</p>
          <p className="text-sm text-ink-500">{shipment.camp?.name || shipment.destination || 'Destination pending'}</p>
        </div>
        <StatusBadge status={shipment.status} />
      </div>
      {shipment.receivedQuantity ? (
        <p className="mt-2 text-sm text-teal-700">Received usable: {shipment.receivedQuantity - (shipment.damagedQuantity || 0)}</p>
      ) : null}
    </article>
  );
}
