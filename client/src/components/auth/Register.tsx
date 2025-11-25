import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from './AuthContext';
import GoogleLogin from './GoogleLogin';

interface RegisterFormData {
  name: string;
  email: string;
  password: string;
}

const Register: React.FC = () => {
  const [formData, setFormData] = useState<RegisterFormData>({
    name: '',
    email: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();
  const { register } = useAuth();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleTogglePassword = () => {
    setShowPassword(!showPassword);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await register(formData);
      
      // הפניה לדשבורד (הקונטקסט כבר שומר את הטוקן והמשתמש)
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center p-4">
      <div className="pro-glass pro-rounded-lg pro-shadow-lg w-full max-w-md p-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-white text-3xl font-bold mb-2">
            Task<span className="pro-text-gradient">Manager</span>
          </h1>
          <h5 className="text-white font-semibold mb-2">
            Create Account
          </h5>
          <p className="text-white/60">
            Join us and start managing your tasks
          </p>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="mb-4 pro-rounded bg-red-600/20 border border-red-500 text-red-200 px-4 py-3 rounded">
            {error}
          </div>
        )}

        {/* Registration Form */}
        <form onSubmit={handleSubmit} className="space-y-4 auth-form">
          {/* Name Field */}
          <div className="relative">
            <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/60">
              👤
            </div>
            <input
              name="name"
              type="text"
              value={formData.name}
              onChange={handleChange}
              required
              autoComplete="name"
              placeholder="Full Name"
              className="w-full pl-12 pr-4 py-4 bg-transparent border border-white/30 rounded text-white placeholder-white/60 focus:outline-none focus:border-white/50 hover:border-white/50"
              style={{
                backgroundColor: 'transparent',
                color: 'white'
              }}
            />
          </div>

          {/* Email Field */}
          <div className="relative">
            <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/60">
              📧
            </div>
            <input
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              required
              autoComplete="email"
              placeholder="Email Address"
              className="w-full pl-12 pr-4 py-4 bg-transparent border border-white/30 rounded text-white placeholder-white/60 focus:outline-none focus:border-white/50 hover:border-white/50"
              style={{
                backgroundColor: 'transparent',
                color: 'white'
              }}
            />
          </div>

          {/* Password Field */}
          <div className="relative">
            <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/60">
              🔒
            </div>
            <input
              name="password"
              type={showPassword ? 'text' : 'password'}
              value={formData.password}
              onChange={handleChange}
              required
              autoComplete="new-password"
              placeholder="Password"
              className="w-full pl-12 pr-12 py-4 bg-transparent border border-white/30 rounded text-white placeholder-white/60 focus:outline-none focus:border-white/50 hover:border-white/50"
              style={{
                backgroundColor: 'transparent',
                color: 'white'
              }}
            />
            <button
              type="button"
              onClick={handleTogglePassword}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-white/60 hover:text-white"
            >
              {showPassword ? '🙈' : '👁️'}
            </button>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="pro-button-gradient pro-rounded mt-6 py-3 text-white font-semibold hover:scale-105 transition-transform duration-200 w-full"
            style={{ 
              height: 48,
              textTransform: 'none',
              fontSize: '16px'
            }}
          >
            {loading ? (
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white mx-auto"></div>
            ) : (
              'Create Account'
            )}
          </button>
        </form>

        {/* Divider */}
        <div className="flex items-center my-6">
          <div className="flex-1 h-px bg-white/20"></div>
          <span className="px-4 text-white/60 text-sm">or</span>
          <div className="flex-1 h-px bg-white/20"></div>
        </div>

        {/* Google Login */}
        <GoogleLogin 
          onSuccess={() => navigate('/dashboard')}
          onError={(error) => setError(error.message || 'Google registration failed')}
        />

        {/* Login Link */}
        <div className="text-center mt-6">
          <p className="text-white/60">
            Already have an account?{' '}
            <Link 
              to="/login" 
              className="text-white hover:underline font-medium"
            >
              Sign In
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;