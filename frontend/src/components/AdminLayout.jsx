import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Users, Users2, PackageSearch, ClipboardCheck, LogOut, Mail } from 'lucide-react';
import { useDispatch } from 'react-redux';
import { logout } from '../features/auth/authSlice';

const AdminLayout = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const menuItems = [
    { path: '/admin', icon: LayoutDashboard, label: 'Dashboard' },
    { path: '/admin/managers', icon: Users, label: 'Managers' },
    { path: '/admin/employees', icon: Users2, label: 'Employees' },
    { path: '/admin/orders', icon: PackageSearch, label: 'Orders' },
    { path: '/admin/attendance', icon: ClipboardCheck, label: 'Attendance' },
    { path: '/admin/emails', icon: Mail, label: 'Email Logs' },
  ];

  const isActive = (path) => {
    if (path === '/admin') {
      return location.pathname === '/admin';
    }
    return location.pathname.startsWith(path);
  };

  const getDesktopClass = (path) => {
    return isActive(path) ? 'bg-primary-50 text-primary-600' : 'text-gray-600 md:hover:bg-gray-50';
  };

  const getMobileClass = (path) => {
    return isActive(path) ? 'text-primary-600' : 'text-gray-400';
  };

  const handleLogout = () => {
    dispatch(logout());
    navigate('/');
  };

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      {/* Desktop Sidebar */}
      <aside className="w-64 bg-white border-r border-gray-100 flex-col hidden md:flex">
        <div className="h-16 flex items-center px-6 border-b border-gray-100">
          <span className="font-bold text-xl tracking-tight text-gray-900">
            Admin<span className="text-primary-600">Portal</span>
          </span>
        </div>

        <div className="flex-1 overflow-y-auto py-4 px-3">
          <nav className="space-y-1">
            {menuItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg font-medium transition-colors ${getDesktopClass(item.path)}`}
              >
                <item.icon className={`w-5 h-5 ${isActive(item.path) ? 'text-primary-600' : 'text-gray-400'}`} />
                {item.label}
              </Link>
            ))}
          </nav>
        </div>

        <div className="p-4 border-t border-gray-100">
          <button onClick={handleLogout} className="flex items-center gap-3 px-3 py-2.5 rounded-lg font-medium text-red-600 md:hover:bg-red-50 transition-colors w-full">
            <LogOut className="w-5 h-5" />
            Logout
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto pb-20 md:pb-0">
        <Outlet />
      </main>

      {/* Mobile Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 grid grid-cols-6 py-1.5 z-50 md:hidden" style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}>
        {menuItems.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            className={`flex flex-col items-center justify-center gap-0.5 py-1 text-[10px] font-medium transition-colors select-none ${getMobileClass(item.path)}`}
          >
            <item.icon className="w-5 h-5" />
            <span>{item.label}</span>
          </Link>
        ))}
        <button
          onClick={handleLogout}
          className="flex flex-col items-center justify-center gap-0.5 py-1 text-[10px] font-medium text-red-500 transition-colors select-none"
        >
          <LogOut className="w-5 h-5" />
          <span>Logout</span>
        </button>
      </nav>
    </div>
  );
};

export default AdminLayout;
