require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });
const mongoose = require('mongoose');
const connectDB = require('../config/db');
const User = require('../models/User');
const VictimApplication = require('../models/VictimApplication');
const Donation = require('../models/Donation');
const { VICTIM_STATUS } = VictimApplication;
const { DONATION_STATUS, ROLES } = require('../utils/constants');
const { setSequence } = require('../utils/generateId');

async function upsertUser({ email, password, fullName, role }) {
  let user = await User.findOne({ email: email.toLowerCase() }).select('+password');
  if (user) {
    user.fullName = fullName;
    user.role = role;
    user.isActive = true;
    user.password = password;
    await user.save();
    return user;
  }
  return User.create({ email: email.toLowerCase(), password, fullName, role });
}

const victimSeeds = [
  { applicationId: 'RAHAT-VIC-000001', fullName: 'Sita Maya Tamang', displayName: 'Sita M.', district: 'Bhaktapur', municipality: 'Suryabinayak Municipality', ward: '6', householdSize: 4, category: 'Shelter', story: 'Flood water entered our home in ward 6. We need help to repair the roof and buy dry bedding for two children.', amountNeededNPR: 25000, amountRaisedNPR: 8500, photoUrl: '/rahat-motive.jpg' },
  { applicationId: 'RAHAT-VIC-000002', fullName: 'Hari Bahadur Magar', displayName: 'Hari B.', district: 'Sindhupalchok', municipality: 'Melamchi Municipality', ward: '3', householdSize: 3, category: 'Medical', story: 'My wife needs follow-up treatment after a landslide injury. We can cover food, but not the remaining hospital cost.', amountNeededNPR: 40000, amountRaisedNPR: 12000, photoUrl: '/rahat-why.jpg' },
  { applicationId: 'RAHAT-VIC-000003', fullName: 'Anisha Shrestha', displayName: 'Anisha S.', district: 'Kathmandu', municipality: 'Kathmandu Metropolitan City', ward: '11', householdSize: 2, category: 'Food', story: 'We lost kitchen stock in the flood. We need rice, oil and cooking gas for the month.', amountNeededNPR: 12000, amountRaisedNPR: 12000, photoUrl: '/rahat-vision.jpg' },
  { applicationId: 'RAHAT-VIC-000004', fullName: 'Bishnu Prasad Rai', displayName: 'Bishnu R.', district: 'Kavre', municipality: 'Dhulikhel Municipality', ward: '2', householdSize: 5, category: 'Livelihood', story: 'Our small shop was damaged. A grant would let us restock grain and reopen for the neighbourhood.', amountNeededNPR: 35000, amountRaisedNPR: 5000, photoUrl: '/rahat-hero.jpg' },
  { applicationId: 'RAHAT-VIC-000005', fullName: 'Maya Gurung', displayName: 'Maya G.', district: 'Lalitpur', municipality: 'Lalitpur Metropolitan City', ward: '8', householdSize: 3, category: 'Education', story: 'School fees and uniforms for two children were lost with our documents. We need help so they can return to class.', amountNeededNPR: 18000, amountRaisedNPR: 3000, photoUrl: '/rahat-motive.jpg' },
  { applicationId: 'RAHAT-VIC-000006', fullName: 'Ram Bahadur Karki', displayName: 'Ram K.', district: 'Nuwakot', municipality: 'Bidur Municipality', ward: '4', householdSize: 6, category: 'Shelter', story: 'The family is staying under a tarpaulin. We need timber and CGI sheets for a one-room shelter.', amountNeededNPR: 50000, amountRaisedNPR: 16000, photoUrl: '/rahat-why.jpg' },
  { applicationId: 'RAHAT-VIC-000007', fullName: 'Kamala Devi Lama', displayName: 'Kamala L.', district: 'Dolakha', municipality: 'Bhimeshwor Municipality', ward: '1', householdSize: 2, category: 'Medical', story: 'I need money for blood-pressure medicine and a clinic visit after we were displaced.', amountNeededNPR: 9000, amountRaisedNPR: 1500, photoUrl: '/rahat-vision.jpg' },
  { applicationId: 'RAHAT-VIC-000008', fullName: 'Nabin Maharjan', displayName: 'Nabin M.', district: 'Bhaktapur', municipality: 'Bhaktapur Municipality', ward: '5', householdSize: 4, category: 'Food', story: 'Daily wage work stopped. We need two weeks of food packages until I can find work again.', amountNeededNPR: 14000, amountRaisedNPR: 0, photoUrl: '/rahat-hero.jpg', pending: true },
];

