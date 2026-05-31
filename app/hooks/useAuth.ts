'use client';

/**
 * useAuth Hook
 * TODO: Implement with NextAuth.js or Auth.js
 *
 * Usage:
 * const { user, loading, login, logout } = useAuth();
 */

export interface AuthUser {
  id: string;
  email: string;
  name?: string;
}

export function useAuth() {
  // TODO: Integrate with NextAuth.js
  // const { data: session, status } = useSession();

  const user: AuthUser | null = null;
  const loading = false;
  const isAuthenticated = false;

  const login = async (email: string, password: string) => {
    // TODO: Implement login
    console.log('Login stub:', email);
  };

  const logout = async () => {
    // TODO: Implement logout
  };

  const register = async (email: string, password: string, name?: string) => {
    // TODO: Implement registration
    console.log('Register stub:', email);
  };

  return {
    user,
    loading,
    isAuthenticated,
    login,
    logout,
    register,
  };
}
