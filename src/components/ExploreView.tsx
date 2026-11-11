import React, { useState, useEffect } from 'react';
import { 
  Search, 
  TrendingUp, 
  UserPlus, 
  UserCheck, 
  CheckCircle2, 
  Compass, 
  Sparkles, 
  Hash, 
  Play, 
  X 
} from 'lucide-react';
import { UserProfile, Post } from '../types';
import { useAuth } from '../contexts/AuthContext';
import { FirestoreService } from '../services/firestore';
import { SAMPLE_USERS } from '../utils/mockData';

interface ExploreViewProps {
  onUserClick: (userId: string) => void;
  allPosts: Post[];
}

const TRENDING_TOPICS = [
  { tag: '#বাংলাদেশ', postsCount: '১২.৫ হাজার' },
  { tag: '#মেট্রোরেল', postsCount: '৮.২ হাজার' },
  { tag: '#সাজেকভ্যালি', postsCount: '৬.১ হাজার' },
  { tag: '#টেকেললাইভ', postsCount: '৫.৪ হাজার' },
  { tag: '#টাইগার্সক্রিকেট', postsCount: '৪.৯ হাজার' },
];

export const ExploreView: React.FC<ExploreViewProps> = ({ onUserClick, allPosts }) => {
  const { currentUser, t } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<UserProfile[]>([]);
  const [suggestedUsers, setSuggestedUsers] = useState<UserProfile[]>([]);
  const [followingMap, setFollowingMap] = useState<Record<string, boolean>>({});

  useEffect(() => {
    // Suggested users: all sample users except currentUser
    const list = SAMPLE_USERS.filter(u => u.uid !== currentUser?.uid);
    setSuggestedUsers(list);

    // Initial check on following status
    if (currentUser) {
      list.forEach(u => {
        FirestoreService.checkIsFollowing(currentUser.uid, u.uid).then(res => {
          setFollowingMap(prev => ({ ...prev, [u.uid]: res }));
        });
      });
    }
  }, [currentUser]);

  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      return;
    }
    const timer = setTimeout(() => {
      FirestoreService.searchUsers(searchQuery).then(results => {
        setSearchResults(results.filter(u => u.uid !== currentUser?.uid));
      });
    }, 250);
    return () => clearTimeout(timer);
  }, [searchQuery, currentUser]);

  const handleToggleFollow = async (targetUser: UserProfile) => {
    if (!currentUser) return;
    const isCurrentlyFollowing = !!followingMap[targetUser.uid];
    const nextState = !isCurrentlyFollowing;

    setFollowingMap(prev => ({ ...prev, [targetUser.uid]: nextState }));
    await FirestoreService.toggleFollow(currentUser.uid, targetUser.uid, isCurrentlyFollowing);
  };

  const mediaPosts = allPosts.filter(p => p.type === 'photo' || p.type === 'video');

  return (
    <div className="max-w-2xl mx-auto pb-24 space-y-5">
      
      {/* Search Input Bar */}
      <div className="relative">
        <Search className="w-5 h-5 text-emerald-600 dark:text-emerald-400 absolute left-4 top-3.5" />
        <input
          type="text"
          placeholder={t('searchPlaceholder')}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-11 pr-10 py-3 text-sm rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-white placeholder-zinc-400 shadow-xs focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
        />
        {searchQuery && (
          <button
            onClick={() => setSearchQuery('')}
            className="absolute right-3 top-3 p-1 rounded-full text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* If Search is Active: Show User Search Results */}
      {searchQuery.trim() ? (
        <div className="bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200 dark:border-zinc-800 p-4 shadow-xs">
          <h2 className="text-xs font-bold text-zinc-400 uppercase tracking-wider mb-3 px-1">
            অনুসন্ধান ফলাফল
          </h2>
          {searchResults.length === 0 ? (
            <p className="text-xs text-zinc-400 text-center py-6">{t('noUsersFound')}</p>
          ) : (
            <div className="divide-y divide-zinc-100 dark:divide-zinc-800/80">
              {searchResults.map(user => (
                <div
                  key={user.uid}
                  className="flex items-center justify-between py-3 px-1 hover:bg-zinc-50 dark:hover:bg-zinc-800/40 rounded-xl transition-colors"
                >
                  <div
                    onClick={() => onUserClick(user.uid)}
                    className="flex items-center gap-3 cursor-pointer group flex-1 min-w-0"
                  >
                    <img
                      src={user.photoURL}
                      alt=""
                      className="w-11 h-11 rounded-full object-cover ring-2 ring-emerald-500/20 group-hover:ring-emerald-500"
                    />
                    <div className="min-w-0">
                      <div className="flex items-center gap-1">
                        <span className="font-bold text-sm text-zinc-900 dark:text-zinc-100 truncate">
                          {user.displayName}
                        </span>
                        {user.isVerified && (
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 fill-emerald-500/20 shrink-0" />
                        )}
                      </div>
                      <span className="text-xs text-zinc-400 truncate block">@{user.username}</span>
                    </div>
                  </div>

                  <button
                    onClick={() => handleToggleFollow(user)}
                    className={`ml-3 px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all shrink-0 ${
                      followingMap[user.uid]
                        ? 'bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300'
                        : 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs'
                    }`}
                  >
                    {followingMap[user.uid] ? t('followingBtn') : t('follow')}
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      ) : (
        <>
          {/* Trending Topics & Hashtags */}
          <div className="bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200 dark:border-zinc-800 p-4 shadow-xs">
            <div className="flex items-center gap-2 mb-3">
              <span className="p-1.5 rounded-xl bg-amber-500/10 text-amber-500">
                <TrendingUp className="w-4 h-4" />
              </span>
              <h2 className="text-sm font-bold text-zinc-900 dark:text-white">
                {t('trendingTopics')}
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {TRENDING_TOPICS.map((item) => (
                <div
                  key={item.tag}
                  onClick={() => setSearchQuery(item.tag)}
                  className="flex items-center justify-between p-3 rounded-2xl bg-zinc-50 dark:bg-zinc-800/60 hover:bg-emerald-50 hover:border-emerald-200 dark:hover:bg-emerald-950/40 border border-zinc-200/60 dark:border-zinc-700/60 cursor-pointer transition-all"
                >
                  <div className="flex items-center gap-2">
                    <span className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-xs">
                      <Hash className="w-3.5 h-3.5" />
                    </span>
                    <span className="text-xs sm:text-sm font-bold text-zinc-900 dark:text-zinc-100">
                      {item.tag}
                    </span>
                  </div>
                  <span className="text-[11px] text-zinc-400 font-medium">{item.postsCount} পোস্ট</span>
                </div>
              ))}
            </div>
          </div>

          {/* Suggested Users To Follow */}
          <div className="bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200 dark:border-zinc-800 p-4 shadow-xs">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <span className="p-1.5 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                  <Sparkles className="w-4 h-4" />
                </span>
                <h2 className="text-sm font-bold text-zinc-900 dark:text-white">
                  {t('suggestedUsers')}
                </h2>
              </div>
            </div>

            <div className="space-y-3">
              {suggestedUsers.map((user) => (
                <div
                  key={user.uid}
                  className="flex items-center justify-between p-2.5 rounded-2xl hover:bg-zinc-50 dark:hover:bg-zinc-800/40 transition-colors"
                >
                  <div
                    onClick={() => onUserClick(user.uid)}
                    className="flex items-center gap-3 cursor-pointer group flex-1 min-w-0"
                  >
                    <img
                      src={user.photoURL}
                      alt=""
                      className="w-11 h-11 rounded-full object-cover ring-2 ring-emerald-500/20 group-hover:ring-emerald-500"
                    />
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="font-bold text-xs sm:text-sm text-zinc-900 dark:text-zinc-100 truncate">
                          {user.displayName}
                        </span>
                        {user.isVerified && (
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 fill-emerald-500/20 shrink-0" />
                        )}
                      </div>
                      <p className="text-[11px] text-zinc-400 truncate max-w-xs">{user.bio}</p>
                    </div>
                  </div>

                  <button
                    onClick={() => handleToggleFollow(user)}
                    className={`ml-2 px-3 py-1.5 rounded-full text-xs font-semibold transition-all shrink-0 ${
                      followingMap[user.uid]
                        ? 'bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300'
                        : 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs'
                    }`}
                  >
                    {followingMap[user.uid] ? (
                      <span className="flex items-center gap-1">
                        <UserCheck className="w-3 h-3" />
                        {t('followingBtn')}
                      </span>
                    ) : (
                      <span className="flex items-center gap-1">
                        <UserPlus className="w-3 h-3" />
                        {t('follow')}
                      </span>
                    )}
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Visual Discovery Grid (Videos & Reels) */}
          <div className="bg-zinc-950/90 rounded-3xl border border-zinc-800/80 p-4 shadow-xl">
            <h2 className="text-sm font-extrabold text-white mb-3 flex items-center gap-2">
              <Compass className="w-4 h-4 text-cyan-400" />
              <span>জনপ্রিয় শর্ট ভিডিও ও রিলস</span>
            </h2>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
              {mediaPosts.map((post) => (
                <div
                  key={post.id}
                  onClick={() => onUserClick(post.authorId)}
                  className="relative rounded-2xl overflow-hidden aspect-[9/16] bg-black border border-zinc-800 group cursor-pointer shadow-md"
                >
                  {post.videoUrl ? (
                    <>
                      <video src={post.videoUrl} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                      <div className="absolute top-2 right-2 p-1.5 rounded-full bg-black/60 text-white backdrop-blur-xs">
                        <Play className="w-3.5 h-3.5 fill-white" />
                      </div>
                    </>
                  ) : (
                    <img
                      src={post.mediaUrl}
                      alt=""
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-transparent to-transparent flex flex-col justify-end p-2.5">
                    <span className="text-[11px] text-white font-extrabold truncate drop-shadow-xs">
                      @{post.authorUsername}
                    </span>
                    <span className="text-[10px] text-zinc-300 line-clamp-1">
                      {post.content}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </>
      )}

    </div>
  );
};
