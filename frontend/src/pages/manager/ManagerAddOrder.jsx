import { useState, useRef, useEffect } from 'react';
import { Save, FileText, Printer, ArrowRight, Check, Package, FileDown } from 'lucide-react';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';

const ManagerAddOrder = () => {
  const { token } = useSelector((state) => state.auth);
  const navigate = useNavigate();
  const formRef = useRef(null);
  
  const [formData, setFormData] = useState({
    company: '',
    contactPerson: '',
    mobileNumber: '',
    productName: '',
    category: 'Electronics',
    quantity: 1,
    unitPrice: 0,
    totalValue: 0,
    orderDate: new Date().toISOString().split('T')[0],
    startDate: '',
    dueDate: '',
    priority: 'MEDIUM',
    description: '',
    status: 'DRAFT'
  });

  const [errors, setErrors] = useState({});

  // Auto calculate total value
  useEffect(() => {
    const total = Number(formData.quantity) * Number(formData.unitPrice);
    setFormData(prev => ({ ...prev, totalValue: total }));
  }, [formData.quantity, formData.unitPrice]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    // Clear error when user types
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.company) newErrors.company = 'Company is required';
    if (!formData.contactPerson) newErrors.contactPerson = 'Contact Person is required';
    if (!formData.mobileNumber) newErrors.mobileNumber = 'Mobile Number is required';
    if (!formData.productName) newErrors.productName = 'Product Name is required';
    if (!formData.dueDate) newErrors.dueDate = 'Due Date is required';
    if (formData.quantity < 1) newErrors.quantity = 'Quantity must be at least 1';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e, targetStatus = 'PENDING') => {
    e.preventDefault();
    if (!validate()) return;
    
    const submitData = { ...formData, status: targetStatus };
    
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL || "http://localhost:5000"}/api/manager/orders`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(submitData)
      });
      
      if (res.ok) {
        alert(`Order ${targetStatus === 'DRAFT' ? 'saved as Draft' : 'Submitted successfully!'}`);
        navigate('/manager/orders');
      } else {
        const data = await res.json();
        alert(`Failed: ${data.message}`);
      }
    } catch (err) {
      alert('Network Error connecting to server');
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleExportPDF = async () => {
    if (!formRef.current) return;
    try {
      const canvas = await html2canvas(formRef.current, { scale: 2 });
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
      
      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      pdf.save(`Order_${formData.company}_${new Date().getTime()}.pdf`);
    } catch (err) {
      console.error('Failed to export PDF', err);
      alert('Failed to export PDF');
    }
  };

  // Timeline UI Data
  const timelineSteps = [
    { id: 'DRAFT', label: 'Draft' },
    { id: 'PENDING', label: 'Pending' },
    { id: 'IN_PRODUCTION', label: 'In Production' },
    { id: 'COMPLETED', label: 'Completed' },
    { id: 'DELIVERED', label: 'Delivered' },
  ];

  const currentStepIndex = timelineSteps.findIndex(s => s.id === formData.status);

  return (
    <div className="p-6 md:p-8 min-h-screen bg-gray-50 pb-24">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4 print:hidden">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Create New Order</h1>
          <p className="text-gray-600 mt-1">Fill out the details below to generate a new enterprise order.</p>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={handlePrint} className="inline-flex items-center gap-2 bg-white text-gray-700 border border-gray-300 px-4 py-2.5 rounded-lg hover:bg-gray-50 font-medium transition-colors shadow-sm">
            <Printer className="w-5 h-5" /> Print
          </button>
          <button onClick={handleExportPDF} className="inline-flex items-center gap-2 bg-red-50 text-red-700 border border-red-200 px-4 py-2.5 rounded-lg hover:bg-red-100 font-medium transition-colors shadow-sm">
            <FileDown className="w-5 h-5" /> PDF
          </button>
        </div>
      </div>

      <div ref={formRef} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden print:shadow-none print:border-none">
        {/* Timeline Header */}
        <div className="bg-gradient-to-r from-gray-900 to-gray-800 p-8 text-white">
          <div className="flex items-center gap-3 mb-8">
            <Package className="w-8 h-8 text-blue-400" />
            <h2 className="text-2xl font-bold">Order Tracking Timeline</h2>
          </div>
          
          <div className="relative">
            <div className="absolute top-1/2 left-0 w-full h-0.5 bg-gray-700 -translate-y-1/2"></div>
            <div className="absolute top-1/2 left-0 h-0.5 bg-blue-500 -translate-y-1/2 transition-all duration-500" style={{ width: `${(Math.max(0, currentStepIndex) / (timelineSteps.length - 1)) * 100}%` }}></div>
            
            <div className="relative flex justify-between">
              {timelineSteps.map((step, index) => {
                const isCompleted = index <= currentStepIndex;
                const isCurrent = index === currentStepIndex;
                
                return (
                  <div key={step.id} className="flex flex-col items-center">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center border-4 border-gray-900 relative z-10 transition-colors duration-300 ${isCompleted ? 'bg-blue-500' : 'bg-gray-700'} ${isCurrent ? 'ring-4 ring-blue-500/30' : ''}`}>
                      {isCompleted ? <Check className="w-5 h-5 text-white" /> : <span className="w-2.5 h-2.5 rounded-full bg-gray-500"></span>}
                    </div>
                    <span className={`mt-3 text-sm font-medium ${isCompleted ? 'text-white' : 'text-gray-400'}`}>{step.label}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Form Body */}
        <form className="p-8" id="orderForm">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Client Details */}
            <div className="space-y-6">
              <h3 className="text-lg font-bold text-gray-900 border-b pb-2">Client Details</h3>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Company Name *</label>
                <input type="text" name="company" value={formData.company} onChange={handleChange} className={`w-full px-4 py-2.5 rounded-lg border ${errors.company ? 'border-red-500 bg-red-50' : 'border-gray-300 bg-gray-50'} focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors`} placeholder="Acme Corp" />
                {errors.company && <p className="text-red-500 text-xs mt-1">{errors.company}</p>}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Contact Person *</label>
                  <input type="text" name="contactPerson" value={formData.contactPerson} onChange={handleChange} className={`w-full px-4 py-2.5 rounded-lg border ${errors.contactPerson ? 'border-red-500 bg-red-50' : 'border-gray-300 bg-gray-50'} focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors`} placeholder="John Doe" />
                  {errors.contactPerson && <p className="text-red-500 text-xs mt-1">{errors.contactPerson}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Mobile Number *</label>
                  <input type="text" name="mobileNumber" value={formData.mobileNumber} onChange={handleChange} className={`w-full px-4 py-2.5 rounded-lg border ${errors.mobileNumber ? 'border-red-500 bg-red-50' : 'border-gray-300 bg-gray-50'} focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors`} placeholder="+1 234 567 890" />
                  {errors.mobileNumber && <p className="text-red-500 text-xs mt-1">{errors.mobileNumber}</p>}
                </div>
              </div>
            </div>

            {/* Product Details */}
            <div className="space-y-6">
              <h3 className="text-lg font-bold text-gray-900 border-b pb-2">Product Details</h3>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Product Name *</label>
                  <input type="text" name="productName" value={formData.productName} onChange={handleChange} className={`w-full px-4 py-2.5 rounded-lg border ${errors.productName ? 'border-red-500 bg-red-50' : 'border-gray-300 bg-gray-50'} focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors`} />
                  {errors.productName && <p className="text-red-500 text-xs mt-1">{errors.productName}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                  <select name="category" value={formData.category} onChange={handleChange} className="w-full px-4 py-2.5 rounded-lg border border-gray-300 bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors">
                    <option value="Electronics">Electronics</option>
                    <option value="Software">Software</option>
                    <option value="Hardware">Hardware</option>
                    <option value="Services">Services</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Quantity *</label>
                  <input type="number" min="1" name="quantity" value={formData.quantity} onChange={handleChange} className={`w-full px-4 py-2.5 rounded-lg border ${errors.quantity ? 'border-red-500 bg-red-50' : 'border-gray-300 bg-gray-50'} focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors`} />
                  {errors.quantity && <p className="text-red-500 text-xs mt-1">{errors.quantity}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Unit Price ($)</label>
                  <input type="number" min="0" step="0.01" name="unitPrice" value={formData.unitPrice} onChange={handleChange} className="w-full px-4 py-2.5 rounded-lg border border-gray-300 bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Total Value</label>
                  <div className="w-full px-4 py-2.5 rounded-lg border border-gray-200 bg-gray-100 font-bold text-gray-900">
                    ${formData.totalValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </div>
                </div>
              </div>
            </div>

            {/* Timeline & Meta Details */}
            <div className="space-y-6 md:col-span-2 mt-4">
              <h3 className="text-lg font-bold text-gray-900 border-b pb-2">Scheduling & Priority</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Order Date</label>
                  <input type="date" name="orderDate" value={formData.orderDate} onChange={handleChange} className="w-full px-4 py-2.5 rounded-lg border border-gray-300 bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
                  <input type="date" name="startDate" value={formData.startDate} onChange={handleChange} className="w-full px-4 py-2.5 rounded-lg border border-gray-300 bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Due Date *</label>
                  <input type="date" name="dueDate" value={formData.dueDate} onChange={handleChange} className={`w-full px-4 py-2.5 rounded-lg border ${errors.dueDate ? 'border-red-500 bg-red-50' : 'border-gray-300 bg-gray-50'} focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors`} />
                  {errors.dueDate && <p className="text-red-500 text-xs mt-1">{errors.dueDate}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
                  <select name="priority" value={formData.priority} onChange={handleChange} className="w-full px-4 py-2.5 rounded-lg border border-gray-300 bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors">
                    <option value="LOW">Low</option>
                    <option value="MEDIUM">Medium</option>
                    <option value="HIGH">High</option>
                    <option value="URGENT">Urgent</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Internal Description / Notes</label>
                <textarea name="description" value={formData.description} onChange={handleChange} rows="3" className="w-full px-4 py-2.5 rounded-lg border border-gray-300 bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors" placeholder="Any specific requirements..."></textarea>
              </div>
            </div>
          </div>
        </form>
        
        {/* Footer Actions (Hidden in Print) */}
        <div className="bg-gray-50 p-6 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-4 print:hidden">
          <div className="text-sm text-gray-500">
            Created By: <span className="font-semibold text-gray-900">Current User</span> (Manager)
          </div>
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <button onClick={(e) => handleSubmit(e, 'DRAFT')} className="flex-1 sm:flex-none inline-flex justify-center items-center gap-2 bg-white text-gray-700 border border-gray-300 px-6 py-3 rounded-xl hover:bg-gray-50 font-semibold transition-colors shadow-sm">
              <Save className="w-5 h-5" /> Save as Draft
            </button>
            <button onClick={(e) => handleSubmit(e, 'PENDING')} className="flex-1 sm:flex-none inline-flex justify-center items-center gap-2 bg-blue-600 text-white px-8 py-3 rounded-xl hover:bg-blue-700 font-bold transition-all shadow-lg shadow-blue-600/30">
              Submit Order <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      <style>{`
        @media print {
          body { background-color: white; }
          nav, aside { display: none !important; }
          main { overflow: visible !important; }
        }
      `}</style>
    </div>
  );
};

export default ManagerAddOrder;
