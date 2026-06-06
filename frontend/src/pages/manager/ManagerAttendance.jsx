import { useState, useEffect } from 'react';
import { Search, MapPin } from 'lucide-react';
import { useSelector } from 'react-redux';

const ManagerAttendance = () => {
  const [attendance, setAttendance] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const { token } = useSelector((state) => state.auth);

  useEffect(() => {
    const fetchAttendance = async () => {
      try {
        const res = await fetch(`${import.meta.env.VITE_API_URL || "http://localhost:5000"}/api/manager/attendance`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await res.json();
        if (res.ok) {
          setAttendance(data.attendance || []);
        }
      } catch (err) {
        console.error('Failed to fetch attendance', err);
      } finally {
        setLoading(false);
      }
    };
    if (token) fetchAttendance();
  }, [token]);

  return (
    <div className="p-6 md:p-8 min-h-screen">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Team Attendance</h1>
        <p className="text-gray-600 mt-1">Review check-ins for your direct reports.</p>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-4 border-b border-gray-100 bg-gray-50/50 flex gap-4">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input 
              type="date" 
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-gray-600"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100 text-sm font-semibold text-gray-600 uppercase tracking-wider">
                <th className="p-4">Employee</th>
                <th className="p-4">Date & Time</th>
                <th className="p-4">Status</th>
                <th className="p-4">Location Verified</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr><td colSpan="4" className="p-8 text-center text-gray-500">Loading attendance...</td></tr>
              ) : attendance.length === 0 ? (
                <tr><td colSpan="4" className="p-8 text-center text-gray-500">No attendance records found.</td></tr>
              ) : (
                attendance.map((record) => (
                  <tr key={record._id} className="hover:bg-gray-50/50">
                    <td className="p-4 font-medium text-gray-900">{record.employeeId?.name || 'Unknown User'}</td>
                    <td className="p-4 text-gray-600">{new Date(record.checkInTime).toLocaleString()}</td>
                    <td className="p-4">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-medium border ${record.status === 'PRESENT' ? 'bg-green-50 text-green-700 border-green-200' : 'bg-orange-50 text-orange-700 border-orange-200'}`}>
                        {record.status}
                      </span>
                    </td>
                    <td className="p-4 text-gray-500 text-sm flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-green-500" /> {record.location?.address || 'HQ Perimeter'}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ManagerAttendance;
