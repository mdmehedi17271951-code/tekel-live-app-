import React, { useState, useEffect } from 'react';
import { 
  Bell, 
  MessageSquare, 
  Heart, 
  UserPlus, 
  AtSign, 
  Shield, 
  ArrowRight,
  Sparkles
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { FirestoreService } from '../services/firestore';
import { NotificationItem, Conversation, UserProfile } from '../types';
import { SAMPLE_USERS } from '../utils/mockData';

interface TikTokInboxViewProps {
  onOpenChat: (user: UserProfile) => void;
  onOpenAuth: () => void;
}

export const TikTokInboxView: React.FC<TikTokInboxViewProps> = ({
  onOpenChat,
  onOpenAuth,
}) => {
  const { currentUser, t } = useAuth();
  const [activeFilter, setActiveFilter] = useState<'all' | 'likes' | 'comments' | 'followers'>('all');
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [conversations, setConversations] = useState<Conversation[]>([]);

  useEffect(() => {
    if (currentUser) {
      FirestoreService.fetchNotifications(currentUser.uid).then(list => {
        if (list.length > 0) {
          setNotifications(list);
        } else {
          // Default realistic TikTok activity notifications
          setNotifications([
            {
              id: 'n1',
              recipientId: currentUser.uid,
              senderId: 'u_1',
              senderName: 'সাকিব চৌধুরী',
              senderPhoto: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&auto=format&fit=crop&q=80',
              type: 'like',
              message: 'আপনার ভিডিও পছন্দ করেছেন।',
              read: false,
              createdAt: new Date(Date.now() - 1000 * 60 * 12).toISOString(),
            },
            {
              id: 'n2',
              recipientId: currentUser.uid,
              senderId: 'u_2',
              senderName: 'তানিয়া আক্তার',
              senderPhoto: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&auto=format&fit=crop&q=80',
              type: 'comment',
              message: 'আপনার ভিডিওতে মন্তব্য করেছেন: "অসাধারণ! 🔥"',
              read: true,
              createdAt: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
            },
            {
              id: 'n3',
              recipientId: currentUser.uid,
              senderId: 'u_3',
              senderName: 'আবির আহমেদ',
              senderPhoto: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80',
              type: 'follow',
              message: 'আপনাকে অনুসরণ করা শুরু করেছেন।',
              read: true,
              createdAt: new Date(Date.now() - 1000 * 60 * 180).toISOString(),
            }
          ]);
        }
      });
    }
  }, [currentUser]);

  if (!currentUser) {
    return (
      <div className="w-full h-full min-h-[80vh] flex flex-col items-center justify-center p-6 text-center bg-[#080808] text-white">
        <div className="w-16 h-16 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center mb-4 text-cyan-400">
          <MessageSquare className="w-8 h-8" />
        </div>
        <h3 className="text-lg font-bold mb-2">ইনবক্স বার্তা ও নোটিফিকেশন</h3>
        <p className="text-sm text-zinc-400 max-w-xs mb-6">
          আপনার নোটিফিকেশন ও বন্ধুদের ব্যক্তিগত বার্তা দেখতে অনুগ্রহ করে লগইন করুন।
        </p>
        <button
          onClick={onOpenAuth}
          className="px-6 py-2.5 rounded-full bg-gradient-to-r from-cyan-500 to-emerald-500 text-white font-bold text-sm shadow-lg shadow-cyan-500/20 active:scale-95"
        >
          {t('login')}
        </button>
      </div>
    );
  }

  const filteredNotifs = notifications.filter(n => {
    if (activeFilter === 'likes') return n.type === 'like';
    if (activeFilter === 'comments') return n.type === 'comment';
    if (activeFilter === 'followers') return n.type === 'follow';
    return true;
  });

  return (
    <div className="w-full max-w-xl mx-auto min-h-screen bg-[#080808] text-white p-4 pb-28 pt-safe">
      
      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b border-zinc-800/80 mb-4">
        <div>
          <h1 className="text-xl font-black tracking-tight text-white flex items-center gap-2">
            ইনবক্স
            <span className="w-2 h-2 rounded-full bg-cyan-400" />
          </h1>
          <p className="text-xs text-zinc-400 mt-0.5">সব কার্যকলাপ ও ডিরেক্ট মেসেজ</p>
        </div>
      </div>

      {/* Activity Filter Chips */}
      <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-3">
        {[
          { key: 'all', label: 'সব নোটিফিকেশন' },
          { key: 'likes', label: 'লাইক' },
          { key: 'comments', label: 'মন্তব্য' },
          { key: 'followers', label: 'নতুন অনুসারী' },
        ].map((f) => (
          <button
            key={f.key}
            onClick={() => setActiveFilter(f.key as any)}
            className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all shrink-0 cursor-pointer ${
              activeFilter === f.key
                ? 'bg-gradient-to-r from-cyan-500 to-emerald-500 text-white shadow-md'
                : 'bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white'
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* DIRECT MESSAGES QUICK ROW */}
      <div className="mb-6 pt-2">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-xs font-extrabold text-zinc-300 uppercase tracking-wider">
            সরাসরি বার্তা পাঠান
          </h3>
          <span className="text-[11px] text-cyan-400 font-bold">অনলাইন</span>
        </div>

        <div className="flex items-center gap-3 overflow-x-auto no-scrollbar py-1">
          {SAMPLE_USERS.filter(u => u.uid !== currentUser.uid).map((friend) => (
            <div
              key={friend.uid}
              onClick={() => onOpenChat(friend)}
              className="flex flex-col items-center gap-1.5 shrink-0 cursor-pointer group"
            >
              <div className="relative">
                <img
                  src={friend.photoURL}
                  alt={friend.displayName}
                  className="w-12 h-12 rounded-full object-cover ring-2 ring-zinc-800 group-hover:ring-cyan-400 transition-all"
                />
                <span className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-emerald-500 ring-2 ring-zinc-950" />
              </div>
              <span className="text-[11px] text-zinc-300 font-medium truncate w-14 text-center">
                {friend.displayName.split(' ')[0]}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* NOTIFICATIONS LIST */}
      <div className="space-y-3">
        <h3 className="text-xs font-extrabold text-zinc-300 uppercase tracking-wider mb-2">
          সাম্প্রতিক আপডেট
        </h3>

        {filteredNotifs.length === 0 ? (
          <div className="p-8 text-center text-zinc-500 text-xs bg-zinc-950/60 rounded-2xl border border-zinc-900">
            এই ক্যাটাগরিতে কোনো নোটিফিকেশন নেই।
          </div>
        ) : (
          filteredNotifs.map((n) => (
            <div
              key={n.id}
              className={`flex items-center justify-between p-3.5 rounded-2xl border transition-all ${
                n.read 
                  ? 'bg-zinc-950/40 border-zinc-900' 
                  : 'bg-zinc-900/80 border-cyan-500/20 shadow-sm'
              }`}
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className="relative shrink-0">
                  <img
                    src={n.senderPhoto}
                    alt={n.senderName}
                    className="w-11 h-11 rounded-full object-cover ring-1 ring-zinc-800"
                  />
                  <span className={`absolute -bottom-1 -right-1 p-1 rounded-full text-white text-[10px] ${
                    n.type === 'like' ? 'bg-rose-500' : n.type === 'comment' ? 'bg-cyan-500' : 'bg-emerald-500'
                  }`}>
                    {n.type === 'like' && <Heart className="w-2.5 h-2.5 fill-white" />}
                    {n.type === 'comment' && <MessageSquare className="w-2.5 h-2.5 fill-white" />}
                    {n.type === 'follow' && <UserPlus className="w-2.5 h-2.5" />}
                  </span>
                </div>

                <div className="min-w-0">
                  <p className="text-xs font-bold text-white truncate">
                    {n.senderName}
                  </p>
                  <p className="text-xs text-zinc-300 font-normal line-clamp-1">
                    {n.message}
                  </p>
                  <span className="text-[10px] text-zinc-500">
                    {new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              </div>

              {n.type === 'follow' ? (
                <button
                  onClick={() => {
                    const target = SAMPLE_USERS.find(u => u.uid === n.senderId) || SAMPLE_USERS[0];
                    onOpenChat(target);
                  }}
                  className="px-3 py-1.5 rounded-full bg-cyan-500/20 text-cyan-400 hover:bg-cyan-500 hover:text-white text-xs font-bold transition-all shrink-0"
                >
                  মেসেজ
                </button>
              ) : (
                <span className="w-2 h-2 rounded-full bg-cyan-400 shrink-0 ml-2" />
              )}
            </div>
          ))
        )}
      </div>

    </div>
  );
};
