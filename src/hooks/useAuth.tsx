'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import type { User, Session } from '@supabase/supabase-js';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  session: null,
  loading: true,
  signOut: async () => {},
});

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check active sessions and sets the user
    const setData = async () => {
      const { data: { session }, error } = await supabase.auth.getSession();
      if (error) {
        console.error('Error getting session:', error);
      }
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    };

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);

      // Importar store de forma dinámica para evitar ciclos si fuera necesario, 
      // o usar getState() directamente.
      const { useGeolandStore } = await import('@/store/useGeolandStore');

      // Cargar ISV guardado al hacer login
      if (event === 'SIGNED_IN' && session?.user) {
        try {
          const { data } = await supabase
            .from('profiles')
            .select('isv_v6')
            .eq('id', session.user.id)
            .single();

          if (data?.isv_v6) {
            const { updateIsvV6, setPerfilCompletado } = useGeolandStore.getState();
            updateIsvV6(data.isv_v6);
            setPerfilCompletado(true);
            console.log('ISV cargado desde Supabase');
          }

        } catch (error) {
          console.error('Error cargando ISV guardado (no bloqueante):', error);
        }
      }

      // Limpiar ISV al cerrar sesión
      if (event === 'SIGNED_OUT') {
        const { resetIsvV6, setPerfilCompletado, setAssets } = useGeolandStore.getState();
        resetIsvV6();
        setPerfilCompletado(false);
        setAssets([]);
      }

    });


    setData();

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  const value = {
    user,
    session,
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
