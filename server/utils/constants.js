const ROLES = {
  CITIZEN: 'citizen',
  CAMP_OFFICIAL: 'camp_official',
  LOCAL_AUTHORITY: 'local_authority',
  LOCAL_ADMIN: 'local_authority',
  DONOR: 'donor',
  ADMIN: 'admin',
};

const VERIFICATION_STATUS = {
  PENDING: 'Pending Verification',
  VERIFIED: 'Verified',
  REJECTED: 'Rejected',
  RESUBMISSION: 'Requires Resubmission',
};

const PERSON_STATUS = {
  FOUND: 'Found',
  MISSING: 'Missing',
  IN_SAFE_ZONE: 'In Safe Zone',
  IN_RELIEF_CAMP: 'In Relief Camp',
  TRANSFERRED: 'Transferred',
  HOSPITALIZED: 'Hospitalized',
  DECEASED: 'Deceased',
  UNVERIFIED: 'Unverified',
};

const DISASTER_TYPES = [
  'Earthquake',
  'Flood',
  'Landslide',
  'Fire',
  'Storm',
  'Avalanche',
  'Building Collapse',
  'Epidemic',
  'Other',
];

const DISASTER_STATUS = {
  DRAFT: 'Draft',
  MONITORING: 'Monitoring',
  ACTIVE: 'Active',
  UNDER_CONTROL: 'Under Control',
  RECOVERY: 'Recovery',
  CLOSED: 'Closed',
};

const DISASTER_LEVELS = [
  { level: 1, code: 'LEVEL_1', label: 'LEVEL 1 — LOCAL / LOW', short: 'Local / Low' },
  { level: 2, code: 'LEVEL_2', label: 'LEVEL 2 — MODERATE', short: 'Moderate' },
  { level: 3, code: 'LEVEL_3', label: 'LEVEL 3 — HIGH', short: 'High' },
  { level: 4, code: 'LEVEL_4', label: 'LEVEL 4 — SEVERE / EMERGENCY', short: 'Severe / Emergency' },
];

const SAFE_ZONE_STATUS = {
  AVAILABLE: 'Available',
  PROPOSED: 'Proposed',
  UNDER_ASSESSMENT: 'Under Assessment',
  DECLARED_SAFE: 'Declared Safe',
  ACTIVE: 'Active',
  FULL: 'Full',
  TEMPORARILY_CLOSED: 'Temporarily Closed',
  INACTIVE: 'Inactive',
  CLOSED: 'Closed',
};

const CAMP_STATUS = {
  PLANNED: 'Planned',
  ACTIVE: 'Active',
  NEAR_CAPACITY: 'Near Capacity',
  FULL: 'Full',
  TEMPORARILY_CLOSED: 'Temporarily Closed',
  CLOSED: 'Closed',
};

const HOUSEHOLD_EVACUATION = {
  AT_HOME: 'At Home',
  EVACUATED: 'Evacuated',
  IN_SAFE_ZONE: 'In Safe Zone',
  IN_RELIEF_CAMP: 'In Relief Camp',
  SEPARATED: 'Separated',
  RECOVERED: 'Recovered',
};

const DONOR_TYPES = [
  'Individual',
  'NGO',
  'INGO',
  'Company',
  'Community Organization',
  'Government Agency',
  'Other Organization',
];

const SHIPMENT_STATUS = {
  PREPARED: 'Prepared',
  DISPATCHED: 'Dispatched',
  IN_TRANSIT: 'In Transit',
  PARTIALLY_RECEIVED: 'Partially Received',
  RECEIVED: 'Received',
  CANCELLED: 'Cancelled',
};

const RESOURCE_AVAILABILITY = ['Available', 'Busy', 'Unavailable', 'Emergency Only'];

const LOCAL_RESOURCE_TYPES = [
  'Ambulance',
  'Hospital',
  'Fire service',
  'Police station',
  'Health post',
  'Water source',
  'Warehouse',
  'Food supplier',
  'Vehicle',
  'Rescue team',
  'Volunteers',
  'Community hall',
  'School shelter',
];

const SAFE_ZONE_FACILITIES = [
  'Drinking water',
  'Toilets',
  'Electricity',
  'Medical support',
  'Food distribution',
  'Wheelchair accessibility',
  'Child-friendly space',
  "Women's facilities",
  'Communication facilities',
  'Emergency transport access',
  'Lighting',
  'Security',
];

const DISASTER_SAFE_ZONE_GUIDANCE = {
  Earthquake: ['Open ground', 'School field', 'Community field', 'Government-designated shelter'],
  Flood: ['Higher elevation', 'Upper-floor designated shelter', 'School/building outside flood-prone area'],
  Landslide: ['Away from slope', 'Away from landslide-risk zone', 'Stable open area'],
  Fire: ['Open area', 'Away from affected structure', 'Accessible evacuation point'],
};

