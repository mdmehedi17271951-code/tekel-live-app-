import React, { useState, useRef, useEffect } from 'react';
import { 
  Heart, 
  MessageCircle, 
  Bookmark, 
  Share2, 
  Music2, 
  Check, 
  Plus, 
  Volume2, 
  VolumeX, 
  Play,
  Sparkles
} from 'lucide-react';
import { Post, UserProfile } from '../types';
import { useAuth } from '../contexts/AuthContext';
import { FirestoreService } from '../services/firestore';
import { convertNumberToBengali } from '../utils/translations';

interface TikTokVideoCardProps {
  post: Post;
  isActive: boolean;
  onOpenComments: (post: Post) => void;
  onOpenShare: (post: Post) => void;
  onUserClick: (userId: string) => void;
}

export const TikTokVideoCard: React.FC<TikTokVideoCardProps> = ({
  post,
  isActive,
  onOpenComments,
  onOpenShare,
  onUserClick,
}) => {
  const { currentUser, language, t } = useAuth();
  const videoRef = useRef<HTMLVideoElement | null>(null);

  // Interaction States
  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [isLiked, setIsLiked] = useState<boolean>(post.isLikedByMe || false);
  const [likesCount, setLikesCount] = useState<number>(post.likesCount || 0);
  const [isSaved, setIsSaved] = useState<boolean>(false);
  const [isFollowing, setIsFollowing] = useState<boolean>(false);
  const [showHeartBurst, setShowHeartBurst] = useState<boolean>(false);
  const [heartCoords, setHeartCoords] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isCaptionExpanded, setIsCaptionExpanded] = useState<boolean>(false);
  const [progress, setProgress] = useState<number>(0);
  const [showPlayPauseIcon, setShowPlayPauseIcon] = useState<boolean>(false);

  // Last tap time for double-tap detection
  const lastTapRef = useRef<number>(0);

  // Check saved and following states
  useEffect(() => {
    if (currentUser) {
      FirestoreService.checkIsPostSaved(currentUser.uid, post.id).then(setIsSaved);
      if (post.authorId !== currentUser.uid) {
        FirestoreService.checkIsFollowing(currentUser.uid, post.authorId).then(setIsFollowing);
      }
    }
  }, [currentUser, post.id, post.authorId]);

  // Handle active video playback
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    if (isActive) {
      video.currentTime = 0;
      const playPromise = video.play();
      if (playPromise !== undefined) {
        playPromise
          .then(() => setIsPlaying(true))
          .catch(() => {
            // Autoplay with sound may be blocked by browser; fallback to muted autoplay
            video.muted = true;
            setIsMuted(true);
            video.play().catch(() => setIsPlaying(false));
          });
      }
    } else {
      video.pause();
      setIsPlaying(false);
    }
  }, [isActive]);

  const handleVideoTimeUpdate = () => {
    if (videoRef.current && videoRef.current.duration) {
      const p = (videoRef.current.currentTime / videoRef.current.duration) * 100;
      setProgress(p);
    }
  };

  // Tap handler (single tap = pause/play, double tap = like)
  const handleContainerClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const now = Date.now();
    const DOUBLE_TAP_DELAY = 300;

    if (now - lastTapRef.current < DOUBLE_TAP_DELAY) {
      // Double tap triggered
      const rect = e.currentTarget.getBoundingClientRect();
      setHeartCoords({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      });
      setShowHeartBurst(true);
      setTimeout(() => setShowHeartBurst(false), 900);

      if (!isLiked && currentUser) {
        handleLikeToggle();
      }
    } else {
      // Single tap -> toggle play/pause
      if (videoRef.current) {
        if (isPlaying) {
          videoRef.current.pause();
          setIsPlaying(false);
        } else {
          videoRef.current.play();
          setIsPlaying(true);
        }
        setShowPlayPauseIcon(true);
        setTimeout(() => setShowPlayPauseIcon(false), 600);
      }
    }
    lastTapRef.current = now;
  };

  const handleLikeToggle = async () => {
    if (!currentUser) return;
    const nextState = !isLiked;
    setIsLiked(nextState);
    setLikesCount(prev => (nextState ? prev + 1 : Math.max(0, prev - 1)));

    await FirestoreService.toggleLikePost(post.id, currentUser.uid, isLiked);
  };

  const handleSaveToggle = async () => {
    if (!currentUser) return;
    const nextState = !isSaved;
    setIsSaved(nextState);
    await FirestoreService.toggleSavePost(currentUser.uid, post.id, isSaved);
  };

  const handleFollowToggle = async () => {
    if (!currentUser || post.authorId === currentUser.uid) return;
    const nextState = !isFollowing;
    setIsFollowing(nextState);
    await FirestoreService.toggleFollow(currentUser.uid, post.authorId, isFollowing);
  };

  const toggleMute = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  const formatCount = (count: number) => {
    let str = count.toString();
    if (count >= 1000000) {
      str = (count / 1000000).toFixed(1) + 'M';
    } else if (count >= 1000) {
      str = (count / 1000).toFixed(1) + 'k';
    }
    return language === 'bn' ? convertNumberToBengali(str) : str;
  };

  return (
    <div 
      className="relative w-full h-[100dvh] snap-feed-item bg-black flex items-center justify-center overflow-hidden select-none"
      onClick={handleContainerClick}
    >
      {/* Background Video Player */}
      {post.videoUrl ? (
        <video
          ref={videoRef}
          src={post.videoUrl}
          poster={post.thumbnailUrl || post.mediaUrl}
          loop
          playsInline
          muted={isMuted}
          onTimeUpdate={handleVideoTimeUpdate}
          className="w-full h-full object-cover sm:object-contain bg-black"
        />
      ) : (
        <div className="relative w-full h-full flex items-center justify-center bg-zinc-950 overflow-hidden">
          <img
            src={post.mediaUrl || 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=1200&auto=format&fit=crop&q=80'}
            alt=""
            className="w-full h-full object-cover scale-105 filter blur-xs opacity-60 absolute inset-0"
          />
          <img
            src={post.mediaUrl}
            alt=""
            className="relative z-10 max-h-full max-w-full object-contain animate-pulse-subtle"
          />
        </div>
      )}

      {/* Top & Bottom Cinematic Gradient Overlays */}
      <div className="absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-black/80 via-black/40 to-transparent pointer-events-none" />
      <div className="absolute inset-x-0 bottom-0 h-56 bg-gradient-to-t from-black/95 via-black/60 to-transparent pointer-events-none" />

      {/* Play/Pause Central Feedback Icon */}
      {showPlayPauseIcon && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-30">
          <div className="w-18 h-18 rounded-full bg-black/60 backdrop-blur-md flex items-center justify-center text-white/90 scale-110 animate-out fade-out zoom-out duration-500">
            {isPlaying ? (
              <Play className="w-10 h-10 ml-1 fill-white" />
            ) : (
              <div className="w-8 h-8 flex gap-1.5 justify-center">
                <div className="w-2.5 h-8 bg-white rounded-xs" />
                <div className="w-2.5 h-8 bg-white rounded-xs" />
              </div>
            )}
          </div>
        </div>
      )}

      {/* Double Tap Floating Animated Heart */}
      {showHeartBurst && (
        <div 
          className="absolute z-40 pointer-events-none animate-heart-burst"
          style={{ left: heartCoords.x - 45, top: heartCoords.y - 45 }}
        >
          <Heart className="w-24 h-24 fill-rose-500 text-rose-500 drop-shadow-[0_0_20px_rgba(244,63,94,0.8)]" />
        </div>
      )}

      {/* Mute/Unmute Float Toggle (Top Right area) */}
      <button
        onClick={toggleMute}
        className="absolute top-20 right-4 z-30 p-2.5 rounded-full bg-black/50 backdrop-blur-md text-white/90 hover:bg-black/70 transition-all active:scale-90"
        title={isMuted ? 'আনমিউট করুন' : 'মিউট করুন'}
      >
        {isMuted ? <VolumeX className="w-5 h-5 text-rose-400" /> : <Volume2 className="w-5 h-5 text-cyan-400" />}
      </button>

      {/* RIGHT ACTION SIDEBAR (Signature TikTok Column) */}
      <div 
        className="absolute right-3 bottom-20 z-30 flex flex-col items-center gap-4.5"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Creator Avatar with Follow (+) Button */}
        <div className="relative mb-1">
          <button
            onClick={() => onUserClick(post.authorId)}
            className="w-12 h-12 rounded-full p-0.5 bg-gradient-to-tr from-cyan-400 to-emerald-400 shadow-lg cursor-pointer"
          >
            <img
              src={post.authorPhoto}
              alt={post.authorName}
              className="w-full h-full rounded-full object-cover"
            />
          </button>
          
          {currentUser && currentUser.uid !== post.authorId && (
            <button
              onClick={handleFollowToggle}
              className={`absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-5.5 h-5.5 rounded-full flex items-center justify-center text-white transition-all shadow-md ${
                isFollowing 
                  ? 'bg-zinc-800 text-cyan-400 scale-90' 
                  : 'bg-rose-500 hover:scale-110 active:scale-95 animate-pulse'
              }`}
              title={isFollowing ? 'অনুসরণ করছেন' : 'অনুসরণ করুন'}
            >
              {isFollowing ? <Check className="w-3.5 h-3.5" /> : <Plus className="w-3.5 h-3.5 stroke-[3]" />}
            </button>
          )}
        </div>

        {/* Like Button */}
        <button
          onClick={handleLikeToggle}
          className="flex flex-col items-center gap-1 group active:scale-80 transition-transform"
        >
          <div className={`p-2.5 rounded-full backdrop-blur-md transition-all ${
            isLiked 
              ? 'bg-rose-500/20 text-rose-500 scale-110' 
              : 'bg-black/40 text-white/90 hover:bg-black/60'
          }`}>
            <Heart 
              className={`w-7 h-7 transition-all ${isLiked ? 'fill-rose-500 text-rose-500 scale-110' : 'text-white'}`} 
            />
          </div>
          <span className="text-[12px] font-bold text-white drop-shadow-md">
            {formatCount(likesCount)}
          </span>
        </button>

        {/* Comments Button */}
        <button
          onClick={() => onOpenComments(post)}
          className="flex flex-col items-center gap-1 group active:scale-80 transition-transform"
        >
          <div className="p-2.5 rounded-full bg-black/40 backdrop-blur-md text-white hover:bg-black/60 transition-all">
            <MessageCircle className="w-7 h-7 text-white fill-white/10" />
          </div>
          <span className="text-[12px] font-bold text-white drop-shadow-md">
            {formatCount(post.commentsCount || 0)}
          </span>
        </button>

        {/* Bookmark / Save Button */}
        <button
          onClick={handleSaveToggle}
          className="flex flex-col items-center gap-1 group active:scale-80 transition-transform"
        >
          <div className={`p-2.5 rounded-full backdrop-blur-md transition-all ${
            isSaved 
              ? 'bg-amber-500/20 text-amber-400 scale-110' 
              : 'bg-black/40 text-white hover:bg-black/60'
          }`}>
            <Bookmark 
              className={`w-7 h-7 transition-all ${isSaved ? 'fill-amber-400 text-amber-400' : 'text-white'}`} 
            />
          </div>
          <span className="text-[12px] font-bold text-white drop-shadow-md">
            {isSaved ? 'সংরক্ষিত' : 'সেভ'}
          </span>
        </button>

        {/* Share Button */}
        <button
          onClick={() => onOpenShare(post)}
          className="flex flex-col items-center gap-1 group active:scale-80 transition-transform"
        >
          <div className="p-2.5 rounded-full bg-black/40 backdrop-blur-md text-white hover:bg-black/60 transition-all">
            <Share2 className="w-7 h-7 text-white" />
          </div>
          <span className="text-[12px] font-bold text-white drop-shadow-md">
            {formatCount(post.sharesCount || 0)}
          </span>
        </button>

        {/* Spinning Vinyl Record Disk with Floating Musical Notes */}
        <div className="relative mt-2">
          {isPlaying && (
            <>
              <span className="absolute -top-3 -left-2 text-cyan-400 animate-float-note-1 text-sm font-bold">
                🎵
              </span>
              <span className="absolute -top-5 right-0 text-emerald-400 animate-float-note-2 text-xs font-bold">
                🎶
              </span>
            </>
          )}

          <div className="w-11 h-11 rounded-full p-1 bg-gradient-to-tr from-zinc-800 via-zinc-950 to-zinc-800 border border-zinc-700/80 shadow-2xl flex items-center justify-center">
            <img
              src={post.authorPhoto}
              alt=""
              className={`w-7 h-7 rounded-full object-cover ${isPlaying ? 'animate-spin-slow' : ''}`}
            />
          </div>
        </div>

      </div>

      {/* BOTTOM INFO OVERLAY (Creator, Caption, Audio Ticker) */}
      <div 
        className="absolute left-3 right-18 bottom-19 z-20 text-left text-white drop-shadow-lg"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Creator Identity */}
        <div 
          onClick={() => onUserClick(post.authorId)}
          className="inline-flex items-center gap-2 cursor-pointer mb-2 group"
        >
          <span className="text-base font-extrabold tracking-tight hover:underline text-white drop-shadow-md">
            @{post.authorUsername}
          </span>
          {post.isAuthorVerified && (
            <span className="w-4 h-4 rounded-full bg-cyan-400 text-black flex items-center justify-center text-[10px] font-black">
              ✓
            </span>
          )}
        </div>

        {/* Caption */}
        <div className="text-xs sm:text-sm text-zinc-100 font-medium leading-relaxed mb-2 max-w-sm">
          <p className={isCaptionExpanded ? '' : 'line-clamp-2'}>
            {post.content}
          </p>
          {post.content.length > 90 && (
            <button
              onClick={() => setIsCaptionExpanded(!isCaptionExpanded)}
              className="text-cyan-300 font-bold ml-1 text-xs hover:underline cursor-pointer"
            >
              {isCaptionExpanded ? 'কম দেখুন' : '...আরও'}
            </button>
          )}
        </div>

        {/* Hashtags */}
        {post.tags && post.tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-2.5">
            {post.tags.map(tag => (
              <span
                key={tag}
                className="text-xs font-bold text-cyan-300/90 hover:text-cyan-200 cursor-pointer"
              >
                {tag}
              </span>
            ))}
          </div>
        )}

        {/* Audio Ticker Marquee */}
        <div className="flex items-center gap-2 text-xs font-medium text-zinc-300 bg-black/40 backdrop-blur-md px-3 py-1.5 rounded-full w-fit max-w-[280px] overflow-hidden border border-white/10">
          <Music2 className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
          <div className="overflow-hidden relative w-52 h-4">
            <span className="animate-ticker text-[11px] text-zinc-200">
              {post.soundTitle || `মূল অডিও - @${post.authorUsername} • Tekel Live`} &nbsp;&nbsp;&nbsp;&nbsp; {post.soundTitle || `মূল অডিও - @${post.authorUsername} • Tekel Live`}
            </span>
          </div>
        </div>
      </div>

      {/* Bottom Progress Scrubber Bar */}
      <div className="absolute bottom-16 inset-x-0 h-1 bg-white/20 z-30">
        <div 
          className="h-full bg-gradient-to-r from-cyan-400 to-emerald-400 transition-all duration-100 ease-linear"
          style={{ width: `${progress}%` }}
        />
      </div>

    </div>
  );
};
