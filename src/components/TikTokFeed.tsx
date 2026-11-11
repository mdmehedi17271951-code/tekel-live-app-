import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Radio, Search, Sparkles } from 'lucide-react';
import { Post } from '../types';
import { TikTokVideoCard } from './TikTokVideoCard';
import { useAuth } from '../contexts/AuthContext';

interface TikTokFeedProps {
  posts: Post[];
  activeFeedTab: 'forYou' | 'following';
  onChangeFeedTab: (tab: 'forYou' | 'following') => void;
  onOpenLive: () => void;
  onOpenSearch: () => void;
  onOpenComments: (post: Post) => void;
  onOpenShare: (post: Post) => void;
  onUserClick: (userId: string) => void;
  onOpenCreate: () => void;
}

export const TikTokFeed: React.FC<TikTokFeedProps> = ({
  posts,
  activeFeedTab,
  onChangeFeedTab,
  onOpenLive,
  onOpenSearch,
  onOpenComments,
  onOpenShare,
  onUserClick,
  onOpenCreate,
}) => {
  const { t } = useAuth();
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [activeIndex, setActiveIndex] = useState<number>(0);

  // Filter posts based on active feed tab
  const displayPosts = posts;

  // Track currently visible video through Intersection Observer
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const items = container.querySelectorAll('.snap-feed-item');
    if (!items.length) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && entry.intersectionRatio >= 0.6) {
            const index = Array.from(items).indexOf(entry.target);
            if (index !== -1) {
              setActiveIndex(index);
            }
          }
        });
      },
      {
        root: container,
        threshold: 0.6,
      }
    );

    items.forEach((item) => observer.observe(item));

    return () => {
      observer.disconnect();
    };
  }, [displayPosts]);

  // Keyboard navigation for desktop users (ArrowUp / ArrowDown)
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (!containerRef.current) return;
    const itemHeight = containerRef.current.clientHeight;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      containerRef.current.scrollBy({ top: itemHeight, behavior: 'smooth' });
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      containerRef.current.scrollBy({ top: -itemHeight, behavior: 'smooth' });
    }
  }, []);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  return (
    <div className="relative w-full h-[100dvh] bg-black overflow-hidden">
      
      {/* FLOATING TOP HEADER (LIVE, Following | For You, Search) */}
      <header className="absolute top-0 inset-x-0 z-40 h-16 flex items-center justify-between px-4 pt-safe pointer-events-none">
        
        {/* Left: LIVE Button */}
        <button
          onClick={onOpenLive}
          className="pointer-events-auto flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-black/40 backdrop-blur-md text-white border border-rose-500/40 hover:bg-black/60 transition-all cursor-pointer shadow-lg active:scale-95"
        >
          <Radio className="w-4 h-4 text-rose-500 animate-pulse" />
          <span className="text-xs font-black tracking-wider uppercase text-rose-400">
            {t('live')}
          </span>
        </button>

        {/* Center: Tabs (Following | For You) */}
        <div className="pointer-events-auto flex items-center gap-5 text-sm font-bold drop-shadow-md">
          <button
            onClick={() => onChangeFeedTab('following')}
            className={`relative py-1 transition-all ${
              activeFeedTab === 'following'
                ? 'text-white font-extrabold text-base'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <span>{t('following')}</span>
            {activeFeedTab === 'following' && (
              <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-7 h-0.75 bg-gradient-to-r from-cyan-400 to-emerald-400 rounded-full" />
            )}
          </button>

          <span className="text-zinc-600">|</span>

          <button
            onClick={() => onChangeFeedTab('forYou')}
            className={`relative py-1 transition-all ${
              activeFeedTab === 'forYou'
                ? 'text-white font-extrabold text-base'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <span>{t('forYou')}</span>
            {activeFeedTab === 'forYou' && (
              <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-7 h-0.75 bg-gradient-to-r from-cyan-400 to-emerald-400 rounded-full" />
            )}
          </button>
        </div>

        {/* Right: Search Button */}
        <button
          onClick={onOpenSearch}
          className="pointer-events-auto p-2.5 rounded-full bg-black/40 backdrop-blur-md text-white hover:bg-black/60 transition-all cursor-pointer shadow-lg active:scale-95"
          title={t('search')}
        >
          <Search className="w-5 h-5 text-white/90" />
        </button>
      </header>

      {/* SNAP-SCROLL VERTICAL FEED */}
      <div
        ref={containerRef}
        className="w-full h-full snap-feed-container overflow-y-scroll overflow-x-hidden no-scrollbar"
      >
        {displayPosts.length === 0 ? (
          <div className="w-full h-full flex flex-col items-center justify-center p-6 text-center bg-[#080808] text-white">
            <div className="w-20 h-20 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center mb-4 text-cyan-400">
              <Sparkles className="w-10 h-10" />
            </div>
            <h3 className="text-lg font-bold mb-2">কোনো ভিডিও পাওয়া যায়নি</h3>
            <p className="text-sm text-zinc-400 max-w-xs mb-6">
              প্রথম ভিডিওটি তৈরি করে সবাইকে চমকে দিন!
            </p>
            <button
              onClick={onOpenCreate}
              className="px-6 py-3 rounded-full bg-gradient-to-r from-cyan-500 to-emerald-500 text-white font-bold text-sm shadow-lg shadow-cyan-500/25 active:scale-95 transition-all"
            >
              ভিডিও তৈরি করুন
            </button>
          </div>
        ) : (
          displayPosts.map((post, idx) => (
            <TikTokVideoCard
              key={post.id}
              post={post}
              isActive={idx === activeIndex}
              onOpenComments={onOpenComments}
              onOpenShare={onOpenShare}
              onUserClick={onUserClick}
            />
          ))
        )}
      </div>

    </div>
  );
};