const SUPPLY_THRESHOLDS = {
  CRITICAL: 1,
  HIGH: 2,
  MODERATE: 4,
};

const DISASTER_SEVERITY = ['Low', 'Moderate', 'High', 'Critical'];

const GENDERS = ['Male', 'Female', 'Other', 'Prefer not to say'];

const BLOOD_GROUPS = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-', 'Unknown'];

const RELATIONSHIPS = [
  'Father',
  'Mother',
  'Son',
  'Daughter',
  'Husband',
  'Wife',
  'Brother',
  'Sister',
  'Grandparent',
  'Guardian',
  'Other',
];

const VULNERABILITY_TYPES = [
  'Child',
  'Elderly',
  'Person with disability',
  'Pregnant',
  'Requires special assistance',
];

const DOCUMENT_TYPES = {
  BIRTH_CERTIFICATE: 'Birth Certificate',
  CITIZENSHIP: 'Citizenship Certificate',
  NATIONAL_ID: 'National ID',
  PHOTOGRAPH: 'Recent Photograph',
  OTHER: 'Other',
};

const UNREGISTERED_STATUS = {
  UNVERIFIED: 'Unverified',
  MATCHED: 'Matched',
  VERIFIED: 'Verified',
  CONVERTED: 'Converted',
};

const INVENTORY_ITEMS = [
  'Rice',
  'Drinking Water',
  'Blankets',
  'Clothes',
  'Tents',
  'Medicines',
  'First Aid Kits',
  'Baby Food',
  'Sanitary Products',
  'Hygiene Kits',
  'Food Packages',
  'Cooking Supplies',
  'Other',
];

const PRIORITY = {
  LOW: 'LOW',
  MEDIUM: 'MEDIUM',
  HIGH: 'HIGH',
  CRITICAL: 'CRITICAL',
};

const DONATION_STATUS = {
  PLEDGED: 'Pledged',
  CONFIRMED: 'Confirmed',
  VERIFIED: 'Verified',
  ALLOCATED: 'Allocated',
  IN_TRANSIT: 'In Transit',
  ARRIVED: 'Arrived',
  PARTIALLY_RECEIVED: 'Partially Received',
  RECEIVED: 'Received',
  IN_INVENTORY: 'In Inventory',
  DISTRIBUTED: 'Distributed',
  CANCELLED: 'Cancelled',
};

const DONATION_TRANSITIONS = {
  Pledged: ['Confirmed', 'Cancelled'],
  Confirmed: ['In Transit', 'Cancelled'],
  Verified: ['In Transit', 'Allocated', 'Cancelled'],
  Allocated: ['In Transit', 'Cancelled'],
  'In Transit': ['Arrived', 'Received', 'Partially Received'],
  Arrived: ['Received', 'Partially Received'],
  Received: ['In Inventory', 'Distributed'],
  'Partially Received': ['In Inventory', 'Distributed'],
  'In Inventory': ['Distributed'],
  Distributed: [],
  Cancelled: [],
};

const RESOURCE_TRANSFER_STATUS = {
  PROPOSED: 'Proposed',
  APPROVED: 'Approved',
  IN_TRANSIT: 'In Transit',
  RECEIVED: 'Received',
  CANCELLED: 'Cancelled',
};

const INVENTORY_TXN_TYPES = {
  RECEIVED: 'Received',
  DISTRIBUTED: 'Distributed',
  TRANSFERRED_OUT: 'Transferred Out',
  TRANSFERRED_IN: 'Transferred In',
  ADJUSTMENT: 'Adjustment',
  CORRECTION: 'Correction',
};

const CAMP_RESOURCE_STATUS = ['Adequate', 'Limited', 'Critical', 'Unavailable'];

const EMERGENCY_URGENCY = ['Low', 'Medium', 'High', 'Critical'];

const EMERGENCY_STATUS = {
  OPEN: 'Open',
  ACKNOWLEDGED: 'Acknowledged',
  IN_PROGRESS: 'In Progress',
  RESOLVED: 'Resolved',
};

const REPORTER_TYPES = ['citizen', 'camp_official', 'third_party'];

const NOTIFICATION_TYPES = [
  'registration_approved',
  'verification_completed',
  'verification_rejected',
  'verification_resubmission',
  'family_member_found',
  'person_transferred',
  'person_status_updated',
  'disaster_activated',
  'camp_shortage',
  'donation_received',
  'emergency_announcement',
  'safe_zone_declared',
  'safe_zone_full',
  'evacuation_notice',
  'shipment_dispatched',
  'shipment_received',
  'relief_request_approved',
  'system',
];

