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
import { TikTokBottomNav } from './components/TikTokBottomNav';
import { TabType } from './components/BottomNav';
import { TikTokFeed } from './components/TikTokFeed';
import { TikTokUploadModal } from './components/TikTokUploadModal';
import { TikTokInboxView } from './components/TikTokInboxView';
import { CommentsDrawer } from './components/CommentsDrawer';
import { ShareDrawer } from './components/ShareDrawer';
import { LiveStreamView } from './components/LiveStreamView';
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
import { X, Bell } from 'lucide-react';

const MainApp: React.FC = () => {
  const { currentUser, t } = useAuth();
  const [activeTab, setActiveTab] = useState<TabType>('home');
  const [activeFeedTab, setActiveFeedTab] = useState<'forYou' | 'following'>('forYou');
  const [posts, setPosts] = useState<Post[]>(INITIAL_POSTS);

  // Modals & Drawers
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [initialPostContent, setInitialPostContent] = useState('');
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isLiveStreamOpen, setIsLiveStreamOpen] = useState(false);
  const [activeCommentPost, setActiveCommentPost] = useState<Post | null>(null);
  const [activeSharePost, setActiveSharePost] = useState<Post | null>(null);

  // Navigation targets
  const [viewingProfileUserId, setViewingProfileUserId] = useState<string | null>(null);
  const [chatTargetUser, setChatTargetUser] = useState<UserProfile | null>(null);

  // Real-time Firestore posts subscription
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
    setActiveTab('home');
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

  return (
    <div className="min-h-screen bg-[#080808] text-zinc-100 flex flex-col font-sans antialiased overflow-x-hidden selection:bg-cyan-500 selection:text-white">
      
      {/* Top Application Bar (Shown on non-home tabs for universal controls) */}
      {activeTab !== 'home' && activeTab !== 'live' && (
        <Navbar
          onOpenSearch={() => setActiveTab('explore')}
          onOpenNotifications={() => setIsNotificationsOpen(true)}
          onOpenAdmin={() => setActiveTab('admin')}
          onOpenAuth={() => setIsAuthModalOpen(true)}
          onOpenAI={() => {
            setActiveTab('ai');
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          unreadCount={2}
        />
      )}

      {/* Main Content Area */}
      <main className="flex-1 w-full flex flex-col">
        
        {/* TAB 1: TIKTOK VERTICAL VIDEO REELS FEED */}
        {activeTab === 'home' && (
          <TikTokFeed
            posts={posts}
            activeFeedTab={activeFeedTab}
            onChangeFeedTab={setActiveFeedTab}
            onOpenLive={() => setIsLiveStreamOpen(true)}
            onOpenSearch={() => setActiveTab('explore')}
            onOpenComments={(p) => setActiveCommentPost(p)}
            onOpenShare={(p) => setActiveSharePost(p)}
            onUserClick={handleUserClick}
            onOpenCreate={() => setIsUploadModalOpen(true)}
          />
        )}

        {/* TAB 2: EXPLORE & SEARCH */}
        {activeTab === 'explore' && (
          <div className="max-w-2xl w-full mx-auto px-3 sm:px-4 pt-3 pb-24">
            <ExploreView
              onUserClick={handleUserClick}
              allPosts={posts}
            />
          </div>
        )}

        {/* TAB 3: INBOX / DIRECT MESSAGING */}
        {activeTab === 'messages' && (
          <div className="w-full">
            {chatTargetUser ? (
              <div className="max-w-2xl mx-auto px-3 sm:px-4 pt-2 pb-24">
                <button
                  onClick={() => setChatTargetUser(null)}
                  className="mb-3 px-3 py-1.5 rounded-full bg-zinc-900 border border-zinc-800 text-xs font-bold text-zinc-300 hover:text-white flex items-center gap-1.5 cursor-pointer"
                >
                  ← ইনবক্সে ফিরে যান
                </button>
                <MessagesView initialChatTarget={chatTargetUser} />
              </div>
            ) : (
              <TikTokInboxView
                onOpenChat={handleNavigateToChat}
                onOpenAuth={() => setIsAuthModalOpen(true)}
              />
            )}
          </div>
        )}

        {/* TAB 4: PROFILE */}
        {activeTab === 'profile' && (
          <div className="max-w-2xl w-full mx-auto px-3 sm:px-4 pt-3 pb-24">
            <ProfileView
              userId={viewingProfileUserId || undefined}
              onNavigateToChat={handleNavigateToChat}
              onPostDeleted={handlePostDeleted}
              allPosts={posts}
            />
          </div>
        )}

        {/* TAB 5: ADMIN DASHBOARD */}
        {activeTab === 'admin' && (
          <div className="max-w-2xl w-full mx-auto px-3 sm:px-4 pt-3 pb-24">
            <AdminDashboard
              posts={posts}
              onPostDeleted={handlePostDeleted}
            />
          </div>
        )}

        {/* TAB 6: TEKEL AI ASSISTANT */}
        {activeTab === 'ai' && (
          <div className="max-w-2xl w-full mx-auto px-3 sm:px-4 pt-3 pb-24">
            <TekelAIView
              onShareAsPost={(text) => {
                setInitialPostContent(text);
                setIsUploadModalOpen(true);
              }}
            />
          </div>
        )}

      </main>

      {/* Floating / Mobile TikTok Bottom Navigation Bar */}
      {!isLiveStreamOpen && activeTab !== 'live' && (
        <TikTokBottomNav
          activeTab={activeTab}
          onTabChange={(tab) => {
            if (tab === 'profile') {
              setViewingProfileUserId(null);
            }
            if (tab === 'create') {
              setIsUploadModalOpen(true);
              return;
            }
            setActiveTab(tab);
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          onOpenCreate={() => setIsUploadModalOpen(true)}
          onOpenAI={() => setActiveTab('ai')}
          unreadCount={2}
        />
      )}

      {/* TIKTOK VIDEO UPLOAD STUDIO MODAL */}
      <TikTokUploadModal
        isOpen={isUploadModalOpen}
        onClose={() => {
          setIsUploadModalOpen(false);
          setInitialPostContent('');
        }}
        onPostCreated={handlePostCreated}
        initialContent={initialPostContent}
      />

      {/* TIKTOK SLIDING COMMENTS DRAWER */}
      <CommentsDrawer
        post={activeCommentPost}
        isOpen={!!activeCommentPost}
        onClose={() => setActiveCommentPost(null)}
        onCommentAdded={() => {
          if (activeCommentPost) {
            setPosts(prev => prev.map(p => p.id === activeCommentPost.id ? { ...p, commentsCount: (p.commentsCount || 0) + 1 } : p));
          }
        }}
      />

      {/* TIKTOK SLIDING SHARE DRAWER */}
      <ShareDrawer
        post={activeSharePost}
        isOpen={!!activeSharePost}
        onClose={() => setActiveSharePost(null)}
        onShareToFeed={(text) => {
          setInitialPostContent(text);
          setIsUploadModalOpen(true);
        }}
      />

      {/* FULL-SCREEN LIVE STREAM ROOM */}
      {(isLiveStreamOpen || activeTab === 'live') && (
        <LiveStreamView
          onClose={() => {
            setIsLiveStreamOpen(false);
            if (activeTab === 'live') setActiveTab('home');
          }}
        />
      )}

      {/* Authentication Modal */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
      />

      {/* Notifications Drawer Modal */}
      {isNotificationsOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xs p-4">
          <div className="w-full max-w-lg bg-zinc-950 rounded-3xl border border-zinc-800 shadow-2xl p-5 max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-800 mb-3">
              <div className="flex items-center gap-2">
                <Bell className="w-5 h-5 text-cyan-400" />
                <h2 className="text-base font-bold text-white">
                  {t('notifications')}
                </h2>
              </div>
              <button
                onClick={() => setIsNotificationsOpen(false)}
                className="p-1.5 rounded-full text-zinc-400 hover:text-white"
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
