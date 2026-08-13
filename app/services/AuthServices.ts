import axios from 'axios';

const apiUrl = process.env.NEXT_PUBLIC_API_URL || '/api';

axios.defaults.withCredentials = true;

interface RegisterData {
  name: string;
  email: string;
  password: string;
}

interface LoginCredentials {
  email: string;
  password: string;
}

interface AuthResponse {
  user: {
    id: string;
    name: string;
    email: string;
  };
}

// Register a new user
export const registerUser = async (userData: RegisterData): Promise<AuthResponse> => {
  try {
    const { data } = await axios.post(`${apiUrl}/auth/register`, userData);
    return data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'Registration failed');
  }
};

// Login user
export const loginUser = async (credentials: LoginCredentials): Promise<AuthResponse> => {
  try {
    const { data } = await axios.post(`${apiUrl}/auth/login`, credentials);
    return data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'Login failed');
  }
};

// Logout user (call server to clear cookie)
export const logoutUser = async (): Promise<void> => {
  try {
    await axios.post(`${apiUrl}/auth/logout`);
  } catch (error) {
    console.error('Logout error:', error);
  }
};

// Check if user is authenticated by calling server
export const checkAuthStatus = async (): Promise<AuthResponse['user'] | null> => {
  try {
    const { data } = await axios.get(`${apiUrl}/auth/me`);
    return data.user;
  } catch (error) {
    return null;
  }
};
