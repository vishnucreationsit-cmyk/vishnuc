import { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { login } from '../features/auth/authSlice';
import AnimatedLoginLayout from '../components/AnimatedLoginLayout';

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
    <AnimatedLoginLayout 
      title="Employee Check-in"
      subtitle={`Local Time: ${time.toLocaleTimeString()}`}
      error={error}
    >
      <form onSubmit={handleSubmit}>
        <div className="animated-input-group">
          <label>Employee Email</label>
          <input
            type="email"
            required
            placeholder="employee@vishnucreations.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>
        
        <div className="animated-input-group">
          <label>Password / PIN</label>
          <input
            type="password"
            required
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>

        <button type="submit" className="animated-login-btn mt-6">
          Authenticate & Verify Location
        </button>
        
        <p className="text-center text-xs text-[#8b949e] mt-6 flex items-center justify-center gap-1.5">
          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>
          Secure 256-bit encryption
        </p>
      </form>
    </AnimatedLoginLayout>
  );
};

export default AttendanceLogin;
