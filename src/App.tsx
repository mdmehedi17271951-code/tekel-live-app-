/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { 
  AuthProvider, 
  useAuth 
} from './contexts/AuthContext';
import { Navbar } from './components/Navbar';
import { BottomNav, TabType } from './components/BottomNav';
import { StoriesBar } from './components/StoriesBar';
import { PostCard } from './components/PostCard';
import { CreatePostModal } from './components/CreatePostModal';
import { AuthModal } from './components/AuthModal';
import { ProfileView } from './components/ProfileView';
import { MessagesView } from './components/MessagesView';
import { NotificationsView } from './components/NotificationsView';
import { ExploreView } from './components/ExploreView';
import { AdminDashboard } from './components/AdminDashboard';
import { TekelAIView } from './components/TekelAIView';
import { Post, UserProfile } from './types';
import { FirestoreService } from './services/firestore';
import { INITIAL_POSTS } from './utils/mockData';
import { 
  Sparkles, 
  Image as ImageIcon, 
  Video, 
  Smile, 
  Layers, 
  Film, 
  Flame, 
  X,
  Bell
} from 'lucide-react';

const MainApp: React.FC = () => {
  const { currentUser, t } = useAuth();
  const [activeTab, setActiveTab] = useState<TabType>('home');
  const [feedFilter, setFeedFilter] = useState<'all' | 'following' | 'videos'>('all');
  const [posts, setPosts] = useState<Post[]>(INITIAL_POSTS);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [initialPostContent, setInitialPostContent] = useState('');
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [viewingProfileUserId, setViewingProfileUserId] = useState<string | null>(null);
  const [chatTargetUser, setChatTargetUser] = useState<UserProfile | null>(null);

  // Subscribe to real-time posts from Firestore
  useEffect(() => {
    const unsubscribe = FirestoreService.subscribePosts((fetchedPosts) => {
      setPosts(fetchedPosts);
    });
    return () => {
      if (typeof unsubscribe === 'function') unsubscribe();
    };
  }, []);

  const handlePostCreated = (newPost: Post) => {
    setPosts(prev => [newPost, ...prev]);
  };

  const handlePostDeleted = (postId: string) => {
    setPosts(prev => prev.filter(p => p.id !== postId));
  };

  const handleUserClick = (userId: string) => {
    setViewingProfileUserId(userId);
    setActiveTab('profile');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleNavigateToChat = (target: UserProfile) => {
    setChatTargetUser(target);
    setActiveTab('messages');
  };

  // Filter posts based on selected sub-tab
  const filteredPosts = posts.filter(post => {
    if (feedFilter === 'videos') {
      return post.type === 'video';
    }
    return true;
  });

  return (
    <div className="min-h-screen bg-zinc-100/70 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 flex flex-col font-sans transition-colors duration-200 antialiased selection:bg-emerald-500 selection:text-white">
      
      {/* Top Application Bar */}
      <Navbar
        onOpenSearch={() => {
          setActiveTab('explore');
        }}
        onOpenNotifications={() => setIsNotificationsOpen(true)}
        onOpenAdmin={() => setActiveTab('admin')}
        onOpenAuth={() => setIsAuthModalOpen(true)}
        onOpenAI={() => {
          setActiveTab('ai');
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        unreadCount={2}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-2xl w-full mx-auto px-3 sm:px-4 pt-3 pb-24">
        
        {/* TAB 1: HOME FEED */}
        {activeTab === 'home' && (
          <div className="space-y-4">
            
            {/* Circular Stories Bar */}
            <StoriesBar />

            {/* Quick Create Post Card */}
            <div className="bg-white dark:bg-zinc-900 rounded-3xl p-4 border border-zinc-200/90 dark:border-zinc-800/80 shadow-xs">
              <div 
                onClick={() => setIsCreateModalOpen(true)}
                className="flex items-center gap-3 cursor-pointer"
              >
                <img
                  src={currentUser?.photoURL || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80'}
                  alt=""
                  className="w-10 h-10 rounded-full object-cover ring-2 ring-emerald-500/30"
                />
                <div className="flex-1 px-4 py-2.5 rounded-full bg-zinc-100 dark:bg-zinc-800 text-xs sm:text-sm text-zinc-400 dark:text-zinc-500 font-medium hover:bg-zinc-200/70 dark:hover:bg-zinc-750 transition-colors">
                  {t('whatsOnYourMind')}
                </div>
              </div>

              <div className="flex items-center justify-around mt-3 pt-3 border-t border-zinc-100 dark:border-zinc-800/80 text-xs">
                <button
                  onClick={() => setIsCreateModalOpen(true)}
                  className="flex items-center gap-1.5 text-zinc-600 dark:text-zinc-400 hover:text-emerald-600 dark:hover:text-emerald-400 font-semibold transition-colors"
                >
                  <ImageIcon className="w-4 h-4 text-emerald-500" />
                  <span>{t('addPhoto')}</span>
                </button>

                <button
                  onClick={() => setIsCreateModalOpen(true)}
                  className="flex items-center gap-1.5 text-zinc-600 dark:text-zinc-400 hover:text-teal-600 dark:hover:text-teal-400 font-semibold transition-colors"
                >
                  <Video className="w-4 h-4 text-teal-500" />
                  <span>{t('addVideo')}</span>
                </button>

                <button
                  onClick={() => setIsCreateModalOpen(true)}
                  className="flex items-center gap-1.5 text-zinc-600 dark:text-zinc-400 hover:text-amber-500 font-semibold transition-colors"
                >
                  <Smile className="w-4 h-4 text-amber-500" />
                  <span>অনুভূতি</span>
                </button>
              </div>
            </div>

            {/* Feed Filter Sub-Tabs */}
            <div className="flex items-center gap-1.5 p-1 bg-white/70 dark:bg-zinc-900/60 rounded-2xl border border-zinc-200/80 dark:border-zinc-800/80 backdrop-blur-xs">
              <button
                onClick={() => setFeedFilter('all')}
                className={`flex-1 py-1.5 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
                  feedFilter === 'all'
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100'
                }`}
              >
                <Layers className="w-3.5 h-3.5" />
                <span>{t('forYou')}</span>
              </button>

              <button
                onClick={() => setFeedFilter('following')}
                className={`flex-1 py-1.5 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
                  feedFilter === 'following'
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100'
                }`}
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>{t('following')}</span>
              </button>

              <button
                onClick={() => setFeedFilter('videos')}
                className={`flex-1 py-1.5 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
                  feedFilter === 'videos'
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100'
                }`}
              >
                <Film className="w-3.5 h-3.5" />
                <span>{t('videos')}</span>
              </button>
            </div>

            {/* Posts Feed Stream */}
            <div className="space-y-4">
              {filteredPosts.length === 0 ? (
                <div className="p-12 text-center bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200 dark:border-zinc-800">
                  <p className="text-zinc-400 text-sm">{t('noPostsYet')}</p>
                </div>
              ) : (
                filteredPosts.map((post) => (
                  <PostCard
                    key={post.id}
                    post={post}
                    onPostDeleted={handlePostDeleted}
                    onUserClick={handleUserClick}
                  />
                ))
              )}
            </div>

          </div>
        )}

        {/* TAB 2: EXPLORE & SEARCH */}
        {activeTab === 'explore' && (
          <ExploreView
            onUserClick={handleUserClick}
            allPosts={posts}
          />
        )}

        {/* TAB 3: PRIVATE MESSAGING */}
        {activeTab === 'messages' && (
          <MessagesView
            initialChatTarget={chatTargetUser}
          />
        )}

        {/* TAB 4: PROFILE */}
        {activeTab === 'profile' && (
          <ProfileView
            userId={viewingProfileUserId || undefined}
            onNavigateToChat={handleNavigateToChat}
            onPostDeleted={handlePostDeleted}
            allPosts={posts}
          />
        )}

        {/* TAB 5: ADMIN DASHBOARD */}
        {activeTab === 'admin' && (
          <AdminDashboard
            posts={posts}
            onPostDeleted={handlePostDeleted}
          />
        )}

        {/* TAB 6: TEKEL AI ASSISTANT */}
        {activeTab === 'ai' && (
          <TekelAIView
            onShareAsPost={(text) => {
              setInitialPostContent(text);
              setIsCreateModalOpen(true);
            }}
          />
        )}

      </main>

      {/* Floating / Mobile Bottom Navigation */}
      <BottomNav
        activeTab={activeTab}
        onTabChange={(tab) => {
          if (tab === 'profile') {
            setViewingProfileUserId(null); // Reset to own profile when bottom profile is tapped
          }
          setActiveTab(tab);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        onOpenCreateModal={() => setIsCreateModalOpen(true)}
        unreadMessagesCount={1}
      />

      {/* Post Creation Modal */}
      <CreatePostModal
        isOpen={isCreateModalOpen}
        onClose={() => {
          setIsCreateModalOpen(false);
          setInitialPostContent('');
        }}
        onPostCreated={(post) => {
          handlePostCreated(post);
          setInitialPostContent('');
        }}
        initialContent={initialPostContent}
      />

      {/* Authentication Modal */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
      />

      {/* Notifications Drawer Modal */}
      {isNotificationsOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="w-full max-w-lg bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200 dark:border-zinc-800 shadow-2xl p-5 max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-200 dark:border-zinc-800 mb-3">
              <div className="flex items-center gap-2">
                <Bell className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                <h2 className="text-base font-bold text-zinc-900 dark:text-white">
                  {t('notifications')}
                </h2>
              </div>
              <button
                onClick={() => setIsNotificationsOpen(false)}
                className="p-1.5 rounded-full text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <NotificationsView
              onNotificationClick={() => {
                setIsNotificationsOpen(false);
                setActiveTab('home');
              }}
            />
          </div>
        </div>
      )}

    </div>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <MainApp />
    </AuthProvider>
  );
}
