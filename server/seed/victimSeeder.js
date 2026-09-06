require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });
const connectDB = require('../config/db');
const VictimApplication = require('../models/VictimApplication');
const { VICTIM_STATUS } = VictimApplication;
const { generateVictimId, setSequence } = require('../utils/generateId');

const seeds = [
  {
    applicationId: 'RAHAT-VIC-000001',
    fullName: 'Sita Maya Tamang',
    displayName: 'Sita M.',
    district: 'Bhaktapur',
    municipality: 'Suryabinayak Municipality',
    ward: '6',
    householdSize: 4,
    category: 'Shelter',
    story: 'Flood water entered our home in ward 6. We need help to repair the roof and buy dry bedding for two children before the next rain.',
    amountNeededNPR: 25000,
    amountRaisedNPR: 8500,
    photoUrl: '/rahat-motive.jpg',
  },
  {
    applicationId: 'RAHAT-VIC-000002',
    fullName: 'Hari Bahadur Magar',
    displayName: 'Hari B.',
    district: 'Sindhupalchok',
    municipality: 'Melamchi Municipality',
    ward: '3',
    householdSize: 3,
    category: 'Medical',
    story: 'My wife needs follow-up treatment after a landslide injury. We can cover food, but not the remaining hospital and medicine cost.',
    amountNeededNPR: 40000,
    amountRaisedNPR: 12000,
    photoUrl: '/rahat-why.jpg',
  },
  {
    applicationId: 'RAHAT-VIC-000003',
    fullName: 'Anisha Shrestha',
    displayName: 'Anisha S.',
    district: 'Kathmandu',
    municipality: 'Kathmandu Metropolitan City',
    ward: '11',
    householdSize: 2,
    category: 'Food',
    story: 'I am staying with my grandmother after we lost kitchen stock in the flood. We need rice, oil and cooking gas to get through the month.',
    amountNeededNPR: 12000,
    amountRaisedNPR: 12000,
    photoUrl: '/rahat-vision.jpg',
  },
];

async function seedVictims() {
  await connectDB();
  for (const row of seeds) {
    const status = row.amountRaisedNPR >= row.amountNeededNPR ? VICTIM_STATUS.FULFILLED : VICTIM_STATUS.APPROVED;
    await VictimApplication.findOneAndUpdate(
      { applicationId: row.applicationId },
      {
        ...row,
        applicationId: row.applicationId || await generateVictimId(),
        status,
        isPublic: true,
        phone: '',
        email: '',
      },
      { upsert: true }
    );
  }
  await setSequence('RAHAT-VIC', 10);
  console.log(`Published ${seeds.length} verified support requests.`);
  const mongoose = require('mongoose');
  await mongoose.connection.close();
  process.exit(0);
}

seedVictims().catch((error) => {
  console.error(error);
  process.exit(1);
});
