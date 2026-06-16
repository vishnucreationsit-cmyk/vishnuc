import React, { useState, useEffect } from 'react';
import { X, Save } from 'lucide-react';
import axios from 'axios';

const EditOrderModal = ({ order, onClose, onRefresh, token, isManager }) => {
  const [formData, setFormData] = useState({
    company: '',
    contactPerson: '',
    mobileNumber: '',
    productName: '',
    category: '',
    quantity: '',
    unitPrice: '',
    dueDate: '',
    priority: 'MEDIUM',
    description: '',
    editNotes: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const apiBaseUrl = import.meta.env.VITE_API_URL || "http://localhost:5000";
  // Always use manager routes for orders since they authorize both ADMIN and MANAGER
  const apiPrefix = '/api/manager';

  useEffect(() => {
    if (order) {
      setFormData({
        company: order.company || '',
        contactPerson: order.contactPerson || '',
        mobileNumber: order.mobileNumber || '',
        productName: order.productName || '',
        category: order.category || '',
        quantity: order.quantity || '',
        unitPrice: order.unitPrice || '',
        dueDate: order.dueDate ? new Date(order.dueDate).toISOString().split('T')[0] : '',
        priority: order.priority || 'MEDIUM',
        description: order.description || '',
        editNotes: '' // Required for audit logs
      });
    }
  }, [order]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');

    if (!formData.editNotes.trim()) {
      setError('Please provide a reason for editing this order to maintain audit logs.');
      setIsSubmitting(false);
      return;
    }

    try {
      const payload = {
        ...formData,
        quantity: Number(formData.quantity),
        unitPrice: Number(formData.unitPrice),
        totalValue: Number(formData.quantity) * Number(formData.unitPrice)
      };

      await axios.put(`${apiBaseUrl}${apiPrefix}/orders/${order._id}`, payload, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      onRefresh();
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update order');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-2xl shadow-xl flex flex-col max-h-[90vh]">
        <div className="flex justify-between items-center p-6 border-b border-gray-100 flex-shrink-0">
          <div>
            <h2 className="text-xl font-bold text-gray-900">Edit Order</h2>
            <p className="text-sm text-gray-500 mt-1">Changes will be recorded in the audit log.</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg text-gray-500 transition-colors">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto">
          {error && <div className="mb-6 p-4 bg-red-50 text-red-600 rounded-lg text-sm">{error}</div>}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Company / Brand</label>
              <input required type="text" name="company" value={formData.company} onChange={handleChange} className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Product Name</label>
              <input required type="text" name="productName" value={formData.productName} onChange={handleChange} className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary-500" />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Contact Person</label>
              <input required type="text" name="contactPerson" value={formData.contactPerson} onChange={handleChange} className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Mobile Number</label>
              <input required type="tel" name="mobileNumber" value={formData.mobileNumber} onChange={handleChange} className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary-500" />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Quantity</label>
              <input required type="number" min="1" name="quantity" value={formData.quantity} onChange={handleChange} className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Unit Price (₹)</label>
              <input required type="number" min="0" step="0.01" name="unitPrice" value={formData.unitPrice} onChange={handleChange} className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary-500" />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Due Date</label>
              <input required type="date" name="dueDate" value={formData.dueDate} onChange={handleChange} className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
              <select name="priority" value={formData.priority} onChange={handleChange} className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary-500">
                <option value="LOW">Low</option>
                <option value="MEDIUM">Medium</option>
                <option value="HIGH">High</option>
                <option value="URGENT">Urgent</option>
              </select>
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Description / Notes</label>
              <textarea name="description" value={formData.description} onChange={handleChange} rows="2" className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary-500"></textarea>
            </div>

            <div className="md:col-span-2 bg-blue-50 p-4 rounded-xl border border-blue-100 mt-2">
              <label className="block text-sm font-bold text-blue-900 mb-1">Reason for Edit (Required for Audit)</label>
              <input required type="text" name="editNotes" placeholder="e.g. Corrected spelling error in company name" value={formData.editNotes} onChange={handleChange} className="w-full px-4 py-2 rounded-lg border border-blue-200 focus:ring-2 focus:ring-blue-500 bg-white" />
            </div>
          </div>

          <div className="flex justify-end gap-3 mt-8">
            <button type="button" onClick={onClose} className="px-5 py-2 text-gray-600 hover:bg-gray-100 rounded-lg font-medium transition-colors">
              Cancel
            </button>
            <button disabled={isSubmitting} type="submit" className="flex items-center gap-2 bg-primary-600 hover:bg-primary-700 text-white px-6 py-2 rounded-lg font-medium transition-colors shadow-sm disabled:opacity-50">
              <Save size={18} /> {isSubmitting ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditOrderModal;
