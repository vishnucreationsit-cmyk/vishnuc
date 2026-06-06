const excel = require('exceljs');
const Order = require('../models/Order');

const exportOrdersToExcel = async (req, res) => {
  try {
    // Admins and Managers can export
    let query = {};
    if (req.user.role === 'MANAGER') {
      // Optional: limit manager exports to their own created orders if needed
      // query = { createdBy: req.user._id }; 
    }

    const orders = await Order.find(query).populate('createdBy', 'name').sort('-createdAt');

    const workbook = new excel.Workbook();
    const worksheet = workbook.addWorksheet('Orders Report');

    worksheet.columns = [
      { header: 'Order ID', key: '_id', width: 25 },
      { header: 'Company', key: 'company', width: 30 },
      { header: 'Product', key: 'productName', width: 25 },
      { header: 'Quantity', key: 'quantity', width: 10 },
      { header: 'Total Value ($)', key: 'totalValue', width: 15 },
      { header: 'Status', key: 'status', width: 15 },
      { header: 'Created By', key: 'createdBy', width: 20 },
      { header: 'Order Date', key: 'orderDate', width: 15 },
    ];

    // Style the header
    worksheet.getRow(1).font = { bold: true };
    worksheet.getRow(1).fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FFE0E0E0' }
    };

    orders.forEach(order => {
      worksheet.addRow({
        _id: order._id.toString(),
        company: order.company,
        productName: order.productName,
        quantity: order.quantity,
        totalValue: order.totalValue,
        status: order.status,
        createdBy: order.createdBy ? order.createdBy.name : 'System',
        orderDate: new Date(order.orderDate).toLocaleDateString()
      });
    });

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', 'attachment; filename=' + `Orders_Report_${new Date().toISOString().split('T')[0]}.xlsx`);

    await workbook.xlsx.write(res);
    res.end();
  } catch (error) {
    res.status(500).json({ message: 'Error exporting to Excel', error: error.message });
  }
};

module.exports = { exportOrdersToExcel };
