import { useState, useEffect } from 'react';
import { MapPin, Clock, LogIn, LogOut, Navigation, AlertCircle } from 'lucide-react';
import { useSelector } from 'react-redux';

const EmployeeDashboard = () => {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [isCheckedIn, setIsCheckedIn] = useState(false);
  const [checkInTime, setCheckInTime] = useState(null);
  const [location, setLocation] = useState(null);
  const [locating, setLocating] = useState(false);
  
  const { token } = useSelector((state) => state.auth);

  const HQ_LAT = 12.841500;
  const HQ_LNG = 80.089917;
  const HQ_RADIUS = 100;

  // Helper to calculate distance in meters using Haversine formula
  const getDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371e3;
    const rad = Math.PI / 180;
    const dLat = (lat2 - lat1) * rad;
    const dLon = (lon2 - lon1) * rad;
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
              Math.cos(lat1 * rad) * Math.cos(lat2 * rad) *
              Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Check today's attendance status
  useEffect(() => {
    const fetchTodayStatus = async () => {
      try {
        const res = await fetch(`${import.meta.env.VITE_API_URL || "http://localhost:5000"}/api/employee/attendance/history?limit=1`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (res.ok) {
          const data = await res.json();
          if (data.attendance && data.attendance.length > 0) {
            const latest = data.attendance[0];
            const today = new Date().toDateString();
            const latestDate = new Date(latest.date).toDateString();
            
            if (today === latestDate) {
              if (!latest.checkOutTime) {
                setIsCheckedIn(true);
                setCheckInTime(new Date(latest.checkInTime));
                // Mock verifying location if already checked in
                setLocation(latest.location || { lat: '0', lng: '0' });
              }
            }
          }
        }
      } catch (err) {
        console.error('Error fetching attendance status', err);
      }
    };
    if (token) fetchTodayStatus();
  }, [token]);

  const getLocation = () => {
    setLocating(true);
    
    if (!navigator.geolocation) {
      alert("Geolocation is not supported by your browser");
      setLocating(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const dist = getDistance(position.coords.latitude, position.coords.longitude, HQ_LAT, HQ_LNG);
        setLocation({ 
          latitude: position.coords.latitude, 
          longitude: position.coords.longitude, 
          distance: Math.round(dist),
          address: 'GPS Verified' 
        });
        setLocating(false);
      },
      (error) => {
        console.error("Error getting location:", error);
        alert("Failed to get location. Please allow location access.");
        setLocating(false);
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  };

  const handleCheckIn = async () => {
    if (!location) {
      alert("Please enable and verify location first!");
      return;
    }
    
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL || "http://localhost:5000"}/api/employee/attendance/check-in`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ location })
      });
      
      const data = await res.json();
      
      if (res.ok) {
        setIsCheckedIn(true);
        setCheckInTime(new Date(data.attendance.checkInTime));
      } else {
        alert(data.message || 'Check-in failed');
      }
    } catch (err) {
      alert('Network Error connecting to server');
    }
  };

  const handleCheckOut = async () => {
    if (!isCheckedIn) return;
    if (!location) {
      alert("Please verify your location before checking out!");
      return;
    }
    if (window.confirm("Are you sure you want to check out for the day?")) {
      try {
        const res = await fetch(`${import.meta.env.VITE_API_URL || "http://localhost:5000"}/api/employee/attendance/check-out`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({ location })
        });
        
        if (res.ok) {
          setIsCheckedIn(false);
          setCheckInTime(null);
          alert("Checked out successfully. Have a great day!");
        } else {
          const data = await res.json();
          alert(data.message || 'Check-out failed');
        }
      } catch (err) {
        alert('Network Error connecting to server');
      }
    }
  };

  const getDuration = () => {
    if (!checkInTime) return '0h 0m';
    const diff = Math.floor((currentTime - checkInTime) / 60000);
    const hrs = Math.floor(diff / 60);
    const mins = diff % 60;
    return `${hrs}h ${mins}m`;
  };

  return (
    <div className="p-6 md:p-8 min-h-screen flex flex-col md:flex-row gap-8">
      <div className="flex-1">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Attendance</h1>
          <p className="text-gray-600 mt-1">Verify location and log your daily shift.</p>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 max-w-xl">
          <div className="flex items-center justify-center mb-8">
            <div className="text-center">
              <div className="text-5xl font-mono font-bold text-gray-900 mb-2">
                {currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
              </div>
              <div className="text-gray-500 font-medium">
                {currentTime.toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
              </div>
            </div>
          </div>

          <div className="bg-gray-50 rounded-xl p-4 mb-8 border border-gray-200">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-sm font-semibold text-gray-900 mb-1 flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-blue-600" /> Location Status
                </h3>
                {location ? (
                  <div>
                    {location.distance <= HQ_RADIUS ? (
                      <p className="text-sm text-green-600 font-medium flex items-center gap-1.5">
                        <CheckCircleIcon className="w-4 h-4" /> Verified within perimeter ({location.distance}m)
                      </p>
                    ) : (
                      <p className="text-sm text-red-600 font-medium flex items-center gap-1.5">
                        <AlertCircle className="w-4 h-4" /> Outside perimeter ({location.distance}m from HQ)
                      </p>
                    )}
                  </div>
                ) : (
                  <p className="text-sm text-orange-600 font-medium flex items-center gap-1.5">
                    <AlertCircle className="w-4 h-4" /> Location not verified
                  </p>
                )}
              </div>
              {!location && (
                <button 
                  onClick={getLocation}
                  disabled={locating}
                  className="px-3 py-1.5 bg-white border border-gray-300 rounded text-sm font-medium hover:bg-gray-50 flex items-center gap-1.5 transition-colors disabled:opacity-50"
                >
                  <Navigation className={`w-4 h-4 ${locating ? 'animate-spin' : ''}`} />
                  {locating ? 'Locating...' : 'Verify GPS'}
                </button>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <button 
              onClick={handleCheckIn}
              disabled={isCheckedIn || !location}
              className={`flex flex-col items-center justify-center p-6 rounded-xl border-2 transition-all ${
                isCheckedIn 
                  ? 'border-gray-200 bg-gray-50 text-gray-400 cursor-not-allowed' 
                  : !location 
                    ? 'border-gray-200 bg-gray-50 text-gray-400 opacity-50 cursor-not-allowed'
                    : 'border-green-500 bg-green-50 text-green-700 hover:bg-green-100 shadow-sm'
              }`}
            >
              <LogIn className="w-8 h-8 mb-2" />
              <span className="font-bold">Check In</span>
            </button>

            <button 
              onClick={handleCheckOut}
              disabled={!isCheckedIn}
              className={`flex flex-col items-center justify-center p-6 rounded-xl border-2 transition-all ${
                !isCheckedIn 
                  ? 'border-gray-200 bg-gray-50 text-gray-400 cursor-not-allowed' 
                  : 'border-red-500 bg-red-50 text-red-700 hover:bg-red-100 shadow-sm'
              }`}
            >
              <LogOut className="w-8 h-8 mb-2" />
              <span className="font-bold">Check Out</span>
            </button>
          </div>
        </div>
      </div>

      <div className="w-full md:w-80 bg-gray-900 rounded-3xl p-6 text-white flex flex-col justify-between shadow-xl">
        <div>
          <h3 className="text-gray-400 font-medium text-sm mb-4">Current Shift</h3>
          <div className="flex items-center gap-4 mb-6">
            <div className="w-12 h-12 rounded-full bg-blue-600 flex items-center justify-center">
              <Clock className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="text-2xl font-bold">{isCheckedIn ? getDuration() : '0h 0m'}</div>
              <div className="text-xs text-gray-400 uppercase tracking-wider">Duration Logged</div>
            </div>
          </div>
          
          <div className="space-y-4">
            <div className="flex justify-between border-b border-gray-800 pb-3">
              <span className="text-gray-400 text-sm">Status</span>
              <span className={`text-sm font-semibold ${isCheckedIn ? 'text-green-400' : 'text-gray-300'}`}>
                {isCheckedIn ? 'ON DUTY' : 'OFF DUTY'}
              </span>
            </div>
            <div className="flex justify-between border-b border-gray-800 pb-3">
              <span className="text-gray-400 text-sm">Check-in Time</span>
              <span className="text-sm font-medium text-white">{checkInTime ? checkInTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '--:--'}</span>
            </div>
          </div>
        </div>
        
        <div className="mt-8 bg-gray-800 p-4 rounded-xl text-xs text-gray-400">
          <AlertCircle className="w-4 h-4 mb-2 text-blue-400" />
          Ensure your browser has location permissions granted. Check-ins outside the designated perimeter will be flagged.
        </div>
      </div>
    </div>
  );
};

const CheckCircleIcon = (props) => (
  <svg {...props} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

export default EmployeeDashboard;
