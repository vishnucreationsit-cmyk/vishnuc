import { useState, useEffect } from 'react';
import { Search, Plus, Edit2, Eye } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';

const ManagerOrders = () => {
  const [orders, setOrders] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  const { token } = useSelector((state) => state.auth);

  const fetchOrders = async () => {
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL || "http://localhost:5000"}/api/manager/orders`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok) {
        setOrders(data.orders || data);
      } else {
        setError(data.message || 'Failed to load orders');
      }
    } catch (err) {
      setError('Network Error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) fetchOrders();
  }, [token]);

  const handleStatusChange = async (orderId, newStatus) => {
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL || "http://localhost:5000"}/api/manager/orders/${orderId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status: newStatus })
      });
      if (res.ok) fetchOrders();
    } catch (err) {
      console.error('Error updating status', err);
    }
  };

  const filteredOrders = orders.filter(order => 
    order.company.toLowerCase().includes(search.toLowerCase()) || 
    order.productName.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-6 md:p-8 min-h-screen">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Manage Orders</h1>
          <p className="text-gray-600 mt-1">Create and update client orders.</p>
        </div>
        <Link to="/manager/orders/add" className="inline-flex items-center gap-2 bg-blue-600 text-white px-5 py-2.5 rounded-lg hover:bg-blue-700 transition-colors shadow-sm font-medium">
          <Plus className="w-5 h-5" /> New Order
        </Link>
      </div>

      {error && <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-lg">{error}</div>}

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-4 border-b border-gray-100 bg-gray-50/50 flex gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input 
              type="text" 
              placeholder="Search by company or product..." 
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100 text-sm font-semibold text-gray-600 uppercase tracking-wider">
                <th className="p-4">Company</th>
                <th className="p-4">Product</th>
                <th className="p-4">Value</th>
                <th className="p-4">Due Date</th>
                <th className="p-4">Priority</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr><td colSpan="7" className="p-8 text-center text-gray-500">Loading orders...</td></tr>
              ) : filteredOrders.length === 0 ? (
                <tr><td colSpan="7" className="p-8 text-center text-gray-500">No orders found.</td></tr>
              ) : (
                filteredOrders.map((order) => (
                  <tr key={order._id} className="hover:bg-gray-50/50 group transition-colors">
                    <td className="p-4 font-medium text-gray-900">{order.company}</td>
                    <td className="p-4 text-gray-600">{order.productName}</td>
                    <td className="p-4 text-gray-900 font-medium">${(order.totalValue || 0).toLocaleString()}</td>
                    <td className="p-4 text-gray-500 text-sm">{new Date(order.dueDate).toLocaleDateString()}</td>
                    <td className="p-4">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold ${order.priority === 'HIGH' || order.priority === 'URGENT' ? 'bg-red-100 text-red-800' : 'bg-yellow-100 text-yellow-800'}`}>
                        {order.priority}
                      </span>
                    </td>
                    <td className="p-4">
                      <select 
                        value={order.status}
                        onChange={(e) => handleStatusChange(order._id, e.target.value)}
                        className={`border border-gray-200 text-sm rounded-lg px-2 py-1 outline-none focus:border-blue-500 font-medium
                          ${order.status === 'COMPLETED' || order.status === 'DELIVERED' ? 'bg-green-50 text-green-700' : 
                            order.status === 'IN_PRODUCTION' ? 'bg-yellow-50 text-yellow-700' : 'bg-blue-50 text-blue-700'}`}
                      >
                        <option value="DRAFT">DRAFT</option>
                        <option value="PENDING">PENDING</option>
                        <option value="IN_PRODUCTION">IN PRODUCTION</option>
                        <option value="COMPLETED">COMPLETED</option>
                        <option value="DELIVERED">DELIVERED</option>
                        <option value="CANCELLED">CANCELLED</option>
                      </select>
                    </td>
                    <td className="p-4 text-right">
                      <button className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-all" title="View/Edit">
                        <Edit2 className="w-4 h-4" />
                      </button>
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

export default ManagerOrders;
