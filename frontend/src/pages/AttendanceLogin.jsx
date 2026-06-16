import { MapPin, User, Lock, Clock } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { login } from '../features/auth/authSlice';

const AttendanceLogin = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [time, setTime] = useState(new Date());
  const dispatch = useDispatch();
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL || "http://localhost:5000"}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      
      const data = await response.json();
      
      if (response.ok) {
        if (data.role !== 'EMPLOYEE' && data.role !== 'ADMIN' && data.role !== 'MANAGER') {
          setError('Access Denied: Invalid role');
          return;
        }
        dispatch(login({ user: data, token: data.accessToken }));
        navigate('/employee');
      } else {
        setError(data.message || 'Login failed');
      }
    } catch (err) {
      setError('Network error. Is the server running?');
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex flex-col md:flex-row bg-white relative overflow-hidden">
      {/* Visual side for Attendance */}
      <div className="hidden md:flex md:w-1/2 bg-primary-600 relative flex-col justify-center items-center p-12 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary-700 to-primary-900"></div>
        
        {/* Abstract map elements */}
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(#fff 1px, transparent 1px)', backgroundSize: '30px 30px' }}></div>
        
        <div className="relative z-10 text-center text-white max-w-md">
          <div className="inline-flex p-4 rounded-full bg-white/10 backdrop-blur-md mb-8">
            <MapPin className="h-12 w-12" />
          </div>
          <h2 className="text-4xl font-bold mb-4">Geo-fenced Attendance</h2>
          <p className="text-primary-100 text-lg mb-12">
            Securely log your attendance. Your location will be verified against authorized office perimeters.
          </p>
          
          <div className="bg-white/10 backdrop-blur-md p-6 rounded-2xl border border-white/20">
            <div className="flex items-center justify-center gap-3 mb-2">
              <Clock className="h-6 w-6 text-primary-200" />
              <span className="text-2xl font-mono font-semibold tracking-wider">
                {time.toLocaleTimeString()}
              </span>
            </div>
            <p className="text-primary-200 text-sm">
              {time.toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
            </p>
          </div>
        </div>
      </div>

      {/* Login form side */}
      <div className="flex-1 flex items-center justify-center p-8 sm:p-12">
        <div className="w-full max-w-md space-y-8">
          <div className="text-center md:text-left">
            <div className="md:hidden mx-auto h-16 w-16 bg-primary-50 rounded-full flex items-center justify-center border border-primary-100 mb-6">
              <MapPin className="h-8 w-8 text-primary-600" />
            </div>
            <h2 className="text-3xl font-extrabold text-gray-900">
              Employee Check-in
            </h2>
            <p className="mt-2 text-sm text-gray-500">
              Please sign in to mark your attendance
            </p>
            {error && (
              <div className="mt-4 p-3 rounded-lg bg-red-50 border border-red-200 text-red-600 text-sm text-center">
                {error}
              </div>
            )}
          </div>
          
          <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
            <div className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Employee Email</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <User className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="email"
                    required
                    className="appearance-none block w-full pl-11 pr-3 py-3 border border-gray-300 rounded-xl shadow-sm placeholder-gray-400 text-gray-900 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm bg-gray-50 focus:bg-white transition-all"
                    placeholder="employee@vishnucreations.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Password / PIN</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="password"
                    required
                    className="appearance-none block w-full pl-11 pr-3 py-3 border border-gray-300 rounded-xl shadow-sm placeholder-gray-400 text-gray-900 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm bg-gray-50 focus:bg-white transition-all"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </div>
              </div>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                className="group relative w-full flex justify-center py-3.5 px-4 border border-transparent text-sm font-bold rounded-xl text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-all shadow-lg shadow-primary-200"
              >
                Authenticate & Verify Location
              </button>
            </div>
            
            <p className="text-center text-xs text-gray-500 mt-6 flex items-center justify-center gap-1.5">
              <Lock className="w-3.5 h-3.5" /> Secure 256-bit encryption
            </p>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AttendanceLogin;
