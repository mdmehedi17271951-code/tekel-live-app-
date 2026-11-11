import React from 'react';
import { 
  Home, 
  Compass, 
  PlusCircle, 
  MessageCircle, 
  User as UserIcon,
  Shield,
  Sparkles
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

export type TabType = 'home' | 'explore' | 'create' | 'ai' | 'messages' | 'profile' | 'admin' | 'live';

interface BottomNavProps {
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
  onOpenCreateModal: () => void;
  unreadMessagesCount?: number;
}

export const BottomNav: React.FC<BottomNavProps> = ({
  activeTab,
  onTabChange,
  onOpenCreateModal,
  unreadMessagesCount = 1,
}) => {
  const { currentUser, isAdmin, t } = useAuth();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-zinc-950/95 backdrop-blur-lg border-t border-zinc-200 dark:border-zinc-800 transition-colors pb-safe">
      <div className="max-w-md mx-auto px-4 h-16 flex items-center justify-between">
        
        {/* Home Tab */}
        <button
          onClick={() => onTabChange('home')}
          className={`flex flex-col items-center justify-center flex-1 h-full transition-colors ${
            activeTab === 'home'
              ? 'text-emerald-600 dark:text-emerald-400 font-bold'
              : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200'
          }`}
        >
          <Home className={`w-5.5 h-5.5 ${activeTab === 'home' ? 'stroke-[2.5px]' : 'stroke-[1.75px]'}`} />
          <span className="text-[11px] mt-1 font-medium">{t('home')}</span>
        </button>

        {/* Explore / Search Tab */}
        <button
          onClick={() => onTabChange('explore')}
          className={`flex flex-col items-center justify-center flex-1 h-full transition-colors ${
            activeTab === 'explore'
              ? 'text-emerald-600 dark:text-emerald-400 font-bold'
              : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200'
          }`}
        >
          <Compass className={`w-5.5 h-5.5 ${activeTab === 'explore' ? 'stroke-[2.5px]' : 'stroke-[1.75px]'}`} />
          <span className="text-[11px] mt-1 font-medium">{t('explore')}</span>
        </button>

        {/* Create Post Button (Floating Center Action) */}
        <div className="flex items-center justify-center flex-1 -mt-5">
          <button
            onClick={onOpenCreateModal}
            className="flex items-center justify-center w-13 h-13 rounded-full bg-gradient-to-tr from-emerald-600 to-teal-500 text-white shadow-lg shadow-emerald-500/40 hover:scale-105 active:scale-95 transition-transform"
            title={t('createPost')}
            aria-label="Create Post"
          >
            <PlusCircle className="w-7 h-7" />
          </button>
        </div>

        {/* Tekel AI Tab */}
        <button
          onClick={() => onTabChange('ai')}
          className={`relative flex flex-col items-center justify-center flex-1 h-full transition-colors ${
            activeTab === 'ai'
              ? 'text-teal-600 dark:text-teal-400 font-bold'
              : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200'
          }`}
        >
          <div className="relative">
            <Sparkles className={`w-5.5 h-5.5 ${activeTab === 'ai' ? 'stroke-[2.5px] text-teal-500' : 'stroke-[1.75px]'}`} />
            <span className="absolute -top-1 -right-1 w-2 h-2 bg-gradient-to-r from-emerald-400 to-teal-400 rounded-full animate-ping opacity-75" />
          </div>
          <span className="text-[10px] mt-1 font-semibold">{t('tekelAI')}</span>
        </button>

        {/* Messages Tab */}
        <button
          onClick={() => onTabChange('messages')}
          className={`relative flex flex-col items-center justify-center flex-1 h-full transition-colors ${
            activeTab === 'messages'
              ? 'text-emerald-600 dark:text-emerald-400 font-bold'
              : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200'
          }`}
        >
          <div className="relative">
            <MessageCircle className={`w-5.5 h-5.5 ${activeTab === 'messages' ? 'stroke-[2.5px]' : 'stroke-[1.75px]'}`} />
            {unreadMessagesCount > 0 && (
              <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-emerald-500 rounded-full ring-2 ring-white dark:ring-zinc-950 animate-pulse" />
            )}
          </div>
          <span className="text-[11px] mt-1 font-medium">{t('messages')}</span>
        </button>

        {/* Profile Tab or Admin Tab */}
        <button
          onClick={() => onTabChange('profile')}
          className={`flex flex-col items-center justify-center flex-1 h-full transition-colors ${
            activeTab === 'profile'
              ? 'text-emerald-600 dark:text-emerald-400 font-bold'
              : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200'
          }`}
        >
          {currentUser ? (
            <img
              src={currentUser.photoURL}
              alt=""
              className={`w-6 h-6 rounded-full object-cover ring-2 ${
                activeTab === 'profile' ? 'ring-emerald-500' : 'ring-transparent'
              }`}
            />
          ) : (
            <UserIcon className={`w-5.5 h-5.5 ${activeTab === 'profile' ? 'stroke-[2.5px]' : 'stroke-[1.75px]'}`} />
          )}
          <span className="text-[11px] mt-1 font-medium">{t('profile')}</span>
        </button>

      </div>
    </nav>
  );
};
