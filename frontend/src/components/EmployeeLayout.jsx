import { Outlet, Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, History, LogOut } from 'lucide-react';

const EmployeeLayout = () => {
  const location = useLocation();

  const menuItems = [
    { path: '/employee', icon: LayoutDashboard, label: 'Geo-Attendance' },
    { path: '/employee/history', icon: History, label: 'My History' },
  ];

  const isActive = (path) => {
    if (path === '/employee') {
      return location.pathname === '/employee' ? 'bg-primary-50 text-primary-600' : 'text-gray-600 hover:bg-gray-50';
    }
    return location.pathname.startsWith(path) ? 'bg-primary-50 text-primary-600' : 'text-gray-600 hover:bg-gray-50';
  };

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-gray-100 flex flex-col hidden md:flex">
        <div className="h-16 flex items-center px-6 border-b border-gray-100">
          <span className="font-bold text-xl tracking-tight text-gray-900">
            Staff<span className="text-primary-600">Portal</span>
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
                <item.icon className={`w-5 h-5 ${isActive(item.path).includes('text-primary') ? 'text-primary-600' : 'text-gray-400'}`} />
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

export default EmployeeLayout;
