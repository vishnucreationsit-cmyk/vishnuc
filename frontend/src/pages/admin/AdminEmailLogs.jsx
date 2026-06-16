import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Mail, AlertCircle, CheckCircle, Clock, RefreshCw } from 'lucide-react';
import { useSelector } from 'react-redux';

const AdminEmailLogs = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [retryingId, setRetryingId] = useState(null);
  const { token } = useSelector((state) => state.auth);

  const fetchLogs = async (pageNum = 1) => {
    try {
      setLoading(true);
      const { data } = await axios.get(`${import.meta.env.VITE_API_URL || "http://localhost:5000"}/api/admin/emails?page=${pageNum}&limit=20`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setLogs(data.logs || []);
      setTotalPages(data.pages || 1);
      setPage(data.page || 1);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch email logs');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) fetchLogs(page);
  }, [page, token]);

  const handleRetry = async (id) => {
    try {
      setRetryingId(id);
      await axios.post(`${import.meta.env.VITE_API_URL || "http://localhost:5000"}/api/admin/emails/${id}/retry`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      // Refresh the specific log or just reload page
      fetchLogs(page);
    } catch (err) {
      alert(err.response?.data?.error || err.response?.data?.message || 'Retry failed');
    } finally {
      setRetryingId(null);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'SENT': return <span className="flex items-center text-green-500 bg-green-500/10 px-2 py-1 rounded-full text-xs font-medium border border-green-500/20"><CheckCircle size={12} className="mr-1"/> Sent</span>;
      case 'FAILED': return <span className="flex items-center text-red-500 bg-red-500/10 px-2 py-1 rounded-full text-xs font-medium border border-red-500/20"><AlertCircle size={12} className="mr-1"/> Failed</span>;
      case 'PENDING': return <span className="flex items-center text-yellow-500 bg-yellow-500/10 px-2 py-1 rounded-full text-xs font-medium border border-yellow-500/20"><Clock size={12} className="mr-1"/> Pending</span>;
      default: return null;
    }
  };

  return (
    <div className="p-6 md:p-8 bg-gray-50 min-h-screen">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
            <Mail className="text-primary-600" /> Notification History
          </h1>
          <p className="text-gray-600 mt-1">Check if login credentials successfully reached your staff members.</p>
        </div>
        <button 
          onClick={() => fetchLogs(page)}
          className="flex items-center bg-white text-gray-700 hover:bg-gray-50 px-4 py-2 rounded-lg transition-colors border border-gray-200 shadow-sm font-medium"
        >
          <RefreshCw size={16} className="mr-2" /> Refresh
        </button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-lg mb-6 shadow-sm">
          {error}
        </div>
      )}

      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 text-gray-600 text-sm border-b border-gray-100 uppercase tracking-wider">
                <th className="p-4 font-medium">Date & Time</th>
                <th className="p-4 font-medium">Recipient</th>
                <th className="p-4 font-medium">Subject</th>
                <th className="p-4 font-medium">Status</th>
                <th className="p-4 font-medium">Status Message</th>
                <th className="p-4 font-medium text-center">Action</th>
              </tr>
            </thead>
            <tbody className="text-sm">
              {loading ? (
                <tr><td colSpan="6" className="p-8 text-center text-gray-500">Loading logs...</td></tr>
              ) : logs.length === 0 ? (
                <tr><td colSpan="6" className="p-8 text-center text-gray-500">No notifications sent yet</td></tr>
              ) : (
                logs.map((log) => (
                  <tr key={log._id} className="border-b border-gray-100 hover:bg-gray-50/50 transition-colors">
                    <td className="p-4 text-gray-600 whitespace-nowrap">
                      {new Date(log.createdAt).toLocaleString()}
                    </td>
                    <td className="p-4 text-gray-900 font-medium">{log.recipientEmail}</td>
                    <td className="p-4 text-gray-500 truncate max-w-xs">{log.subject}</td>
                    <td className="p-4">{getStatusBadge(log.status)}</td>
                    <td className="p-4 max-w-md">
                      {log.status === 'FAILED' ? (
                        <div className="text-red-500 text-xs break-words">{log.errorMessage}</div>
                      ) : (
                        <div className="text-gray-400 text-xs truncate" title={log.smtpResponse}>{log.smtpResponse || 'N/A'}</div>
                      )}
                      {log.retryCount > 0 && <div className="text-xs text-yellow-500 mt-1">Retries: {log.retryCount}</div>}
                    </td>
                    <td className="p-4 text-center">
                      {(log.status === 'FAILED' || log.status === 'PENDING') && (
                        <button
                          onClick={() => handleRetry(log._id)}
                          disabled={retryingId === log._id}
                          className="bg-primary-600 hover:bg-primary-700 disabled:opacity-50 text-white px-3 py-1.5 rounded-md text-xs font-medium transition-colors shadow-sm"
                        >
                          {retryingId === log._id ? 'Retrying...' : 'Retry Now'}
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        
        {totalPages > 1 && (
          <div className="p-4 border-t border-gray-100 flex justify-between items-center bg-gray-50/50">
            <button
              disabled={page === 1}
              onClick={() => setPage(page - 1)}
              className="px-4 py-2 bg-white border border-gray-200 text-gray-700 rounded-lg disabled:opacity-50 hover:bg-gray-50 transition-colors text-sm font-medium shadow-sm"
            >
              Previous
            </button>
            <span className="text-gray-500 text-sm font-medium">Page {page} of {totalPages}</span>
            <button
              disabled={page === totalPages}
              onClick={() => setPage(page + 1)}
              className="px-4 py-2 bg-white border border-gray-200 text-gray-700 rounded-lg disabled:opacity-50 hover:bg-gray-50 transition-colors text-sm font-medium shadow-sm"
            >
              Next
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminEmailLogs;
