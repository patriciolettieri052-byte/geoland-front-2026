'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';

interface AuthContextType {
  user: any | null;
  loading: boolean;
  signOut: () => void;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  signOut: () => {},
});

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  const checkAuth = () => {
    // Buscar la cookie geoland_auth de forma más precisa
    const cookies = document.cookie.split('; ');
    const authCookie = cookies.find(row => row.startsWith('geoland_auth='));
    const isAuth = authCookie?.split('=')[1] === 'true';

    if (isAuth) {
      setUser({ id: 'geoland-user', email: 'admin@geoland.io', role: 'admin' });
    } else {
      setUser(null);
    }
    setLoading(false);
  };

  useEffect(() => {
    checkAuth();
    
    // Escuchar cambios en el almacenamiento local o cookies si fuera necesario
    // Por simplicidad, checkAuth al montar es suficiente dado el middleware
  }, []);

  const signOut = async () => {
    // Borrar cookie
    document.cookie = "geoland_auth=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
    setUser(null);
    
    // Limpiar store
    const { useGeolandStore } = await import('@/store/useGeolandStore');
    const store = useGeolandStore.getState();
    store.resetIsvV6();
    store.setPerfilCompletado(false);
    store.setAssets([]);
    store.setChatHistory(() => []);
    store.setAecHistory(() => []);
    store.setAecPendingActions([]);
    store.setAecProactiveAlert(null);
    store.setSimulationPreview(null);
    store.setCompareAssetIds(null);

    // Redirigir al login
    window.location.href = '/login';
  };

  const value = {
    user,
    loading,
    signOut,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
