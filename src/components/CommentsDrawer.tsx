import React, { useState, useEffect } from 'react';
import { X, Send, Heart } from 'lucide-react';
import { Post, Comment } from '../types';
import { useAuth } from '../contexts/AuthContext';
import { FirestoreService } from '../services/firestore';
import { convertNumberToBengali } from '../utils/translations';

interface CommentsDrawerProps {
  post: Post | null;
  isOpen: boolean;
  onClose: () => void;
  onCommentAdded?: () => void;
}

const QUICK_EMOJIS = ['❤️', '🔥', '👏', '😂', '🇧🇩', '✨', '🙌'];

export const CommentsDrawer: React.FC<CommentsDrawerProps> = ({
  post,
  isOpen,
  onClose,
  onCommentAdded,
}) => {
  const { currentUser, language, t } = useAuth();
  const [comments, setComments] = useState<Comment[]>([]);
  const [newCommentText, setNewCommentText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [likedCommentIds, setLikedCommentIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (isOpen && post) {
      FirestoreService.fetchComments(post.id).then(fetched => {
        if (fetched.length > 0) {
          setComments(fetched);
        } else {
          // Provide sample discussion comments for vibrant feel if fresh
          setComments([
            {
              id: 'c1',
              postId: post.id,
              authorId: 'u_1',
              authorName: 'রাকিব হাসান',
              authorUsername: 'rakib_h',
              authorPhoto: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80',
              text: 'অসাধারণ ভিডিও! অনেক সুন্দর লাগলো। চালিয়ে যান ভাই ❤️🔥',
              createdAt: new Date(Date.now() - 1000 * 60 * 15).toISOString(),
            },
            {
              id: 'c2',
              postId: post.id,
              authorId: 'u_2',
              authorName: 'সামিয়া হক',
              authorUsername: 'samia_hq',
              authorPhoto: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&auto=format&fit=crop&q=80',
              text: 'লোকেশনটা কোন জায়গা ভাই? ব্যাকগ্রাউন্ড মিউজিকটা দারুণ মানিয়েছে! ✨',
              createdAt: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
            }
          ]);
        }
      });
    }
  }, [isOpen, post]);

  if (!isOpen || !post) return null;

  const handleSendComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCommentText.trim() || !currentUser) return;

    setIsLoading(true);
    try {
      const added = await FirestoreService.addComment(post.id, currentUser, newCommentText.trim());
      setComments(prev => [...prev, added]);
      setNewCommentText('');
      if (onCommentAdded) onCommentAdded();
    } catch (err) {
      console.error('Failed to add comment:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleCommentLike = (cId: string) => {
    setLikedCommentIds(prev => {
      const next = new Set(prev);
      if (next.has(cId)) next.delete(cId);
      else next.add(cId);
      return next;
    });
  };

  const totalCount = comments.length;
  const formattedCount = language === 'bn' ? convertNumberToBengali(totalCount) : totalCount;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 backdrop-blur-xs animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div 
        className="w-full max-w-lg bg-zinc-950/95 border-t border-zinc-800 rounded-t-3xl backdrop-blur-2xl shadow-2xl flex flex-col h-[72vh] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Drag handle */}
        <div className="w-10 h-1 bg-zinc-700 rounded-full mx-auto mt-2.5 mb-1" />

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3 border-b border-zinc-800/80">
          <div className="w-6" /> {/* spacer for balance */}
          <h3 className="text-sm font-bold text-white tracking-wide">
            {formattedCount} {t('comments')}
          </h3>
          <button
            onClick={onClose}
            className="p-1 rounded-full text-zinc-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Comments Scrollable List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 no-scrollbar">
          {comments.map((comment) => (
            <div key={comment.id} className="flex items-start gap-3">
              <img
                src={comment.authorPhoto}
                alt={comment.authorName}
                className="w-9 h-9 rounded-full object-cover shrink-0 ring-1 ring-zinc-700"
              />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-zinc-300">
                    @{comment.authorUsername}
                  </span>
                  <span className="text-[10px] text-zinc-500">
                    {new Date(comment.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
                <p className="text-sm text-zinc-100 font-normal mt-0.5 leading-relaxed break-words">
                  {comment.text}
                </p>
              </div>

              {/* Like Comment Heart */}
              <button
                onClick={() => toggleCommentLike(comment.id)}
                className="flex flex-col items-center gap-0.5 pt-1 text-zinc-400 hover:text-rose-500 transition-colors"
              >
                <Heart 
                  className={`w-4 h-4 transition-all ${
                    likedCommentIds.has(comment.id) ? 'fill-rose-500 text-rose-500' : ''
                  }`} 
                />
                <span className="text-[10px] text-zinc-500">
                  {likedCommentIds.has(comment.id) ? '১' : ''}
                </span>
              </button>
            </div>
          ))}
        </div>

        {/* Quick Emoji Bar */}
        <div className="flex items-center gap-2 px-4 py-2 border-t border-zinc-800/60 overflow-x-auto no-scrollbar">
          {QUICK_EMOJIS.map(emoji => (
            <button
              key={emoji}
              type="button"
              onClick={() => setNewCommentText(prev => prev + emoji)}
              className="text-lg p-1 hover:scale-125 transition-transform shrink-0"
            >
              {emoji}
            </button>
          ))}
        </div>

        {/* Input Bar */}
        <form onSubmit={handleSendComment} className="p-3 px-4 bg-zinc-900 border-t border-zinc-800 flex items-center gap-2 pb-safe">
          <input
            type="text"
            value={newCommentText}
            onChange={(e) => setNewCommentText(e.target.value)}
            placeholder={currentUser ? t('writeComment') : 'মন্তব্য করতে লগইন করুন...'}
            disabled={!currentUser || isLoading}
            className="flex-1 px-4 py-2.5 rounded-full bg-zinc-800 text-sm text-white placeholder-zinc-500 focus:outline-hidden focus:ring-1 focus:ring-cyan-400 border border-zinc-700/60"
          />
          <button
            type="submit"
            disabled={!newCommentText.trim() || !currentUser || isLoading}
            className="p-2.5 rounded-full bg-gradient-to-r from-cyan-500 to-emerald-500 text-white disabled:opacity-40 disabled:cursor-not-allowed hover:opacity-90 transition-all shrink-0 cursor-pointer"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>

      </div>
    </div>
  );
};
