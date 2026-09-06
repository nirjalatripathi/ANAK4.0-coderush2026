const User = require('../models/User');
const { ROLES } = require('../utils/constants');

const DEMO_ACCOUNTS = [
  {
    email: process.env.ADMIN_EMAIL || 'admin@rahat.gov.np',
    password: process.env.ADMIN_PASSWORD || 'RahatAdmin@2026',
    fullName: process.env.ADMIN_NAME || 'RAHAT System Administrator',
    role: ROLES.ADMIN,
  },
  {
    email: 'vendor.demo@rahat.test',
    password: process.env.DEMO_VENDOR_PASSWORD || 'VendorDemo@2026',
    fullName: 'RAHAT Vendor',
    role: ROLES.DONOR,
  },
];

async function ensureDemoAccounts() {
  for (const row of DEMO_ACCOUNTS) {
    const existing = await User.findOne({ email: row.email.toLowerCase() }).select('+password');
    if (existing) {
      existing.fullName = row.fullName;
      existing.role = row.role;
      existing.isActive = true;
      existing.password = row.password;
      await existing.save();
      continue;
    }
    await User.create(row);
  }
}

module.exports = { ensureDemoAccounts, DEMO_ACCOUNTS };
