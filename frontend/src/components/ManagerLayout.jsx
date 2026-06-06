import { Outlet, Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, Users, PackageSearch, ClipboardCheck, LogOut } from 'lucide-react';

const ManagerLayout = () => {
  const location = useLocation();

  const menuItems = [
    { path: '/manager', icon: LayoutDashboard, label: 'Dashboard' },
    { path: '/manager/employees', icon: Users, label: 'Employees' },
    { path: '/manager/orders', icon: PackageSearch, label: 'Orders' },
    { path: '/manager/attendance', icon: ClipboardCheck, label: 'Attendance' },
  ];

  const isActive = (path) => {
    if (path === '/manager') {
      return location.pathname === '/manager' ? 'bg-blue-50 text-blue-600' : 'text-gray-600 hover:bg-gray-50';
    }
    return location.pathname.startsWith(path) ? 'bg-blue-50 text-blue-600' : 'text-gray-600 hover:bg-gray-50';
  };

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-gray-100 flex flex-col hidden md:flex">
        <div className="h-16 flex items-center px-6 border-b border-gray-100">
          <span className="font-bold text-xl tracking-tight text-gray-900">
            Manager<span className="text-blue-600">Portal</span>
          </span>
        </div>

        <div className="flex-1 overflow-y-auto py-4 px-3">
          <nav className="space-y-1">
            {menuItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg font-medium transition-colors ${isActive(item.path)}`}
              >
                <item.icon className={`w-5 h-5 ${isActive(item.path).includes('text-blue') ? 'text-blue-600' : 'text-gray-400'}`} />
                {item.label}
              </Link>
            ))}
          </nav>
        </div>

        <div className="p-4 border-t border-gray-100">
          <Link to="/" className="flex items-center gap-3 px-3 py-2.5 rounded-lg font-medium text-gray-600 hover:bg-red-50 hover:text-red-600 transition-colors">
            <LogOut className="w-5 h-5" />
            Sign Out
          </Link>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto">
        <Outlet />
      </main>
    </div>
  );
};

export default ManagerLayout;