const AUDIT_ACTIONS = {
  CITIZEN_VERIFIED: 'Citizen verified',
  CITIZEN_REJECTED: 'Citizen rejected',
  CITIZEN_RESUBMISSION: 'Citizen resubmission requested',
  CITIZEN_SUSPENDED: 'Citizen suspended',
  CITIZEN_UPDATED: 'Citizen updated',
  PERSON_MARKED_FOUND: 'Person marked Found',
  PERSON_MARKED_MISSING: 'Person marked Missing',
  PERSON_TRANSFERRED: 'Person transferred',
  PERSON_STATUS_UPDATED: 'Person status updated',
  UNREGISTERED_CREATED: 'Unregistered person created',
  UNREGISTERED_VERIFIED: 'Unregistered person verified',
  UNREGISTERED_MATCHED: 'Unregistered person matched',
  CAMP_CREATED: 'Camp created',
  CAMP_UPDATED: 'Camp updated',
  INVENTORY_CHANGED: 'Inventory changed',
  DONATION_RECEIVED: 'Donation received',
  DONATION_UPDATED: 'Donation updated',
  DISASTER_ACTIVATED: 'Disaster activated',
  DISASTER_CREATED: 'Disaster created',
  DISASTER_UPDATED: 'Disaster updated',
  DISASTER_LEVEL_CHANGED: 'Disaster level changed',
  SAFE_ZONE_DECLARED: 'Safe zone declared',
  SAFE_ZONE_CLOSED: 'Safe zone closed',
  PERSON_CHECKED_IN: 'Person checked in',
  PERSON_CHECKED_OUT: 'Person checked out',
  RELIEF_REQUEST_APPROVED: 'Relief request approved',
  SHIPMENT_DISPATCHED: 'Shipment dispatched',
  SHIPMENT_RECEIVED: 'Shipment received',
  ALLOCATION_CHANGED: 'Allocation changed',
  OFFICIAL_CREATED: 'Camp official created',
  HOUSEHOLD_UPDATED: 'Household updated',
  SETTINGS_UPDATED: 'System settings updated',
};

const NEPAL_DISTRICTS = [
  'Kathmandu',
  'Lalitpur',
  'Bhaktapur',
  'Kavrepalanchok',
  'Sindhupalchok',
  'Nuwakot',
  'Dhading',
  'Rasuwa',
  'Makwanpur',
  'Chitwan',
  'Pokhara / Kaski',
  'Gorkha',
  'Lamjung',
  'Tanahun',
  'Syangja',
  'Parbat',
  'Baglung',
  'Myagdi',
  'Mustang',
  'Manang',
  'Ramechhap',
  'Dolakha',
  'Okhaldhunga',
  'Solukhumbu',
  'Sunsari',
  'Morang',
  'Jhapa',
  'Dhanusha',
  'Mahottari',
  'Sarlahi',
  'Rautahat',
  'Bara',
  'Parsa',
  'Rupandehi',
  'Kapilvastu',
  'Banke',
  'Bardiya',
  'Kailali',
  'Kanchanpur',
  'Surkhet',
  'Dailekh',
  'Jumla',
  'Humla',
  'Mugu',
  'Dolpa',
  'Bajura',
  'Bajhang',
  'Doti',
  'Achham',
  'Dadeldhura',
  'Baitadi',
  'Darchula',
  'Other',
];

module.exports = {
  ROLES,
  VERIFICATION_STATUS,
  PERSON_STATUS,
  DISASTER_TYPES,
  DISASTER_STATUS,
  DISASTER_LEVELS,
  DISASTER_SEVERITY,
  SAFE_ZONE_STATUS,
  CAMP_STATUS,
  HOUSEHOLD_EVACUATION,
  DONOR_TYPES,
  SHIPMENT_STATUS,
  RESOURCE_AVAILABILITY,
  LOCAL_RESOURCE_TYPES,
  SAFE_ZONE_FACILITIES,
  DISASTER_SAFE_ZONE_GUIDANCE,
  SUPPLY_THRESHOLDS,
  GENDERS,
  BLOOD_GROUPS,
  RELATIONSHIPS,
  VULNERABILITY_TYPES,
  DOCUMENT_TYPES,
  UNREGISTERED_STATUS,
  INVENTORY_ITEMS,
  PRIORITY,
  DONATION_STATUS,
  DONATION_TRANSITIONS,
  RESOURCE_TRANSFER_STATUS,
  INVENTORY_TXN_TYPES,
  CAMP_RESOURCE_STATUS,
  EMERGENCY_URGENCY,
  EMERGENCY_STATUS,
  REPORTER_TYPES,
  NOTIFICATION_TYPES,
  AUDIT_ACTIONS,
  NEPAL_DISTRICTS,
};
