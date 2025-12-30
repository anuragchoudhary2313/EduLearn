import React, { createContext, useContext, useEffect, useState } from 'react';
const API = import.meta.env.VITE_API_URL || 'http://localhost:4000';
const ACCESS_TOKEN_KEY = 'edulearn_access';
const REFRESH_TOKEN_KEY = 'edulearn_refresh';

const AuthContext = createContext();
export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const setTokens = (access, refresh) => {
    if (access) localStorage.setItem(ACCESS_TOKEN_KEY, access); else localStorage.removeItem(ACCESS_TOKEN_KEY);
    if (refresh) localStorage.setItem(REFRESH_TOKEN_KEY, refresh); else localStorage.removeItem(REFRESH_TOKEN_KEY);
  };

  const getAccessToken = () => localStorage.getItem(ACCESS_TOKEN_KEY);

  const fetchMe = async (token) => {
    if (!token) { setUser(null); return; }
    try {
      const resp = await fetch(`${API}/api/me`, { headers: { Authorization: `Bearer ${token}` } });
      if (!resp.ok) throw new Error('not authorized');
      const data = await resp.json();
      setUser(data);
    } catch (err) {
      setUser(null);
    }
  };

  const refreshAccess = async () => {
    const rt = localStorage.getItem(REFRESH_TOKEN_KEY);
    if (!rt) return false;
    try {
      const resp = await fetch(`${API}/api/auth/refresh`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ refreshToken: rt })
      });
      if (!resp.ok) throw new Error('refresh failed');
      const json = await resp.json();
      setTokens(json.accessToken, rt);
      return true;
    } catch (err) {
      setTokens(null, null);
      return false;
    }
  };

  useEffect(() => {
    (async () => {
      setLoading(true);
      const at = localStorage.getItem(ACCESS_TOKEN_KEY);
      if (at) {
        await fetchMe(at);
        setLoading(false);
        return;
      }
      const ok = await refreshAccess();
      if (ok) await fetchMe(localStorage.getItem(ACCESS_TOKEN_KEY));
      setLoading(false);
    })();
  }, []);

  const register = async ({ email, password, role='student', full_name }) => {
    const resp = await fetch(`${API}/api/auth/register`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email, password, role, full_name })
    });
    if (!resp.ok) throw await resp.json();
    const { accessToken, refreshToken, user } = await resp.json();
    setTokens(accessToken, refreshToken);
    setUser(user);
    return user;
  };

  const login = async ({ email, password }) => {
    const resp = await fetch(`${API}/api/auth/login`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email, password })
    });
    if (!resp.ok) throw await resp.json();
    const { accessToken, refreshToken, user } = await resp.json();
    setTokens(accessToken, refreshToken);
    setUser(user);
    return user;
  };

  const logout = async () => {
    const rt = localStorage.getItem(REFRESH_TOKEN_KEY);
    try { await fetch(`${API}/api/auth/logout`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ refreshToken: rt }) }); } catch (e) {}
    setTokens(null, null);
    setUser(null);
  };

  return <AuthContext.Provider value={{ user, loading, register, login, logout, getAccessToken: () => getAccessToken(), refreshAccess }}>{children}</AuthContext.Provider>;
};