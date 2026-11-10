import React from 'react';
import { 
  Bell, 
  Moon, 
  Sun, 
  Shield, 
  Search, 
  Globe,
  Radio
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { convertNumberToBengali } from '../utils/translations';

interface NavbarProps {
  onOpenSearch: () => void;
  onOpenNotifications: () => void;
  onOpenAdmin: () => void;
  onOpenAuth: () => void;
  unreadCount?: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  onOpenSearch,
  onOpenNotifications,
  onOpenAdmin,
  onOpenAuth,
  unreadCount = 2,
}) => {
  const { currentUser, isAdmin, theme, toggleTheme, language, setLanguage, t } = useAuth();

  return (
    <header className="sticky top-0 z-40 w-full backdrop-blur-md bg-white/90 dark:bg-zinc-950/90 border-b border-zinc-200 dark:border-zinc-800 transition-colors duration-200">
      <div className="max-w-4xl mx-auto px-4 h-15 flex items-center justify-between">
        
        {/* Brand Logo & Live Badge */}
        <div className="flex items-center gap-2.5 cursor-pointer">
  <div className="relative flex items-center justify-center w-10 h-10 rounded-2xl bg-gradient-to-br from-slate-900 via-blue-800 to-cyan-500 shadow-lg shadow-blue-500/20 text-white font-black text-3xl italic tracking-tighter">
    M
    <span className="absolute -top-1 -right-1 flex h-3 w-3">
      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-300 opacity-75"></span>
      <span className="relative inline-flex rounded-full h-3 w-3 bg-cyan-400 border-2 border-white dark:border-zinc-950"></span>
    </span>
  
</div>

          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-xl font-bold bg-gradient-to-r from-emerald-600 to-teal-500 dark:from-emerald-400 dark:to-cyan-400 bg-clip-text text-transparent">
                টেকেল লাইভ
              </span>
              <span className="flex items-center gap-0.5 text-[10px] font-semibold uppercase px-1.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-700">
                <Radio className="w-2.5 h-2.5 animate-pulse text-emerald-500" />
                Live
              </span>
            </div>
            <p className="text-[11px] text-zinc-500 dark:text-zinc-400 font-medium hidden sm:block">
              {t('tagline')}
            </p>
          </div>
        </div>

        {/* Right Action Icons */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* Search Trigger */}
          <button
            onClick={onOpenSearch}
            className="p-2 sm:px-3 sm:py-1.5 flex items-center gap-2 rounded-full text-zinc-600 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800/80 transition-all text-sm"
            title={t('search')}
          >
            <Search className="w-5 h-5 text-zinc-500 dark:text-zinc-400" />
            <span className="hidden md:inline text-xs text-zinc-400">অনুসন্ধান করুন...</span>
          </button>

          {/* Language Toggle (Bangla / English) */}
          <button
            onClick={() => setLanguage(language === 'bn' ? 'en' : 'bn')}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-full text-xs font-semibold text-zinc-700 dark:text-zinc-300 bg-zinc-100 dark:bg-zinc-800/90 hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-all"
            title={t('language')}
          >
            <Globe className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
            <span>{language === 'bn' ? 'বাংলা' : 'EN'}</span>
          </button>

          {/* Theme Toggle */}
          <button
            onClick={toggleTheme}
            className="p-2 rounded-full text-zinc-600 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800/80 transition-colors"
            title={theme === 'dark' ? t('lightMode') : t('darkMode')}
            aria-label="Toggle Theme"
          >
            {theme === 'dark' ? (
              <Sun className="w-5 h-5 text-amber-400" />
            ) : (
              <Moon className="w-5 h-5 text-zinc-700" />
            )}
          </button>

          {/* Notifications Button with unread badge */}
          <button
            onClick={onOpenNotifications}
            className="relative p-2 rounded-full text-zinc-600 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800/80 transition-colors"
            title={t('notifications')}
          >
            <Bell className="w-5 h-5" />
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 flex items-center justify-center min-w-4.5 h-4.5 px-1 text-[10px] font-bold text-white bg-rose-500 rounded-full border-2 border-white dark:border-zinc-950 animate-bounce">
                {language === 'bn' ? convertNumberToBengali(unreadCount) : unreadCount}
              </span>
            )}
          </button>

          {/* Admin Dashboard shortcut if user has admin privileges */}
          {isAdmin && (
            <button
              onClick={onOpenAdmin}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-gradient-to-r from-amber-500 to-rose-500 text-white text-xs font-semibold shadow-sm hover:opacity-90 transition-all cursor-pointer"
              title={t('admin')}
            >
              <Shield className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">{t('admin')}</span>
            </button>
          )}

          {/* User Avatar or Login Button */}
          {currentUser ? (
            <div 
              onClick={() => onOpenAuth()} 
              className="flex items-center gap-2 pl-1 cursor-pointer"
              title={`${currentUser.displayName} (${currentUser.username})`}
            >
              <img
                src={currentUser.photoURL}
                alt={currentUser.displayName}
                className="w-9 h-9 rounded-full object-cover ring-2 ring-emerald-500/50 hover:ring-emerald-500 transition-all"
              />
            </div>
          ) : (
            <button
              onClick={onOpenAuth}
              className="px-4 py-1.5 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white text-xs sm:text-sm font-semibold shadow-md shadow-emerald-600/20 transition-all"
            >
              {t('login')}
            </button>
          )}

        </div>

      </div>
    </header>
  );
};
