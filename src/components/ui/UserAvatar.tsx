'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { User, Star, Bell, Info, CreditCard, LogOut, ChevronRight, BarChart3, LogIn } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useGeolandStore } from '@/store/useGeolandStore';
import { translations } from '@/lib/translations';

export const UserAvatar = () => {
  const { user, signOut } = useAuth();
  const { language, setAuthModalOpen, setAuthModalView } = useGeolandStore();
  const [showMenu, setShowMenu] = useState(false);
  
  const t = translations[language];

  const handleAuthAction = () => {
    if (user) {
      setShowMenu(!showMenu);
    } else {
      setAuthModalView('login');
      setAuthModalOpen(true);
    }
  };

  const menuItems = [
    { icon: BarChart3, label: t.menus.profile.myBureau },
    { icon: Star,     label: t.menus.profile.myFavorites },
    { icon: Bell,     label: t.menus.profile.myAlerts },
    { icon: Info,     label: t.menus.profile.usage },
    { icon: CreditCard, label: t.menus.profile.subscription },
    { icon: LogOut,   label: t.menus.profile.logout, danger: true, action: signOut }
  ];

  // Get initials or use a generic icon
  const getInitials = () => {
    if (!user) return null;
    const name = user.user_metadata?.full_name || user.email || '';
    return name.charAt(0).toUpperCase();
  };

  return (
    <div className="relative">
      <button
        onClick={handleAuthAction}
        className={`flex items-center justify-center rounded-full transition-all group overflow-hidden border ${
          user 
            ? 'bg-black text-white border-black' 
            : 'bg-white text-gray-400 border-gray-200 hover:border-black hover:text-black'
        } ${showMenu ? 'ring-2 ring-offset-1 ring-black' : ''}`}
        style={{ width: '36px', height: '36px' }}
      >
        {user ? (
          <span className="text-sm font-bold">{getInitials()}</span>
        ) : (
          <User size={18} className="transition-transform group-hover:scale-110" />
        )}
      </button>

      <AnimatePresence>
        {showMenu && user && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 5, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            className="absolute right-0 top-full mt-2 w-56 bg-white rounded-2xl shadow-xl p-1.5 border border-[#E5E7EB] z-50"
          >
            {/* User Info Header */}
            <div className="px-3 py-3 border-b border-gray-100 mb-1">
              <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-0.5">Inversionista</p>
              <p className="text-sm font-bold text-gray-900 truncate">
                {user.user_metadata?.full_name || 'Usuario Geoland'}
              </p>
              <p className="text-[10px] text-gray-500 truncate">{user.email}</p>
            </div>

            {menuItems.map((item, i) => (
              <button
                key={i}
                className={`w-full flex items-center justify-between px-3 py-2.5 text-xs rounded-xl transition-all cursor-pointer ${
                  item.danger ? 'hover:bg-red-50 text-red-600' : 'hover:bg-gray-50 text-gray-700'
                }`}
                onClick={() => {
                  if (item.action) item.action();
                  setShowMenu(false);
                }}
              >
                <div className="flex items-center gap-3">
                  <item.icon size={14} />
                  <span className="font-semibold">{item.label}</span>
                </div>
                <ChevronRight size={12} className="opacity-0 group-hover:opacity-40 transition-opacity" />
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
