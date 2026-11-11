import React, { useState, useEffect } from 'react';
import { 
  X, 
  Image, 
  Video, 
  Smile, 
  Upload, 
  Sparkles, 
  Film, 
  Hash, 
  Send 
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { Post, PostType } from '../types';
import { FirestoreService } from '../services/firestore';
import { SAMPLE_VIDEOS } from '../utils/mockData';

interface CreatePostModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPostCreated: (post: Post) => void;
  initialContent?: string;
}

const PRESET_PHOTO_OPTIONS = [
  {
    name: 'পদ্মা সেতু',
    url: 'https://images.unsplash.com/photo-1584551246679-0daf3d275d0f?w=1200&auto=format&fit=crop&q=80',
  },
  {
    name: 'কক্সবাজার সমুদ্র সৈকত',
    url: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=1200&auto=format&fit=crop&q=80',
  },
  {
    name: 'শ্রীমঙ্গলের চা বাগান',
    url: 'https://images.unsplash.com/photo-1544735716-392fe2489ffa?w=1200&auto=format&fit=crop&q=80',
  },
  {
    name: 'লালবাগ কেল্লা',
    url: 'https://images.unsplash.com/photo-1589182373726-e4f658ab50f0?w=1200&auto=format&fit=crop&q=80',
  },
];

const SUGGESTED_HASHTAGS = ['#টেকেললাইভ', '#বাংলাদেশ', '#প্রকৃতি', '#ভ্রমন', '#প্রযুক্তি', '#আনন্দ'];

