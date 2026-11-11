import React, { useState, useRef, useEffect } from 'react';
import { 
  Radio, 
  X, 
  Send, 
  Gift, 
  Heart, 
  Camera, 
  Sparkles, 
  Users, 
  Volume2, 
  VolumeX, 
  Share2,
  Check,
  Plus
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { LiveGift, LiveChatMessage } from '../types';

interface LiveStreamViewProps {
  onClose: () => void;
}

const AVAILABLE_GIFTS: LiveGift[] = [
  { id: 'g_rose', name: 'Rose', bengaliName: 'গোলাপ', icon: '🌹', coins: 1 },
  { id: 'g_heart', name: 'Heart', bengaliName: 'ভালোবাসা', icon: '💖', coins: 5 },
  { id: 'g_diamond', name: 'Diamond', bengaliName: 'হীরা', icon: '💎', coins: 20 },
  { id: 'g_rocket', name: 'Rocket', bengaliName: 'রকেট', icon: '🚀', coins: 50 },
  { id: 'g_crown', name: 'Crown', bengaliName: 'মুকুট', icon: '👑', coins: 100 },
];

export const LiveStreamView: React.FC<LiveStreamViewProps> = ({ onClose }) => {
  const { currentUser } = useAuth();

  // Mode: 'watching' or 'broadcasting'
  const [streamMode, setStreamMode] = useState<'watching' | 'broadcasting'>('watching');
  const [viewerCount, setViewerCount] = useState<number>(1428);
  const [isFollowingHost, setIsFollowingHost] = useState<boolean>(false);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [showGiftModal, setShowGiftModal] = useState<boolean>(false);
  const [activeGiftBanner, setActiveGiftBanner] = useState<{ sender: string; gift: LiveGift } | null>(null);
  const [commentInput, setCommentInput] = useState<string>('');

  // Floating heart burst for likes
  const [floatingHearts, setFloatingHearts] = useState<{ id: number; x: number; y: number }[]>([]);

  // Camera stream for broadcast mode
  const localVideoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const chatBottomRef = useRef<HTMLDivElement | null>(null);

  // Live Chat Stream State
  const [messages, setMessages] = useState<LiveChatMessage[]>([
    {
      id: 'm1',
      senderId: 'u1',
      senderName: 'সাকিব চৌধুরী',
      senderPhoto: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&auto=format&fit=crop&q=80',
      text: 'লাইভে স্বাগতম ভাই! কেমন আছেন? 🇧🇩',
      timestamp: 'এখন',
    },
    {
      id: 'm2',
      senderId: 'u2',
      senderName: 'তানিয়া আক্তার',
      senderPhoto: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&auto=format&fit=crop&q=80',
      text: 'সাউন্ড কোয়ালিটি খুব ক্লিয়ার! 👏✨',
      timestamp: '১ মিনিট আগে',
    },
    {
      id: 'm3',
      senderId: 'u3',
      senderName: 'আবির আহমেদ',
      senderPhoto: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80',
      text: 'চট্টগ্রাম থেকে দেখছি! সবাইকে ভালোবাসা ❤️',
      timestamp: '১ মিনিট আগে',
    }
  ]);

  // Periodic random live comments and viewers simulation
  useEffect(() => {
    const chatInterval = setInterval(() => {
      const sampleNames = ['রাকিব', 'নুসরাত', 'আরিফ', 'মাহি', 'সুমন', 'মেহেদী'];
      const samplePhrases = [
        'ভালোবাসা রইলো ভাই ❤️',
        'অনেক সুন্দর লাইভ!',
        'লাইক ও শেয়ার দিলাম 🔥',
        'চমৎকার পরিবেশ!',
        'পরবর্তী ভিডিও কবে আসবে?',
        '🇧🇩 বাংলাদেশ জিন্দাবাদ!',
      ];
      const randomName = sampleNames[Math.floor(Math.random() * sampleNames.length)];
      const randomText = samplePhrases[Math.floor(Math.random() * samplePhrases.length)];

      const newMsg: LiveChatMessage = {
        id: `sim_${Date.now()}`,
        senderId: `u_${Date.now()}`,
        senderName: randomName,
        senderPhoto: `https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80`,
        text: randomText,
        timestamp: 'এখন',
      };

      setMessages(prev => [...prev.slice(-25), newMsg]);
      setViewerCount(prev => prev + Math.floor(Math.random() * 5) - 2);
    }, 4000);

    return () => clearInterval(chatInterval);
  }, []);

  // Auto-scroll chat to bottom
  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Switch to broadcasting mode with device camera
  const handleStartBroadcasting = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'user', width: { ideal: 720 }, height: { ideal: 1280 } },
        audio: true,
      });
      streamRef.current = stream;
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream;
        localVideoRef.current.play();
      }
      setStreamMode('broadcasting');
    } catch (err) {
      console.warn('Webcam start failed:', err);
      alert('ক্যামেরা চালু করা যায়নি। আপনি দর্শক হিসেবে লাইভ দেখতে পারেন।');
    }
  };

  const handleStopBroadcasting = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    setStreamMode('watching');
  };

  const handleSendComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentInput.trim() || !currentUser) return;

    const newMsg: LiveChatMessage = {
      id: `my_${Date.now()}`,
      senderId: currentUser.uid,
      senderName: currentUser.displayName,
      senderPhoto: currentUser.photoURL,
      text: commentInput.trim(),
      timestamp: 'এখন',
    };

    setMessages(prev => [...prev, newMsg]);
    setCommentInput('');
  };

  const handleSendGift = (gift: LiveGift) => {
    if (!currentUser) return;
    setShowGiftModal(false);

    // Show screen banner
    setActiveGiftBanner({
      sender: currentUser.displayName,
      gift,
    });
    setTimeout(() => setActiveGiftBanner(null), 3500);

    // Add into chat
    const giftMsg: LiveChatMessage = {
      id: `gift_${Date.now()}`,
      senderId: currentUser.uid,
      senderName: currentUser.displayName,
      senderPhoto: currentUser.photoURL,
      text: `${gift.bengaliName} উপহার পাঠিয়েছেন!`,
      gift,
      timestamp: 'এখন',
    };
    setMessages(prev => [...prev, giftMsg]);
  };

  const triggerFloatingHeart = (e: React.MouseEvent) => {
    const id = Date.now() + Math.random();
    const x = e.clientX || window.innerWidth / 2;
    const y = e.clientY || window.innerHeight / 2;
    setFloatingHearts(prev => [...prev, { id, x, y }]);
    setTimeout(() => {
      setFloatingHearts(prev => prev.filter(h => h.id !== id));
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black flex items-center justify-center overflow-hidden select-none">
      
      {/* BACKGROUND VIDEO FEED */}
      {streamMode === 'broadcasting' ? (
        <video
          ref={localVideoRef}
          playsInline
          muted
          autoPlay
          className="w-full h-full object-cover scale-x-[-1]"
        />
      ) : (
        <div className="relative w-full h-full bg-black flex items-center justify-center">
          <video
            src="https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4"
            autoPlay
            loop
            playsInline
            muted={isMuted}
            className="w-full h-full object-cover sm:object-contain"
          />
        </div>
      )}

      {/* Screen Gradient Overlays */}
      <div className="absolute inset-x-0 top-0 h-36 bg-gradient-to-b from-black/85 via-black/40 to-transparent pointer-events-none" />
      <div className="absolute inset-x-0 bottom-0 h-64 bg-gradient-to-t from-black/95 via-black/60 to-transparent pointer-events-none" />

      {/* FLOATING HEARTS ANIMATION */}
      {floatingHearts.map(h => (
        <div
          key={h.id}
          className="absolute z-40 pointer-events-none animate-heart-burst"
          style={{ left: h.x - 20, top: h.y - 20 }}
        >
          <Heart className="w-10 h-10 fill-rose-500 text-rose-500 drop-shadow-[0_0_12px_rgba(244,63,94,0.9)]" />
        </div>
      ))}

      {/* TOP BAR: Host info, live pill, viewer count, Go Live toggle, Close */}
      <header className="absolute top-0 inset-x-0 z-40 p-4 pt-safe flex items-center justify-between">
        
        {/* Host badge */}
        <div className="flex items-center gap-2 p-1.5 pr-3 rounded-full bg-black/50 backdrop-blur-md border border-white/10">
          <img
            src={streamMode === 'broadcasting' ? (currentUser?.photoURL || '') : 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&auto=format&fit=crop&q=80'}
            alt=""
            className="w-9 h-9 rounded-full object-cover ring-2 ring-rose-500"
          />
          <div>
            <div className="flex items-center gap-1">
              <span className="text-xs font-extrabold text-white">
                {streamMode === 'broadcasting' ? currentUser?.displayName : 'মেহেদী হাসান'}
              </span>
              <span className="px-1.5 py-0.2 rounded-full bg-rose-500 text-[9px] font-black uppercase text-white flex items-center gap-1 animate-pulse">
                <Radio className="w-2.5 h-2.5" />
                লাইভ
              </span>
            </div>
            <div className="flex items-center gap-1 text-[10px] text-zinc-300">
              <Users className="w-3 h-3 text-cyan-400" />
              <span>{viewerCount} দর্শনার্থী</span>
            </div>
          </div>

          {streamMode === 'watching' && (
            <button
              onClick={() => setIsFollowingHost(!isFollowingHost)}
              className={`ml-1 px-2.5 py-1 rounded-full text-xs font-bold transition-all ${
                isFollowingHost
                  ? 'bg-zinc-800 text-zinc-400'
                  : 'bg-rose-500 text-white hover:bg-rose-600'
              }`}
            >
              {isFollowingHost ? <Check className="w-3 h-3" /> : '+ ফলো'}
            </button>
          )}
        </div>

        {/* Right Action Buttons */}
        <div className="flex items-center gap-2">
          {/* Go Live / Stop broadcast toggle */}
          {streamMode === 'watching' ? (
            <button
              onClick={handleStartBroadcasting}
              className="flex items-center gap-1 px-3 py-1.5 rounded-full bg-gradient-to-r from-cyan-500 to-emerald-500 text-white text-xs font-extrabold shadow-md active:scale-95"
            >
              <Camera className="w-3.5 h-3.5" />
              <span>গো লাইভ</span>
            </button>
          ) : (
            <button
              onClick={handleStopBroadcasting}
              className="px-3 py-1.5 rounded-full bg-rose-600 text-white text-xs font-extrabold shadow-md active:scale-95"
            >
              লাইভ শেষ করুন
            </button>
          )}

          {/* Mute button */}
          <button
            onClick={() => setIsMuted(!isMuted)}
            className="p-2 rounded-full bg-black/50 backdrop-blur-md text-white hover:bg-black/70"
          >
            {isMuted ? <VolumeX className="w-4 h-4 text-rose-400" /> : <Volume2 className="w-4 h-4 text-cyan-400" />}
          </button>

          {/* Close button */}
          <button
            onClick={() => {
              handleStopBroadcasting();
              onClose();
            }}
            className="p-2 rounded-full bg-black/50 backdrop-blur-md text-white hover:bg-black/70"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </header>

      {/* POPUP GIFT BANNER NOTIFICATION */}
      {activeGiftBanner && (
        <div className="absolute top-24 left-4 z-40 flex items-center gap-3 p-2.5 px-4 rounded-2xl bg-gradient-to-r from-amber-500/90 via-rose-500/90 to-purple-600/90 backdrop-blur-xl border border-white/20 text-white shadow-2xl animate-in slide-in-from-left duration-300">
          <span className="text-3xl animate-bounce">{activeGiftBanner.gift.icon}</span>
          <div>
            <p className="text-xs font-bold">
              <span className="text-amber-200">{activeGiftBanner.sender}</span> উপহার পাঠিয়েছেন!
            </p>
            <p className="text-[11px] text-white/90 font-medium">
              {activeGiftBanner.gift.bengaliName} ({activeGiftBanner.gift.coins} কয়েন)
            </p>
          </div>
        </div>
      )}

      {/* BOTTOM CHAT STREAM & INPUT RAIL */}
      <div className="absolute inset-x-0 bottom-0 z-30 p-4 pb-safe flex flex-col justify-end pointer-events-none">
        
        {/* Scrolling Chat Messages Area */}
        <div className="pointer-events-auto max-h-48 overflow-y-auto space-y-2 mb-3 max-w-sm no-scrollbar">
          {messages.map((msg) => (
            <div 
              key={msg.id}
              className={`p-2 px-3 rounded-2xl backdrop-blur-md text-xs leading-relaxed inline-block max-w-[90%] shadow-sm ${
                msg.gift 
                  ? 'bg-gradient-to-r from-amber-500/30 to-rose-500/30 border border-amber-400/40 text-amber-200' 
                  : 'bg-black/45 border border-white/10 text-white'
              }`}
            >
              <div className="flex items-center gap-1.5 mb-0.5">
                <span className="font-bold text-cyan-300">@{msg.senderName}</span>
                {msg.gift && (
                  <span className="text-base">{msg.gift.icon}</span>
                )}
              </div>
              <p className="font-normal text-zinc-100">{msg.text}</p>
            </div>
          ))}
          <div ref={chatBottomRef} />
        </div>

        {/* Action Controls Row */}
        <div className="pointer-events-auto flex items-center gap-2">
          
          {/* Chat Form */}
          <form onSubmit={handleSendComment} className="flex-1 flex items-center gap-1.5 bg-black/50 backdrop-blur-md rounded-full px-3 py-1.5 border border-white/20">
            <input
              type="text"
              value={commentInput}
              onChange={(e) => setCommentInput(e.target.value)}
              placeholder="লাইভ আড্ডায় লিখুন..."
              className="flex-1 bg-transparent text-xs text-white placeholder-zinc-400 focus:outline-hidden"
            />
            <button
              type="submit"
              disabled={!commentInput.trim()}
              className="p-1 text-cyan-400 disabled:opacity-40"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>

          {/* Send Gift Button */}
          <button
            onClick={() => setShowGiftModal(true)}
            className="p-2.5 rounded-full bg-gradient-to-r from-amber-500 to-rose-500 text-white shadow-lg active:scale-90 hover:opacity-95 transition-all"
            title="উপহার পাঠান"
          >
            <Gift className="w-5 h-5" />
          </button>

          {/* Tap to Like Button */}
          <button
            onClick={triggerFloatingHeart}
            className="p-2.5 rounded-full bg-rose-500 text-white shadow-lg active:scale-90 hover:scale-105 transition-all"
            title="লাইক"
          >
            <Heart className="w-5 h-5 fill-white" />
          </button>

        </div>

      </div>

      {/* GIFT SELECTOR DRAWER */}
      {showGiftModal && (
        <div 
          className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 backdrop-blur-xs animate-in fade-in"
          onClick={() => setShowGiftModal(false)}
        >
          <div 
            className="w-full max-w-md bg-zinc-950/95 border-t border-zinc-800 rounded-t-3xl backdrop-blur-2xl p-5 pb-safe shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-3 border-b border-zinc-800 mb-4">
              <div className="flex items-center gap-2">
                <Gift className="w-5 h-5 text-amber-400" />
                <h3 className="text-sm font-bold text-white">উপহার পাঠান</h3>
              </div>
              <button
                onClick={() => setShowGiftModal(false)}
                className="p-1 rounded-full text-zinc-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-5 gap-2">
              {AVAILABLE_GIFTS.map((g) => (
                <button
                  key={g.id}
                  onClick={() => handleSendGift(g)}
                  className="flex flex-col items-center gap-1 p-2 rounded-2xl bg-zinc-900 border border-zinc-800 hover:border-amber-400 hover:scale-105 active:scale-95 transition-all group"
                >
                  <span className="text-3xl group-hover:scale-110 transition-transform">{g.icon}</span>
                  <span className="text-[11px] font-bold text-zinc-200">{g.bengaliName}</span>
                  <span className="text-[9px] text-amber-400 font-bold">{g.coins} কয়েন</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
