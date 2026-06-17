import { ShieldAlert, User, KeyRound, ArrowLeft, Loader2, Mail } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { login } from '../features/auth/authSlice';
import AnimatedLoginLayout from '../components/AnimatedLoginLayout';

const AdminLogin = () => {
  const [step, setStep] = useState('email'); // 'email' | 'otp'
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const otpRefs = useRef([]);

  // Countdown timer for resend
  useEffect(() => {
    if (countdown <= 0) return;
    const timer = setTimeout(() => setCountdown((c) => c - 1), 1000);
    return () => clearTimeout(timer);
  }, [countdown]);

  // Auto-focus first OTP input when step changes
  useEffect(() => {
    if (step === 'otp' && otpRefs.current[0]) {
      setTimeout(() => otpRefs.current[0]?.focus(), 100);
    }
  }, [step]);

  const handleSendOtp = async (e) => {
    e?.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL || "https://vishnuc-mbqdn947o-vc-s-projects6.vercel.app"}/api/auth/admin-send-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim().toLowerCase() }),
      });

      const data = await response.json();

      if (response.ok) {
        setStep('otp');
        setSuccess('OTP sent! Check your email inbox.');
        setCountdown(60);
        setOtp(['', '', '', '', '', '']);
      } else {
        setError(data.message || 'Failed to send OTP');
      }
    } catch (err) {
      setError('Network error. Is the server running?');
    } finally {
      setLoading(false);
    }
  };

  const handleOtpChange = (index, value) => {
    // Only allow digits
    if (value && !/^\d$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Auto-focus next input
    if (value && index < 5) {
      otpRefs.current[index + 1]?.focus();
    }

    // Auto-submit when all digits entered
    if (value && index === 5) {
      const fullOtp = newOtp.join('');
      if (fullOtp.length === 6) {
        handleVerifyOtp(fullOtp);
      }
    }
  };

  const handleOtpKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      otpRefs.current[index - 1]?.focus();
    }
  };

  const handleOtpPaste = (e) => {
    e.preventDefault();
    const pasteData = e.clipboardData.getData('text').trim();
    if (/^\d{6}$/.test(pasteData)) {
      const digits = pasteData.split('');
      setOtp(digits);
      otpRefs.current[5]?.focus();
      handleVerifyOtp(pasteData);
    }
  };

  const handleVerifyOtp = async (otpString) => {
    const otpValue = otpString || otp.join('');
    if (otpValue.length !== 6) {
      setError('Please enter the complete 6-digit OTP');
      return;
    }

    setError('');
    setSuccess('');
    setLoading(true);

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL || "https://vishnuc-mbqdn947o-vc-s-projects6.vercel.app"}/api/auth/admin-verify-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim().toLowerCase(), otp: otpValue }),
      });

      const data = await response.json();

      if (response.ok) {
        if (data.role !== 'ADMIN') {
          setError('Access Denied: Not an Administrator');
          return;
        }
        dispatch(login({ user: data, token: data.accessToken }));
        navigate('/admin');
      } else {
        setError(data.message || 'Verification failed');
        setOtp(['', '', '', '', '', '']);
        otpRefs.current[0]?.focus();
      }
    } catch (err) {
      setError('Network error. Is the server running?');
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    setStep('email');
    setOtp(['', '', '', '', '', '']);
    setError('');
    setSuccess('');
  };

  return (
    <AnimatedLoginLayout 
      title={step === 'email' ? 'Admin Portal' : 'Enter OTP'}
      subtitle={step === 'email' ? 'High security access area' : `OTP sent to ${email}`}
      error={error}
      success={success}
    >
      {step === 'email' ? (
        <form onSubmit={handleSendOtp}>
          <div className="animated-input-group">
            <label>Admin Email</label>
            <input
              id="admin-email"
              type="email"
              required
              placeholder="admin@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoFocus
            />
          </div>

          <button
            id="send-otp-btn"
            type="submit"
            disabled={loading}
            className="animated-login-btn flex items-center justify-center"
          >
            {loading ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <>
                <Mail className="h-5 w-5 mr-2" />
                Send OTP to Email
              </>
            )}
          </button>
        </form>
      ) : (
        <div className="mt-4 space-y-6">
          <div className="flex justify-center gap-2 sm:gap-3" onPaste={handleOtpPaste}>
            {otp.map((digit, index) => (
              <input
                key={index}
                ref={(el) => (otpRefs.current[index] = el)}
                id={`otp-input-${index}`}
                type="text"
                inputMode="numeric"
                maxLength={1}
                value={digit}
                onChange={(e) => handleOtpChange(index, e.target.value)}
                onKeyDown={(e) => handleOtpKeyDown(index, e)}
                className="w-11 h-13 sm:w-12 sm:h-14 text-center text-xl font-bold rounded-lg border border-[#30363d] bg-[#0d1117] text-[#c9d1d9] focus:outline-none focus:border-[#2ea043] focus:ring-2 focus:ring-[#2ea043]/20 transition-all"
              />
            ))}
          </div>

          <button
            id="verify-otp-btn"
            onClick={() => handleVerifyOtp()}
            disabled={loading || otp.join('').length !== 6}
            className="animated-login-btn flex justify-center"
          >
            {loading ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              'Verify & Sign In'
            )}
          </button>

          <div className="flex items-center justify-between mt-6">
            <button
              id="back-to-email-btn"
              onClick={handleBack}
              className="flex items-center text-sm text-[#8b949e] hover:text-[#c9d1d9] transition-colors"
            >
              <ArrowLeft className="h-4 w-4 mr-1" />
              Change Email
            </button>

            <button
              id="resend-otp-btn"
              onClick={handleSendOtp}
              disabled={countdown > 0 || loading}
              className="text-sm text-[#2ea043] hover:text-[#3fb950] transition-colors disabled:text-[#8b949e] disabled:cursor-not-allowed"
            >
              {countdown > 0 ? `Resend in ${countdown}s` : 'Resend OTP'}
            </button>
          </div>
        </div>
      )}
    </AnimatedLoginLayout>
  );
};

export default AdminLogin;
