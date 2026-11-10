import React, { useState } from 'react';
import { Plus, X, Heart, Send } from 'lucide-react';
import { StoryItem } from '../types';
import { INITIAL_STORIES } from '../utils/mockData';
import { useAuth } from '../contexts/AuthContext';

export const StoriesBar: React.FC = () => {
  const { currentUser, t } = useAuth();
  const [stories, setStories] = useState<StoryItem[]>(INITIAL_STORIES);
  const [activeStoryIndex, setActiveStoryIndex] = useState<number | null>(null);
  const [storyTextReply, setStoryTextReply] = useState('');
  const [likedCurrentStory, setLikedCurrentStory] = useState(false);

  const activeStory = activeStoryIndex !== null ? stories[activeStoryIndex] : null;

  const handleNextStory = () => {
    if (activeStoryIndex !== null) {
      if (activeStoryIndex < stories.length - 1) {
        setActiveStoryIndex(activeStoryIndex + 1);
        setLikedCurrentStory(false);
      } else {
        setActiveStoryIndex(null);
      }
    }
  };

  const handlePrevStory = () => {
    if (activeStoryIndex !== null && activeStoryIndex > 0) {
      setActiveStoryIndex(activeStoryIndex - 1);
      setLikedCurrentStory(false);
    }
  };

  const handleAddQuickStory = () => {
    if (!currentUser) return;
    const newStory: StoryItem = {
      id: `story_${Date.now()}`,
      authorId: currentUser.uid,
      authorName: currentUser.displayName,
      authorPhoto: currentUser.photoURL,
      mediaUrl: 'https://images.unsplash.com/photo-1518495973542-4542c06a5843?w=800&auto=format&fit=crop&q=80',
      type: 'photo',
      caption: 'টেকেল লাইভে আমার নতুন স্টোরি! 🌟',
      createdAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + 24 * 3600000).toISOString(),
    };
    setStories([newStory, ...stories]);
    setActiveStoryIndex(0);
  };

  return (
    <>
      {/* Horizontal Scrollable Stories Container */}
      <div className="w-full bg-white dark:bg-zinc-900/60 rounded-2xl border border-zinc-200 dark:border-zinc-800/80 p-3 mb-4 shadow-xs">
        <div className="flex items-center gap-3 overflow-x-auto no-scrollbar py-1">
          
          {/* Add Your Story Button */}
          <div className="flex flex-col items-center flex-shrink-0 cursor-pointer group" onClick={handleAddQuickStory}>
            <div className="relative">
              <img
                src={currentUser?.photoURL || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80'}
                alt="My story"
                className="w-15 h-15 rounded-full object-cover p-0.5 border-2 border-dashed border-emerald-500/80 group-hover:scale-105 transition-transform"
              />
              <span className="absolute bottom-0 right-0 w-5 h-5 bg-emerald-600 rounded-full flex items-center justify-center text-white border-2 border-white dark:border-zinc-900 shadow-sm">
                <Plus className="w-3.5 h-3.5 stroke-[3]" />
              </span>
            </div>
            <span className="text-[11px] font-medium text-zinc-700 dark:text-zinc-300 mt-1 max-w-16 truncate">
              {t('addStory')}
            </span>
          </div>

          {/* User Stories */}
          {stories.map((story, idx) => (
            <div
              key={story.id}
              onClick={() => {
                setActiveStoryIndex(idx);
                setLikedCurrentStory(false);
              }}
              className="flex flex-col items-center flex-shrink-0 cursor-pointer group"
            >
              <div className="p-0.5 rounded-full bg-gradient-to-tr from-amber-500 via-rose-500 to-emerald-500 group-hover:scale-105 transition-transform shadow-xs">
                <div className="p-0.5 bg-white dark:bg-zinc-900 rounded-full">
                  <img
                    src={story.authorPhoto}
                    alt={story.authorName}
                    className="w-14 h-14 rounded-full object-cover"
                  />
                </div>
              </div>
              <span className="text-[11px] font-medium text-zinc-700 dark:text-zinc-300 mt-1 max-w-16 truncate">
                {story.authorName.split(' ')[0]}
              </span>
            </div>
          ))}

        </div>
      </div>

      {/* Full-Screen Immersive Story Viewer Modal */}
      {activeStory && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 backdrop-blur-md">
          {/* Close button */}
          <button
            onClick={() => setActiveStoryIndex(null)}
            className="absolute top-4 right-4 z-50 p-2 text-white/80 hover:text-white bg-zinc-800/60 rounded-full hover:bg-zinc-700/80 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>

          {/* Main Story Container with phone aspect ratio */}
          <div className="relative w-full max-w-md h-full sm:h-[85vh] sm:rounded-3xl overflow-hidden bg-zinc-950 flex flex-col justify-between shadow-2xl">
            {/* Progress indicators bar */}
            <div className="absolute top-3 left-3 right-3 z-30 flex items-center gap-1.5">
              {stories.map((_, i) => (
                <div key={i} className="h-1 flex-1 bg-white/30 rounded-full overflow-hidden">
                  <div
                    className={`h-full bg-white transition-all duration-300 ${
                      i < (activeStoryIndex ?? 0)
                        ? 'w-full'
                        : i === activeStoryIndex
                        ? 'w-full animate-[pulse_4s_ease-in-out]'
                        : 'w-0'
                    }`}
                  />
                </div>
              ))}
            </div>

            {/* Author info header */}
            <div className="absolute top-7 left-4 z-30 flex items-center gap-2.5">
              <img
                src={activeStory.authorPhoto}
                alt=""
                className="w-9 h-9 rounded-full object-cover ring-2 ring-white/80"
              />
              <div>
                <p className="text-white text-sm font-semibold drop-shadow-md">
                  {activeStory.authorName}
                </p>
                <p className="text-white/70 text-xs drop-shadow-xs">স্টোরি আপডেট</p>
              </div>
            </div>

            {/* Media Image & Tap Navigation overlay */}
            <div className="relative w-full h-full flex items-center justify-center bg-zinc-900">
              <img
                src={activeStory.mediaUrl}
                alt=""
                className="w-full h-full object-cover"
              />
              {/* Left Tap for previous */}
              <div
                onClick={handlePrevStory}
                className="absolute top-16 bottom-20 left-0 w-1/3 z-20 cursor-pointer"
                title="Previous"
              />
              {/* Right Tap for next */}
              <div
                onClick={handleNextStory}
                className="absolute top-16 bottom-20 right-0 w-2/3 z-20 cursor-pointer"
                title="Next"
              />
            </div>

            {/* Caption & Quick Reaction Bar */}
            <div className="absolute bottom-0 left-0 right-0 z-30 p-4 bg-gradient-to-t from-black/90 via-black/50 to-transparent">
              {activeStory.caption && (
                <p className="text-white text-sm font-medium mb-3 text-center px-2 drop-shadow-md">
                  {activeStory.caption}
                </p>
              )}
              
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  placeholder="একটি প্রতিক্রিয়া পাঠান..."
                  value={storyTextReply}
                  onChange={(e) => setStoryTextReply(e.target.value)}
                  className="flex-1 px-4 py-2 text-sm bg-white/20 border border-white/30 rounded-full text-white placeholder-white/70 focus:outline-hidden focus:ring-2 focus:ring-emerald-400"
                />
                
                <button
                  onClick={() => setLikedCurrentStory(!likedCurrentStory)}
                  className="p-2.5 rounded-full bg-white/20 hover:bg-white/30 text-white transition-colors"
                >
                  <Heart
                    className={`w-5 h-5 ${
                      likedCurrentStory ? 'fill-rose-500 text-rose-500 scale-110' : 'text-white'
                    } transition-transform`}
                  />
                </button>

                <button
                  onClick={() => {
                    if (storyTextReply.trim()) {
                      setStoryTextReply('');
                      handleNextStory();
                    }
                  }}
                  className="p-2.5 rounded-full bg-emerald-600 hover:bg-emerald-500 text-white transition-colors"
                >
                  <Send className="w-5 h-5" />
                </button>
              </div>
            </div>

          </div>
        </div>
      )}
    </>
  );
};
