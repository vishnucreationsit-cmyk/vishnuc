import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { LayoutDashboard, History, LogOut } from 'lucide-react';
import { useDispatch } from 'react-redux';
import { logout } from '../features/auth/authSlice';

const EmployeeLayout = () => {
  const location = useLocation();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const menuItems = [
    { path: '/employee', icon: LayoutDashboard, label: 'Geo-Attendance' },
    { path: '/employee/history', icon: History, label: 'My History' },
  ];

  const isActive = (path) => {
    if (path === '/employee') {
      return location.pathname === '/employee';
    }
    return location.pathname.startsWith(path);
  };

  const getDesktopClass = (path) => {
    return isActive(path) ? 'bg-primary-50 text-primary-600' : 'text-gray-600 hover:bg-gray-50';
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
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-gray-100 hidden md:flex flex-col">
        <div className="h-16 flex items-center px-6 border-b border-gray-100">
          <span className="font-bold text-xl tracking-tight text-gray-900">
            Staff<span className="text-primary-600">Portal</span>
          </span>
        </div>

        <div className="flex-1 overflow-y-auto py-4 px-3">
          <nav className="space-y-1">
            {menuItems.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-lg font-medium transition-colors ${getDesktopClass(item.path)}`}
                >
                  <Icon className={`w-5 h-5 ${isActive(item.path) ? 'text-primary-600' : 'text-gray-400'}`} />
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="p-4 border-t border-gray-100">
          <button onClick={handleLogout} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg font-medium text-gray-600 hover:bg-red-50 hover:text-red-600 transition-colors">
            <LogOut className="w-5 h-5" />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto pb-20 md:pb-0">
        <Outlet />
      </main>

      {/* Mobile Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 grid grid-cols-3 py-2 z-50 md:hidden" style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}>
        {menuItems.map((item) => {
          const Icon = item.icon;
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex flex-col items-center justify-center gap-1 py-1 text-xs font-medium transition-colors select-none ${getMobileClass(item.path)}`}
            >
              <Icon className="w-6 h-6" />
              <span>{item.label}</span>
            </Link>
          );
        })}
        <button
          onClick={handleLogout}
          className="flex flex-col items-center justify-center gap-1 py-1 text-xs font-medium text-gray-500 hover:text-red-500 transition-colors select-none"
        >
          <LogOut className="w-6 h-6" />
          <span>Sign Out</span>
        </button>
      </nav>
    </div>
  );
};

export default EmployeeLayout;
