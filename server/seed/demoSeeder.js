require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });
const connectDB = require('../config/db');
const User = require('../models/User');
const Citizen = require('../models/Citizen');
const Household = require('../models/Household');
const Disaster = require('../models/Disaster');
const ReliefCamp = require('../models/ReliefCamp');
const CampOfficial = require('../models/CampOfficial');
const CampInventory = require('../models/CampInventory');
const ReliefNeed = require('../models/ReliefNeed');
const UnregisteredPerson = require('../models/UnregisteredPerson');
const Donation = require('../models/Donation');
const Notification = require('../models/Notification');
const AuditLog = require('../models/AuditLog');
const SystemSettings = require('../models/SystemSettings');
const LocalGovernment = require('../models/LocalGovernment');
const SafeZone = require('../models/SafeZone');
const LocalResource = require('../models/LocalResource');
const Warehouse = require('../models/Warehouse');
const ReliefRequest = require('../models/ReliefRequest');
const Shipment = require('../models/Shipment');
const SafeZoneCheckIn = require('../models/SafeZoneCheckIn');
const Transfer = require('../models/Transfer');
const Distribution = require('../models/Distribution');
const LocalAuthority = require('../models/LocalAuthority');
const ResourceTransfer = require('../models/ResourceTransfer');
const DonationDelivery = require('../models/DonationDelivery');
const { setSequence } = require('../utils/generateId');
const { syncReliefNeeds } = require('../services/reliefEngine');
const {
  ROLES,
  VERIFICATION_STATUS,
  PERSON_STATUS,
  DISASTER_STATUS,
  UNREGISTERED_STATUS,
  DONATION_STATUS,
  INVENTORY_ITEMS,
} = require('../utils/constants');

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

