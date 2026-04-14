'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Mail, Lock, User, ArrowRight, Loader2 } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useGeolandStore } from '@/store/useGeolandStore';

export const AuthModal = () => {
  const { 
    authModalOpen, 
    setAuthModalOpen, 
    authModalView, 
    setAuthModalView 
  } = useGeolandStore();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  if (!authModalOpen) return null;

  const handleClose = () => {
    setAuthModalOpen(false);
    setError(null);
    setMessage(null);
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setError(error.message);
    } else {
      handleClose();
    }
    setLoading(false);
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
        },
      },
    });

    if (error) {
      setError(error.message);
    } else {
      setMessage('¡Cuenta creada! Ya podés ingresar.');
      setAuthModalView('login');
      // Limpiar campos de registro
      setFullName('');
    }
    setLoading(false);
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const { error } = await supabase.auth.resetPasswordForEmail(email);

    if (error) {
      setError(error.message);
    } else {
      setMessage('Se ha enviado un correo para restablecer tu contraseña.');
    }
    setLoading(false);
  };

  const viewVariants = {
    initial: { opacity: 0, x: 20 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -20 },
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="relative w-full max-w-md bg-white rounded-xl shadow-2xl border border-[#E5E7EB] overflow-hidden"
      >
        <button 
          onClick={handleClose}
          className="absolute top-4 right-4 p-2 hover:bg-gray-100 rounded-full transition-colors z-10"
        >
          <X size={20} className="text-gray-500" />
        </button>

        <div className="p-8">
          <AnimatePresence mode="wait">
            {authModalView === 'login' && (
              <motion.div
                key="login"
                variants={viewVariants}
                initial="initial"
                animate="animate"
                exit="exit"
              >
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Bienvenido</h2>
                <p className="text-gray-500 mb-6 font-medium">Accede a tu cuenta institucional</p>

                <form onSubmit={handleLogin} className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">Email</label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                      <input 
                        type="email" 
                        required
                        placeholder="nombre@empresa.com"
                        className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-[#E5E7EB] rounded-lg focus:ring-2 focus:ring-black outline-none transition-all text-gray-900"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">Contraseña</label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                      <input 
                        type="password" 
                        required
                        placeholder="••••••••"
                        className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-[#E5E7EB] rounded-lg focus:ring-2 focus:ring-black outline-none transition-all text-gray-900"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                      />
                    </div>
                  </div>

                  {error && <p className="text-sm text-red-600 bg-red-50 p-3 rounded-lg border border-red-100">{error}</p>}
                  {message && <p className="text-sm text-green-600 bg-green-50 p-3 rounded-lg border border-green-100">{message}</p>}


                  <button 
                    type="submit" 
                    disabled={loading}
                    className="w-full bg-black text-white py-3 rounded-lg font-bold hover:bg-gray-800 transition-colors flex items-center justify-center gap-2 mt-2"
                  >
                    {loading ? <Loader2 className="animate-spin" size={20} /> : <>Entrar <ArrowRight size={18} /></>}
                  </button>

                  <div className="flex flex-col gap-3 mt-6 text-center">
                    <button 
                      type="button"
                      onClick={() => setAuthModalView('register')}
                      className="text-sm text-gray-600 hover:text-black transition-colors"
                    >
                      ¿No tienes cuenta? <span className="font-bold underline">Regístrate</span>
                    </button>
                    <button 
                      type="button"
                      onClick={() => setAuthModalView('reset')}
                      className="text-sm text-gray-500 hover:text-gray-900 transition-colors"
                    >
                      Olvidé mi contraseña
                    </button>
                  </div>
                </form>
              </motion.div>
            )}

            {authModalView === 'register' && (
              <motion.div
                key="register"
                variants={viewVariants}
                initial="initial"
                animate="animate"
                exit="exit"
              >
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Crear Cuenta</h2>
                <p className="text-gray-500 mb-6 font-medium">Únete a la red Geoland</p>

                <form onSubmit={handleRegister} className="space-y-4">

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1.5">Nombre Completo</label>
                      <div className="relative">
                        <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                        <input 
                          type="text" 
                          required
                          placeholder="Juan Pérez"
                          className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-[#E5E7EB] rounded-lg focus:ring-2 focus:ring-black outline-none transition-all text-gray-900"
                          value={fullName}
                          onChange={(e) => setFullName(e.target.value)}
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1.5">Email</label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                        <input 
                          type="email" 
                          required
                          placeholder="nombre@empresa.com"
                          className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-[#E5E7EB] rounded-lg focus:ring-2 focus:ring-black outline-none transition-all text-gray-900"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1.5">Contraseña</label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                        <input 
                          type="password" 
                          required
                          placeholder="Mínimo 6 caracteres"
                          className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-[#E5E7EB] rounded-lg focus:ring-2 focus:ring-black outline-none transition-all text-gray-900"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                        />
                      </div>
                    </div>

                    {error && <p className="text-sm text-red-600 bg-red-50 p-3 rounded-lg border border-red-100">{error}</p>}

                    <button 
                      type="submit" 
                      disabled={loading}
                      className="w-full bg-black text-white py-3 rounded-lg font-bold hover:bg-gray-800 transition-colors flex items-center justify-center gap-2 mt-2"
                    >
                      {loading ? <Loader2 className="animate-spin" size={20} /> : 'Crear Cuenta'}
                    </button>

                    <div className="mt-6 text-center">
                      <button 
                        type="button"
                        onClick={() => setAuthModalView('login')}
                        className="text-sm text-gray-600 hover:text-black transition-colors"
                      >
                        ¿Ya tienes cuenta? <span className="font-bold underline">Inicia sesión</span>
                      </button>
                    </div>
                  </form>
                )}
              </motion.div>
            )}

            {authModalView === 'reset' && (
              <motion.div
                key="reset"
                variants={viewVariants}
                initial="initial"
                animate="animate"
                exit="exit"
              >
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Recuperar Acceso</h2>
                <p className="text-gray-500 mb-6 font-medium">Ingresa tu email para restablecer la contraseña</p>

                {message ? (
                  <div className="bg-blue-50 p-4 rounded-lg border border-blue-100 text-blue-800">
                    <p className="text-sm">{message}</p>
                    <button 
                      onClick={() => setAuthModalView('login')}
                      className="mt-4 text-sm font-bold underline"
                    >
                      Volver al login
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleResetPassword} className="space-y-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1.5">Email</label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                        <input 
                          type="email" 
                          required
                          placeholder="nombre@empresa.com"
                          className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-[#E5E7EB] rounded-lg focus:ring-2 focus:ring-black outline-none transition-all text-gray-900"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                        />
                      </div>
                    </div>

                    {error && <p className="text-sm text-red-600 bg-red-50 p-3 rounded-lg border border-red-100">{error}</p>}

                    <button 
                      type="submit" 
                      disabled={loading}
                      className="w-full bg-black text-white py-3 rounded-lg font-bold hover:bg-gray-800 transition-colors flex items-center justify-center gap-2 mt-2"
                    >
                      {loading ? <Loader2 className="animate-spin" size={20} /> : 'Enviar Instrucciones'}
                    </button>

                    <div className="mt-6 text-center">
                      <button 
                        type="button"
                        onClick={() => setAuthModalView('login')}
                        className="text-sm text-gray-600 hover:text-black transition-colors"
                      >
                        Volver al inicio de sesión
                      </button>
                    </div>
                  </form>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
};
