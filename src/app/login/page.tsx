'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { Lock, User, AlertCircle, ArrowRight, Loader2 } from 'lucide-react';

function LoginContent() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const errorType = searchParams.get('error');
    if (errorType === 'unauthorized') {
      setError('Acceso restringido. Debes iniciar sesión para continuar.');
    }
  }, [searchParams]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    // Simular un poco de delay para la experiencia de usuario
    await new Promise(resolve => setTimeout(resolve, 800));

    // Credenciales hardcodeadas
    if (username === 'geoland' && password === 'geoland_2026_infraestructure') {
      // Establecer cookie de sesión simple con SameSite para compatibilidad en despliegue
      document.cookie = "geoland_auth=true; path=/; max-age=86400; SameSite=Lax"; // 24 horas
      
      router.push('/');
      router.refresh();
    } else {
      setError('Credenciales inválidas. Por favor verifique su usuario y contraseña.');
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-black flex flex-col items-center justify-center p-6 relative overflow-hidden">
      {/* Background Video */}
      <video 
        autoPlay 
        loop 
        muted 
        playsInline 
        className="absolute inset-0 w-full h-full object-cover opacity-40"
      >
        <source src="/portada.mp4" type="video/mp4" />
      </video>

      {/* Decorative Orbs Overlay */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-500/5 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-500/5 rounded-full blur-[120px] pointer-events-none" />

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="w-full max-w-[420px] z-10"
      >
        {/* Logo Section */}
        <div className="flex flex-col items-center mb-12">
          <div className="relative w-48 h-24 mb-4">
            <Image
              src="/logo Geoland OS.svg"
              alt="Geoland OS Logo"
              fill
              className="object-contain brightness-110"
              priority
            />
          </div>
          <div className="h-[1px] w-16 bg-gradient-to-r from-transparent via-blue-500 to-transparent mb-2" />
          <p className="text-zinc-500 text-sm tracking-[0.2em] uppercase font-light">Neural Intelligence OS</p>
        </div>

        {/* Login Form Card */}
        <div className="bg-zinc-900/40 backdrop-blur-xl border border-zinc-800/50 p-8 rounded-3xl shadow-2xl">
          <h1 className="text-2xl font-semibold text-white mb-2">Bienvenido</h1>
          <p className="text-zinc-400 text-sm mb-8">Ingresa tus credenciales para acceder a la plataforma.</p>

          <form onSubmit={handleLogin} className="space-y-5">
            <div className="space-y-2">
              <label className="text-xs font-medium text-zinc-500 ml-1 uppercase tracking-wider">Usuario</label>
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                <input
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full bg-zinc-950/50 border border-zinc-800 rounded-2xl py-3.5 pl-12 pr-4 text-white placeholder:text-zinc-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500/50 transition-all"
                  placeholder="Usuario Geoland"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-medium text-zinc-500 ml-1 uppercase tracking-wider">Contraseña</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-zinc-950/50 border border-zinc-800 rounded-2xl py-3.5 pl-12 pr-4 text-white placeholder:text-zinc-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500/50 transition-all"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <AnimatePresence>
              {error && (
                <motion.div 
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="bg-red-500/10 border border-red-500/20 p-3 rounded-xl flex items-start gap-3"
                >
                  <AlertCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
                  <p className="text-xs text-red-400 leading-relaxed">{error}</p>
                </motion.div>
              )}
            </AnimatePresence>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-white text-black font-semibold py-4 rounded-2xl flex items-center justify-center gap-2 hover:bg-zinc-200 disabled:opacity-50 disabled:cursor-not-allowed transition-all active:scale-[0.98] mt-4"
            >
              {loading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  Entrar <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>
        </div>

        {/* Footer */}
        <p className="text-center mt-8 text-zinc-600 text-xs font-light">
          &copy; 2026 Geoland Intelligence. Todos los derechos reservados.
        </p>
      </motion.div>

      {/* Decorative Gradient Bar */}
      <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-blue-500/20 to-transparent" />
    </main>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-black flex items-center justify-center text-white">Cargando...</div>}>
      <LoginContent />
    </Suspense>
  );
}
