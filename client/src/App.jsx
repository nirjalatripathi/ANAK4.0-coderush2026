import { Navigate, Route, Routes } from 'react-router-dom';
import PublicLayout from './layouts/PublicLayout';
import CitizenLayout from './layouts/CitizenLayout';
import CampLayout from './layouts/CampLayout';
import AdminLayout from './layouts/AdminLayout';
import AuthorityLayout from './layouts/AuthorityLayout';
import DonorLayout from './layouts/DonorLayout';
import ProtectedRoute from './components/ProtectedRoute';
import RoleRoute from './components/RoleRoute';
import Home from './pages/Home';
import About from './pages/About';
import Contact from './pages/Contact';
import SafeZones, { SafeZoneDetails } from './pages/SafeZones';
import ReliefNeeds from './pages/ReliefNeeds';
import ReliefTransparency from './pages/ReliefTransparency';
import DisasterInformation from './pages/DisasterInformation';
import ReliefCamps, { CampDetails } from './pages/ReliefCamps';
import Donations from './pages/Donations';
import { AccessDenied, Privacy, Terms } from './pages/Legal';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import ForgotPassword from './pages/auth/ForgotPassword';
import AdminLogin from './pages/admin/AdminLogin';
import CitizenDashboard from './pages/citizen/Dashboard';
import CitizenProfile from './pages/citizen/Profile';
import CitizenSafeZones from './pages/citizen/SafeZones';
import CitizenDisasterStatus from './pages/citizen/DisasterStatus';
import CitizenCampStatus from './pages/citizen/CampStatus';
import CampDashboard from './pages/camp/Dashboard';
import CampPeople from './pages/camp/People';
import CampInventory from './pages/camp/Inventory';
import CampReliefNeeds from './pages/camp/ReliefNeeds';
import CampCheckIn from './pages/camp/CheckIn';
import CampDeliveries from './pages/camp/Deliveries';
import TransferBoard from './pages/shared/TransferBoard';
import AdminDashboard from './pages/admin/Dashboard';
import AdminCitizens from './pages/admin/Citizens';
import CitizenDetails from './pages/admin/CitizenDetails';
import AdminDisasters from './pages/admin/Disasters';
import AdminCamps from './pages/admin/Camps';
import AdminInventory from './pages/admin/Inventory';
import AdminDonations from './pages/admin/Donations';
import AdminReports from './pages/admin/Reports';
import AdminAuditLogs from './pages/admin/AuditLogs';
import AdminSettings from './pages/admin/Settings';
import AdminSafeZones from './pages/admin/SafeZones';
import AdminReliefNeeds from './pages/admin/ReliefNeeds';
import AuthorityDashboard from './pages/authority/Dashboard';
import AuthorityPopulation from './pages/authority/Population';
import DonorDashboard from './pages/donor/Dashboard';
import DonorNeeds from './pages/donor/Needs';
import DonorDonations from './pages/donor/Donations';
import DonorDonationDetail from './pages/donor/DonationDetail';

export default function App() {
  return (
    <Routes>
      <Route element={<PublicLayout />}>
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<About />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/disasters" element={<DisasterInformation />} />
        <Route path="/safe-zones" element={<SafeZones />} />
        <Route path="/safe-zones/:id" element={<SafeZoneDetails />} />
        <Route path="/relief-needs" element={<ReliefNeeds />} />
        <Route path="/transparency" element={<ReliefTransparency />} />
        <Route path="/camps" element={<ReliefCamps />} />
        <Route path="/camps/:id" element={<CampDetails />} />
        <Route path="/donations" element={<Donations />} />
        <Route path="/privacy" element={<Privacy />} />
        <Route path="/terms" element={<Terms />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route path="/access-denied" element={<AccessDenied />} />
      </Route>

      <Route path="/citizen" element={<ProtectedRoute><RoleRoute roles={['citizen']}><CitizenLayout /></RoleRoute></ProtectedRoute>}>
        <Route path="dashboard" element={<CitizenDashboard />} />
        <Route path="profile" element={<CitizenProfile />} />
        <Route path="safe-zones" element={<CitizenSafeZones />} />
        <Route path="disaster-status" element={<CitizenDisasterStatus />} />
        <Route path="camp-status" element={<CitizenCampStatus />} />
      </Route>

      <Route path="/authority" element={<ProtectedRoute><RoleRoute roles={['local_authority', 'local_admin', 'admin']}><AuthorityLayout /></RoleRoute></ProtectedRoute>}>
        <Route path="dashboard" element={<AuthorityDashboard />} />
        <Route path="disasters" element={<AdminDisasters />} />
        <Route path="safe-zones" element={<AdminSafeZones />} />
        <Route path="camps" element={<AdminCamps />} />
        <Route path="population" element={<AuthorityPopulation />} />
        <Route path="relief-needs" element={<AdminReliefNeeds />} />
        <Route path="transfers" element={<TransferBoard canCreate />} />
      </Route>

      <Route path="/donor" element={<ProtectedRoute><RoleRoute roles={['donor', 'admin']}><DonorLayout /></RoleRoute></ProtectedRoute>}>
        <Route path="dashboard" element={<DonorDashboard />} />
        <Route path="needs" element={<DonorNeeds />} />
        <Route path="donations" element={<DonorDonations />} />
        <Route path="donations/:id" element={<DonorDonationDetail />} />
      </Route>

      <Route path="/camp" element={<ProtectedRoute><RoleRoute roles={['camp_official', 'admin']}><CampLayout /></RoleRoute></ProtectedRoute>}>
        <Route path="dashboard" element={<CampDashboard />} />
        <Route path="people" element={<CampPeople />} />
        <Route path="check-in" element={<CampCheckIn />} />
        <Route path="inventory" element={<CampInventory />} />
        <Route path="needs" element={<CampReliefNeeds />} />
        <Route path="deliveries" element={<CampDeliveries />} />
        <Route path="transfers" element={<TransferBoard />} />
      </Route>

      <Route path="/admin" element={<RoleRoute roles={['admin']} adminLock><AdminLayout /></RoleRoute>}>
        <Route index element={<Navigate to="dashboard" replace />} />
        <Route path="dashboard" element={<AdminDashboard />} />
        <Route path="citizens" element={<AdminCitizens />} />
        <Route path="citizens/:id" element={<CitizenDetails />} />
        <Route path="disasters" element={<AdminDisasters />} />
        <Route path="safe-zones" element={<AdminSafeZones />} />
        <Route path="camps" element={<AdminCamps />} />
        <Route path="relief-needs" element={<AdminReliefNeeds />} />
        <Route path="inventory" element={<AdminInventory />} />
        <Route path="donations" element={<AdminDonations />} />
        <Route path="transfers" element={<TransferBoard canCreate />} />
        <Route path="reports" element={<AdminReports />} />
        <Route path="audit-logs" element={<AdminAuditLogs />} />
        <Route path="settings" element={<AdminSettings />} />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
