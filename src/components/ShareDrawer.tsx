import React, { useState } from 'react';
import { 
  X, 
  Copy, 
  Check, 
  Repeat, 
  Download, 
  Flag, 
  Share2, 
  Sparkles,
  MessageCircle
} from 'lucide-react';
import { Post } from '../types';
import { useAuth } from '../contexts/AuthContext';
import { SAMPLE_USERS } from '../utils/mockData';

interface ShareDrawerProps {
  post: Post | null;
  isOpen: boolean;
  onClose: () => void;
  onShareToFeed?: (text: string) => void;
}

export const ShareDrawer: React.FC<ShareDrawerProps> = ({
  post,
  isOpen,
  onClose,
  onShareToFeed,
}) => {
  const { t } = useAuth();
  const [copied, setCopied] = useState(false);
  const [sentFriendIds, setSentFriendIds] = useState<Set<string>>(new Set());

  if (!isOpen || !post) return null;

  const postUrl = window.location.href;

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(postUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      // Fallback
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  const handleSendToFriend = (friendId: string) => {
    setSentFriendIds(prev => new Set(prev).add(friendId));
  };

  const handleShareToWhatsApp = () => {
    const text = encodeURIComponent(`টেকেল লাইভে @${post.authorUsername}-এর এই ভাইরাল ভিডিওটি দেখুন: ${post.content}\n${postUrl}`);
    window.open(`https://api.whatsapp.com/send?text=${text}`, '_blank');
  };

  const handleShareToFacebook = () => {
    window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(postUrl)}`, '_blank');
  };

  const handleRepost = () => {
    if (onShareToFeed) {
      onShareToFeed(`রিপোস্ট: @${post.authorUsername}-এর ভিডিও:\n"${post.content}"\n#টেকেললাইভ #রিপোস্ট`);
      onClose();
    }
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 backdrop-blur-xs animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div 
        className="w-full max-w-lg bg-zinc-950/95 border-t border-zinc-800 rounded-t-3xl backdrop-blur-2xl shadow-2xl p-5 pb-safe animate-in slide-in-from-bottom duration-300"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Drag handle */}
        <div className="w-10 h-1 bg-zinc-700 rounded-full mx-auto mb-4" />

        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-zinc-800/80 mb-4">
          <h3 className="text-sm font-bold text-white tracking-wide">
            {t('share')}
          </h3>
          <button
            onClick={onClose}
            className="p-1 rounded-full text-zinc-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Send to friends row */}
        <div className="mb-4">
          <p className="text-xs text-zinc-400 font-semibold mb-3">বন্ধুদের কাছে পাঠান</p>
          <div className="flex items-center gap-4 overflow-x-auto no-scrollbar py-1">
            {SAMPLE_USERS.map((friend) => (
              <div 
                key={friend.uid}
                onClick={() => handleSendToFriend(friend.uid)}
                className="flex flex-col items-center gap-1.5 shrink-0 cursor-pointer group"
              >
                <div className="relative">
                  <img
                    src={friend.photoURL}
                    alt={friend.displayName}
                    className="w-13 h-13 rounded-full object-cover ring-2 ring-zinc-700 group-hover:ring-cyan-400 transition-all"
                  />
                  {sentFriendIds.has(friend.uid) && (
                    <span className="absolute inset-0 rounded-full bg-cyan-500/80 flex items-center justify-center text-white">
                      <Check className="w-5 h-5" />
                    </span>
                  )}
                </div>
                <span className="text-[11px] text-zinc-300 truncate w-14 text-center">
                  {sentFriendIds.has(friend.uid) ? 'পাঠানো হয়েছে' : friend.displayName.split(' ')[0]}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Share action icons grid */}
        <div className="grid grid-cols-4 gap-3 py-2 border-t border-zinc-800/80">
          
          {/* Copy link */}
          <button
            onClick={handleCopyLink}
            className="flex flex-col items-center gap-1.5 p-2 rounded-2xl hover:bg-zinc-900 transition-colors cursor-pointer"
          >
            <div className="w-12 h-12 rounded-full bg-zinc-800 flex items-center justify-center text-cyan-400 shadow-sm">
              {copied ? <Check className="w-5 h-5 text-emerald-400" /> : <Copy className="w-5 h-5" />}
            </div>
            <span className="text-[11px] text-zinc-300">
              {copied ? 'কপি হয়েছে' : 'কপি লিঙ্ক'}
            </span>
          </button>

          {/* Repost */}
          <button
            onClick={handleRepost}
            className="flex flex-col items-center gap-1.5 p-2 rounded-2xl hover:bg-zinc-900 transition-colors cursor-pointer"
          >
            <div className="w-12 h-12 rounded-full bg-emerald-500/10 text-emerald-400 flex items-center justify-center shadow-sm">
              <Repeat className="w-5 h-5" />
            </div>
            <span className="text-[11px] text-zinc-300">রিপোস্ট</span>
          </button>

          {/* WhatsApp */}
          <button
            onClick={handleShareToWhatsApp}
            className="flex flex-col items-center gap-1.5 p-2 rounded-2xl hover:bg-zinc-900 transition-colors cursor-pointer"
          >
            <div className="w-12 h-12 rounded-full bg-emerald-600/20 text-emerald-400 flex items-center justify-center shadow-sm">
              <MessageCircle className="w-5 h-5" />
            </div>
            <span className="text-[11px] text-zinc-300">হোয়াটসঅ্যাপ</span>
          </button>

          {/* Facebook */}
          <button
            onClick={handleShareToFacebook}
            className="flex flex-col items-center gap-1.5 p-2 rounded-2xl hover:bg-zinc-900 transition-colors cursor-pointer"
          >
            <div className="w-12 h-12 rounded-full bg-blue-600/20 text-blue-400 flex items-center justify-center shadow-sm">
              <Share2 className="w-5 h-5" />
            </div>
            <span className="text-[11px] text-zinc-300">ফেসবুক</span>
          </button>

        </div>

      </div>
    </div>
  );
};
