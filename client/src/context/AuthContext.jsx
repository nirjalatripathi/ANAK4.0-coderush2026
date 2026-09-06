import { createContext, useCallback, useEffect, useMemo, useState } from 'react';
import { authService } from '../services/authService';

export const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [citizen, setCitizen] = useState(null);
  const [campOfficial, setCampOfficial] = useState(null);
  const [localAuthority, setLocalAuthority] = useState(null);
  const [loading, setLoading] = useState(true);

  const applySession = useCallback((data, token) => {
    if (token) localStorage.setItem('rahat_token', token);
    setUser(data.user || null);
    setCitizen(data.citizen || data.user?.citizen || null);
    setCampOfficial(data.campOfficial || data.user?.campOfficial || null);
    setLocalAuthority(data.localAuthority || data.user?.localAuthority || null);
  }, []);

  const loadMe = useCallback(async () => {
    const token = localStorage.getItem('rahat_token');
    if (!token) {
      setUser(null);
      setCitizen(null);
      setCampOfficial(null);
      setLocalAuthority(null);
      setLoading(false);
      return;
    }
    try {
      const { data } = await authService.me();
      applySession(data);
    } catch {
      localStorage.removeItem('rahat_token');
      setUser(null);
      setCitizen(null);
      setCampOfficial(null);
      setLocalAuthority(null);
    } finally {
      setLoading(false);
    }
  }, [applySession]);

  useEffect(() => {
    loadMe();
  }, [loadMe]);

  const login = async (payload) => {
    const { data } = await authService.login(payload);
    applySession(data, data.token);
    return data;
  };

  const adminLogin = async (payload) => {
    const { data } = await authService.adminLogin(payload);
    applySession(data, data.token);
    return data;
  };

  const register = async (payload) => {
    const { data } = await authService.register(payload);
    applySession(data, data.token);
    return data;
  };

  const logout = async () => {
    try {
      await authService.logout();
    } catch {
      /* token discard is enough */
    }
    localStorage.removeItem('rahat_token');
    setUser(null);
    setCitizen(null);
    setCampOfficial(null);
    setLocalAuthority(null);
  };

  const registerDonor = async (payload) => {
    const { data } = await authService.registerDonor(payload);
    applySession(data, data.token);
    return data;
  };

  const value = useMemo(
    () => ({
      user,
      citizen,
      campOfficial,
      localAuthority,
      loading,
      login,
      adminLogin,
      register,
      registerDonor,
      logout,
      refresh: loadMe,
      isAdmin: user?.role === 'admin',
      isOfficial: user?.role === 'camp_official',
      isAuthority: user?.role === 'local_authority' || user?.role === 'local_admin',
      isDonor: user?.role === 'donor',
      isCitizen: user?.role === 'citizen',
    }),
    [user, citizen, campOfficial, localAuthority, loading, loadMe]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
