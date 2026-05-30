import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import ProtectedRoute from "./components/ProtectedRoute";
import AdminLogin from "./pages/auth/AdminLogin";
import AdminRegister from "./pages/auth/AdminRegister";
import CustomerLogin from "./pages/auth/CustomerLogin";
import CustomerRegister from "./pages/auth/CustomerRegister";
import AdminChat from "./pages/admin/AdminChat";
import AdminDashboard from "./pages/admin/AdminDashboard";
import CustomerManagement from "./pages/admin/CustomerManagement";
import LoanApproval from "./pages/admin/LoanApproval";
import About from "./pages/About";
import Chat from "./pages/user/Chat";
import Dashboard from "./pages/user/Dashboard";
import Investments from "./pages/user/Investments";
import LoanApplication from "./pages/user/LoanApplication";
import Notifications from "./pages/user/Notifications";
import Transactions from "./pages/user/Transactions";
import { getSession } from "./utils/api";

function HomeRedirect() {
  const session = getSession();

  if (!session) return <Navigate to="/customer-login" replace />;
  return <Navigate to={session.role === "admin" ? "/admin-dashboard" : "/dashboard"} replace />;
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomeRedirect />} />
        <Route path="/customer-login" element={<CustomerLogin />} />
        <Route path="/customer-register" element={<CustomerRegister />} />
        <Route path="/admin-login" element={<AdminLogin />} />
        <Route path="/admin-register" element={<AdminRegister />} />
        <Route path="/about" element={<About />} />

        <Route path="/dashboard" element={<ProtectedRoute allowedRoles={["customer"]}><Dashboard /></ProtectedRoute>} />
        <Route path="/transactions" element={<ProtectedRoute allowedRoles={["customer"]}><Transactions /></ProtectedRoute>} />
        <Route path="/investments" element={<ProtectedRoute allowedRoles={["customer"]}><Investments /></ProtectedRoute>} />
        <Route path="/loan" element={<ProtectedRoute allowedRoles={["customer"]}><LoanApplication /></ProtectedRoute>} />
        <Route path="/chat" element={<ProtectedRoute allowedRoles={["customer"]}><Chat /></ProtectedRoute>} />
        <Route path="/notifications" element={<ProtectedRoute allowedRoles={["customer"]}><Notifications /></ProtectedRoute>} />

        <Route path="/admin-dashboard" element={<ProtectedRoute allowedRoles={["admin"]}><AdminDashboard /></ProtectedRoute>} />
        <Route path="/loan-approval" element={<ProtectedRoute allowedRoles={["admin"]}><LoanApproval /></ProtectedRoute>} />
        <Route path="/customer-management" element={<ProtectedRoute allowedRoles={["admin"]}><CustomerManagement /></ProtectedRoute>} />
        <Route path="/admin-chat" element={<ProtectedRoute allowedRoles={["admin"]}><AdminChat /></ProtectedRoute>} />

        <Route path="*" element={<HomeRedirect />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