async function seedDemo() {
  await connectDB();
  console.log('Seeding RAHAT demonstration data...');

  const adminPassword = process.env.ADMIN_PASSWORD || 'RahatAdmin@2026';
  const officialPassword = process.env.DEMO_OFFICIAL_PASSWORD || 'CampOfficial@2026';
  const citizenPassword = process.env.DEMO_CITIZEN_PASSWORD || 'CitizenDemo@2026';
  const authorityPassword = process.env.DEMO_AUTHORITY_PASSWORD || 'Authority@2026';
  const donorPassword = process.env.DEMO_DONOR_PASSWORD || 'DonorDemo@2026';

  const admin = await upsertUser({
    email: process.env.ADMIN_EMAIL || 'admin@rahat.gov.np',
    password: adminPassword,
    fullName: process.env.ADMIN_NAME || 'RAHAT System Administrator',
    role: ROLES.ADMIN,
  });

  await SafeZoneCheckIn.deleteMany({});
  await Transfer.deleteMany({});
  await Distribution.deleteMany({});
  await Shipment.deleteMany({ isDemo: true });

  await SystemSettings.findOneAndUpdate(
    { key: 'system' },
    {
      value: {
        portalName: 'RAHAT',
        helpDeskEmail: 'helpdesk@rahat.gov.np',
        emergencyHotline: '1149',
        allowPublicRegistration: true,
        maintenanceMode: false,
        demoMode: true,
      },
    },
    { upsert: true }
  );

  const disaster = await Disaster.findOneAndUpdate(
    { disasterId: 'DIS-2026-0001' },
    {
      disasterId: 'DIS-2026-0001',
      name: 'Suryabinayak Flash Flood — Coordination Exercise',
      type: 'Flood',
      location: 'Hanumante corridor, Suryabinayak',
      district: 'Bhaktapur',
      municipality: 'Suryabinayak Municipality',
      ward: '6',
      date: new Date('2026-09-04'),
      severity: 'High',
      disasterLevel: 3,
      expectedPopulation: 2840,
      evacuationRequired: true,
      affectedWards: ['5', '6', '7'],
      affectedAreas: ['Ward 5', 'Ward 6', 'Ward 7'],
      responsePriorities: ['Evacuation', 'Water', 'Food', 'Medicine', 'Shelter'],
      latitude: 27.6668,
      longitude: 85.428,
      description:
        'DEMO DATA. Local flood response exercise for Suryabinayak Municipality. This is not a live emergency declaration.',
      status: DISASTER_STATUS.ACTIVE,
      isPublic: true,
      isDemo: true,
    },
    { upsert: true, returnDocument: 'after' }
  );

  const campA = await ReliefCamp.findOneAndUpdate(
    { campId: 'CAMP-2026-0001' },
    {
      campId: 'CAMP-2026-0001',
      name: 'Camp A — Bhaktapur Emergency Shelter',
      location: 'Suryabinayak Ground, Bhaktapur',
      district: 'Bhaktapur',
      municipality: 'Suryabinayak Municipality',
      ward: '4',
      campHead: 'Bimala Tamang',
      contactPhone: '01-6611001',
      contactEmail: 'camp.a@rahat.gov.np',
      capacity: 1000,
      currentPopulation: 0,
      beds: 850,
      latitude: 27.6662,
      longitude: 85.4315,
      campStatus: 'Active',
      medicalStatus: 'Limited',
      foodStatus: 'Limited',
      waterStatus: 'Adequate',
      sanitationStatus: 'Limited',
      disaster: disaster._id,
      isActive: true,
      isDemo: true,
      notes: 'Demonstration camp A',
    },
    { upsert: true, returnDocument: 'after' }
  );

  const campB = await ReliefCamp.findOneAndUpdate(
    { campId: 'CAMP-2026-0002' },
    {
      campId: 'CAMP-2026-0002',
      name: 'Camp B — Kathmandu Central Relief Camp',
      location: 'Tundikhel Coordination Area, Kathmandu',
      district: 'Kathmandu',
      municipality: 'Kathmandu Metropolitan City',
      ward: '11',
      campHead: 'Prakash Adhikari',
      contactPhone: '01-4211002',
      contactEmail: 'camp.b@rahat.gov.np',
      capacity: 1500,
      currentPopulation: 0,
      beds: 1200,
      medicalStatus: 'Adequate',
      foodStatus: 'Limited',
      waterStatus: 'Limited',
      sanitationStatus: 'Adequate',
      disaster: disaster._id,
      isActive: true,
      isDemo: true,
    },
    { upsert: true, returnDocument: 'after' }
  );

  const campC = await ReliefCamp.findOneAndUpdate(
    { campId: 'CAMP-2026-0003' },
    {
      campId: 'CAMP-2026-0003',
      name: 'Camp C — Lalitpur Community Shelter',
      location: 'Pulchowk Community Ground, Lalitpur',
      district: 'Lalitpur',
      municipality: 'Lalitpur Metropolitan City',
      ward: '3',
      campHead: 'Nabin Maharjan',
      contactPhone: '01-5521003',
      contactEmail: 'camp.c@rahat.gov.np',
      capacity: 800,
      currentPopulation: 0,
      beds: 640,
      medicalStatus: 'Limited',
      foodStatus: 'Adequate',
      waterStatus: 'Adequate',
      sanitationStatus: 'Limited',
      disaster: disaster._id,
      isActive: true,
      isDemo: true,
    },
    { upsert: true, returnDocument: 'after' }
  );

  disaster.activeCamps = [campA._id, campB._id, campC._id];
  await disaster.save();

  async function seedOfficial({ email, name, camp, officialId }) {
    const user = await upsertUser({
      email,
      password: officialPassword,
      fullName: name,
      role: ROLES.CAMP_OFFICIAL,
    });
    const official = await CampOfficial.findOneAndUpdate(
      { officialId },
      {
        user: user._id,
        officialId,
        fullName: name,
        assignedCamp: camp._id,
        phone: '9800000000',
        designation: 'Camp Coordination Officer',
        isActive: true,
        isDemo: true,
      },
      { upsert: true, returnDocument: 'after' }
    );
    user.campOfficial = official._id;
    await user.save();
    return official;
  }

  await seedOfficial({
    email: 'official.a@rahat.gov.np',
    name: 'Bimala Tamang',
    camp: campA,
    officialId: 'OFF-2026-0001',
  });
  await seedOfficial({
    email: 'official.b@rahat.gov.np',
    name: 'Prakash Adhikari',
    camp: campB,
    officialId: 'OFF-2026-0002',
  });
  await seedOfficial({
    email: 'official.c@rahat.gov.np',
    name: 'Nabin Maharjan',
    camp: campC,
    officialId: 'OFF-2026-0003',
  });

  const authorityUser = await upsertUser({
    email: 'authority.suryabinayak@rahat.gov.np',
    password: authorityPassword,
    fullName: 'Suryabinayak LDMC Officer (DEMO)',
    role: ROLES.LOCAL_AUTHORITY,
  });
  const authority = await LocalAuthority.findOneAndUpdate(
    { user: authorityUser._id },
    {
      user: authorityUser._id,
      title: 'Local Disaster Management Officer',
      province: 'Bagmati',
      district: 'Bhaktapur',
      municipality: 'Suryabinayak Municipality',
      wards: ['5', '6', '7'],
      contactPhone: '01-6612345',
      isDemo: true,
    },
    { upsert: true, returnDocument: 'after' }
  );
  authorityUser.localAuthority = authority._id;
  await authorityUser.save();

  const donorUser = await upsertUser({
    email: 'donor.demo@rahat.test',
    password: donorPassword,
    fullName: 'Valley Mutual Aid (DEMO Donor)',
    role: ROLES.DONOR,
  });

  const family = [
    {
      registrationId: 'CIT-2026-000001',
      fullName: 'Ram Bahadur Shrestha',
      dateOfBirth: '1978-03-12',
      gender: 'Male',
      phone: '9841111001',
      email: 'ram.shrestha.demo@rahat.test',
      relationship: 'Head of Household',
      vulnerabilityTypes: [],
    },
    {
      registrationId: 'CIT-2026-000002',
      fullName: 'Sita Devi Shrestha',
      dateOfBirth: '1982-07-22',
      gender: 'Female',
      phone: '9841111002',
      email: 'sita.shrestha.demo@rahat.test',
      relationship: 'Wife',
      vulnerabilityTypes: [],
    },
    {
      registrationId: 'CIT-2026-000003',
      fullName: 'Anisha Shrestha',
      dateOfBirth: '2014-11-05',
      gender: 'Female',
      phone: '',
      email: 'anisha.shrestha.demo@rahat.test',
      relationship: 'Daughter',
      vulnerabilityTypes: ['Child'],
    },
    {
      registrationId: 'CIT-2026-000004',
      fullName: 'Hari Bahadur Shrestha',
      dateOfBirth: '1952-01-18',
      gender: 'Male',
      phone: '9841111004',
      email: 'hari.shrestha.demo@rahat.test',
      relationship: 'Grandparent',
      vulnerabilityTypes: ['Elderly', 'Requires special assistance'],
    },
  ];

  const createdCitizens = [];
  for (const member of family) {
    const user = await upsertUser({
      email: member.email,
      password: citizenPassword,
      fullName: member.fullName,
      role: ROLES.CITIZEN,
    });
    const citizen = await Citizen.findOneAndUpdate(
      { registrationId: member.registrationId },
      {
        user: user._id,
        registrationId: member.registrationId,
        fullName: member.fullName,
        dateOfBirth: member.dateOfBirth,
        gender: member.gender,
        bloodGroup: 'O+',
        phone: member.phone,
        email: member.email,
        permanentAddress: {
          street: 'Demo Ward Residence, Bode',
          district: 'Bhaktapur',
          municipality: 'Madhyapur Thimi',
          ward: '6',
        },
        currentAddress: {
          street: 'Unknown after separation — demonstration record',
          district: 'Kathmandu',
          municipality: '',
          ward: '',
        },
        emergencyContact: {
          name: 'Neighbour — Kamala Joshi (demo)',
          phone: '9841999000',
          relationship: 'Other',
        },
        relationshipToHead: member.relationship,
        verificationStatus: VERIFICATION_STATUS.VERIFIED,
        disasterStatus: PERSON_STATUS.MISSING,
        currentCamp: null,
        currentSafeZone: null,
        lastKnownLocation: 'Separated during demonstration exercise',
        statusUpdatedAt: new Date(),
        isVulnerable: member.vulnerabilityTypes.length > 0,
        vulnerabilityTypes: member.vulnerabilityTypes,
        specialAssistanceNotes: member.relationship === 'Grandparent' ? 'Requires mobility assistance. Demonstration record.' : '',
        isPublicMissingApproved: true,
        publicDisplayName: member.fullName,
        isDemo: true,
      },
      { upsert: true, returnDocument: 'after' }
    );
    user.citizen = citizen._id;
    await user.save();
    createdCitizens.push({ citizen, relationship: member.relationship });
  }

  const household = await Household.findOneAndUpdate(
    { householdId: 'HH-2026-000001' },
    {
      householdId: 'HH-2026-000001',
      headOfHousehold: createdCitizens[0].citizen._id,
      permanentAddress: createdCitizens[0].citizen.permanentAddress,
      currentAddress: createdCitizens[0].citizen.currentAddress,
      emergencyContact: createdCitizens[0].citizen.emergencyContact,
      members: createdCitizens.map((item) => ({
        citizen: item.citizen._id,
        relationship: item.relationship,
      })),
      memberCount: 4,
      evacuationStatus: 'At Home',
      currentSafeZone: null,
      currentCamp: null,
      isDemo: true,
    },
    { upsert: true, returnDocument: 'after' }
  );

  for (const item of createdCitizens) {
    item.citizen.household = household._id;
    await item.citizen.save();
  }

  const extraUser = await upsertUser({
    email: 'citizen.demo@rahat.test',
    password: citizenPassword,
    fullName: 'Nisha Karki',
    role: ROLES.CITIZEN,
  });
  const extraCitizen = await Citizen.findOneAndUpdate(
    { registrationId: 'CIT-2026-000010' },
    {
      user: extraUser._id,
      registrationId: 'CIT-2026-000010',
      fullName: 'Nisha Karki',
      dateOfBirth: '1996-05-09',
      gender: 'Female',
      bloodGroup: 'B+',
      phone: '9841222333',
      email: 'citizen.demo@rahat.test',
      permanentAddress: {
        street: 'Demo residence, Kupondole',
        district: 'Lalitpur',
        municipality: 'Lalitpur Metropolitan City',
        ward: '1',
      },
      currentAddress: {
        street: 'Demo residence, Kupondole',
        district: 'Lalitpur',
        municipality: 'Lalitpur Metropolitan City',
        ward: '1',
      },
      emergencyContact: { name: 'Rajan Karki (demo)', phone: '9841222444', relationship: 'Brother' },
      verificationStatus: VERIFICATION_STATUS.PENDING,
      disasterStatus: PERSON_STATUS.UNVERIFIED,
      publicDisplayName: 'Nisha Karki',
      isDemo: true,
    },
    { upsert: true, returnDocument: 'after' }
  );
  extraUser.citizen = extraCitizen._id;
  await extraUser.save();

  const extraHousehold = await Household.findOneAndUpdate(
    { householdId: 'HH-2026-000010' },
    {
      householdId: 'HH-2026-000010',
      headOfHousehold: extraCitizen._id,
      permanentAddress: extraCitizen.permanentAddress,
      currentAddress: extraCitizen.currentAddress,
      emergencyContact: extraCitizen.emergencyContact,
      members: [{ citizen: extraCitizen._id, relationship: 'Head of Household' }],
      memberCount: 1,
      isDemo: true,
    },
    { upsert: true, returnDocument: 'after' }
  );
  extraCitizen.household = extraHousehold._id;
  extraCitizen.relationshipToHead = 'Head of Household';
  await extraCitizen.save();

  const inventorySeeds = {
    [campA._id]: {
      Blankets: { current: 200, required: 500 },
      'Drinking Water': { current: 3000, required: 10000, incoming: 500, dailyConsumption: 4000, unit: 'L' },
      Rice: { current: 200, required: 400 },
      Medicines: { current: 40, required: 180 },
      'Baby Food': { current: 20, required: 80 },
    },
    [campB._id]: {
      Blankets: { current: 800, required: 500 },
      'Drinking Water': { current: 900, required: 1000 },
      Rice: { current: 350, required: 350 },
      Medicines: { current: 90, required: 120 },
    },
    [campC._id]: {
      Blankets: { current: 180, required: 250 },
      'Drinking Water': { current: 500, required: 700 },
      Medicines: { current: 20, required: 200 },
      'First Aid Kits': { current: 15, required: 60 },
    },
  };

  await CampInventory.deleteMany({ camp: { $in: [campA._id, campB._id, campC._id] } });
  await ReliefNeed.deleteMany({ camp: { $in: [campA._id, campB._id, campC._id] } });

  for (const [campId, items] of Object.entries(inventorySeeds)) {
    for (const itemName of INVENTORY_ITEMS.filter((name) => name !== 'Other')) {
      const preset = items[itemName] || { current: 50, required: 50 };
      const doc = await CampInventory.create({
        camp: campId,
        itemName,
        current: preset.current,
        required: preset.required,
        incoming: preset.incoming || 0,
        dailyConsumption: preset.dailyConsumption || 0,
        unit: preset.unit || 'units',
        distributed: 0,
        lastUpdatedBy: admin._id,
      });
      doc.recalculatePriority();
      await doc.save();
    }
    await syncReliefNeeds(campId);
  }

  await UnregisteredPerson.findOneAndUpdate(
    { temporaryId: 'UNREG-2026-000245' },
    {
      temporaryId: 'UNREG-2026-000245',
      name: 'Daniel Foster',
      approximateAge: '34',
      gender: 'Male',
      currentLocation: 'Camp B — Kathmandu Central Relief Camp',
      previousLocation: 'Thamel guest house (reported)',
      countryOfOrigin: 'United Kingdom',
      districtOfOrigin: 'Visitor — not a Nepal resident',
      familyInformation: 'Travelling independently. No local family identified.',
      emergencyContact: { name: 'British Embassy Duty Officer (demo)', phone: '01-4410583' },
      availableId: 'Passport fragment photographed at camp — demonstration only',
      status: UNREGISTERED_STATUS.UNVERIFIED,
      disasterStatus: PERSON_STATUS.IN_RELIEF_CAMP,
      currentCamp: campB._id,
      notes: 'Demonstration unregistered visitor record.',
      createdBy: admin._id,
      isDemo: true,
    },
    { upsert: true, returnDocument: 'after' }
  );

  await Donation.findOneAndUpdate(
    { donationId: 'DON-2026-000001' },
    {
      donationId: 'DON-2026-000001',
      kind: 'Physical',
      donorName: 'Valley Mutual Aid Collective (demo)',
      donorEmail: 'donate.demo@rahat.test',
      donorPhone: '9801111222',
      camp: campA._id,
      itemName: 'Hygiene Kits',
      quantity: 80,
      status: DONATION_STATUS.RECEIVED,
      notes: 'Sample received donation for demonstration dashboards.',
      receivedAt: new Date(),
      inventoryUpdated: true,
      isDemo: true,
    },
    { upsert: true }
  );

  await Notification.create({
    audience: 'all',
    title: 'Demonstration disaster mode is active',
    body: 'This RAHAT instance contains clearly labelled demonstration records for training. It is not a live government emergency feed.',
    type: 'disaster_activated',
  });

  await AuditLog.create({
    user: admin._id,
    actorName: admin.fullName,
    role: ROLES.ADMIN,
    action: 'Disaster activated',
    entityType: 'Disaster',
    entityId: disaster.disasterId,
    metadata: { seeded: true },
  });

  const lg = await LocalGovernment.findOneAndUpdate(
    { code: 'SURYABINAYAK-DEMO' },
    {
      code: 'SURYABINAYAK-DEMO',
      name: 'Suryabinayak Municipality (DEMO)',
      type: 'Nagarpalika',
      province: 'Bagmati',
      district: 'Bhaktapur',
      wards: ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10'],
      contactPhone: '01-6612345',
      isDemo: true,
    },
    { upsert: true, returnDocument: 'after' }
  );

  disaster.localGovernment = lg._id;
  await disaster.save();
  campA.localGovernment = lg._id;
  campB.localGovernment = lg._id;
  campC.localGovernment = lg._id;
  await campA.save();
  await campB.save();
  await campC.save();

  const safeZoneSeeds = [
    {
      safeZoneId: 'SZ-2026-0001',
      name: 'Safe Zone A — Suryabinayak Higher Ground',
      ward: '6',
      location: 'Suryabinayak Temple terrace / school field',
      latitude: 27.6698,
      longitude: 85.4272,
      capacity: 500,
      facilities: ['Drinking water', 'Toilets', 'Electricity', 'Medical support', 'Food distribution', 'Wheelchair accessibility', "Women's facilities", 'Communication facilities', 'Emergency transport access', 'Lighting', 'Security'],
    },
    {
      safeZoneId: 'SZ-2026-0002',
      name: 'Safe Zone B — Community Field North',
      ward: '5',
      location: 'Ward 5 community ground (above flood line)',
      latitude: 27.6724,
      longitude: 85.4241,
      capacity: 800,
      facilities: ['Drinking water', 'Toilets', 'Medical support', 'Food distribution', 'Child-friendly space', "Women's facilities", 'Communication facilities', 'Emergency transport access', 'Lighting', 'Security'],
    },
    {
      safeZoneId: 'SZ-2026-0003',
      name: 'Safe Zone C — Municipal School Compound',
      ward: '7',
      location: 'Upper-floor designated school shelter, Ward 7',
      latitude: 27.6641,
      longitude: 85.4336,
      capacity: 400,
      facilities: ['Drinking water', 'Toilets', 'Electricity', 'Food distribution', 'Wheelchair accessibility', 'Child-friendly space', "Women's facilities", 'Communication facilities', 'Lighting', 'Security'],
    },
  ];

  for (const zone of safeZoneSeeds) {
    await SafeZone.findOneAndUpdate(
      { safeZoneId: zone.safeZoneId },
      {
        ...zone,
        localGovernment: lg._id,
        district: 'Bhaktapur',
        municipality: 'Suryabinayak Municipality',
        currentOccupancy: 0,
        accessibleFor: 'General public, elderly, children',
        hazards: 'Keep away from riverbank and flood-prone slopes',
        suitableDisasterTypes: ['Flood', 'Landslide'],
        minimumDisasterLevel: 1,
        maximumDisasterLevel: 4,
        status: 'Active',
        disaster: disaster._id,
        assignedWards: ['5', '6', '7'],
        declaredBy: admin._id,
        declaredAt: new Date(),
        isPublic: true,
        isDemo: true,
      },
      { upsert: true, returnDocument: 'after' }
    );
  }

  disaster.activeSafeZones = (await SafeZone.find({ disaster: disaster._id })).map((z) => z._id);
  await disaster.save();

  await Warehouse.findOneAndUpdate(
    { name: 'Ward 6 Pre-positioned Stock (DEMO)' },
    {
      name: 'Ward 6 Pre-positioned Stock (DEMO)',
      municipality: 'Suryabinayak Municipality',
      ward: '6',
      location: 'Municipal warehouse, Ward 6',
      prePositioned: true,
      stock: [
        { itemName: 'Drinking Water', quantity: 8000, unit: 'L' },
        { itemName: 'Blankets', quantity: 1500, unit: 'units' },
        { itemName: 'First Aid Kits', quantity: 200, unit: 'units' },
        { itemName: 'Tents', quantity: 80, unit: 'units' },
      ],
      isDemo: true,
    },
    { upsert: true, returnDocument: 'after' }
  );

  const resourceSeeds = [
    { name: 'Ambulance A-12', type: 'Ambulance', ward: '6', availability: 'Available' },
    { name: 'Suryabinayak Hospital (DEMO)', type: 'Hospital', ward: '4', availability: 'Available' },
    { name: 'Ward 6 Health Post', type: 'Health post', ward: '6', availability: 'Available' },
    { name: 'Municipal Fire Unit', type: 'Fire service', ward: '5', availability: 'Busy' },
    { name: 'Suryabinayak Police Station', type: 'Police station', ward: '4', availability: 'Available' },
    { name: 'Volunteer Rescue Team 3', type: 'Rescue team', ward: '6', availability: 'Available' },
  ];
  for (const resource of resourceSeeds) {
    await LocalResource.findOneAndUpdate(
      { name: resource.name },
      { ...resource, municipality: 'Suryabinayak Municipality', location: `${resource.type}, Ward ${resource.ward}`, isDemo: true },
      { upsert: true, returnDocument: 'after' }
    );
  }

  await ReliefRequest.findOneAndUpdate(
    { requestId: 'REQ-2026-000001' },
    {
      requestId: 'REQ-2026-000001',
      camp: campA._id,
      disaster: disaster._id,
      itemName: 'Drinking Water',
      current: 2000,
      required: 10000,
      incoming: 1000,
      dailyConsumption: 1500,
      unit: 'L',
      priority: 'CRITICAL',
      priorityReason: 'Water supply is below the configured emergency threshold. Population affected, 1.33 days remaining, disaster level 3.',
      status: 'Verified',
      verifiedBy: admin._id,
      verifiedAt: new Date(),
      notes: 'DEMO DATA — Camp A water need for the flood walkthrough.',
      isDemo: true,
    },
    { upsert: true, returnDocument: 'after' }
  );

  const DonationAllocation = require('../models/DonationAllocation');
  const ImpactRecord = require('../models/ImpactRecord');
  const waterNeed = await ReliefNeed.findOne({ camp: campA._id, itemName: 'Drinking Water' });
  const demoMoney = await Donation.findOneAndUpdate(
    { donationId: 'RAHAT-DON-000001' },
    {
      donationId: 'RAHAT-DON-000001',
      kind: 'Money',
      donorName: donorUser.fullName,
      donorEmail: donorUser.email,
      donorUser: donorUser._id,
      donorType: 'Community Organization',
      amountNPR: 5000,
      allocatedAmount: 5000,
      usedAmount: 5000,
      remainingAmount: 0,
      purpose: 'Highest Priority Need',
      category: 'Highest Priority Need',
      camp: campA._id,
      reliefNeed: waterNeed?._id,
      itemName: 'Drinking Water',
      status: DONATION_STATUS.COMPLETED,
      peopleSupported: 150,
      notes: 'DEMO DATA — completed money donation walkthrough. Not a live payment.',
      isDemo: true,
      timeline: [
        { key: 'submitted', label: 'Donation Submitted', at: new Date('2026-09-05T08:00:00'), description: 'NPR 5000 recorded. Payment pending verification.', byName: donorUser.fullName },
        { key: 'verified', label: 'Payment Verified', at: new Date('2026-09-05T09:00:00'), description: 'Administrator confirmed the demo payment record.', byName: admin.fullName },
        { key: 'allocated', label: 'Donation Allocated', at: new Date('2026-09-05T10:00:00'), description: 'Allocated to drinking water at Relief Center A.', byName: admin.fullName },
        { key: 'delivered', label: 'Delivered to Relief Center', at: new Date('2026-09-08T11:00:00'), description: 'Water purchased and delivered.', byName: admin.fullName },
        { key: 'verified_use', label: 'Distribution Verified', at: new Date('2026-09-08T14:00:00'), description: 'Administrator verified distribution.', byName: admin.fullName },
        { key: 'impact', label: 'Impact Recorded', at: new Date('2026-09-08T15:00:00'), description: 'Supported approximately 150 people.', byName: admin.fullName },
      ],
    },
    { upsert: true, returnDocument: 'after' }
  );
  await DonationAllocation.findOneAndUpdate(
    { allocationId: 'ALC-2026-000001' },
    {
      allocationId: 'ALC-2026-000001',
      donation: demoMoney._id,
      need: waterNeed?._id,
      camp: campA._id,
      itemName: 'Drinking Water',
      amountNPR: 5000,
      reason: 'Highest verified shortage: Drinking Water at Relief Center A.',
      allocatedBy: admin._id,
    },
    { upsert: true }
  );
  await ImpactRecord.findOneAndUpdate(
    { donation: demoMoney._id },
    {
      donation: demoMoney._id,
      camp: campA._id,
      itemName: 'Drinking Water',
      amountUsedNPR: 5000,
      quantityDelivered: 1000,
      unit: 'L',
      peopleSupported: 150,
      location: campA.name,
      verifiedBy: admin._id,
      verifiedAt: new Date('2026-09-08T15:00:00'),
      notes: 'DEMO DATA — group water distribution at Relief Center A.',
      donorFacing: true,
      proofs: [{ kind: 'note', url: '', caption: 'Water drums delivered to Relief Center A.', donorFacing: true }],
    },
    { upsert: true }
  );
  await Notification.findOneAndUpdate(
    { user: donorUser._id, type: 'donation_impact', relatedId: demoMoney._id },
    {
      user: donorUser._id,
      title: 'Your donation has now been used for relief',
      body: 'Your NPR 5,000 contribution was allocated toward drinking water relief at Relief Center A. Proof is available on your donation record.',
      type: 'donation_impact',
      relatedModel: 'Donation',
      relatedId: demoMoney._id,
    },
    { upsert: true }
  );

  await setSequence('CIT-2026', 20);
  await setSequence('HH-2026', 20);
  await setSequence('UNREG-2026', 245);
  await setSequence('CAMP-2026', 10);
  await setSequence('DIS-2026', 5);
  await setSequence('OFF-2026', 10);
  await setSequence('DON-2026', 10);
  await setSequence('SOS-2026', 10);
  await setSequence('SZ-2026', 10);
  await setSequence('REL-2026', 4181);
  await setSequence('REQ-2026', 10);
  await setSequence('ALC-2026', 10);
  await setSequence('RAHAT-DON', 1);
  await setSequence('RAHAT-SUP', 1);

  console.log('------------------------------------------');
  console.log('RAHAT demo seed complete');
  console.log('Admin:   admin@rahat.gov.np');
  console.log('Authority: authority.suryabinayak@rahat.gov.np');
  console.log('Donor: donor.demo@rahat.test');
  console.log('Official Camp A: official.a@rahat.gov.np');
  console.log('Official Camp B: official.b@rahat.gov.np');
  console.log('Official Camp C: official.c@rahat.gov.np');
  console.log('Citizen: citizen.demo@rahat.test');
  console.log('Family household: HH-2026-000001 (Ram, Sita, Anisha, Hari)');
  console.log('Unregistered: UNREG-2026-000245');
  console.log('Camp A blankets: 100 current / 500 required');
  console.log('------------------------------------------');
  process.exit(0);
}

seedDemo().catch((error) => {
  console.error(error);
  process.exit(1);
});