async function seedPortal() {
  await connectDB();

  const donors = await Promise.all([
    upsertUser({ email: 'donor.demo@rahat.test', password: 'DonorDemo@2026', fullName: 'Valley Mutual Aid Donor', role: ROLES.DONOR }),
    upsertUser({ email: 'priya.donor@rahat.test', password: 'DonorDemo@2026', fullName: 'Priya Sharma', role: ROLES.DONOR }),
    upsertUser({ email: 'kiran.donor@rahat.test', password: 'DonorDemo@2026', fullName: 'Kiran Thapa', role: ROLES.DONOR }),
    upsertUser({ email: 'himalayan.relief@rahat.test', password: 'DonorDemo@2026', fullName: 'Himalayan Relief Group', role: ROLES.DONOR }),
    upsertUser({ email: 'anita.donor@rahat.test', password: 'DonorDemo@2026', fullName: 'Anita Joshi', role: ROLES.DONOR }),
    upsertUser({ email: 'vendor.demo@rahat.test', password: process.env.DEMO_VENDOR_PASSWORD || 'VendorDemo@2026', fullName: 'RAHAT Vendor', role: ROLES.DONOR }),
  ]);

  await Promise.all([
    upsertUser({ email: 'admin@rahat.gov.np', password: process.env.ADMIN_PASSWORD || 'RahatAdmin@2026', fullName: 'RAHAT System Administrator', role: ROLES.ADMIN }),
    upsertUser({ email: 'citizen.demo@rahat.test', password: 'CitizenDemo@2026', fullName: 'Nisha Karki', role: ROLES.CITIZEN }),
    upsertUser({ email: 'sita.citizen@rahat.test', password: 'CitizenDemo@2026', fullName: 'Sita Maya Tamang', role: ROLES.CITIZEN }),
    upsertUser({ email: 'hari.citizen@rahat.test', password: 'CitizenDemo@2026', fullName: 'Hari Bahadur Magar', role: ROLES.CITIZEN }),
  ]);

  const victims = [];
  for (const row of victimSeeds) {
    const pending = row.pending;
    const payload = { ...row };
    delete payload.pending;
    const status = pending
      ? VICTIM_STATUS.PENDING
      : (payload.amountRaisedNPR >= payload.amountNeededNPR ? VICTIM_STATUS.FULFILLED : VICTIM_STATUS.APPROVED);
    const victim = await VictimApplication.findOneAndUpdate(
      { applicationId: row.applicationId },
      { ...payload, status, isPublic: !pending, phone: '', email: '' },
      { upsert: true, returnDocument: 'after' }
    );
    victims.push(victim);
  }

  const byId = Object.fromEntries(victims.map((row) => [row.applicationId, row]));
  const [valley, priya, kiran, himalayan, anita] = donors;

  const tx = [
    { donationId: 'RAHAT-DON-100001', donor: valley, victim: byId['RAHAT-VIC-000001'], amountNPR: 5000, status: DONATION_STATUS.PAYMENT_VERIFIED, txnId: '0007A01' },
    { donationId: 'RAHAT-DON-100002', donor: priya, victim: byId['RAHAT-VIC-000001'], amountNPR: 3500, status: DONATION_STATUS.PAYMENT_VERIFIED, txnId: '0007A02' },
    { donationId: 'RAHAT-DON-100003', donor: kiran, victim: byId['RAHAT-VIC-000002'], amountNPR: 8000, status: DONATION_STATUS.PAYMENT_VERIFIED, txnId: '0007A03' },
    { donationId: 'RAHAT-DON-100004', donor: himalayan, victim: byId['RAHAT-VIC-000002'], amountNPR: 4000, status: DONATION_STATUS.PAYMENT_VERIFIED, txnId: '0007A04' },
    { donationId: 'RAHAT-DON-100005', donor: anita, victim: byId['RAHAT-VIC-000003'], amountNPR: 7000, status: DONATION_STATUS.PAYMENT_VERIFIED, txnId: '0007A05' },
    { donationId: 'RAHAT-DON-100006', donor: valley, victim: byId['RAHAT-VIC-000003'], amountNPR: 5000, status: DONATION_STATUS.PAYMENT_VERIFIED, txnId: '0007A06' },
    { donationId: 'RAHAT-DON-100007', donor: priya, victim: byId['RAHAT-VIC-000004'], amountNPR: 5000, status: DONATION_STATUS.PAYMENT_VERIFIED, txnId: '0007A07' },
    { donationId: 'RAHAT-DON-100008', donor: kiran, victim: byId['RAHAT-VIC-000005'], amountNPR: 3000, status: DONATION_STATUS.PENDING, txnId: '' },
    { donationId: 'RAHAT-DON-100009', donor: himalayan, victim: byId['RAHAT-VIC-000006'], amountNPR: 10000, status: DONATION_STATUS.PAYMENT_VERIFIED, txnId: '0007A09' },
    { donationId: 'RAHAT-DON-100010', donor: anita, victim: byId['RAHAT-VIC-000006'], amountNPR: 6000, status: DONATION_STATUS.PAYMENT_VERIFIED, txnId: '0007A10' },
    { donationId: 'RAHAT-DON-100011', donor: valley, victim: byId['RAHAT-VIC-000007'], amountNPR: 1500, status: DONATION_STATUS.PAYMENT_VERIFIED, txnId: '0007A11' },
    { donationId: 'RAHAT-DON-100012', donor: priya, victim: byId['RAHAT-VIC-000002'], amountNPR: 2000, status: DONATION_STATUS.PENDING, txnId: '' },
  ];

  for (const row of tx) {
    if (!row.victim) continue;
    await Donation.findOneAndUpdate(
      { donationId: row.donationId },
      {
        donationId: row.donationId,
        kind: 'Money',
        donorName: row.donor.fullName,
        donorEmail: row.donor.email,
        donorUser: row.donor._id,
        donorType: 'Individual',
        victim: row.victim._id,
        amountNPR: row.amountNPR,
        remainingAmount: row.amountNPR,
        purpose: `Support for ${row.victim.displayName}`,
        paymentProvider: 'khalti',
        khaltiPidx: row.donationId,
        khaltiTxnId: row.txnId,
        purchaseOrderId: row.donationId,
        status: row.status,
        isDemo: false,
        timeline: [{
          key: row.status === DONATION_STATUS.PAYMENT_VERIFIED ? 'khalti_verified' : 'khalti_started',
          label: row.status === DONATION_STATUS.PAYMENT_VERIFIED ? 'Khalti payment verified' : 'Khalti checkout started',
          at: new Date(),
          description: `NPR ${row.amountNPR}`,
          byName: row.donor.fullName,
        }],
      },
      { upsert: true }
    );
  }

  await setSequence('RAHAT-VIC', 50);
  await setSequence('RAHAT-DON', 100020);
  console.log(`Portal seed: ${victimSeeds.length} victims, ${donors.length} donors, ${tx.length} transactions.`);
  await mongoose.connection.close();
  process.exit(0);
}

seedPortal().catch(async (error) => {
  console.error(error);
  try { await mongoose.connection.close(); } catch { /* ignore */ }
  process.exit(1);
});
