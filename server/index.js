const path = require('path');
const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
require('./models/LocalAuthority');
require('./models/AffectedArea');
require('./models/InventoryTransaction');
require('./models/DonationDelivery');
require('./models/ResourceTransfer');
require('./models/DonationAllocation');
require('./models/ImpactRecord');
const { notFound, errorHandler } = require('./middleware/errorMiddleware');

dotenv.config();

const app = express();

app.use(
  cors({
    origin(origin, callback) {
      if (!origin || process.env.NODE_ENV !== 'production') {
        return callback(null, true);
      }
      const allowed = String(process.env.CLIENT_URL || 'http://localhost:5173')
        .split(',')
        .map((value) => value.trim());
      return callback(null, allowed.includes(origin));
    },
    credentials: true,
  })
);
app.use(express.json({ limit: '2mb' }));
app.use(express.urlencoded({ extended: true }));

app.use('/uploads/profile-images', express.static(path.join(__dirname, 'uploads', 'profile-images')));
app.use('/uploads/unregistered', express.static(path.join(__dirname, 'uploads', 'unregistered')));

app.get('/api/health', async (req, res) => {
  const { pingSupabase } = require('./config/supabase');
  const supabase = await pingSupabase();
  res.json({
    success: true,
    service: 'RAHAT API',
    time: new Date().toISOString(),
    mongo: Boolean(process.env.MONGO_URI),
    supabase,
  });
});

app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/citizens', require('./routes/citizenRoutes'));
app.use('/api/households', require('./routes/householdRoutes'));
app.use('/api/disasters', require('./routes/disasterRoutes'));
app.use('/api/camps', require('./routes/campRoutes'));
app.use('/api/officials', require('./routes/campOfficialRoutes'));
app.use('/api/missing-found', require('./routes/missingFoundRoutes'));
app.use('/api/unregistered', require('./routes/unregisteredRoutes'));
app.use('/api/inventory', require('./routes/inventoryRoutes'));
app.use('/api/donations', require('./routes/donationRoutes'));
app.use('/api/victims', require('./routes/victimRoutes'));
app.use('/api/emergencies', require('./routes/emergencyRoutes'));
app.use('/api/notifications', require('./routes/notificationRoutes'));
app.use('/api/admin', require('./routes/adminRoutes'));
app.use('/api/public', require('./routes/publicRoutes'));
app.use('/api/relief', require('./routes/reliefRoutes'));
app.use('/api/resources', require('./routes/resourceRoutes'));
app.use('/api/resource-transfers', require('./routes/resourceTransferRoutes'));

app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

connectDB()
  .then(async () => {
    const { ensureDemoAccounts } = require('./seed/demoAccounts');
    await ensureDemoAccounts();
    app.listen(PORT, () => {
      console.log(`RAHAT server listening on port ${PORT}`);
    });
  })
  .catch((error) => {
    console.error('Failed to start RAHAT server', error);
    process.exit(1);
  });
