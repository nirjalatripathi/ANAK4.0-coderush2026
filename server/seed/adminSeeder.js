require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });
const connectDB = require('../config/db');
const User = require('../models/User');
const { ROLES } = require('../utils/constants');

async function seedAdmin() {
  await connectDB();

  const email = (process.env.ADMIN_EMAIL || 'admin@rahat.gov.np').toLowerCase();
  const password = process.env.ADMIN_PASSWORD || 'RahatAdmin@2026';
  const fullName = process.env.ADMIN_NAME || 'RAHAT System Administrator';

  let admin = await User.findOne({ email });
  if (admin) {
    admin.role = ROLES.ADMIN;
    admin.fullName = fullName;
    admin.isActive = true;
    if (password) {
      admin.password = password;
    }
    await admin.save();
    console.log(`Updated existing administrator: ${email}`);
  } else {
    admin = await User.create({
      email,
      password,
      fullName,
      role: ROLES.ADMIN,
    });
    console.log(`Created administrator: ${email}`);
  }

  console.log('Admin seeder complete. Use /admin/login — never a public navbar link.');
  process.exit(0);
}

seedAdmin().catch((error) => {
  console.error(error);
  process.exit(1);
});
