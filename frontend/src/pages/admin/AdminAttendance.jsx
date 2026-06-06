import { useState, useEffect } from 'react';
import { Search, Filter, MapPin } from 'lucide-react';

const AdminAttendance = () => {
  const [attendance, setAttendance] = useState([]);

  useEffect(() => {
    setAttendance([
      { _id: '1', employeeName: 'Charlie Davis', date: '2026-06-06T09:00:00Z', status: 'PRESENT', location: 'HQ Office' },
      { _id: '2', employeeName: 'Diana Prince', date: '2026-06-06T09:15:00Z', status: 'LATE', location: 'Branch 1' },
    ]);
  }, []);

  return (
    <div className="p-6 md:p-8 bg-gray-50 min-h-screen">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Attendance Log</h1>
        <p className="text-gray-600 mt-1">Company-wide geo-fenced attendance reports.</p>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-4 border-b border-gray-100 flex flex-col sm:flex-row gap-4 justify-between items-center bg-gray-50/50">
          <div className="relative w-full sm:w-96">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input 
              type="date" 
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white text-gray-600"
            />
          </div>
          <button className="inline-flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-50 bg-white font-medium">
            <Filter className="w-4 h-4" /> Status Filter
          </button>
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
              {attendance.map((record) => (
                <tr key={record._id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="p-4 font-medium text-gray-900">{record.employeeName}</td>
                  <td className="p-4 text-gray-600">{new Date(record.date).toLocaleString()}</td>
                  <td className="p-4">
                    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border ${record.status === 'PRESENT' ? 'bg-green-50 text-green-700 border-green-200' : 'bg-orange-50 text-orange-700 border-orange-200'}`}>
                      {record.status}
                    </span>
                  </td>
                  <td className="p-4 text-gray-500 text-sm flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-green-500" /> {record.location}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        <div className="p-4 border-t border-gray-100 flex items-center justify-between text-sm text-gray-600 bg-gray-50/50">
          <div>Showing 1 to {attendance.length} of {attendance.length} records</div>
          <div className="flex gap-1">
            <button className="px-3 py-1 border border-gray-200 rounded hover:bg-gray-100 disabled:opacity-50" disabled>Prev</button>
            <button className="px-3 py-1 border border-gray-200 rounded hover:bg-gray-100 disabled:opacity-50" disabled>Next</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminAttendance;
