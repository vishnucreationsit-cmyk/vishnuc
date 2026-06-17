import { useState } from 'react';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { login } from '../features/auth/authSlice';
import AnimatedLoginLayout from '../components/AnimatedLoginLayout';

const ManagerLogin = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const dispatch = useDispatch();
  const navigate = useNavigate();

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
        if (data.role !== 'MANAGER' && data.role !== 'ADMIN') {
          setError('Access Denied: Manager Privileges Required');
          return;
        }
        dispatch(login({ user: data, token: data.accessToken }));
        navigate('/manager');
      } else {
        setError(data.message || 'Login failed');
      }
    } catch (err) {
      setError('Network error. Is the server running?');
    }
  };

  return (
    <AnimatedLoginLayout 
      title="Manager Portal"
      subtitle="Sign in to manage your team"
      error={error}
    >
      <form onSubmit={handleSubmit}>
        <div className="animated-input-group">
          <label>Email address</label>
          <input
            type="email"
            required
            placeholder="manager@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>
        
        <div className="animated-input-group">
          <label>Password</label>
          <input
            type="password"
            required
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>

        <div className="flex items-center justify-between mt-4">
          <div className="flex items-center">
            <input id="remember-me" name="remember-me" type="checkbox" className="h-4 w-4 rounded bg-[#0d1117] border-[#30363d] focus:ring-[#2ea043] checked:bg-[#2ea043]" />
            <label htmlFor="remember-me" className="ml-2 block text-sm text-[#8b949e]">
              Remember me
            </label>
          </div>

          <div className="text-sm">
            <a href="#" className="font-medium text-[#2ea043] hover:text-[#3fb950] transition-colors">
              Forgot password?
            </a>
          </div>
        </div>

        <button type="submit" className="animated-login-btn">
          Sign in
        </button>
      </form>
    </AnimatedLoginLayout>
  );
};

export default ManagerLogin;
