import { useState, useEffect } from 'react';
import { FileText, Download, CheckCircle2, Clock } from 'lucide-react';
import { useSelector } from 'react-redux';

const EmployeeHistory = () => {
  const [history, setHistory] = useState([]);
  const [summary, setSummary] = useState({
    totalDaysPresent: 0,
    totalLate: 0,
    totalHoursWorked: 0
  });
  const [loading, setLoading] = useState(true);
  
  const { token } = useSelector((state) => state.auth);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [historyRes, reportRes] = await Promise.all([
          fetch('http://localhost:5000/api/employee/attendance/history', {
            headers: { 'Authorization': `Bearer ${token}` }
          }),
          fetch('http://localhost:5000/api/employee/attendance/report', {
            headers: { 'Authorization': `Bearer ${token}` }
          })
        ]);

        if (historyRes.ok) {
          const historyData = await historyRes.json();
          setHistory(historyData.attendance || []);
        }

        if (reportRes.ok) {
          const reportData = await reportRes.json();
          if (reportData.summary) {
            setSummary(reportData.summary);
          }
        }
      } catch (err) {
        console.error('Error fetching attendance data', err);
      } finally {
        setLoading(false);
      }
    };

    if (token) fetchData();
  }, [token]);

  const handleDownload = () => {
    // In a real app, this would trigger a CSV/PDF download
    alert('Report generation initiated. Your download will begin shortly.');
  };

  return (
    <div className="p-6 md:p-8 min-h-screen bg-gray-50">
      <div className="mb-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Attendance History</h1>
          <p className="text-gray-600 mt-1">View your past check-ins and monthly reports.</p>
        </div>
        <button 
          onClick={handleDownload}
          className="inline-flex items-center gap-2 bg-white text-gray-700 border border-gray-300 px-4 py-2.5 rounded-lg hover:bg-gray-50 font-medium transition-colors shadow-sm"
        >
          <Download className="w-5 h-5" /> Download Report
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4">
          <div className="p-3 bg-green-50 text-green-600 rounded-xl">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Days Present (This Month)</p>
            <p className="text-2xl font-bold text-gray-900">{summary.totalDaysPresent}</p>
          </div>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4">
          <div className="p-3 bg-orange-50 text-orange-600 rounded-xl">
            <Clock className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Late Arrivals</p>
            <p className="text-2xl font-bold text-gray-900">{summary.totalLate}</p>
          </div>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4">
          <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
            <FileText className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Total Hours</p>
            <p className="text-2xl font-bold text-gray-900">{summary.totalHoursWorked}h</p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100 text-sm font-semibold text-gray-600 uppercase tracking-wider">
                <th className="p-4">Date</th>
                <th className="p-4">Check In</th>
                <th className="p-4">Check Out</th>
                <th className="p-4">Duration</th>
                <th className="p-4">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr><td colSpan="5" className="p-8 text-center text-gray-500">Loading history...</td></tr>
              ) : history.length === 0 ? (
                <tr><td colSpan="5" className="p-8 text-center text-gray-500">No attendance records found.</td></tr>
              ) : (
                history.map((record) => {
                  const checkInDate = new Date(record.checkInTime);
                  const checkOutDate = record.checkOutTime ? new Date(record.checkOutTime) : null;
                  
                  return (
                    <tr key={record._id} className="hover:bg-gray-50/50">
                      <td className="p-4 font-medium text-gray-900">
                        {new Date(record.date).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })}
                      </td>
                      <td className="p-4 text-gray-600">
                        {checkInDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </td>
                      <td className="p-4 text-gray-600">
                        {checkOutDate ? checkOutDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '--:--'}
                      </td>
                      <td className="p-4 text-gray-900 font-medium">
                        {record.durationWorked ? `${Math.floor(record.durationWorked / 60)}h ${record.durationWorked % 60}m` : '--'}
                      </td>
                      <td className="p-4">
                        <span className={`px-2.5 py-1 rounded-full text-xs font-medium border ${record.status === 'PRESENT' ? 'bg-green-50 text-green-700 border-green-200' : 'bg-orange-50 text-orange-700 border-orange-200'}`}>
                          {record.status}
                        </span>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default EmployeeHistory;
