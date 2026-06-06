const Attendance = require('../models/Attendance');

// Helper to calculate distance in meters using Haversine formula
const getDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371e3; // Earth radius in meters
  const rad = Math.PI / 180;
  const dLat = (lat2 - lat1) * rad;
  const dLon = (lon2 - lon1) * rad;
  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(lat1 * rad) * Math.cos(lat2 * rad) *
            Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};
const checkIn = async (req, res) => {
  try {
    const location = req.body.location;

    if (!location || !location.latitude || !location.longitude) {
      return res.status(400).json({ message: 'GPS Location is required for check-in.' });
    }

    // Geo-fencing validation
    const hqLat = parseFloat(process.env.HQ_LATITUDE);
    const hqLng = parseFloat(process.env.HQ_LONGITUDE);
    const hqRadius = parseFloat(process.env.HQ_RADIUS_METERS || 200);

    const distance = getDistance(location.latitude, location.longitude, hqLat, hqLng);
    
    if (distance > hqRadius) {
      return res.status(403).json({ 
        message: `Check-in rejected. You are ${Math.round(distance)} meters away from the office. Must be within ${hqRadius}m.` 
      });
    }

    // Start and end of current day to check if already checked in
    const startOfDay = new Date();
    startOfDay.setHours(0,0,0,0);
    const endOfDay = new Date();
    endOfDay.setHours(23,59,59,999);

    const existingAttendance = await Attendance.findOne({
      employeeId: req.user._id,
      date: { $gte: startOfDay, $lte: endOfDay }
    });

    if (existingAttendance) {
      return res.status(400).json({ message: 'Already checked in for today.' });
    }

    const attendance = await Attendance.create({
      employeeId: req.user._id,
      checkInTime: new Date(),
      location,
      date: new Date(),
      status: 'PRESENT'
    });

    res.status(201).json({ message: 'Checked in successfully', attendance });
  } catch (error) {
    res.status(500).json({ message: 'Check-in failed', error: error.message });
  }
};

const checkOut = async (req, res) => {
  try {
    const startOfDay = new Date();
    startOfDay.setHours(0,0,0,0);
    const endOfDay = new Date();
    endOfDay.setHours(23,59,59,999);

    const attendance = await Attendance.findOne({
      employeeId: req.user._id,
      date: { $gte: startOfDay, $lte: endOfDay }
    });

    if (!attendance) {
      return res.status(400).json({ message: 'No check-in record found for today.' });
    }

    if (attendance.checkOutTime) {
      return res.status(400).json({ message: 'Already checked out for today.' });
    }

    const checkOutTime = new Date();
    attendance.checkOutTime = checkOutTime;
    
    // Calculate duration worked in minutes
    const diffInMs = checkOutTime.getTime() - attendance.checkInTime.getTime();
    attendance.durationWorked = Math.floor(diffInMs / 60000);

    await attendance.save();

    res.json({ message: 'Checked out successfully', attendance });
  } catch (error) {
    res.status(500).json({ message: 'Check-out failed', error: error.message });
  }
};

const getHistory = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 30;
    const skip = (page - 1) * limit;

    const attendance = await Attendance.find({ employeeId: req.user._id })
      .sort('-date')
      .skip(skip)
      .limit(limit);
      
    const total = await Attendance.countDocuments({ employeeId: req.user._id });

    res.json({ attendance, page, pages: Math.ceil(total / limit), total });
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch history', error: error.message });
  }
};

const getMonthlyReport = async (req, res) => {
  try {
    // Current month start and end
    const date = new Date();
    const firstDay = new Date(date.getFullYear(), date.getMonth(), 1);
    const lastDay = new Date(date.getFullYear(), date.getMonth() + 1, 0);

    const attendance = await Attendance.find({
      employeeId: req.user._id,
      date: { $gte: firstDay, $lte: lastDay }
    }).sort('date');

    const totalDaysPresent = attendance.filter(a => a.status === 'PRESENT').length;
    const totalLate = attendance.filter(a => a.status === 'LATE').length;
    const totalMinutesWorked = attendance.reduce((sum, a) => sum + (a.durationWorked || 0), 0);

    res.json({
      records: attendance,
      summary: {
        totalDaysPresent,
        totalLate,
        totalHoursWorked: (totalMinutesWorked / 60).toFixed(2)
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Failed to generate report', error: error.message });
  }
};

module.exports = { checkIn, checkOut, getHistory, getMonthlyReport };
