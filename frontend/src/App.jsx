import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Home from './pages/Home';
import About from './pages/About';
import Products from './pages/Products';
import Contact from './pages/Contact';
import AdminLogin from './pages/AdminLogin';
import ManagerLogin from './pages/ManagerLogin';
import AttendanceLogin from './pages/AttendanceLogin';

// Admin Components
import AdminLayout from './components/AdminLayout';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminManagers from './pages/admin/AdminManagers';
import AdminOrders from './pages/admin/AdminOrders';
import AdminAttendance from './pages/admin/AdminAttendance';

// Manager Components
import ManagerLayout from './components/ManagerLayout';
import ManagerDashboard from './pages/manager/ManagerDashboard';
import ManagerEmployees from './pages/manager/ManagerEmployees';
import ManagerOrders from './pages/manager/ManagerOrders';
import ManagerAddOrder from './pages/manager/ManagerAddOrder';
import ManagerAttendance from './pages/manager/ManagerAttendance';

// Employee Components
import EmployeeLayout from './components/EmployeeLayout';
import EmployeeDashboard from './pages/employee/EmployeeDashboard';
import EmployeeHistory from './pages/employee/EmployeeHistory';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="about" element={<About />} />
          <Route path="products" element={<Products />} />
          <Route path="contact" element={<Contact />} />
          <Route path="admin-login" element={<AdminLogin />} />
          <Route path="manager-login" element={<ManagerLogin />} />
          <Route path="attendance-login" element={<AttendanceLogin />} />
        </Route>

        {/* Admin Routes */}
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<AdminDashboard />} />
          <Route path="managers" element={<AdminManagers />} />
          <Route path="orders" element={<AdminOrders />} />
          <Route path="attendance" element={<AdminAttendance />} />
        </Route>

        {/* Manager Routes */}
        <Route path="/manager" element={<ManagerLayout />}>
          <Route index element={<ManagerDashboard />} />
          <Route path="employees" element={<ManagerEmployees />} />
          <Route path="orders" element={<ManagerOrders />} />
          <Route path="orders/add" element={<ManagerAddOrder />} />
          <Route path="attendance" element={<ManagerAttendance />} />
        </Route>

        {/* Employee Routes */}
        <Route path="/employee" element={<EmployeeLayout />}>
          <Route index element={<EmployeeDashboard />} />
          <Route path="history" element={<EmployeeHistory />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
