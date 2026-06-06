import { useState, useEffect } from 'react';
import { Users, PackageSearch, CheckCircle, Clock } from 'lucide-react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  AreaChart, Area, LineChart, Line 
} from 'recharts';
import { useSelector } from 'react-redux';

const ManagerDashboard = () => {
  const [dashboardData, setDashboardData] = useState({
    stats: {
      totalEmployees: 0,
      activeOrders: 0,
      pendingOrders: 0,
      completedOrders: 0
    },
    monthlyProductionData: [],
    employeeAttendanceData: [],
    myOrdersData: []
  });
  
  const { token } = useSelector((state) => state.auth);

  useEffect(() => {
    const fetchDashboardStats = async () => {
      try {
        const res = await fetch(`${import.meta.env.VITE_API_URL || "http://localhost:5000"}/api/manager/stats`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (res.ok) {
          const data = await res.json();
          setDashboardData(data);
        }
      } catch (err) {
        console.error('Failed to load dashboard stats', err);
      }
    };
    if (token) fetchDashboardStats();
  }, [token]);

  const stats = [
    { title: 'My Team', value: dashboardData.stats.totalEmployees, icon: Users, color: 'text-blue-600', bg: 'bg-blue-100' },
    { title: 'Active Orders', value: dashboardData.stats.activeOrders, icon: PackageSearch, color: 'text-purple-600', bg: 'bg-purple-100' },
    { title: 'Pending Approvals', value: dashboardData.stats.pendingOrders, icon: Clock, color: 'text-orange-600', bg: 'bg-orange-100' },
    { title: 'Completed Tasks', value: dashboardData.stats.completedOrders, icon: CheckCircle, color: 'text-green-600', bg: 'bg-green-100' },
  ];

  return (
    <div className="p-6 md:p-8 min-h-screen bg-gray-50 pb-24">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Welcome Back</h1>
        <p className="text-gray-600 mt-1">Here is what's happening with your team today.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((card, idx) => (
          <div key={idx} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
            <div className={`inline-flex p-3 rounded-xl ${card.bg} ${card.color} mb-4`}>
              <card.icon className="w-6 h-6" />
            </div>
            <h3 className="text-gray-500 text-sm font-medium">{card.title}</h3>
            <p className="text-3xl font-bold text-gray-900 mt-1">{card.value}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        {/* Monthly Production - Area Chart */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-lg font-bold text-gray-900 mb-6">Monthly Production Volume</h2>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={dashboardData.monthlyProductionData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorProduction" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#6b7280'}} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#6b7280'}} />
                <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                <Area type="monotone" dataKey="production" stroke="#3b82f6" strokeWidth={3} fillOpacity={1} fill="url(#colorProduction)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Employee Attendance - Line Chart */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-lg font-bold text-gray-900 mb-6">Team Attendance (This Week)</h2>
          <div className="h-72 flex items-center justify-center text-gray-400">
             Attendance Reporting Temporarily Hidden
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <h2 className="text-lg font-bold text-gray-900 mb-6">My Orders Overview (This Month)</h2>
        <div className="h-72 flex items-center justify-center text-gray-400">
           Order Overview Temporarily Hidden
        </div>
      </div>
    </div>
  );
};

export default ManagerDashboard;
