import React from 'react';
import { 
  Home, 
  Compass, 
  Plus, 
  MessageSquare, 
  User as UserIcon,
  Sparkles
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { TabType } from './BottomNav';

interface TikTokBottomNavProps {
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
  onOpenCreate: () => void;
  onOpenAI: () => void;
  unreadCount?: number;
}

export const TikTokBottomNav: React.FC<TikTokBottomNavProps> = ({
  activeTab,
  onTabChange,
  onOpenCreate,
  onOpenAI,
  unreadCount = 2,
}) => {
  const { currentUser, t } = useAuth();

  return (
    <nav className="fixed bottom-0 inset-x-0 z-40 bg-black/90 backdrop-blur-xl border-t border-zinc-800/80 pb-safe transition-all select-none">
      <div className="max-w-md mx-auto px-4 h-16 flex items-center justify-between">
        
        {/* Home Tab */}
        <button
          onClick={() => onTabChange('home')}
          className={`flex flex-col items-center justify-center flex-1 h-full transition-all ${
            activeTab === 'home'
              ? 'text-white font-black'
              : 'text-zinc-500 hover:text-zinc-300'
          }`}
        >
          <Home className={`w-5.5 h-5.5 ${activeTab === 'home' ? 'stroke-[2.5px] text-white' : 'stroke-[1.75px]'}`} />
          <span className="text-[10px] mt-1 font-medium">{t('home')}</span>
        </button>

        {/* Explore Tab */}
        <button
          onClick={() => onTabChange('explore')}
          className={`flex flex-col items-center justify-center flex-1 h-full transition-all ${
            activeTab === 'explore'
              ? 'text-cyan-400 font-black'
              : 'text-zinc-500 hover:text-zinc-300'
          }`}
        >
          <Compass className={`w-5.5 h-5.5 ${activeTab === 'explore' ? 'stroke-[2.5px] text-cyan-400' : 'stroke-[1.75px]'}`} />
          <span className="text-[10px] mt-1 font-medium">{t('explore')}</span>
        </button>

        {/* Create (+) Iconic TikTok Button */}
        <div className="flex items-center justify-center flex-1">
          <button
            onClick={onOpenCreate}
            className="relative flex items-center justify-center w-11 h-8 group active:scale-95 transition-transform cursor-pointer"
            title={t('createPost')}
            aria-label="Create Video"
          >
            {/* Cyan background shifted left */}
            <div className="absolute inset-0 -left-1 bg-cyan-400 rounded-lg group-hover:-left-1.5 transition-all" />
            {/* Rose background shifted right */}
            <div className="absolute inset-0 -right-1 bg-rose-500 rounded-lg group-hover:-right-1.5 transition-all" />
            {/* White foreground center button */}
            <div className="relative w-full h-full bg-white rounded-lg flex items-center justify-center text-black font-extrabold shadow-sm">
              <Plus className="w-5 h-5 stroke-[3]" />
            </div>
          </button>
        </div>

        {/* Inbox / Messages Tab */}
        <button
          onClick={() => onTabChange('messages')}
          className={`relative flex flex-col items-center justify-center flex-1 h-full transition-all ${
            activeTab === 'messages'
              ? 'text-cyan-400 font-black'
              : 'text-zinc-500 hover:text-zinc-300'
          }`}
        >
          <div className="relative">
            <MessageSquare className={`w-5.5 h-5.5 ${activeTab === 'messages' ? 'stroke-[2.5px] text-cyan-400' : 'stroke-[1.75px]'}`} />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-rose-500 rounded-full ring-2 ring-black animate-pulse" />
            )}
          </div>
          <span className="text-[10px] mt-1 font-medium">{t('messages')}</span>
        </button>

        {/* Profile Tab */}
        <button
          onClick={() => onTabChange('profile')}
          className={`flex flex-col items-center justify-center flex-1 h-full transition-all ${
            activeTab === 'profile'
              ? 'text-cyan-400 font-black'
              : 'text-zinc-500 hover:text-zinc-300'
          }`}
        >
          {currentUser ? (
            <img
              src={currentUser.photoURL}
              alt=""
              className={`w-6 h-6 rounded-full object-cover ring-2 ${
                activeTab === 'profile' ? 'ring-cyan-400' : 'ring-transparent'
              }`}
            />
          ) : (
            <UserIcon className={`w-5.5 h-5.5 ${activeTab === 'profile' ? 'stroke-[2.5px] text-cyan-400' : 'stroke-[1.75px]'}`} />
          )}
          <span className="text-[10px] mt-1 font-medium">{t('profile')}</span>
        </button>

      </div>

      {/* Floating Tekel AI Assistant Pill (Bottom Right above nav) */}
      <button
        onClick={onOpenAI}
        className={`fixed right-4 bottom-20 z-40 flex items-center gap-1.5 px-3 py-2 rounded-full shadow-2xl backdrop-blur-xl border border-cyan-500/40 transition-all cursor-pointer active:scale-95 ${
          activeTab === 'ai'
            ? 'bg-gradient-to-r from-cyan-500 to-emerald-500 text-white font-black scale-105 shadow-cyan-500/30'
            : 'bg-zinc-950/85 text-zinc-200 hover:bg-zinc-900'
        }`}
        title="টেকেল AI অ্যাসিস্ট্যান্ট"
      >
        <Sparkles className="w-4 h-4 text-cyan-400 animate-pulse" />
        <span className="text-xs font-bold tracking-tight">টেকেল AI</span>
      </button>
    </nav>
  );
};