export const CreatePostModal: React.FC<CreatePostModalProps> = ({
  isOpen,
  onClose,
  onPostCreated,
  initialContent,
}) => {
  const { currentUser, t } = useAuth();
  const [content, setContent] = useState('');
  const [postType, setPostType] = useState<PostType>('photo');
  const [mediaUrl, setMediaUrl] = useState('');
  const [videoUrl, setVideoUrl] = useState('');
  const [selectedFeeling, setSelectedFeeling] = useState('');
  const [selectedTag, setSelectedTag] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPresetPicker, setShowPresetPicker] = useState(false);

  useEffect(() => {
    if (isOpen && initialContent) {
      setContent(initialContent);
      setPostType('text');
    }
  }, [isOpen, initialContent]);

  if (!isOpen) return null;

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === 'string') {
          if (file.type.startsWith('video/')) {
            setPostType('video');
            setVideoUrl(reader.result);
          } else {
            setPostType('photo');
            setMediaUrl(reader.result);
          }
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAddHashtag = (tag: string) => {
    if (!content.includes(tag)) {
      setContent(prev => (prev ? `${prev} ${tag}` : tag));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;
    if (!content.trim() && !mediaUrl && !videoUrl) return;

    setIsSubmitting(true);
    try {
      let finalContent = content.trim();
      if (selectedFeeling) {
        finalContent = `${finalContent}\n\n— অনুভূতি: ${selectedFeeling}`;
      }

      const tags = finalContent
        .split(' ')
        .filter(word => word.startsWith('#'));

      const newPost = await FirestoreService.createPost({
        authorId: currentUser.uid,
        authorName: currentUser.displayName,
        authorPhoto: currentUser.photoURL,
        authorUsername: currentUser.username,
        authorRole: currentUser.role,
        isAuthorVerified: currentUser.isVerified,
        type: postType,
        content: finalContent,
        mediaUrl: postType === 'photo' ? (mediaUrl || undefined) : undefined,
        videoUrl: postType === 'video' ? (videoUrl || undefined) : undefined,
        tags: tags.length ? tags : ['#টেকেললাইভ'],
      });

      onPostCreated(newPost);
      // Reset
      setContent('');
      setMediaUrl('');
      setVideoUrl('');
      setSelectedFeeling('');
      onClose();
    } catch (err) {
      console.error('Failed to create post:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-xs p-0 sm:p-4">
      <div 
        className="w-full max-w-lg bg-white dark:bg-zinc-900 rounded-t-3xl sm:rounded-3xl border border-zinc-200 dark:border-zinc-800 shadow-2xl overflow-hidden max-h-[90vh] flex flex-col animate-in fade-in zoom-in-95 duration-200"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-zinc-100 dark:border-zinc-800">
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
              <Sparkles className="w-5 h-5" />
            </span>
            <h2 className="text-lg font-bold text-zinc-900 dark:text-white">
              {t('createPost')}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-5 space-y-4">
          
          {/* Author Badge */}
          {currentUser && (
            <div className="flex items-center gap-3">
              <img
                src={currentUser.photoURL}
                alt={currentUser.displayName}
                className="w-11 h-11 rounded-full object-cover ring-2 ring-emerald-500/30"
              />
              <div>
                <p className="text-sm font-semibold text-zinc-900 dark:text-white">
                  {currentUser.displayName}
                </p>
                <div className="flex items-center gap-1.5 text-xs text-zinc-500 dark:text-zinc-400">
                  <span>@{currentUser.username}</span>
                  <span>•</span>
                  <span className="text-emerald-600 dark:text-emerald-400 font-medium">পাবলিক পোস্ট</span>
                </div>
              </div>
            </div>
          )}

          {/* Text Area */}
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder={t('whatsOnYourMind')}
            rows={4}
            className="w-full text-base bg-transparent border-0 focus:outline-hidden focus:ring-0 text-zinc-800 dark:text-zinc-100 placeholder-zinc-400 dark:placeholder-zinc-500 resize-none"
          />

          {/* Quick Hashtags */}
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-1">
            <span className="text-xs text-zinc-400 flex items-center gap-0.5">
              <Hash className="w-3.5 h-3.5" />
            </span>
            {SUGGESTED_HASHTAGS.map((tag) => (
              <button
                key={tag}
                type="button"
                onClick={() => handleAddHashtag(tag)}
                className="px-2.5 py-1 text-xs font-medium rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-emerald-50 hover:text-emerald-600 dark:hover:bg-emerald-950/60 dark:hover:text-emerald-400 transition-colors shrink-0"
              >
                {tag}
              </button>
            ))}
          </div>

          {/* Post Type Selector Tabs */}
          <div className="flex p-1 bg-zinc-100 dark:bg-zinc-800/80 rounded-xl">
            <button
              type="button"
              onClick={() => setPostType('photo')}
              className={`flex-1 py-1.5 text-xs font-semibold rounded-lg flex items-center justify-center gap-1.5 transition-all ${
                postType === 'photo'
                  ? 'bg-white dark:bg-zinc-700 text-emerald-600 dark:text-emerald-400 shadow-xs'
                  : 'text-zinc-600 dark:text-zinc-400'
              }`}
            >
              <Image className="w-4 h-4" />
              <span>{t('addPhoto')}</span>
            </button>

            <button
              type="button"
              onClick={() => setPostType('video')}
              className={`flex-1 py-1.5 text-xs font-semibold rounded-lg flex items-center justify-center gap-1.5 transition-all ${
                postType === 'video'
                  ? 'bg-white dark:bg-zinc-700 text-emerald-600 dark:text-emerald-400 shadow-xs'
                  : 'text-zinc-600 dark:text-zinc-400'
              }`}
            >
              <Video className="w-4 h-4" />
              <span>{t('addVideo')}</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setPostType('text');
                setMediaUrl('');
                setVideoUrl('');
              }}
              className={`flex-1 py-1.5 text-xs font-semibold rounded-lg flex items-center justify-center gap-1.5 transition-all ${
                postType === 'text'
                  ? 'bg-white dark:bg-zinc-700 text-emerald-600 dark:text-emerald-400 shadow-xs'
                  : 'text-zinc-600 dark:text-zinc-400'
              }`}
            >
              <span>শুধু লেখা</span>
            </button>
          </div>

          {/* Media Inputs according to postType */}
          {postType === 'photo' && (
            <div className="space-y-3 p-3.5 bg-zinc-50 dark:bg-zinc-800/40 rounded-2xl border border-zinc-200/80 dark:border-zinc-700/60">
              <div className="flex items-center justify-between text-xs font-medium text-zinc-600 dark:text-zinc-300">
                <span>ছবির মাধ্যম নির্বাচন করুন:</span>
                <button
                  type="button"
                  onClick={() => setShowPresetPicker(!showPresetPicker)}
                  className="text-emerald-600 dark:text-emerald-400 font-semibold hover:underline"
                >
                  {showPresetPicker ? 'লুকান' : 'সুন্দর দৃশ্য থেকে বাছুন'}
                </button>
              </div>

              {/* Preset Gallery */}
              {showPresetPicker && (
                <div className="grid grid-cols-2 gap-2 pt-1">
                  {PRESET_PHOTO_OPTIONS.map((item) => (
                    <div
                      key={item.name}
                      onClick={() => setMediaUrl(item.url)}
                      className={`relative cursor-pointer rounded-xl overflow-hidden border-2 transition-all ${
                        mediaUrl === item.url
                          ? 'border-emerald-500 scale-[1.02]'
                          : 'border-transparent hover:border-zinc-300 dark:hover:border-zinc-600'
                      }`}
                    >
                      <img src={item.url} alt={item.name} className="w-full h-20 object-cover" />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex items-end p-1.5">
                        <span className="text-[11px] text-white font-medium truncate">{item.name}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* URL or Device upload */}
              <div className="flex gap-2">
                <input
                  type="url"
                  placeholder="https://example.com/image.jpg"
                  value={mediaUrl}
                  onChange={(e) => setMediaUrl(e.target.value)}
                  className="flex-1 px-3 py-2 text-xs rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 text-zinc-800 dark:text-zinc-200 focus:ring-2 focus:ring-emerald-500"
                />
                
                <label className="flex items-center gap-1 px-3 py-2 text-xs font-semibold rounded-xl bg-emerald-600/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 hover:bg-emerald-600/20 cursor-pointer transition-colors shrink-0">
                  <Upload className="w-4 h-4" />
                  <span>ডিভাইস</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                </label>
              </div>

              {/* Image Preview */}
              {mediaUrl && (
                <div className="relative rounded-2xl overflow-hidden border border-zinc-200 dark:border-zinc-700 max-h-56">
                  <img src={mediaUrl} alt="Preview" className="w-full h-auto object-cover max-h-56" />
                  <button
                    type="button"
                    onClick={() => setMediaUrl('')}
                    className="absolute top-2 right-2 p-1.5 bg-black/70 hover:bg-black/90 text-white rounded-full transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>
          )}

          {postType === 'video' && (
            <div className="space-y-3 p-3.5 bg-zinc-50 dark:bg-zinc-800/40 rounded-2xl border border-zinc-200/80 dark:border-zinc-700/60">
              <div className="flex items-center justify-between text-xs font-medium text-zinc-600 dark:text-zinc-300">
                <span>ভিডিও যুক্ত করুন:</span>
                <span className="text-[11px] text-zinc-400">MP4 লিঙ্ক বা নমুনা ভিডিও</span>
              </div>

              {/* Sample Videos to choose from */}
              <div className="grid grid-cols-3 gap-2">
                {SAMPLE_VIDEOS.map((vid) => (
                  <div
                    key={vid.title}
                    onClick={() => setVideoUrl(vid.url)}
                    className={`relative cursor-pointer rounded-xl overflow-hidden border-2 transition-all ${
                      videoUrl === vid.url
                        ? 'border-emerald-500 scale-[1.02]'
                        : 'border-transparent hover:border-zinc-300 dark:hover:border-zinc-600'
                    }`}
                  >
                    <img src={vid.thumbnail} alt="" className="w-full h-16 object-cover" />
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                      <Film className="w-5 h-5 text-white" />
                    </div>
                    <span className="absolute bottom-1 left-1 right-1 text-[10px] text-white font-medium truncate drop-shadow-xs">
                      {vid.title}
                    </span>
                  </div>
                ))}
              </div>

              <div className="flex gap-2">
                <input
                  type="url"
                  placeholder="https://example.com/video.mp4"
                  value={videoUrl}
                  onChange={(e) => setVideoUrl(e.target.value)}
                  className="flex-1 px-3 py-2 text-xs rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 text-zinc-800 dark:text-zinc-200 focus:ring-2 focus:ring-emerald-500"
                />

                <label className="flex items-center gap-1 px-3 py-2 text-xs font-semibold rounded-xl bg-emerald-600/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 hover:bg-emerald-600/20 cursor-pointer transition-colors shrink-0">
                  <Upload className="w-4 h-4" />
                  <span>ভিডিও ফাইল</span>
                  <input
                    type="file"
                    accept="video/*"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                </label>
              </div>

              {/* Video Preview */}
              {videoUrl && (
                <div className="relative rounded-2xl overflow-hidden border border-zinc-200 dark:border-zinc-700">
                  <video
                    src={videoUrl}
                    controls
                    className="w-full max-h-56 bg-black rounded-2xl"
                  />
                  <button
                    type="button"
                    onClick={() => setVideoUrl('')}
                    className="absolute top-2 right-2 p-1.5 bg-black/70 hover:bg-black/90 text-white rounded-full transition-colors z-10"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Feeling / Activity selector */}
          <div className="flex items-center gap-2 pt-1">
            <span className="text-xs text-zinc-500 flex items-center gap-1">
              <Smile className="w-4 h-4 text-amber-500" />
              <span>{t('feelings')}:</span>
            </span>
            <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
              {[t('happy'), t('excited'), t('blessed'), t('traveling'), t('listening')].map((feel) => (
                <button
                  key={feel}
                  type="button"
                  onClick={() => setSelectedFeeling(selectedFeeling === feel ? '' : feel)}
                  className={`px-2.5 py-1 text-xs rounded-full border transition-all shrink-0 ${
                    selectedFeeling === feel
                      ? 'bg-amber-100 text-amber-900 border-amber-300 dark:bg-amber-950/80 dark:text-amber-200 dark:border-amber-700'
                      : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 border-transparent hover:border-zinc-300'
                  }`}
                >
                  {feel}
                </button>
              ))}
            </div>
          </div>

          {/* Submit Button */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={isSubmitting || (!content.trim() && !mediaUrl && !videoUrl)}
              className="w-full py-3 px-4 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-700 hover:to-teal-600 text-white font-bold text-sm shadow-md shadow-emerald-600/30 flex items-center justify-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            >
              <Send className="w-4 h-4" />
              <span>{isSubmitting ? t('publishing') : t('publish')}</span>
            </button>
          </div>

        </form>
      </div>
    </div>
  );
};
