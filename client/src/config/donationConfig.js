export const donationConfig = {
  currency: 'NPR',
  presetAmounts: [500, 1000, 5000, 10000],
  qrImageSrc: '/qr-placeholder.svg',
  qrLabel: 'SCAN TO DONATE',
  demoNotice: 'DEMO PAYMENT FLOW — this QR is a placeholder. Completing this step records a donation for administrator verification. It does not confirm a real bank transfer.',
  categories: [
    'Highest Priority Need',
    'Water',
    'Food',
    'Medicine',
    'Hygiene',
    'Shelter',
    'Specific Relief Need',
  ],
};

export const MONEY_STEPS = [
  'Pending',
  'Payment Verified',
  'Allocated',
  'In Use',
  'Impact Verified',
  'Completed',
];

export const PHYSICAL_STEPS = [
  'Pledged',
  'Accepted',
  'Dispatched',
  'Received',
  'Verified',
  'Distributed',
  'Completed',
];
