import React, { useState, useRef, useEffect } from 'react';
import { 
  X, 
  Upload, 
  Video, 
  Film, 
  Camera, 
  Music, 
  Hash, 
  Check, 
  Sparkles, 
  Play, 
  Pause,
  RefreshCw
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { Post } from '../types';
import { FirestoreService } from '../services/firestore';
import { SAMPLE_VIDEOS } from '../utils/mockData';

interface TikTokUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPostCreated: (post: Post) => void;
  initialContent?: string;
}

const VIRAL_HASHTAGS = ['#টেকেললাইভ', '#ভাইরাল', '#বাংলাদেশ', '#ফরইউ', '#TikTokBangla', '#ট্রেন্ডিং'];

export const TikTokUploadModal: React.FC<TikTokUploadModalProps> = ({
  isOpen,
  onClose,
  onPostCreated,
  initialContent = '',
}) => {
  const { currentUser, t } = useAuth();

  // Upload Form States
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [videoUrl, setVideoUrl] = useState<string>('');
  const [caption, setCaption] = useState<string>(initialContent);
  const [soundTitle, setSoundTitle] = useState<string>('');
  const [thumbnailUrl, setThumbnailUrl] = useState<string>('');
  const [isCameraActive, setIsCameraActive] = useState<boolean>(false);
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [previewPlaying, setPreviewPlaying] = useState<boolean>(true);

  const videoPreviewRef = useRef<HTMLVideoElement | null>(null);
  const cameraVideoRef = useRef<HTMLVideoElement | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);

  useEffect(() => {
    if (initialContent) {
      setCaption(initialContent);
    }
  }, [initialContent]);

  // Set default sound title based on user
  useEffect(() => {
    if (currentUser && !soundTitle) {
      setSoundTitle(`মূল সাউন্ড - @${currentUser.username} • Tekel Live`);
    }
  }, [currentUser, soundTitle]);

  // Handle device file upload (phone gallery or PC)
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setVideoFile(file);
      const url = URL.createObjectURL(file);
      setVideoUrl(url);
      stopCamera();
    }
  };

  // Start device camera / webcam recording preview
  const startCamera = async () => {
    try {
      stopCamera();
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'user', width: { ideal: 720 }, height: { ideal: 1280 } },
        audio: true,
      });
      mediaStreamRef.current = stream;
      if (cameraVideoRef.current) {
        cameraVideoRef.current.srcObject = stream;
        cameraVideoRef.current.play();
      }
      setIsCameraActive(true);
      setVideoUrl('');
      setVideoFile(null);
    } catch (err) {
      console.warn('Camera access error:', err);
      alert('ক্যামেরা চালু করা যায়নি। অনুগ্রহ করে গ্যালারি থেকে ভিডিও নির্বাচন করুন।');
    }
  };

  const stopCamera = () => {
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach(track => track.stop());
      mediaStreamRef.current = null;
    }
    setIsCameraActive(false);
  };

  const handleSelectPreset = (url: string, thumb: string) => {
    stopCamera();
    setVideoUrl(url);
    setThumbnailUrl(thumb);
  };

  const handleAddHashtag = (tag: string) => {
    if (!caption.includes(tag)) {
      setCaption(prev => (prev ? `${prev} ${tag}` : tag));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;
    if (!videoUrl && !videoFile && !caption) return;

    setIsUploading(true);
    setUploadProgress(10);

    // Realistic upload progress simulation
    const interval = setInterval(() => {
      setUploadProgress(prev => {
        if (prev >= 90) {
          clearInterval(interval);
          return 95;
        }
        return prev + 20;
      });
    }, 200);

    try {
      const finalVideoUrl = videoUrl || 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4';
      const finalThumb = thumbnailUrl || 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=800&auto=format&fit=crop&q=80';

      const tags = caption
        .split(' ')
        .filter(word => word.startsWith('#'));

      const newPost = await FirestoreService.createPost({
        authorId: currentUser.uid,
        authorName: currentUser.displayName,
        authorPhoto: currentUser.photoURL,
        authorUsername: currentUser.username,
        authorRole: currentUser.role,
        isAuthorVerified: currentUser.isVerified,
        type: 'video',
        content: caption || 'টেকেল লাইভে নতুন ভিডিও! 🔥',
        videoUrl: finalVideoUrl,
        thumbnailUrl: finalThumb,
        soundTitle: soundTitle || `মূল অডিও - @${currentUser.username} • Tekel Live`,
        tags: tags.length ? tags : ['#টেকেললাইভ', '#ভাইরাল'],
      });

      clearInterval(interval);
      setUploadProgress(100);

      setTimeout(() => {
        onPostCreated(newPost);
        // Reset states
        setVideoFile(null);
        setVideoUrl('');
        setCaption('');
        setThumbnailUrl('');
        stopCamera();
        onClose();
      }, 400);

    } catch (err) {
      console.error('Video upload failed:', err);
      clearInterval(interval);
    } finally {
      setIsUploading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-0 sm:p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-xl h-full sm:h-[90vh] bg-zinc-950 border border-zinc-800 rounded-none sm:rounded-3xl shadow-2xl flex flex-col overflow-hidden">
        
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-zinc-800/80 bg-zinc-900/60">
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-xl bg-cyan-500/10 text-cyan-400">
              <Film className="w-5 h-5" />
            </span>
            <h2 className="text-base font-extrabold text-white">
              TikTok ভিডিও স্টুডিও
            </h2>
          </div>
          <button
            onClick={() => {
              stopCamera();
              onClose();
            }}
            className="p-1.5 text-zinc-400 hover:text-white rounded-full hover:bg-zinc-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Studio Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-5 space-y-4 no-scrollbar">
          
          {/* VIDEO SOURCE SELECTOR (Upload from phone / Camera / Presets) */}
          <div className="space-y-3">
            <label className="text-xs font-bold text-zinc-300 uppercase tracking-wider block">
              ভিডিও নির্বাচন করুন
            </label>

            {/* If camera is active */}
            {isCameraActive && (
              <div className="relative w-full aspect-[9/16] max-h-80 mx-auto rounded-2xl overflow-hidden bg-black border border-cyan-500/50 shadow-lg">
                <video
                  ref={cameraVideoRef}
                  playsInline
                  muted
                  className="w-full h-full object-cover"
                />
                <div className="absolute top-3 left-3 px-2.5 py-1 rounded-full bg-rose-500 text-white text-[10px] font-black uppercase flex items-center gap-1.5 animate-pulse">
                  <span className="w-2 h-2 rounded-full bg-white" />
                  ক্যামেরা লাইভ
                </div>
                <button
                  type="button"
                  onClick={stopCamera}
                  className="absolute bottom-3 right-3 px-3 py-1.5 rounded-xl bg-black/60 text-white text-xs font-bold hover:bg-black/80"
                >
                  বন্ধ করুন
                </button>
              </div>
            )}

            {/* If video URL is loaded */}
            {videoUrl && (
              <div className="relative w-full aspect-[9/16] max-h-80 mx-auto rounded-2xl overflow-hidden bg-black border border-zinc-700 shadow-xl">
                <video
                  ref={videoPreviewRef}
                  src={videoUrl}
                  loop
                  autoPlay
                  playsInline
                  className="w-full h-full object-cover"
                />
                <button
                  type="button"
                  onClick={() => {
                    setVideoUrl('');
                    setVideoFile(null);
                  }}
                  className="absolute top-3 right-3 p-1.5 bg-black/70 hover:bg-black/90 text-white rounded-full transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            )}

            {/* Action buttons when no video is selected */}
            {!videoUrl && !isCameraActive && (
              <div className="grid grid-cols-2 gap-3">
                {/* Gallery File Upload */}
                <label className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-zinc-700 hover:border-cyan-400 rounded-2xl bg-zinc-900/50 cursor-pointer transition-all hover:bg-zinc-900 group">
                  <div className="w-12 h-12 rounded-full bg-cyan-500/10 text-cyan-400 flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
                    <Upload className="w-6 h-6" />
                  </div>
                  <span className="text-xs font-bold text-white text-center">
                    ফোন বা ডিভাইস থেকে
                  </span>
                  <span className="text-[10px] text-zinc-500 mt-0.5">MP4, MOV বা WebM</span>
                  <input
                    type="file"
                    accept="video/*"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                </label>

                {/* Open Camera Preview */}
                <button
                  type="button"
                  onClick={startCamera}
                  className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-zinc-700 hover:border-emerald-400 rounded-2xl bg-zinc-900/50 cursor-pointer transition-all hover:bg-zinc-900 group"
                >
                  <div className="w-12 h-12 rounded-full bg-emerald-500/10 text-emerald-400 flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
                    <Camera className="w-6 h-6" />
                  </div>
                  <span className="text-xs font-bold text-white text-center">
                    ক্যামেরা খুলুন
                  </span>
                  <span className="text-[10px] text-zinc-500 mt-0.5">রিয়েল-টাইম প্রিভিউ</span>
                </button>
              </div>
            )}

            {/* Quick Viral Presets */}
            {!videoUrl && !isCameraActive && (
              <div className="mt-3">
                <span className="text-[11px] text-zinc-400 block mb-2 font-medium">
                  অথবা ডেমো হিসেবে প্রস্তুত ভাইরাল ভিডিও ক্লিপ বাছুন:
                </span>
                <div className="grid grid-cols-3 gap-2">
                  {SAMPLE_VIDEOS.map((item) => (
                    <div
                      key={item.title}
                      onClick={() => handleSelectPreset(item.url, item.thumbnail)}
                      className="relative cursor-pointer rounded-xl overflow-hidden border border-zinc-700 hover:border-cyan-400 transition-all group"
                    >
                      <img src={item.thumbnail} alt="" className="w-full h-20 object-cover" />
                      <div className="absolute inset-0 bg-black/40 flex items-center justify-center group-hover:bg-black/20 transition-all">
                        <Play className="w-5 h-5 text-white fill-white" />
                      </div>
                      <span className="absolute bottom-1 left-1 right-1 text-[10px] text-white font-bold truncate drop-shadow-xs">
                        {item.title}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* CAPTION & HASHTAGS */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-zinc-300 uppercase tracking-wider">
                ক্যাপশন ও বর্ণনা
              </label>
              <span className="text-[11px] text-zinc-500">{caption.length}/300</span>
            </div>
            <textarea
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              placeholder="আপনার ভিডিও সম্পর্কে আকর্ষণীয় ক্যাপশন লিখুন... #টেকেললাইভ #ভাইরাল"
              rows={3}
              maxLength={300}
              className="w-full p-3.5 rounded-2xl bg-zinc-900 border border-zinc-800 text-sm text-white placeholder-zinc-500 focus:outline-hidden focus:ring-1 focus:ring-cyan-400 resize-none leading-relaxed"
            />

            {/* Quick Hashtags */}
            <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-1">
              <Hash className="w-3.5 h-3.5 text-zinc-500 shrink-0" />
              {VIRAL_HASHTAGS.map((tag) => (
                <button
                  key={tag}
                  type="button"
                  onClick={() => handleAddHashtag(tag)}
                  className="px-2.5 py-1 text-xs font-medium rounded-full bg-zinc-900 text-zinc-300 hover:bg-cyan-500/20 hover:text-cyan-400 border border-zinc-800 transition-colors shrink-0"
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>

          {/* AUDIO TITLE */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-zinc-300 uppercase tracking-wider flex items-center gap-1.5">
              <Music className="w-3.5 h-3.5 text-cyan-400" />
              <span>সাউন্ড / অডিও নাম</span>
            </label>
            <input
              type="text"
              value={soundTitle}
              onChange={(e) => setSoundTitle(e.target.value)}
              placeholder="মূল সাউন্ড - Tekel Live Original Track"
              className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-900 border border-zinc-800 text-xs text-white placeholder-zinc-500 focus:outline-hidden focus:ring-1 focus:ring-cyan-400"
            />
          </div>

          {/* UPLOAD PROGRESS BAR */}
          {isUploading && (
            <div className="p-4 bg-zinc-900/90 rounded-2xl border border-cyan-500/30 space-y-2 animate-pulse">
              <div className="flex items-center justify-between text-xs font-bold text-cyan-400">
                <span>ভিডিও প্রসেসিং ও আপলোড হচ্ছে...</span>
                <span>{uploadProgress}%</span>
              </div>
              <div className="w-full h-2 rounded-full bg-zinc-800 overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-cyan-400 to-emerald-400 transition-all duration-200"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
            </div>
          )}

          {/* SUBMIT / PUBLISH BUTTON */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={isUploading || (!videoUrl && !caption.trim())}
              className="w-full py-3.5 px-4 rounded-2xl bg-gradient-to-r from-cyan-500 to-emerald-500 hover:opacity-95 text-white font-extrabold text-sm shadow-lg shadow-cyan-500/20 flex items-center justify-center gap-2 transition-all disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer active:scale-98"
            >
              {isUploading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>আপলোড হচ্ছে...</span>
                </>
              ) : (
                <>
                  <Upload className="w-4 h-4" />
                  <span>ভিডিও পোস্ট করুন</span>
                </>
              )}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
};
