import React, { useState, useEffect } from 'react';
import { 
  Shield, 
  Users, 
  FileText, 
  Activity, 
  AlertTriangle, 
  CheckCircle2, 
  Trash2, 
  UserX, 
  UserCheck, 
  Send, 
  Lock, 
  Sparkles, 
  BadgeCheck, 
  Radio 
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { UserProfile, Post } from '../types';
import { FirestoreService } from '../services/firestore';
import { convertNumberToBengali } from '../utils/translations';
import { SAMPLE_USERS } from '../utils/mockData';

interface AdminDashboardProps {
  posts: Post[];
  onPostDeleted: (postId: string) => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ posts, onPostDeleted }) => {
  const { currentUser, isAdmin, loginAsDemoUser, t, language } = useAuth();
  const [usersList, setUsersList] = useState<UserProfile[]>([]);
  const [broadcastText, setBroadcastText] = useState('');
  const [broadcastSuccess, setBroadcastSuccess] = useState(false);
  const [activeTab, setActiveTab] = useState<'users' | 'moderation' | 'broadcast'>('users');

  useEffect(() => {
    FirestoreService.getAllUsers().then(setUsersList);
  }, []);

  if (!isAdmin) {
    return (
      <div className="max-w-md mx-auto my-12 p-6 bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200 dark:border-zinc-800 text-center shadow-md">
        <div className="w-14 h-14 mx-auto rounded-2xl bg-amber-500/10 text-amber-500 flex items-center justify-center mb-3">
          <Lock className="w-7 h-7" />
        </div>
        <h2 className="text-lg font-bold text-zinc-900 dark:text-white mb-1.5">
          {t('notAuthorized')}
        </h2>
        <p className="text-xs text-zinc-500 dark:text-zinc-400 mb-5 leading-relaxed">
          অ্যাডমিন ড্যাশবোর্ড কেবল প্ল্যাটফর্ম প্রশাসকদের জন্য উন্মুক্ত। আপনি নিচের বোতামে ক্লিক করে তাৎক্ষণিকভাবে অ্যাডমিন অ্যাকাউন্টে প্রবেশ করতে পারেন:
        </p>
        <button
          onClick={() => loginAsDemoUser(SAMPLE_USERS[0])}
          className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-700 hover:to-teal-600 text-white font-bold text-xs sm:text-sm shadow-md transition-all cursor-pointer"
        >
          মেহেদী হাসান (অ্যাডমিন) হিসেবে দেখুন
        </button>
      </div>
    );
  }

  const handleToggleBan = async (user: UserProfile) => {
    const nextStatus = !user.isBanned;
    setUsersList(prev => prev.map(u => u.uid === user.uid ? { ...u, isBanned: nextStatus } : u));
    await FirestoreService.updateUserRoleOrStatus(user.uid, { isBanned: nextStatus });
  };

  const handleToggleVerified = async (user: UserProfile) => {
    const nextVerified = !user.isVerified;
    setUsersList(prev => prev.map(u => u.uid === user.uid ? { ...u, isVerified: nextVerified } : u));
    await FirestoreService.updateUserRoleOrStatus(user.uid, { isVerified: nextVerified });
  };

  const handleToggleAdminRole = async (user: UserProfile) => {
    const nextRole = user.role === 'admin' ? 'user' : 'admin';
    setUsersList(prev => prev.map(u => u.uid === user.uid ? { ...u, role: nextRole } : u));
    await FirestoreService.updateUserRoleOrStatus(user.uid, { role: nextRole });
  };

  const handleSendBroadcast = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!broadcastText.trim()) return;

    // Send broadcast notification to all users
    usersList.forEach(u => {
      FirestoreService.createNotification({
        recipientId: u.uid,
        senderId: currentUser?.uid || 'admin',
        senderName: 'টেকেল লাইভ অ্যাডমিন',
        senderPhoto: currentUser?.photoURL || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200&auto=format&fit=crop&q=80',
        type: 'admin',
        message: broadcastText.trim(),
      });
    });

    setBroadcastText('');
    setBroadcastSuccess(true);
    setTimeout(() => setBroadcastSuccess(false), 3000);
  };

  const totalInteractions = posts.reduce((sum, p) => sum + p.likesCount + p.commentsCount + p.sharesCount, 0);

  return (
    <div className="max-w-4xl mx-auto pb-24 space-y-5">
      
      {/* Admin Header Banner */}
      <div className="p-5 bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 rounded-3xl text-white shadow-md relative overflow-hidden">
        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-1">
            <span className="p-1 rounded-lg bg-white/20">
              <Shield className="w-4 h-4 text-white" />
            </span>
            <span className="text-xs uppercase font-bold tracking-wider text-emerald-100">
              সুপার অ্যাডমিন মোড
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold mb-1">
            {t('adminTitle')}
          </h1>
          <p className="text-xs sm:text-sm text-emerald-100/90 max-w-xl">
            {t('adminSubtitle')}
          </p>
        </div>
      </div>

      {/* Analytics KPI Stat Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-4 bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-2xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-zinc-500 dark:text-zinc-400">
              {t('totalUsers')}
            </span>
            <Users className="w-4 h-4 text-emerald-500" />
          </div>
          <span className="text-xl sm:text-2xl font-bold text-zinc-900 dark:text-white">
            {language === 'bn' ? convertNumberToBengali(usersList.length || 4) : usersList.length || 4}
          </span>
        </div>

        <div className="p-4 bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-2xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-zinc-500 dark:text-zinc-400">
              {t('totalPosts')}
            </span>
            <FileText className="w-4 h-4 text-teal-500" />
          </div>
          <span className="text-xl sm:text-2xl font-bold text-zinc-900 dark:text-white">
            {language === 'bn' ? convertNumberToBengali(posts.length) : posts.length}
          </span>
        </div>

        <div className="p-4 bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-2xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-zinc-500 dark:text-zinc-400">
              {t('totalInteractions')}
            </span>
            <Activity className="w-4 h-4 text-cyan-500" />
          </div>
          <span className="text-xl sm:text-2xl font-bold text-zinc-900 dark:text-white">
            {language === 'bn' ? convertNumberToBengali(totalInteractions) : totalInteractions}
          </span>
        </div>

        <div className="p-4 bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-2xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-zinc-500 dark:text-zinc-400">
              {t('pendingReports')}
            </span>
            <AlertTriangle className="w-4 h-4 text-amber-500" />
          </div>
          <span className="text-xl sm:text-2xl font-bold text-emerald-600 dark:text-emerald-400">
            {language === 'bn' ? '০ টি' : '0'}
          </span>
        </div>
      </div>

      {/* Admin Tab Switcher */}
      <div className="flex p-1 bg-zinc-100 dark:bg-zinc-850 rounded-2xl">
        <button
          onClick={() => setActiveTab('users')}
          className={`flex-1 py-2 text-xs sm:text-sm font-bold rounded-xl transition-all ${
            activeTab === 'users'
              ? 'bg-white dark:bg-zinc-700 text-emerald-600 dark:text-emerald-400 shadow-xs'
              : 'text-zinc-600 dark:text-zinc-400'
          }`}
        >
          {t('userManagement')}
        </button>

        <button
          onClick={() => setActiveTab('moderation')}
          className={`flex-1 py-2 text-xs sm:text-sm font-bold rounded-xl transition-all ${
            activeTab === 'moderation'
              ? 'bg-white dark:bg-zinc-700 text-emerald-600 dark:text-emerald-400 shadow-xs'
              : 'text-zinc-600 dark:text-zinc-400'
          }`}
        >
          {t('contentModeration')}
        </button>

        <button
          onClick={() => setActiveTab('broadcast')}
          className={`flex-1 py-2 text-xs sm:text-sm font-bold rounded-xl transition-all ${
            activeTab === 'broadcast'
              ? 'bg-white dark:bg-zinc-700 text-emerald-600 dark:text-emerald-400 shadow-xs'
              : 'text-zinc-600 dark:text-zinc-400'
          }`}
        >
          {t('broadcastNotice')}
        </button>
      </div>

      {/* TAB 1: USER MANAGEMENT */}
      {activeTab === 'users' && (
        <div className="bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200 dark:border-zinc-800 p-5 shadow-xs">
          <h2 className="text-sm font-bold text-zinc-900 dark:text-white mb-4">
            সকল নিবন্ধিত ব্যবহারকারী তালিকা
          </h2>

          <div className="space-y-3">
            {usersList.map((user) => (
              <div
                key={user.uid}
                className="flex flex-col sm:flex-row sm:items-center justify-between p-3.5 rounded-2xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200/80 dark:border-zinc-700/60 gap-3"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <img
                    src={user.photoURL}
                    alt=""
                    className="w-11 h-11 rounded-full object-cover ring-2 ring-emerald-500/30 shrink-0"
                  />
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span className="font-bold text-sm text-zinc-900 dark:text-zinc-100 truncate">
                        {user.displayName}
                      </span>
                      {user.isVerified && (
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 fill-emerald-500/20 shrink-0" />
                      )}
                      <span
                        className={`text-[10px] font-bold px-1.5 py-0.5 rounded-md ${
                          user.role === 'admin'
                            ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                            : 'bg-zinc-200 dark:bg-zinc-700 text-zinc-700 dark:text-zinc-300'
                        }`}
                      >
                        {user.role}
                      </span>
                    </div>
                    <p className="text-xs text-zinc-500 dark:text-zinc-400">@{user.username}</p>
                    <p className="text-[11px] text-zinc-400 truncate">{user.email}</p>
                  </div>
                </div>

                {/* Admin Action Buttons */}
                <div className="flex items-center gap-1.5 shrink-0 flex-wrap">
                  <button
                    onClick={() => handleToggleVerified(user)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1 transition-all ${
                      user.isVerified
                        ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300'
                        : 'bg-zinc-200 dark:bg-zinc-700 text-zinc-700 dark:text-zinc-300'
                    }`}
                  >
                    <BadgeCheck className="w-3.5 h-3.5" />
                    <span>{user.isVerified ? 'যাচাইকৃত' : 'যাচাই করুন'}</span>
                  </button>

                  <button
                    onClick={() => handleToggleAdminRole(user)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1 transition-all ${
                      user.role === 'admin'
                        ? 'bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300'
                        : 'bg-zinc-200 dark:bg-zinc-700 text-zinc-700 dark:text-zinc-300'
                    }`}
                  >
                    <Shield className="w-3.5 h-3.5" />
                    <span>{user.role === 'admin' ? 'অ্যাডমিন' : 'মেম্বার'}</span>
                  </button>

                  <button
                    onClick={() => handleToggleBan(user)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1 transition-all ${
                      user.isBanned
                        ? 'bg-emerald-600 text-white'
                        : 'bg-rose-100 dark:bg-rose-950/80 text-rose-700 dark:text-rose-300 hover:bg-rose-200'
                    }`}
                  >
                    {user.isBanned ? (
                      <>
                        <UserCheck className="w-3.5 h-3.5" />
                        <span>সক্রিয় করুন</span>
                      </>
                    ) : (
                      <>
                        <UserX className="w-3.5 h-3.5" />
                        <span>স্থগিত</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 2: CONTENT MODERATION */}
      {activeTab === 'moderation' && (
        <div className="bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200 dark:border-zinc-800 p-5 shadow-xs">
          <h2 className="text-sm font-bold text-zinc-900 dark:text-white mb-4">
            সাম্প্রতিক পোস্টসমূহ ও সরাসরি মডারেশন
          </h2>

          <div className="space-y-3">
            {posts.map((post) => (
              <div
                key={post.id}
                className="flex items-start justify-between p-3.5 rounded-2xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200/80 dark:border-zinc-700/60 gap-3"
              >
                <div className="flex items-start gap-3 min-w-0">
                  <img
                    src={post.authorPhoto}
                    alt=""
                    className="w-10 h-10 rounded-full object-cover shrink-0 mt-0.5"
                  />
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-zinc-900 dark:text-zinc-100">
                      {post.authorName} <span className="text-zinc-400 font-normal">(@{post.authorUsername})</span>
                    </p>
                    <p className="text-xs text-zinc-700 dark:text-zinc-300 line-clamp-2 mt-0.5">
                      {post.content}
                    </p>
                    <div className="flex items-center gap-3 text-[11px] text-zinc-400 mt-1">
                      <span>ধরন: {post.type}</span>
                      <span>লাইক: {post.likesCount}</span>
                      <span>মন্তব্য: {post.commentsCount}</span>
                    </div>
                  </div>
                </div>

                <button
                  onClick={async () => {
                    if (confirm('অ্যাডমিন হিসেবে এই পোস্টটি অপসারণ করতে চান?')) {
                      await FirestoreService.deletePost(post.id);
                      onPostDeleted(post.id);
                    }
                  }}
                  className="p-2 rounded-xl text-rose-600 bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/60 dark:hover:bg-rose-950 transition-colors shrink-0"
                  title="মুছে ফেলুন"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: BROADCAST ANNOUNCEMENT */}
      {activeTab === 'broadcast' && (
        <div className="bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200 dark:border-zinc-800 p-5 shadow-xs">
          <div className="flex items-center gap-2 mb-2">
            <span className="p-1.5 rounded-xl bg-cyan-500/10 text-cyan-600 dark:text-cyan-400">
              <Radio className="w-4 h-4" />
            </span>
            <h2 className="text-sm font-bold text-zinc-900 dark:text-white">
              {t('broadcastNotice')}
            </h2>
          </div>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mb-4">
            এখানে কোনো বার্তা পোস্ট করলে সকল টেকেল লাইভ ব্যবহারকারীর নোটিফিকেশন বক্সে লাল নোটিশ আকারে প্রদর্শিত হবে।
          </p>

          {broadcastSuccess && (
            <div className="p-3 mb-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/80 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 text-xs font-semibold">
              বিজ্ঞপ্তিটি সফলভাবে সকল ব্যবহারকারীর কাছে পাঠানো হয়েছে!
            </div>
          )}

          <form onSubmit={handleSendBroadcast} className="space-y-3">
            <textarea
              rows={4}
              required
              value={broadcastText}
              onChange={(e) => setBroadcastText(e.target.value)}
              placeholder={t('broadcastPlaceholder')}
              className="w-full p-3.5 text-xs sm:text-sm rounded-2xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100 focus:ring-2 focus:ring-emerald-500 resize-none"
            />

            <button
              type="submit"
              disabled={!broadcastText.trim()}
              className="py-2.5 px-5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs sm:text-sm shadow-md flex items-center gap-2 disabled:opacity-50 transition-all cursor-pointer"
            >
              <Send className="w-4 h-4" />
              <span>{t('sendBroadcast')}</span>
            </button>
          </form>
        </div>
      )}

    </div>
  );
};
