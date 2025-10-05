import React, { useState } from 'react';
import { 
  TextField, 
  Button, 
  Box, 
  Typography, 
  Alert,
  CircularProgress,
  IconButton,
  InputAdornment
} from '@mui/material';
import { 
  EmailOutlined, 
  LockOutlined,
  VisibilityOutlined,
  VisibilityOffOutlined 
} from '@mui/icons-material';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from './AuthContext';
import GoogleLogin from './GoogleLogin';
import '../../dashboard.css';

interface LoginFormData {
  email: string;
  password: string;
}

const Login: React.FC = () => {
  const [formData, setFormData] = useState<LoginFormData>({
    email: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();

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
      await login(formData);
      
      // הפניה לדשבורד (הקונטקסט כבר שומר את הטוקן והמשתמש)
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Login failed');
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
          <Typography variant="h5" className="text-white font-semibold mb-2">
            Welcome Back
          </Typography>
          <Typography variant="body2" className="text-white/60">
            Sign in to continue managing your tasks
          </Typography>
        </div>

        {/* Error Alert */}
        {error && (
          <Alert severity="error" className="mb-4 pro-rounded">
            {error}
          </Alert>
        )}

        {/* Login Form */}
        <Box component="form" onSubmit={handleSubmit} className="space-y-4 auth-form">
          {/* Email Field */}
          <TextField
            fullWidth
            name="email"
            type="email"
            label="Email Address"
            value={formData.email}
            onChange={handleChange}
            required
            InputProps={{
              startAdornment: <EmailOutlined className="text-white/60 mr-2" />,
              style: { color: 'white' }
            }}
            InputLabelProps={{
              style: { color: 'rgba(255,255,255,0.6)' }
            }}
            sx={{
              '& .MuiOutlinedInput-root': {
                backgroundColor: 'transparent',
                '& fieldset': { borderColor: 'rgba(255,255,255,0.3)' },
                '&:hover fieldset': { borderColor: 'rgba(255,255,255,0.5)' },
                '&.Mui-focused fieldset': { borderColor: 'rgba(255,255,255,0.7)' },
                '& input': {
                  backgroundColor: 'transparent',
                  '&:-webkit-autofill': {
                    WebkitBoxShadow: '0 0 0 1000px transparent inset !important',
                    WebkitTextFillColor: 'white !important',
                    backgroundColor: 'transparent !important'
                  },
                  '&:-webkit-autofill:hover': {
                    WebkitBoxShadow: '0 0 0 1000px transparent inset !important',
                    WebkitTextFillColor: 'white !important',
                    backgroundColor: 'transparent !important'
                  },
                  '&:-webkit-autofill:focus': {
                    WebkitBoxShadow: '0 0 0 1000px transparent inset !important',
                    WebkitTextFillColor: 'white !important',
                    backgroundColor: 'transparent !important'
                  }
                }
              },
              '& .MuiInputLabel-root': {
                '&.MuiInputLabel-shrink': {
                  transform: 'translate(14px, -9px) scale(0.75)'
                }
              }
            }}
          />

          {/* Password Field */}
          <TextField
            fullWidth
            name="password"
            type={showPassword ? 'text' : 'password'}
            label="Password"
            value={formData.password}
            onChange={handleChange}
            required
            InputProps={{
              startAdornment: <LockOutlined className="text-white/60 mr-2" />,
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    onClick={handleTogglePassword}
                    className="text-white/60 hover:text-white"
                    edge="end"
                  >
                    {showPassword ? <VisibilityOffOutlined /> : <VisibilityOutlined />}
                  </IconButton>
                </InputAdornment>
              ),
              style: { color: 'white' }
            }}
            InputLabelProps={{
              style: { color: 'rgba(255,255,255,0.6)' }
            }}
            sx={{
              '& .MuiOutlinedInput-root': {
                backgroundColor: 'transparent',
                '& fieldset': { borderColor: 'rgba(255,255,255,0.3)' },
                '&:hover fieldset': { borderColor: 'rgba(255,255,255,0.5)' },
                '&.Mui-focused fieldset': { borderColor: 'rgba(255,255,255,0.7)' },
                '& input': {
                  backgroundColor: 'transparent',
                  '&:-webkit-autofill': {
                    WebkitBoxShadow: '0 0 0 1000px transparent inset !important',
                    WebkitTextFillColor: 'white !important',
                    backgroundColor: 'transparent !important'
                  },
                  '&:-webkit-autofill:hover': {
                    WebkitBoxShadow: '0 0 0 1000px transparent inset !important',
                    WebkitTextFillColor: 'white !important',
                    backgroundColor: 'transparent !important'
                  },
                  '&:-webkit-autofill:focus': {
                    WebkitBoxShadow: '0 0 0 1000px transparent inset !important',
                    WebkitTextFillColor: 'white !important',
                    backgroundColor: 'transparent !important'
                  }
                }
              },
              '& .MuiInputLabel-root': {
                '&.MuiInputLabel-shrink': {
                  transform: 'translate(14px, -9px) scale(0.75)'
                }
              }
            }}
          />

          {/* Submit Button */}
          <Button
            type="submit"
            fullWidth
            disabled={loading}
            className="pro-button-gradient pro-rounded mt-6 py-3 text-white font-semibold hover:scale-105 transition-transform duration-200"
            sx={{ 
              height: 48,
              textTransform: 'none',
              fontSize: '16px'
            }}
          >
            {loading ? (
              <CircularProgress size={24} className="text-white" />
            ) : (
              'Sign In'
            )}
          </Button>
        </Box>

        {/* Divider */}
        <div className="flex items-center my-6">
          <div className="flex-1 h-px bg-white/20"></div>
          <span className="px-4 text-white/60 text-sm">or</span>
          <div className="flex-1 h-px bg-white/20"></div>
        </div>

        {/* Google Login */}
        <GoogleLogin 
          onSuccess={() => navigate('/dashboard')}
          onError={(error) => setError(error.message || 'Google login failed')}
        />

        {/* Register Link */}
        <div className="text-center mt-6">
          <Typography variant="body2" className="text-white/60">
            Don't have an account?{' '}
            <Link 
              to="/register" 
              className="text-white hover:underline font-medium"
            >
              Create Account
            </Link>
          </Typography>
        </div>
      </div>
    </div>
  );
};

export default Login; 