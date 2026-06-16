import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useSelector } from 'react-redux';
import { ArrowLeft, Clock, CheckCircle, Image as ImageIcon, Trash2, Upload, History, Package, Send, Truck } from 'lucide-react';

const WORKFLOW_STAGES = [
  'Order Created', 'Design Approved', 'Raw Material Procured', 
  'Production Started', 'Cutting Completed', 'Stitching Completed', 
  'Quality Check', 'Packing', 'Ready For Dispatch', 'Dispatched', 'Delivered'
];

const OrderDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { token, user } = useSelector((state) => state.auth);
  
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Image Upload State
  const [uploading, setUploading] = useState(false);
  
  // Status Update State
  const [statusNotes, setStatusNotes] = useState('');
  const [updatingStatus, setUpdatingStatus] = useState(false);
  
  // Delivery State
  const [showDeliveryModal, setShowDeliveryModal] = useState(false);
  const [deliveryData, setDeliveryData] = useState({
    deliveredTo: '',
    receiverName: '',
    receiverMobile: '',
    notes: '',
  });

  const isManager = user?.role === 'MANAGER';
  const apiBaseUrl = import.meta.env.VITE_API_URL || "http://localhost:5000";
  // Always use manager routes for orders since they authorize both ADMIN and MANAGER
  const apiPrefix = '/api/manager';

  const fetchOrder = async () => {
    try {
      const { data } = await axios.get(`${apiBaseUrl}${apiPrefix}/orders/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setOrder(data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch order details');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) fetchOrder();
  }, [id, token]);

  const handleImageUpload = async (e) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    
    const formData = new FormData();
    for (let i = 0; i < files.length; i++) {
      formData.append('images', files[i]);
    }

    try {
      setUploading(true);
      const { data } = await axios.post(`${apiBaseUrl}/api/upload/order-images`, formData, {
        headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        }
      });
      
      // Now update the order with the new images
      const updatedImages = [...(order.images || []), ...data.images];
      await axios.put(`${apiBaseUrl}${apiPrefix}/orders/${id}`, { images: updatedImages }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      fetchOrder();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to upload images');
    } finally {
      setUploading(false);
    }
  };

  const handleDeleteImage = async (publicId, imageObjId) => {
    if (!window.confirm('Delete this image?')) return;
    try {
      await axios.post(`${apiBaseUrl}/api/upload/delete-image`, { publicId }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      const updatedImages = order.images.filter(img => img._id !== imageObjId);
      await axios.put(`${apiBaseUrl}${apiPrefix}/orders/${id}`, { images: updatedImages }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      fetchOrder();
    } catch (err) {
      alert('Failed to delete image');
    }
  };

  const handleUpdateStatus = async (nextStatus) => {
    if (!window.confirm(`Move order to ${nextStatus}?`)) return;
    try {
      setUpdatingStatus(true);
      await axios.patch(`${apiBaseUrl}${apiPrefix}/orders/${id}/status`, 
        { status: nextStatus, notes: statusNotes }, 
        { headers: { Authorization: `Bearer ${token}` }}
      );
      setStatusNotes('');
      fetchOrder();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update status');
    } finally {
      setUpdatingStatus(false);
    }
  };

  const handleDeliver = async (e) => {
    e.preventDefault();
    try {
      setUpdatingStatus(true);
      await axios.post(`${apiBaseUrl}${apiPrefix}/orders/${id}/deliver`, 
        { ...deliveryData, date: new Date() }, 
        { headers: { Authorization: `Bearer ${token}` }}
      );
      setShowDeliveryModal(false);
      fetchOrder();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to deliver order');
    } finally {
      setUpdatingStatus(false);
    }
  };

  if (loading) return <div className="p-8 text-center text-gray-500">Loading Order Details...</div>;
  if (error || !order) return <div className="p-8 text-center text-red-500">{error || 'Order not found'}</div>;

  // Map legacy statuses to new workflow stages
  let normalizedStatus = order.status;
  if (normalizedStatus === 'DRAFT' || normalizedStatus === 'PENDING') normalizedStatus = 'Order Created';
  if (normalizedStatus === 'IN_PRODUCTION') normalizedStatus = 'Production Started';
  if (normalizedStatus === 'COMPLETED' || normalizedStatus === 'DELIVERED') normalizedStatus = 'Delivered';

  const currentStageIndex = WORKFLOW_STAGES.indexOf(normalizedStatus);
  const nextStage = currentStageIndex !== -1 && currentStageIndex < WORKFLOW_STAGES.length - 1 
    ? WORKFLOW_STAGES[currentStageIndex + 1] 
    : null;

  return (
    <div className="p-6 md:p-8 bg-gray-50 min-h-screen pb-24">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <button onClick={() => navigate(-1)} className="p-2 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 text-gray-600 transition-colors">
          <ArrowLeft size={20} />
        </button>
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Order #{order._id.substring(order._id.length - 6).toUpperCase()}</h1>
          <p className="text-gray-500 mt-1">{order.productName} for {order.company}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        {/* Main Content (Left Column) */}
        <div className="xl:col-span-2 space-y-8">
          
          {/* Status Timeline */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <h2 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
              <Package className="text-primary-600" /> Production Tracker
            </h2>
            
            {order.status === 'CANCELLED' ? (
              <div className="bg-red-50 p-6 rounded-xl border border-red-100 text-center text-red-600 font-medium">
                This order has been cancelled.
              </div>
            ) : (
            <div className="relative">
              <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-gray-100"></div>
              <div className="space-y-6">
                {WORKFLOW_STAGES.map((stage, idx) => {
                  const isCompleted = currentStageIndex > idx;
                  const isCurrent = currentStageIndex === idx;
                  const isPending = currentStageIndex < idx;

                  return (
                    <div key={stage} className={`relative flex items-start gap-4 ${isPending ? 'opacity-50' : ''}`}>
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center relative z-10 
                        ${isCompleted ? 'bg-green-100 text-green-600' : isCurrent ? 'bg-primary-100 text-primary-600 ring-4 ring-primary-50' : 'bg-gray-100 text-gray-400'}
                      `}>
                        {isCompleted ? <CheckCircle size={16} /> : isCurrent ? <Clock size={16} /> : <div className="w-2 h-2 rounded-full bg-gray-300" />}
                      </div>
                      <div className="pt-1">
                        <h4 className={`font-semibold ${isCurrent ? 'text-primary-700' : 'text-gray-900'}`}>{stage}</h4>
                        {isCurrent && (
                          <div className="mt-3 bg-primary-50 p-4 rounded-xl border border-primary-100">
                            {nextStage === 'Delivered' ? (
                              <button 
                                onClick={() => setShowDeliveryModal(true)}
                                className="bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-green-700 transition-colors shadow-sm flex items-center gap-2"
                              >
                                <Truck size={16} /> Mark as Delivered
                              </button>
                            ) : nextStage ? (
                              <div className="space-y-3">
                                <input 
                                  type="text" 
                                  placeholder="Optional notes for next stage..." 
                                  value={statusNotes} 
                                  onChange={(e) => setStatusNotes(e.target.value)}
                                  className="w-full px-3 py-2 rounded-lg border border-primary-200 focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm"
                                />
                                <button 
                                  disabled={updatingStatus}
                                  onClick={() => handleUpdateStatus(nextStage)}
                                  className="bg-primary-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-primary-700 disabled:opacity-50 transition-colors shadow-sm flex items-center gap-2"
                                >
                                  Move to {nextStage} <Send size={14} />
                                </button>
                              </div>
                            ) : (
                              <span className="text-green-600 font-medium flex items-center gap-1"><CheckCircle size={16}/> Workflow Complete</span>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
            )}
          </div>

          {/* Image Gallery */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                <ImageIcon className="text-blue-500" /> Production Photos
              </h2>
              <div>
                <input type="file" multiple accept="image/*" id="imageUpload" className="hidden" onChange={handleImageUpload} />
                <label htmlFor="imageUpload" className="cursor-pointer bg-blue-50 hover:bg-blue-100 text-blue-700 px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 border border-blue-200">
                  <Upload size={16} /> {uploading ? 'Uploading...' : 'Add Photos'}
                </label>
              </div>
            </div>
            
            {order.images && order.images.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                {order.images.map((img) => (
                  <div key={img._id} className="relative group rounded-xl overflow-hidden border border-gray-200 aspect-square bg-gray-50">
                    <img src={img.url} alt="Order Proof" className="w-full h-full object-cover" />
                    <button 
                      onClick={() => handleDeleteImage(img.publicId, img._id)}
                      className="absolute top-2 right-2 p-1.5 bg-red-500 text-white rounded-lg opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600 shadow-md"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500 bg-gray-50 rounded-xl border border-dashed border-gray-300">
                No photos uploaded yet. Add sample or production photos here.
              </div>
            )}
          </div>

        </div>

        {/* Sidebar (Right Column) */}
        <div className="space-y-8">
          
          {/* Order Details Card */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <h2 className="text-lg font-bold text-gray-900 mb-6">Order Details</h2>
            <div className="space-y-4 text-sm">
              <div><span className="text-gray-500 block">Company</span><span className="font-semibold text-gray-900">{order.company}</span></div>
              <div><span className="text-gray-500 block">Contact</span><span className="text-gray-900">{order.contactPerson} ({order.mobileNumber})</span></div>
              <div><span className="text-gray-500 block">Category</span><span className="text-gray-900">{order.category}</span></div>
              <div><span className="text-gray-500 block">Quantity</span><span className="text-gray-900">{order.quantity} units</span></div>
              <div><span className="text-gray-500 block">Total Value</span><span className="font-bold text-gray-900">₹{order.totalValue?.toLocaleString()}</span></div>
              <div><span className="text-gray-500 block">Due Date</span><span className="text-gray-900">{new Date(order.dueDate).toLocaleDateString()}</span></div>
              {order.description && <div><span className="text-gray-500 block">Notes</span><p className="text-gray-900 bg-gray-50 p-3 rounded-lg mt-1">{order.description}</p></div>}
            </div>
          </div>

          {/* Delivery Details (If Delivered) */}
          {order.deliveryDetails?.deliveredTo && (
            <div className="bg-green-50 rounded-2xl p-6 shadow-sm border border-green-100">
              <h2 className="text-lg font-bold text-green-900 mb-4 flex items-center gap-2"><CheckCircle size={20}/> Delivery Info</h2>
              <div className="space-y-3 text-sm text-green-800">
                <p><strong>Delivered On:</strong> {new Date(order.deliveryDetails.date).toLocaleString()}</p>
                <p><strong>To:</strong> {order.deliveryDetails.deliveredTo}</p>
                <p><strong>Receiver:</strong> {order.deliveryDetails.receiverName} ({order.deliveryDetails.receiverMobile})</p>
                {order.deliveryDetails.notes && <p><strong>Notes:</strong> {order.deliveryDetails.notes}</p>}
              </div>
            </div>
          )}

          {/* Status History */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <h2 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
              <History className="text-purple-500" /> Audit Logs
            </h2>
            <div className="space-y-4">
              {order.statusHistory?.slice().reverse().map((log, idx) => (
                <div key={idx} className="border-l-2 border-purple-200 pl-4 py-1">
                  <p className="text-xs text-gray-500 mb-1">{new Date(log.date).toLocaleString()} by {log.updatedBy?.name || 'System'}</p>
                  <p className="text-sm font-medium text-gray-900">{log.previousStatus} → <span className="text-purple-600">{log.newStatus}</span></p>
                  {log.notes && <p className="text-xs text-gray-600 mt-1 italic">"{log.notes}"</p>}
                </div>
              ))}
              {(!order.statusHistory || order.statusHistory.length === 0) && <p className="text-sm text-gray-500">No status changes yet.</p>}
            </div>
          </div>

        </div>
      </div>

      {/* Delivery Modal */}
      {showDeliveryModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="bg-white rounded-2xl p-6 md:p-8 w-full max-w-md shadow-2xl relative">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Complete Delivery</h2>
            <form onSubmit={handleDeliver} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Delivered To (Address/Location)</label>
                <input required type="text" value={deliveryData.deliveredTo} onChange={e => setDeliveryData({...deliveryData, deliveredTo: e.target.value})} className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-green-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Receiver Name</label>
                <input required type="text" value={deliveryData.receiverName} onChange={e => setDeliveryData({...deliveryData, receiverName: e.target.value})} className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-green-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Receiver Mobile</label>
                <input required type="text" value={deliveryData.receiverMobile} onChange={e => setDeliveryData({...deliveryData, receiverMobile: e.target.value})} className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-green-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Delivery Notes (Optional)</label>
                <textarea value={deliveryData.notes} onChange={e => setDeliveryData({...deliveryData, notes: e.target.value})} className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-green-500" rows="3"></textarea>
              </div>
              <div className="pt-4 flex gap-3 justify-end">
                <button type="button" onClick={() => setShowDeliveryModal(false)} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg">Cancel</button>
                <button disabled={updatingStatus} type="submit" className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg font-medium">Confirm Delivery</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrderDetails;
