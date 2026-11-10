import React, { useState, useEffect } from 'react';
import { 
  Heart, 
  MessageCircle, 
  Share2, 
  Bookmark, 
  MoreVertical, 
  CheckCircle2, 
  Trash2, 
  Flag, 
  Send, 
  Play, 
  Pause, 
  Volume2, 
  VolumeX, 
  UserPlus, 
  UserCheck 
} from 'lucide-react';
import { Post, Comment } from '../types';
import { useAuth } from '../contexts/AuthContext';
import { FirestoreService } from '../services/firestore';
import { convertNumberToBengali, formatTimeAgoInBengali } from '../utils/translations';

interface PostCardProps {
  post: Post;
  onPostDeleted?: (postId: string) => void;
  onUserClick?: (userId: string) => void;
  onToggleSave?: (postId: string, isSaved: boolean) => void;
}

export const PostCard: React.FC<PostCardProps> = ({
  post,
  onPostDeleted,
  onUserClick,
  onToggleSave,
}) => {
  const { currentUser, isAdmin, language, t } = useAuth();
  const [likesCount, setLikesCount] = useState(post.likesCount);
  const [isLiked, setIsLiked] = useState(post.isLikedByMe || false);
  const [comments, setComments] = useState<Comment[]>([]);
  const [commentsCount, setCommentsCount] = useState(post.commentsCount);
  const [showComments, setShowComments] = useState(false);
  const [newCommentText, setNewCommentText] = useState('');
  const [isFollowing, setIsFollowing] = useState(false);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [saveNotice, setSaveNotice] = useState<string | null>(null);
  const [showMenu, setShowMenu] = useState(false);
  const [copyNotice, setCopyNotice] = useState(false);
  const [isVideoPlaying, setIsVideoPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const [likeHeartBurst, setLikeHeartBurst] = useState(false);

  // Check if current user is following the author and check if post is saved
  useEffect(() => {
    if (currentUser) {
      if (currentUser.uid !== post.authorId) {
        FirestoreService.checkIsFollowing(currentUser.uid, post.authorId).then(setIsFollowing);
      }
      FirestoreService.checkIsPostSaved(currentUser.uid, post.id).then(setIsBookmarked);
    }
  }, [currentUser, post.authorId, post.id]);

  // Load comments when expanded
  useEffect(() => {
    if (showComments) {
      FirestoreService.fetchComments(post.id).then(setComments);
    }
  }, [showComments, post.id]);

  const handleLikeToggle = async () => {
    if (!currentUser) return;
    const nextState = !isLiked;
    setIsLiked(nextState);
    setLikesCount(prev => (nextState ? prev + 1 : Math.max(0, prev - 1)));

    if (nextState) {
      setLikeHeartBurst(true);
      setTimeout(() => setLikeHeartBurst(false), 700);

      // Create notification for post author if not self
      if (post.authorId !== currentUser.uid) {
        FirestoreService.createNotification({
          recipientId: post.authorId,
          senderId: currentUser.uid,
          senderName: currentUser.displayName,
          senderPhoto: currentUser.photoURL,
          type: 'like',
          targetId: post.id,
          message: `${currentUser.displayName} আপনার পোস্টে লাইক দিয়েছেন`,
        });
      }
    }

    await FirestoreService.toggleLikePost(post.id, currentUser.uid, !nextState);
  };

  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser || !newCommentText.trim()) return;

    const comment = await FirestoreService.addComment(post.id, currentUser, newCommentText.trim());
    setComments(prev => [...prev, comment]);
    setCommentsCount(prev => prev + 1);
    setNewCommentText('');

    if (post.authorId !== currentUser.uid) {
      FirestoreService.createNotification({
        recipientId: post.authorId,
        senderId: currentUser.uid,
        senderName: currentUser.displayName,
        senderPhoto: currentUser.photoURL,
        type: 'comment',
        targetId: post.id,
        message: `${currentUser.displayName} আপনার পোস্টে একটি মন্তব্য করেছেন: "${comment.text.slice(0, 30)}..."`,
      });
    }
  };

  const handleToggleFollow = async () => {
    if (!currentUser) return;
    const nextFollow = !isFollowing;
    setIsFollowing(nextFollow);
    await FirestoreService.toggleFollow(currentUser.uid, post.authorId, !nextFollow);

    if (nextFollow) {
      FirestoreService.createNotification({
        recipientId: post.authorId,
        senderId: currentUser.uid,
        senderName: currentUser.displayName,
        senderPhoto: currentUser.photoURL,
        type: 'follow',
        targetId: currentUser.uid,
        message: `${currentUser.displayName} আপনাকে অনুসরণ করা শুরু করেছেন`,
      });
    }
  };

  const handleShare = () => {
    const postUrl = `${window.location.origin}/#post-${post.id}`;
    if (navigator.clipboard) {
      navigator.clipboard.writeText(postUrl);
      setCopyNotice(true);
      setTimeout(() => setCopyNotice(false), 2500);
    }
  };

  const handleToggleSave = async () => {
    if (!currentUser) return;
    const nextSaved = !isBookmarked;
    setIsBookmarked(nextSaved);
    setSaveNotice(nextSaved ? t('postSaved') : t('postUnsaved'));
    setTimeout(() => setSaveNotice(null), 2500);

    if (onToggleSave) {
      onToggleSave(post.id, nextSaved);
    }
    await FirestoreService.toggleSavePost(currentUser.uid, post.id, !nextSaved);
  };

  const handleDeletePost = async () => {
    if (confirm('আপনি কি নিশ্চিত যে পোস্টটি মুছতে চান?')) {
      await FirestoreService.deletePost(post.id);
      if (onPostDeleted) onPostDeleted(post.id);
    }
  };

  const isAuthorOrAdmin = currentUser?.uid === post.authorId || isAdmin;

  return (
    <article className="w-full bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200/90 dark:border-zinc-800/80 shadow-xs hover:shadow-md transition-all duration-200 overflow-hidden mb-4">
      
      {/* Header: Author Info & Options */}
      <div className="p-4 flex items-center justify-between">
        <div 
          onClick={() => onUserClick && onUserClick(post.authorId)}
          className="flex items-center gap-3 cursor-pointer group"
        >
          <img
            src={post.authorPhoto}
            alt={post.authorName}
            className="w-11 h-11 rounded-full object-cover ring-2 ring-emerald-500/30 group-hover:ring-emerald-500 transition-all"
          />
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-bold text-zinc-900 dark:text-zinc-100 text-sm group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                {post.authorName}
              </span>
              {(post.isAuthorVerified || post.authorRole === 'admin') && (
                <CheckCircle2 className="w-4 h-4 text-emerald-500 fill-emerald-500/20" />
              )}
            </div>
            <div className="flex items-center gap-1.5 text-xs text-zinc-500 dark:text-zinc-400">
              <span>@{post.authorUsername}</span>
              <span>•</span>
              <span>{formatTimeAgoInBengali(post.createdAt, language)}</span>
            </div>
          </div>
        </div>

        {/* Follow Button & More Menu */}
        <div className="flex items-center gap-1">
          {currentUser && currentUser.uid !== post.authorId && (
            <button
              onClick={handleToggleFollow}
              className={`flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold transition-all ${
                isFollowing
                  ? 'bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-200'
                  : 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 hover:bg-emerald-100'
              }`}
            >
              {isFollowing ? (
                <>
                  <UserCheck className="w-3.5 h-3.5" />
                  <span>{t('followingBtn')}</span>
                </>
              ) : (
                <>
                  <UserPlus className="w-3.5 h-3.5" />
                  <span>{t('follow')}</span>
                </>
              )}
            </button>
          )}

          <div className="relative">
            <button
              onClick={() => setShowMenu(!showMenu)}
              className="p-1.5 text-zinc-500 hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-200 rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
            >
              <MoreVertical className="w-5 h-5" />
            </button>

            {showMenu && (
              <div className="absolute right-0 top-8 z-30 w-44 bg-white dark:bg-zinc-800 rounded-2xl shadow-xl border border-zinc-200 dark:border-zinc-700 py-1.5 animate-in fade-in zoom-in-95 duration-150">
                <button
                  onClick={() => {
                    handleShare();
                    setShowMenu(false);
                  }}
                  className="w-full px-4 py-2 text-left text-xs text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-700/60 flex items-center gap-2"
                >
                  <Share2 className="w-4 h-4" />
                  <span>{t('copyLink')}</span>
                </button>

                <button
                  onClick={() => {
                    handleToggleSave();
                    setShowMenu(false);
                  }}
                  className="w-full px-4 py-2 text-left text-xs text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-700/60 flex items-center gap-2"
                >
                  <Bookmark className={`w-4 h-4 ${isBookmarked ? 'fill-amber-500 text-amber-500' : ''}`} />
                  <span>{isBookmarked ? t('unsavePost') : t('savePost')}</span>
                </button>

                {isAuthorOrAdmin && (
                  <button
                    onClick={() => {
                      handleDeletePost();
                      setShowMenu(false);
                    }}
                    className="w-full px-4 py-2 text-left text-xs text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/50 flex items-center gap-2"
                  >
                    <Trash2 className="w-4 h-4" />
                    <span>{t('deletePost')}</span>
                  </button>
                )}

                <button
                  onClick={() => {
                    alert('রিপোর্ট গৃহীত হয়েছে। অ্যাডমিন টিম এটি পর্যালোচনা করবে।');
                    setShowMenu(false);
                  }}
                  className="w-full px-4 py-2 text-left text-xs text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-700/60 flex items-center gap-2"
                >
                  <Flag className="w-4 h-4" />
                  <span>{t('reportPost')}</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Post Text Content */}
      {post.content && (
        <div className="px-4 pb-3">
          <p className="text-zinc-800 dark:text-zinc-200 text-sm sm:text-base leading-relaxed whitespace-pre-line select-text">
            {post.content.split(' ').map((word, idx) => {
              if (word.startsWith('#')) {
                return (
                  <span key={idx} className="text-emerald-600 dark:text-emerald-400 font-semibold cursor-pointer hover:underline mr-1">
                    {word}{' '}
                  </span>
                );
              }
              return word + ' ';
            })}
          </p>
        </div>
      )}

      {/* Media: Photo or Video */}
      {post.type === 'photo' && post.mediaUrl && (
        <div className="relative w-full bg-zinc-950 max-h-[500px] flex items-center justify-center overflow-hidden">
          <img
            src={post.mediaUrl}
            alt=""
            loading="lazy"
            className="w-full h-auto object-cover max-h-[500px]"
            onDoubleClick={handleLikeToggle}
          />
          {likeHeartBurst && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none animate-ping">
              <Heart className="w-24 h-24 fill-rose-500 text-rose-500 drop-shadow-2xl" />
            </div>
          )}
        </div>
      )}

      {post.type === 'video' && post.videoUrl && (
        <div className="relative w-full bg-black max-h-[500px] overflow-hidden flex items-center justify-center">
          <video
            src={post.videoUrl}
            playsInline
            loop
            muted={isMuted}
            autoPlay={isVideoPlaying}
            className="w-full h-auto max-h-[500px] object-contain"
          />
          {/* Controls overlay */}
          <div className="absolute bottom-3 right-3 flex items-center gap-2 z-20">
            <button
              onClick={() => setIsMuted(!isMuted)}
              className="p-2 rounded-full bg-black/60 hover:bg-black/80 text-white backdrop-blur-xs transition-colors"
            >
              {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
            </button>
            <button
              onClick={() => setIsVideoPlaying(!isVideoPlaying)}
              className="p-2 rounded-full bg-black/60 hover:bg-black/80 text-white backdrop-blur-xs transition-colors"
            >
              {isVideoPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
            </button>
          </div>
        </div>
      )}

      {/* Engagement Action Bar */}
      <div className="px-4 py-3 flex items-center justify-between border-t border-zinc-100 dark:border-zinc-800/80">
        <div className="flex items-center gap-4 sm:gap-6">
          {/* Like Button */}
          <button
            onClick={handleLikeToggle}
            className="flex items-center gap-1.5 text-zinc-600 dark:text-zinc-300 hover:text-rose-500 dark:hover:text-rose-400 group transition-colors"
          >
            <Heart
              className={`w-5 h-5 transition-transform group-hover:scale-110 ${
                isLiked ? 'fill-rose-500 text-rose-500' : ''
              }`}
            />
            <span className={`text-xs sm:text-sm font-semibold ${isLiked ? 'text-rose-500' : ''}`}>
              {language === 'bn' ? convertNumberToBengali(likesCount) : likesCount}
            </span>
          </button>

          {/* Comment Button */}
          <button
            onClick={() => setShowComments(!showComments)}
            className="flex items-center gap-1.5 text-zinc-600 dark:text-zinc-300 hover:text-emerald-600 dark:hover:text-emerald-400 group transition-colors"
          >
            <MessageCircle className="w-5 h-5 transition-transform group-hover:scale-110" />
            <span className="text-xs sm:text-sm font-semibold">
              {language === 'bn' ? convertNumberToBengali(commentsCount) : commentsCount}
            </span>
          </button>

          {/* Share Button */}
          <button
            onClick={handleShare}
            className="flex items-center gap-1.5 text-zinc-600 dark:text-zinc-300 hover:text-teal-600 dark:hover:text-teal-400 group transition-colors"
            title={t('share')}
          >
            <Share2 className="w-5 h-5 transition-transform group-hover:scale-110" />
            <span className="text-xs sm:text-sm font-semibold hidden sm:inline">
              {language === 'bn' ? convertNumberToBengali(post.sharesCount) : post.sharesCount}
            </span>
          </button>
        </div>

        {/* Save / Bookmark Button */}
        <button
          onClick={handleToggleSave}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer ${
            isBookmarked
              ? 'bg-amber-50 dark:bg-amber-950/70 text-amber-600 dark:text-amber-400 border border-amber-500/30 shadow-xs'
              : 'text-zinc-600 dark:text-zinc-400 hover:text-amber-500 hover:bg-zinc-100 dark:hover:bg-zinc-800'
          }`}
          title={isBookmarked ? t('unsavePost') : t('savePost')}
          aria-label={isBookmarked ? 'Unsave Post' : 'Save Post'}
        >
          <Bookmark className={`w-4 h-4 transition-transform ${isBookmarked ? 'fill-amber-500 text-amber-500 scale-110' : ''}`} />
          <span>{isBookmarked ? t('saved') : t('save')}</span>
        </button>
      </div>

      {/* Toast Feedback Notice */}
      {saveNotice && (
        <div className="bg-amber-500 text-white text-xs font-semibold py-1.5 px-4 text-center animate-in fade-in duration-150">
          {saveNotice}
        </div>
      )}
      {copyNotice && (
        <div className="bg-emerald-600 text-white text-xs font-semibold py-1.5 px-4 text-center animate-in fade-in duration-150">
          {t('linkCopied')}
        </div>
      )}

      {/* Expandable Comments Section */}
      {showComments && (
        <div className="bg-zinc-50 dark:bg-zinc-950/60 p-4 border-t border-zinc-100 dark:border-zinc-800/80 animate-in fade-in duration-200">
          
          {/* Comment Input */}
          {currentUser && (
            <form onSubmit={handleAddComment} className="flex items-center gap-2 mb-3">
              <img
                src={currentUser.photoURL}
                alt=""
                className="w-8 h-8 rounded-full object-cover shrink-0"
              />
              <input
                type="text"
                placeholder={t('writeComment')}
                value={newCommentText}
                onChange={(e) => setNewCommentText(e.target.value)}
                className="flex-1 px-3.5 py-2 text-xs sm:text-sm rounded-full bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-800 dark:text-zinc-100 focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
              />
              <button
                type="submit"
                disabled={!newCommentText.trim()}
                className="p-2 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white disabled:opacity-40 transition-colors shrink-0"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          )}

          {/* Comments List */}
          <div className="space-y-2.5 max-h-60 overflow-y-auto no-scrollbar">
            {comments.length === 0 ? (
              <p className="text-xs text-zinc-400 text-center py-2">{t('noComments')}</p>
            ) : (
              comments.map((c) => (
                <div key={c.id} className="flex items-start gap-2.5 text-xs">
                  <img
                    src={c.authorPhoto}
                    alt=""
                    className="w-7 h-7 rounded-full object-cover mt-0.5 shrink-0"
                  />
                  <div className="flex-1 bg-white dark:bg-zinc-800/80 p-2.5 rounded-2xl border border-zinc-200/60 dark:border-zinc-700/60">
                    <div className="flex items-center justify-between mb-0.5">
                      <span className="font-semibold text-zinc-900 dark:text-zinc-100">
                        {c.authorName}
                      </span>
                      <span className="text-[10px] text-zinc-400">
                        {formatTimeAgoInBengali(c.createdAt, language)}
                      </span>
                    </div>
                    <p className="text-zinc-700 dark:text-zinc-300 select-text leading-relaxed">
                      {c.text}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>

        </div>
      )}

    </article>
  );
};
