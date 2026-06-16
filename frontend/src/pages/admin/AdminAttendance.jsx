import { useState, useEffect } from 'react';
import { Search, Filter, MapPin, X, Loader2 } from 'lucide-react';
import { useSelector } from 'react-redux';
import axios from 'axios';

const AdminAttendance = () => {
  const [attendance, setAttendance] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { token } = useSelector((state) => state.auth);
  
  // Modal State
  const [selectedLocation, setSelectedLocation] = useState(null);

  useEffect(() => {
    const fetchAttendance = async () => {
      try {
        setLoading(true);
        const res = await axios.get(`${import.meta.env.VITE_API_URL || "http://localhost:5000"}/api/admin/attendance`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setAttendance(res.data.attendance || res.data);
      } catch (err) {
        setError('Failed to fetch attendance records');
      } finally {
        setLoading(false);
      }
    };
    if (token) fetchAttendance();
  }, [token]);

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
              {loading ? (
                <tr><td colSpan="4" className="p-8 text-center text-gray-500"><Loader2 className="w-6 h-6 animate-spin mx-auto" /></td></tr>
              ) : attendance.length === 0 ? (
                <tr><td colSpan="4" className="p-8 text-center text-gray-500">No records found.</td></tr>
              ) : (
                attendance.map((record) => (
                  <tr key={record._id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="p-4 font-medium text-gray-900">{record.employeeId?.name || 'Unknown'}</td>
                    <td className="p-4 text-gray-600">{new Date(record.date).toLocaleString()}</td>
                    <td className="p-4">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border ${record.status === 'PRESENT' ? 'bg-green-50 text-green-700 border-green-200' : 'bg-orange-50 text-orange-700 border-orange-200'}`}>
                        {record.status}
                      </span>
                    </td>
                    <td className="p-4 text-gray-500 text-sm">
                      {record.location && record.location.latitude ? (
                        <div className="flex items-center gap-2">
                          <button 
                            onClick={() => setSelectedLocation(record.location)}
                            className="inline-flex items-center gap-1.5 text-blue-600 hover:text-blue-800 bg-blue-50 px-2 py-1 rounded-md transition-colors"
                          >
                            <MapPin className="w-4 h-4" /> View Map
                          </button>
                          {record.location.distanceFromOffice !== undefined && (
                            <span className="text-xs font-medium bg-gray-100 px-2 py-1 rounded text-gray-600 border border-gray-200">
                              {record.location.distanceFromOffice}m away
                            </span>
                          )}
                        </div>
                      ) : (
                        <span className="text-gray-400 italic">No GPS data</span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        
        {/* Pagination logic could go here */}
        
        <div className="p-4 border-t border-gray-100 flex items-center justify-between text-sm text-gray-600 bg-gray-50/50">
          <div>Showing 1 to {attendance.length} of {attendance.length} records</div>
          <div className="flex gap-1">
            <button className="px-3 py-1 border border-gray-200 rounded hover:bg-gray-100 disabled:opacity-50" disabled>Prev</button>
            <button className="px-3 py-1 border border-gray-200 rounded hover:bg-gray-100 disabled:opacity-50" disabled>Next</button>
          </div>
        </div>
      </div>

      {/* Google Maps Modal */}
      {selectedLocation && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl w-full max-w-2xl shadow-2xl overflow-hidden">
            <div className="flex justify-between items-center p-4 border-b border-gray-100">
              <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                <MapPin className="text-blue-500" /> Check-in Location
              </h3>
              <button onClick={() => setSelectedLocation(null)} className="text-gray-400 hover:text-gray-600 transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-4 bg-gray-50 border-b border-gray-100 flex justify-between text-sm">
              <span className="text-gray-600"><strong>Lat:</strong> {selectedLocation.latitude}</span>
              <span className="text-gray-600"><strong>Lng:</strong> {selectedLocation.longitude}</span>
              {selectedLocation.distanceFromOffice !== undefined && (
                <span className="text-blue-600 font-medium">Distance from HQ: {selectedLocation.distanceFromOffice}m</span>
              )}
            </div>
            <div className="w-full h-[400px]">
              <iframe
                title="Google Maps"
                width="100%"
                height="100%"
                frameBorder="0"
                style={{ border: 0 }}
                src={`https://maps.google.com/maps?q=${selectedLocation.latitude},${selectedLocation.longitude}&z=16&output=embed`}
                allowFullScreen
              ></iframe>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminAttendance;
