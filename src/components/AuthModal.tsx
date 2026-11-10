import React, { useState } from 'react';
import { 
  X, 
  LogIn, 
  UserPlus, 
  ShieldCheck, 
  LogOut, 
  User as UserIcon,
  Sparkles,
  Lock,
  Mail
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { SAMPLE_USERS } from '../utils/mockData';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose }) => {
  const { 
    currentUser, 
    loginWithGoogle, 
    loginWithEmail, 
    signupWithEmail, 
    loginAsDemoUser, 
    logout, 
    t 
  } = useAuth();

  const [mode, setMode] = useState<'login' | 'signup'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [username, setUsername] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setIsSubmitting(true);

    try {
      if (mode === 'login') {
        await loginWithEmail(email, password);
      } else {
        if (!displayName.trim() || !username.trim()) {
          setErrorMsg('দয়া করে নাম এবং ইউজারনেম পূরণ করুন');
          setIsSubmitting(false);
          return;
        }
        await signupWithEmail(email, password, displayName, username);
      }
      onClose();
    } catch (err: any) {
      setErrorMsg(err.message || 'একটি ত্রুটি ঘটেছে। দয়া করে পুনরায় চেষ্টা করুন।');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGoogleLogin = async () => {
    setErrorMsg('');
    try {
      await loginWithGoogle();
      onClose();
    } catch (err: any) {
      setErrorMsg(err.message || 'গুগল সাইন ইন সম্পন্ন করা যায়নি।');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
      <div className="w-full max-w-md bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200 dark:border-zinc-800 shadow-2xl p-6 overflow-hidden max-h-[92vh] overflow-y-auto">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-zinc-100 dark:border-zinc-800">
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
              <Sparkles className="w-5 h-5" />
            </span>
            <h2 className="text-lg font-bold text-zinc-900 dark:text-white">
              {currentUser ? 'আপনার অ্যাকাউন্ট' : t('loginTitle')}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* If Already Logged In */}
        {currentUser ? (
          <div className="py-4 space-y-4">
            <div className="flex items-center gap-3.5 p-3.5 bg-zinc-50 dark:bg-zinc-800/50 rounded-2xl border border-zinc-200/80 dark:border-zinc-700/60">
              <img
                src={currentUser.photoURL}
                alt=""
                className="w-14 h-14 rounded-full object-cover ring-2 ring-emerald-500"
              />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5">
                  <p className="font-bold text-zinc-900 dark:text-white text-base truncate">
                    {currentUser.displayName}
                  </p>
                  {currentUser.role === 'admin' && (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300">
                      অ্যাডমিন
                    </span>
                  )}
                </div>
                <p className="text-xs text-zinc-500 dark:text-zinc-400">@{currentUser.username}</p>
                <p className="text-xs text-zinc-400 truncate">{currentUser.email}</p>
              </div>
            </div>

            <button
              onClick={() => {
                logout();
                onClose();
              }}
              className="w-full py-2.5 px-4 rounded-xl border border-rose-200 dark:border-rose-900/60 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 text-sm font-semibold flex items-center justify-center gap-2 transition-colors cursor-pointer"
            >
              <LogOut className="w-4 h-4" />
              <span>{t('logout')}</span>
            </button>
          </div>
        ) : (
          <div className="py-4 space-y-4">
            <p className="text-xs text-zinc-500 dark:text-zinc-400">
              {t('loginSubtitle')}
            </p>

            {/* Google One-Click Auth */}
            <button
              onClick={handleGoogleLogin}
              className="w-full py-2.5 px-4 rounded-2xl bg-white dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 hover:bg-zinc-50 dark:hover:bg-zinc-750 text-zinc-800 dark:text-zinc-100 font-semibold text-xs sm:text-sm flex items-center justify-center gap-2.5 shadow-xs transition-all cursor-pointer"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                />
              </svg>
              <span>{t('googleSignIn')}</span>
            </button>

            <div className="relative flex items-center justify-center">
              <div className="border-t border-zinc-200 dark:border-zinc-800 w-full" />
              <span className="bg-white dark:bg-zinc-900 px-3 text-[11px] text-zinc-400 absolute">
                অথবা ইমেইল দিয়ে
              </span>
            </div>

            {errorMsg && (
              <div className="p-3 bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-900 text-rose-600 dark:text-rose-300 text-xs rounded-xl">
                {errorMsg}
              </div>
            )}

            {/* Email form */}
            <form onSubmit={handleSubmit} className="space-y-3">
              {mode === 'signup' && (
                <>
                  <div>
                    <label className="text-xs font-medium text-zinc-700 dark:text-zinc-300">
                      {t('displayName')}
                    </label>
                    <div className="relative mt-1">
                      <UserIcon className="w-4 h-4 text-zinc-400 absolute left-3 top-2.5" />
                      <input
                        type="text"
                        required
                        value={displayName}
                        onChange={(e) => setDisplayName(e.target.value)}
                        placeholder="আপনার নাম"
                        className="w-full pl-9 pr-3 py-2 text-xs rounded-xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100 focus:ring-2 focus:ring-emerald-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-medium text-zinc-700 dark:text-zinc-300">
                      {t('username')}
                    </label>
                    <div className="relative mt-1">
                      <span className="text-xs text-zinc-400 absolute left-3 top-2 font-mono">@</span>
                      <input
                        type="text"
                        required
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        placeholder="unique_username"
                        className="w-full pl-8 pr-3 py-2 text-xs rounded-xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100 focus:ring-2 focus:ring-emerald-500 font-mono"
                      />
                    </div>
                  </div>
                </>
              )}

              <div>
                <label className="text-xs font-medium text-zinc-700 dark:text-zinc-300">
                  {t('email')}
                </label>
                <div className="relative mt-1">
                  <Mail className="w-4 h-4 text-zinc-400 absolute left-3 top-2.5" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="user@example.com"
                    className="w-full pl-9 pr-3 py-2 text-xs rounded-xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100 focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-medium text-zinc-700 dark:text-zinc-300">
                  {t('password')}
                </label>
                <div className="relative mt-1">
                  <Lock className="w-4 h-4 text-zinc-400 absolute left-3 top-2.5" />
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-9 pr-3 py-2 text-xs rounded-xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100 focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs sm:text-sm shadow-md shadow-emerald-600/30 transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                {mode === 'login' ? <LogIn className="w-4 h-4" /> : <UserPlus className="w-4 h-4" />}
                <span>
                  {isSubmitting
                    ? (mode === 'login' ? t('loggingIn') : t('signingUp'))
                    : (mode === 'login' ? t('login') : t('signup'))}
                </span>
              </button>
            </form>

            {/* Toggle Login / Signup */}
            <div className="text-center pt-1">
              <button
                type="button"
                onClick={() => {
                  setMode(mode === 'login' ? 'signup' : 'login');
                  setErrorMsg('');
                }}
                className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold hover:underline"
              >
                {mode === 'login' ? t('dontHaveAccount') : t('alreadyHaveAccount')}
              </button>
            </div>

            {/* Quick Demo Switchers for Easy Evaluation */}
            <div className="pt-3 border-t border-zinc-100 dark:border-zinc-800">
              <p className="text-[11px] font-semibold text-zinc-500 dark:text-zinc-400 mb-2 flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
                <span>{t('quickDemoLogin')}:</span>
              </p>
              <div className="grid grid-cols-1 gap-1.5">
                {SAMPLE_USERS.map((usr) => (
                  <button
                    key={usr.uid}
                    onClick={() => {
                      loginAsDemoUser(usr);
                      onClose();
                    }}
                    className="flex items-center gap-2.5 p-2 rounded-xl bg-zinc-50 dark:bg-zinc-800/60 hover:bg-zinc-100 dark:hover:bg-zinc-800 border border-zinc-200/60 dark:border-zinc-700/60 transition-all text-left cursor-pointer"
                  >
                    <img src={usr.photoURL} alt="" className="w-7 h-7 rounded-full object-cover shrink-0" />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold text-zinc-900 dark:text-zinc-100 truncate">
                          {usr.displayName}
                        </span>
                        {usr.role === 'admin' && (
                          <span className="text-[10px] font-bold text-amber-500 px-1 rounded bg-amber-500/10">
                            Admin
                          </span>
                        )}
                      </div>
                      <span className="text-[10px] text-zinc-400">@{usr.username}</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>

          </div>
        )}

      </div>
    </div>
  );
};
