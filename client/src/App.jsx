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
import AdminDisasterRecords from './pages/admin/DisasterRecords';
import AdminCamps from './pages/admin/Camps';
import AdminInventory from './pages/admin/Inventory';
import AdminDonations from './pages/admin/Donations';
import AdminReports from './pages/admin/Reports';
import AdminAuditLogs from './pages/admin/AuditLogs';
import AdminSettings from './pages/admin/Settings';
import AdminReliefNeeds from './pages/admin/ReliefNeeds';
import AuthorityDashboard from './pages/authority/Dashboard';
import AuthorityPopulation from './pages/authority/Population';
import DonorDashboard from './pages/donor/Dashboard';
import DonorNeeds from './pages/donor/Needs';
import DonorDonations from './pages/donor/Donations';
import DonorDonationDetail from './pages/donor/DonationDetail';
import DonorImpact from './pages/donor/Impact';
import DonorNotifications from './pages/donor/Notifications';
import DonorProfile from './pages/donor/Profile';
import DonorRecommend from './pages/donor/Recommend';
import DonateChoice from './pages/donate/DonateChoice';
import DonateMoney from './pages/donate/DonateMoney';
import DonateSupplies from './pages/donate/DonateSupplies';
import HowItWorks from './pages/HowItWorks';
import ImpactStories from './pages/ImpactStories';
import AdminDonationDetail from './pages/admin/DonationDetail';
import Victims from './pages/Victims';
import VictimDetail from './pages/VictimDetail';
import ApplySupport from './pages/ApplySupport';
import AdminVictims from './pages/admin/Victims';
import KhaltiSuccess from './pages/donate/KhaltiSuccess';
import KhaltiFailure from './pages/donate/KhaltiFailure';
import KhaltiCheckout from './pages/donate/KhaltiCheckout';

export default function App() {
  return (
    <Routes>
      <Route element={<PublicLayout />}>
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<About />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/disasters" element={<DisasterInformation />} />
        <Route path="/relief-needs" element={<ReliefNeeds />} />
        <Route path="/transparency" element={<ReliefTransparency />} />
        <Route path="/camps" element={<ReliefCamps />} />
        <Route path="/camps/:id" element={<CampDetails />} />
        <Route path="/donations" element={<Donations />} />
        <Route path="/donate" element={<DonateChoice />} />
        <Route path="/donate/money" element={<DonateMoney />} />
        <Route path="/victims" element={<Victims />} />
        <Route path="/victims/:id" element={<VictimDetail />} />
        <Route path="/apply-support" element={<ApplySupport />} />
        <Route path="/donate/khalti/checkout" element={<KhaltiCheckout />} />
        <Route path="/donate/khalti/success" element={<KhaltiSuccess />} />
        <Route path="/donate/khalti/failure" element={<KhaltiFailure />} />
        <Route path="/donate/esewa/success" element={<Navigate to="/donate/khalti/success" replace />} />
        <Route path="/donate/esewa/failure" element={<Navigate to="/donate/khalti/failure" replace />} />
        <Route path="/donate/esewa/sandbox" element={<Navigate to="/donate/money" replace />} />
        <Route path="/donate/esewa/pay" element={<Navigate to="/donate/money" replace />} />
        <Route path="/how-it-works" element={<HowItWorks />} />
        <Route path="/impact" element={<ImpactStories />} />
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
        <Route path="disaster-status" element={<CitizenDisasterStatus />} />
        <Route path="camp-status" element={<CitizenCampStatus />} />
        <Route path="apply-support" element={<ApplySupport />} />
      </Route>

      <Route path="/authority" element={<ProtectedRoute><RoleRoute roles={['local_authority', 'local_admin', 'admin']}><AuthorityLayout /></RoleRoute></ProtectedRoute>}>
        <Route path="dashboard" element={<AuthorityDashboard />} />
        <Route path="disasters" element={<AdminDisasters />} />
        <Route path="camps" element={<AdminCamps />} />
        <Route path="population" element={<AuthorityPopulation />} />
        <Route path="relief-needs" element={<AdminReliefNeeds />} />
        <Route path="transfers" element={<TransferBoard canCreate />} />
      </Route>

      <Route path="/donor" element={<ProtectedRoute><RoleRoute roles={['donor', 'admin']}><DonorLayout /></RoleRoute></ProtectedRoute>}>
        <Route path="dashboard" element={<DonorDashboard />} />
        <Route path="needs" element={<DonorNeeds />} />
        <Route path="donate/money" element={<DonateMoney />} />
        <Route path="donate/supplies" element={<DonateSupplies />} />
        <Route path="recommend" element={<DonorRecommend />} />
        <Route path="donations" element={<DonorDonations />} />
        <Route path="donations/:id" element={<DonorDonationDetail />} />
        <Route path="impact" element={<DonorImpact />} />
        <Route path="notifications" element={<DonorNotifications />} />
        <Route path="profile" element={<DonorProfile />} />
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
        <Route path="disaster-records" element={<AdminDisasterRecords />} />
        <Route path="camps" element={<AdminCamps />} />
        <Route path="relief-needs" element={<AdminReliefNeeds />} />
        <Route path="inventory" element={<AdminInventory />} />
        <Route path="victims" element={<AdminVictims />} />
        <Route path="donations" element={<AdminDonations />} />
        <Route path="donations/:id" element={<AdminDonationDetail />} />
        <Route path="transfers" element={<TransferBoard canCreate />} />
        <Route path="reports" element={<AdminReports />} />
        <Route path="audit-logs" element={<AdminAuditLogs />} />
        <Route path="settings" element={<AdminSettings />} />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
