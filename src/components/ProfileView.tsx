import React, { useState, useEffect } from 'react';
import { 
  Edit3, 
  CheckCircle2, 
  Calendar, 
  Grid, 
  Image as ImageIcon, 
  Heart, 
  MessageSquare, 
  UserPlus, 
  UserCheck, 
  X, 
  Save, 
  Camera,
  Bookmark
} from 'lucide-react';
import { UserProfile, Post } from '../types';
import { useAuth } from '../contexts/AuthContext';
import { PostCard } from './PostCard';
import { FirestoreService } from '../services/firestore';
import { convertNumberToBengali } from '../utils/translations';
import { PRESET_AVATARS, PRESET_COVERS } from '../utils/mockData';

interface ProfileViewProps {
  userId?: string;
  onNavigateToChat?: (targetUser: UserProfile) => void;
  onPostDeleted?: (postId: string) => void;
  allPosts: Post[];
}

export const ProfileView: React.FC<ProfileViewProps> = ({
  userId,
  onNavigateToChat,
  onPostDeleted,
  allPosts,
}) => {
  const { currentUser, updateProfileData, t, language } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(currentUser);
  const [activeTab, setActiveTab] = useState<'posts' | 'media' | 'liked' | 'saved'>('posts');
  const [savedPostIds, setSavedPostIds] = useState<string[]>([]);
  const [isEditing, setIsEditing] = useState(false);
  const [isFollowing, setIsFollowing] = useState(false);

  // Edit form state
  const [editName, setEditName] = useState('');
  const [editBio, setEditBio] = useState('');
  const [editPhoto, setEditPhoto] = useState('');
  const [editCover, setEditCover] = useState('');

  const isOwnProfile = !userId || (currentUser && currentUser.uid === userId);

  useEffect(() => {
    if (isOwnProfile && currentUser) {
      setProfile(currentUser);
      setEditName(currentUser.displayName);
      setEditBio(currentUser.bio || '');
      setEditPhoto(currentUser.photoURL);
      setEditCover(currentUser.coverURL || '');
      FirestoreService.fetchSavedPostIds(currentUser.uid).then(setSavedPostIds);
    } else if (userId) {
      // Find user from Firestore or mock
      FirestoreService.searchUsers(userId).then(users => {
        const found = users.find(u => u.uid === userId);
        if (found) {
          setProfile(found);
          if (currentUser) {
            FirestoreService.checkIsFollowing(currentUser.uid, found.uid).then(setIsFollowing);
          }
          FirestoreService.fetchSavedPostIds(found.uid).then(setSavedPostIds);
        }
      });
    }
  }, [userId, isOwnProfile, currentUser]);

  const handleToggleSaveInProfile = (postId: string, isSaved: boolean) => {
    setSavedPostIds(prev =>
      isSaved ? Array.from(new Set([...prev, postId])) : prev.filter(id => id !== postId)
    );
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile) return;
    await updateProfileData({
      displayName: editName.trim() || profile.displayName,
      bio: editBio.trim(),
      photoURL: editPhoto || profile.photoURL,
      coverURL: editCover || profile.coverURL,
    });
    setIsEditing(false);
  };

  const handleToggleFollow = async () => {
    if (!currentUser || !profile) return;
    const nextState = !isFollowing;
    setIsFollowing(nextState);
    setProfile(prev => prev ? {
      ...prev,
      followersCount: nextState ? prev.followersCount + 1 : Math.max(0, prev.followersCount - 1)
    } : null);
    await FirestoreService.toggleFollow(currentUser.uid, profile.uid, !nextState);
  };

  if (!profile) {
    return (
      <div className="py-12 text-center text-zinc-500">
        ব্যবহারকারীর তথ্য লোড হচ্ছে...
      </div>
    );
  }

  const userPosts = allPosts.filter(p => p.authorId === profile.uid);
  const mediaPosts = userPosts.filter(p => p.type === 'photo' || p.type === 'video');
  const savedPosts = allPosts.filter(p => savedPostIds.includes(p.id));

  return (
    <div className="max-w-2xl mx-auto pb-24">
      {/* Cover Banner */}
      <div className="relative w-full h-44 sm:h-56 bg-zinc-800 rounded-3xl overflow-hidden shadow-xs">
        <img
          src={profile.coverURL || 'https://images.unsplash.com/photo-1518495973542-4542c06a5843?w=1000&auto=format&fit=crop&q=80'}
          alt="Cover"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
      </div>

      {/* Profile Header Details */}
      <div className="relative px-5 pb-4 -mt-16 sm:-mt-20">
        <div className="flex flex-col sm:flex-row items-center sm:items-end justify-between gap-4">
          
          {/* Avatar and Info */}
          <div className="flex flex-col sm:flex-row items-center sm:items-end gap-3 text-center sm:text-left">
            <div className="relative">
              <img
                src={profile.photoURL}
                alt={profile.displayName}
                className="w-28 h-28 sm:w-32 sm:h-32 rounded-full object-cover ring-4 ring-white dark:ring-zinc-950 shadow-xl"
              />
              {isOwnProfile && (
                <button
                  onClick={() => setIsEditing(true)}
                  className="absolute bottom-1 right-1 p-2 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white shadow-md transition-colors"
                  title="ছবি পরিবর্তন"
                >
                  <Camera className="w-4 h-4" />
                </button>
              )}
            </div>

            <div className="mt-2 sm:mb-2">
              <div className="flex items-center justify-center sm:justify-start gap-1.5">
                <h1 className="text-xl sm:text-2xl font-bold text-zinc-900 dark:text-white">
                  {profile.displayName}
                </h1>
                {(profile.isVerified || profile.role === 'admin') && (
                  <CheckCircle2 className="w-5 h-5 text-emerald-500 fill-emerald-500/20" />
                )}
              </div>
              <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400">
                @{profile.username}
              </p>
            </div>
          </div>

          {/* Action Buttons: Edit or Follow & Message */}
          <div className="flex items-center gap-2">
            {isOwnProfile ? (
              <button
                onClick={() => setIsEditing(true)}
                className="flex items-center gap-2 px-4 py-2 rounded-full bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-800 dark:text-zinc-200 text-xs sm:text-sm font-semibold transition-all cursor-pointer shadow-xs"
              >
                <Edit3 className="w-4 h-4" />
                <span>{t('editProfile')}</span>
              </button>
            ) : (
              <>
                <button
                  onClick={handleToggleFollow}
                  className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-xs sm:text-sm font-semibold transition-all shadow-xs cursor-pointer ${
                    isFollowing
                      ? 'bg-zinc-200 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200'
                      : 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-600/30'
                  }`}
                >
                  {isFollowing ? (
                    <>
                      <UserCheck className="w-4 h-4" />
                      <span>{t('followingBtn')}</span>
                    </>
                  ) : (
                    <>
                      <UserPlus className="w-4 h-4" />
                      <span>{t('follow')}</span>
                    </>
                  )}
                </button>

                {onNavigateToChat && (
                  <button
                    onClick={() => onNavigateToChat(profile)}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-800 dark:text-zinc-200 text-xs sm:text-sm font-semibold transition-colors cursor-pointer"
                  >
                    <MessageSquare className="w-4 h-4" />
                    <span>বার্তা</span>
                  </button>
                )}
              </>
            )}
          </div>

        </div>

        {/* Bio */}
        <div className="mt-4 text-center sm:text-left">
          <p className="text-zinc-700 dark:text-zinc-300 text-sm whitespace-pre-line leading-relaxed max-w-xl">
            {profile.bio || t('noBioYet')}
          </p>
          <div className="flex items-center justify-center sm:justify-start gap-1.5 text-xs text-zinc-400 mt-2">
            <Calendar className="w-3.5 h-3.5" />
            <span>
              {t('joinedOn')}: {new Date(profile.createdAt).toLocaleDateString('bn-BD', { month: 'long', year: 'numeric' })}
            </span>
          </div>
        </div>

        {/* Stats Row */}
        <div className="flex items-center justify-around sm:justify-start sm:gap-8 mt-5 py-3 border-y border-zinc-200 dark:border-zinc-800">
          <div className="text-center sm:text-left">
            <span className="block font-bold text-base sm:text-lg text-zinc-900 dark:text-white">
              {language === 'bn' ? convertNumberToBengali(userPosts.length) : userPosts.length}
            </span>
            <span className="text-xs text-zinc-500 dark:text-zinc-400">{t('postsCount')}</span>
          </div>

          <div className="text-center sm:text-left">
            <span className="block font-bold text-base sm:text-lg text-zinc-900 dark:text-white">
              {language === 'bn' ? convertNumberToBengali(profile.followersCount) : profile.followersCount}
            </span>
            <span className="text-xs text-zinc-500 dark:text-zinc-400">{t('followersCount')}</span>
          </div>

          <div className="text-center sm:text-left">
            <span className="block font-bold text-base sm:text-lg text-zinc-900 dark:text-white">
              {language === 'bn' ? convertNumberToBengali(profile.followingCount) : profile.followingCount}
            </span>
            <span className="text-xs text-zinc-500 dark:text-zinc-400">{t('followingCount')}</span>
          </div>
        </div>

        {/* Tabs: Posts / Media / Liked / Saved */}
        <div className="flex items-center justify-around mt-4 border-b border-zinc-800 overflow-x-auto no-scrollbar">
          <button
            onClick={() => setActiveTab('posts')}
            className={`flex items-center gap-1.5 py-3 px-3 text-xs sm:text-sm font-bold border-b-2 transition-all shrink-0 cursor-pointer ${
              activeTab === 'posts'
                ? 'border-cyan-400 text-cyan-400'
                : 'border-transparent text-zinc-400 hover:text-white'
            }`}
          >
            <Grid className="w-4 h-4" />
            <span>{t('allPosts')}</span>
          </button>

          <button
            onClick={() => setActiveTab('media')}
            className={`flex items-center gap-1.5 py-3 px-3 text-xs sm:text-sm font-bold border-b-2 transition-all shrink-0 cursor-pointer ${
              activeTab === 'media'
                ? 'border-cyan-400 text-cyan-400'
                : 'border-transparent text-zinc-400 hover:text-white'
            }`}
          >
            <ImageIcon className="w-4 h-4" />
            <span>ভিডিও ও রিলস</span>
          </button>

          <button
            onClick={() => setActiveTab('liked')}
            className={`flex items-center gap-1.5 py-3 px-3 text-xs sm:text-sm font-bold border-b-2 transition-all shrink-0 cursor-pointer ${
              activeTab === 'liked'
                ? 'border-cyan-400 text-cyan-400'
                : 'border-transparent text-zinc-400 hover:text-white'
            }`}
          >
            <Heart className="w-4 h-4" />
            <span>{t('likedPosts')}</span>
          </button>

          {isOwnProfile && (
            <button
              onClick={() => setActiveTab('saved')}
              className={`flex items-center gap-1.5 py-3 px-3 text-xs sm:text-sm font-bold border-b-2 transition-all shrink-0 cursor-pointer ${
                activeTab === 'saved'
                  ? 'border-amber-400 text-amber-400'
                  : 'border-transparent text-zinc-400 hover:text-white'
              }`}
            >
              <Bookmark className={`w-4 h-4 ${activeTab === 'saved' ? 'fill-amber-400' : ''}`} />
              <span>{t('savedPosts')}</span>
              {savedPosts.length > 0 && (
                <span className="ml-0.5 px-1.5 py-0.5 rounded-full text-[10px] bg-amber-950 text-amber-300 border border-amber-800 font-bold">
                  {language === 'bn' ? convertNumberToBengali(savedPosts.length) : savedPosts.length}
                </span>
              )}
            </button>
          )}
        </div>

        {/* Tab Contents */}
        <div className="mt-5 space-y-4">
          {activeTab === 'posts' && (
            userPosts.length === 0 ? (
              <div className="py-12 text-center text-zinc-500 text-xs sm:text-sm">
                এখনো কোনো পোস্ট করা হয়নি
              </div>
            ) : (
              userPosts.map(post => (
                <PostCard
                  key={post.id}
                  post={post}
                  onPostDeleted={onPostDeleted}
                  onToggleSave={handleToggleSaveInProfile}
                />
              ))
            )
          )}

          {activeTab === 'media' && (
            mediaPosts.length === 0 ? (
              <div className="py-12 text-center text-zinc-500 text-xs sm:text-sm">
                কোনো ভিডিও পাওয়া যায়নি
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                {mediaPosts.map(p => (
                  <div key={p.id} className="relative rounded-2xl overflow-hidden aspect-[9/16] bg-black border border-zinc-800 group cursor-pointer shadow-md">
                    {p.videoUrl ? (
                      <video src={p.videoUrl} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                    ) : (
                      <img src={p.mediaUrl} alt="" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex items-end p-2.5">
                      <span className="flex items-center gap-1 text-white text-xs font-bold drop-shadow-md">
                        <Heart className="w-3.5 h-3.5 fill-rose-500 text-rose-500" />
                        {p.likesCount}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )
          )}

          {activeTab === 'liked' && (
            <div className="py-10 text-center text-zinc-400 text-xs sm:text-sm">
              পছন্দ করা পোস্টগুলো সংরক্ষিত রয়েছে
            </div>
          )}

          {/* Dedicated Saved Posts Tab */}
          {activeTab === 'saved' && (
            savedPosts.length === 0 ? (
              <div className="py-16 px-6 text-center bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200/90 dark:border-zinc-800/80 shadow-xs">
                <div className="w-16 h-16 mx-auto rounded-3xl bg-amber-500/10 text-amber-500 flex items-center justify-center mb-4 ring-8 ring-amber-500/5">
                  <Bookmark className="w-8 h-8 stroke-[1.75]" />
                </div>
                <h3 className="text-base font-bold text-zinc-900 dark:text-white mb-1.5">
                  {t('noSavedPosts')}
                </h3>
                <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400 max-w-sm mx-auto leading-relaxed">
                  {t('noSavedPostsDesc')}
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center justify-between px-2 text-xs font-semibold text-zinc-500 dark:text-zinc-400">
                  <span className="flex items-center gap-1.5">
                    <Bookmark className="w-4 h-4 text-amber-500 fill-amber-500" />
                    <span>মোট সংরক্ষিত পোস্ট:</span>
                    <strong className="text-zinc-900 dark:text-white font-bold">
                      {language === 'bn' ? convertNumberToBengali(savedPosts.length) : savedPosts.length} টি
                    </strong>
                  </span>
                </div>
                {savedPosts.map(post => (
                  <PostCard
                    key={post.id}
                    post={post}
                    onPostDeleted={onPostDeleted}
                    onToggleSave={handleToggleSaveInProfile}
                  />
                ))}
              </div>
            )
          )}
        </div>
      </div>

      {/* Edit Profile Modal */}
      {isEditing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="w-full max-w-lg bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200 dark:border-zinc-800 shadow-2xl p-6 overflow-hidden max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-200 dark:border-zinc-800">
              <h2 className="text-base font-bold text-zinc-900 dark:text-white">
                {t('editProfile')}
              </h2>
              <button
                onClick={() => setIsEditing(false)}
                className="p-1 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveProfile} className="space-y-4 pt-4">
              <div>
                <label className="text-xs font-medium text-zinc-700 dark:text-zinc-300">
                  {t('displayName')}
                </label>
                <input
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full mt-1 px-3.5 py-2 text-xs sm:text-sm rounded-xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100 focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="text-xs font-medium text-zinc-700 dark:text-zinc-300">
                  {t('bio')}
                </label>
                <textarea
                  rows={3}
                  value={editBio}
                  onChange={(e) => setEditBio(e.target.value)}
                  className="w-full mt-1 px-3.5 py-2 text-xs sm:text-sm rounded-xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100 focus:ring-2 focus:ring-emerald-500 resize-none"
                />
              </div>

              {/* Avatar Preset Selectors */}
              <div>
                <label className="text-xs font-medium text-zinc-700 dark:text-zinc-300 block mb-1.5">
                  {t('choosePresetAvatar')}:
                </label>
                <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1">
                  {PRESET_AVATARS.map((avUrl, i) => (
                    <img
                      key={i}
                      src={avUrl}
                      alt=""
                      onClick={() => setEditPhoto(avUrl)}
                      className={`w-12 h-12 rounded-full object-cover cursor-pointer ring-2 transition-all ${
                        editPhoto === avUrl ? 'ring-emerald-500 scale-105' : 'ring-transparent hover:ring-zinc-400'
                      }`}
                    />
                  ))}
                </div>
              </div>

              {/* Cover Preset Selectors */}
              <div>
                <label className="text-xs font-medium text-zinc-700 dark:text-zinc-300 block mb-1.5">
                  কভার ফটো বাছুন:
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {PRESET_COVERS.map((covUrl, i) => (
                    <img
                      key={i}
                      src={covUrl}
                      alt=""
                      onClick={() => setEditCover(covUrl)}
                      className={`w-full h-16 rounded-xl object-cover cursor-pointer border-2 transition-all ${
                        editCover === covUrl ? 'border-emerald-500 scale-[1.02]' : 'border-transparent'
                      }`}
                    />
                  ))}
                </div>
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="px-4 py-2 text-xs font-semibold rounded-xl text-zinc-600 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800"
                >
                  {t('cancel')}
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-bold rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white shadow-md flex items-center gap-1.5"
                >
                  <Save className="w-4 h-4" />
                  <span>{t('saveChanges')}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
