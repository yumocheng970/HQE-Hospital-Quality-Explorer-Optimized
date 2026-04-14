import { useState, useEffect, useContext, createContext } from 'react';

const API_BASE = 'http://localhost:3001';

// Context lets any component access auth state without prop drilling
const AuthContext = createContext(null);

/**
 * Wrap your app in <AuthProvider> so all children can call useAuth().
 */
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true); // true until initial check completes

  // On mount: check if there's an existing session
  useEffect(() => {
    fetch(`${API_BASE}/api/auth/me`, { credentials: 'include' })
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => setUser(data))
      .catch(() => setUser(null))
      .finally(() => setLoading(false));
  }, []);

  /**
   * Log in with username and password.
   * Returns the user object on success; throws on failure.
   */
  async function login(username, password) {
    const res = await fetch(`${API_BASE}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ username, password }),
    });

    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      throw new Error(body.error || 'Login failed');
    }

    const data = await res.json();
    setUser(data);
    return data;
  }

  /**
   * Log out and clear local state.
   */
  async function logout() {
    await fetch(`${API_BASE}/api/auth/logout`, {
      method: 'POST',
      credentials: 'include',
    });
    setUser(null);
  }

  const value = { user, loading, login, logout };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

/**
 * Access auth state from any component inside <AuthProvider>.
 * Returns { user, loading, login, logout }
 */
export default function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used inside <AuthProvider>');
  }
  return ctx;
}
