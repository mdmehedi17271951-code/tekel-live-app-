import React, { useState, useEffect, useRef } from 'react';
import { 
  Sparkles, 
  Send, 
  Copy, 
  Check, 
  RotateCcw, 
  Share2, 
  Trash2, 
  Bot, 
  User, 
  Compass, 
  PenTool, 
  Code, 
  Lightbulb, 
  FileText,
  AlertCircle
} from 'lucide-react';
import { AIChatMessage } from '../types';
import { AIService } from '../services/ai';
import { useAuth } from '../contexts/AuthContext';

interface TekelAIViewProps {
  onShareAsPost?: (content: string) => void;
}

const STORAGE_KEY = 'tekel_ai_chat_history_v1';

const SUGGESTED_PROMPTS = [
  {
    icon: PenTool,
    title: 'পোস্ট ক্যাপশন',
    desc: 'একটি সুন্দর ছবি বা ভ্রমণের জন্য চমৎকার বাংলা ক্যাপশন লিখে দাও',
    prompt: 'আমার সাম্প্রতিক ভ্রমণের সুন্দর কিছু ছবির জন্য একটি আকর্ষণীয় ও আবেগপূর্ণ বাংলা সোশ্যাল মিডিয়া ক্যাপশন এবং প্রাসঙ্গিক হ্যাশট্যাগ লিখে দাও।',
  },
  {
    icon: Compass,
    title: 'ভ্রমণ পরামর্শ',
    desc: 'সাজেক বা কক্সবাজার ভ্রমণের সেরা টিপস ও পরিকল্পনা',
    prompt: 'বাংলাদেশে ঘুরে দেখার মতো ৩টি আকর্ষণীয় স্থান এবং কম খরচে ভ্রমণের বাস্তবসম্মত পরামর্শ দাও।',
  },
  {
    icon: Lightbulb,
    title: 'অনুপ্রেরণাদায়ী গল্প',
    desc: 'দৈনন্দিন জীবনের লক্ষ্য অর্জনে ছোট শিক্ষণীয় বার্তা',
    prompt: 'কঠিন সময়ে ধৈর্য ও এগিয়ে চলার অনুপ্রেরণা নিয়ে একটি ছোট শিক্ষণীয় গল্প বা বার্তা বলো।',
  },
  {
    icon: Code,
    title: 'প্রযুক্তি ও কোডিং',
    desc: 'ওয়েব ও মোবাইল অ্যাপ ডেভেলপমেন্ট টিপস',
    prompt: 'React, TypeScript এবং Tailwind CSS দিয়ে আকর্ষণীয় মোবাইল-ফার্স্ট অ্যাপ তৈরির সেরা ৫টি টিপস কী কী?',
  },
];

export const TekelAIView: React.FC<TekelAIViewProps> = ({ onShareAsPost }) => {
  const { currentUser, t } = useAuth();
  const [messages, setMessages] = useState<AIChatMessage[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch {}
    return [
      {
        id: 'welcome_1',
        role: 'model',
        text: 'আসসালামু আলাইকুম! আমি **টেকেল এআই (Tekel AI)** — টেকেল লাইভ প্ল্যাটফর্মের আপনার নিজস্ব বুদ্ধিমান সহকারী।\n\nআপনি আমাকে বাংলা বা ইংরেজি যেকোনো ভাষায় প্রশ্ন করতে পারেন। পোস্ট ক্যাপশন তৈরি, সাধারণ জ্ঞান, ভ্রমণ তথ্য, গল্প বা প্রযুক্তি বিষয়ক যে কোনো সহায়তার জন্য আমি সর্বদা প্রস্তুত!',
        timestamp: new Date().toISOString(),
      },
    ];
  });

  const [inputPrompt, setInputPrompt] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [shareNoticeId, setShareNoticeId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(messages));
    } catch {}
    scrollToBottom();
  }, [messages, isLoading]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = async (textToSend?: string) => {
    const prompt = (textToSend || inputPrompt).trim();
    if (!prompt || isLoading) return;

    const userMessage: AIChatMessage = {
      id: `user_${Date.now()}`,
      role: 'user',
      text: prompt,
      timestamp: new Date().toISOString(),
    };

    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setInputPrompt('');
    setIsLoading(true);

    try {
      const aiReply = await AIService.sendMessage(prompt, newMessages);
      const modelMessage: AIChatMessage = {
        id: `ai_${Date.now()}`,
        role: 'model',
        text: aiReply,
        timestamp: new Date().toISOString(),
      };
      setMessages([...newMessages, modelMessage]);
    } catch (err: any) {
      console.error('AI chat error:', err);
      const errorMessage: AIChatMessage = {
        id: `error_${Date.now()}`,
        role: 'model',
        text: `দুঃখিত, সংযোগে একটি সমস্যা দেখা দিয়েছে (${err.message || 'Error'})। অনুগ্রহ করে আবার চেষ্টা করুন।`,
        timestamp: new Date().toISOString(),
        isError: true,
      };
      setMessages([...newMessages, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegenerate = async (targetMessageId: string) => {
    const msgIndex = messages.findIndex(m => m.id === targetMessageId);
    if (msgIndex <= 0) return;

    // Find the preceding user message
    let userMsg: AIChatMessage | null = null;
    for (let i = msgIndex - 1; i >= 0; i--) {
      if (messages[i].role === 'user') {
        userMsg = messages[i];
        break;
      }
    }

    if (!userMsg) return;

    // Remove the previous model message and subsequent messages
    const trimmed = messages.slice(0, msgIndex);
    setMessages(trimmed);
    setIsLoading(true);

    try {
      const aiReply = await AIService.sendMessage(userMsg.text, trimmed);
      const newModelMessage: AIChatMessage = {
        id: `ai_${Date.now()}`,
        role: 'model',
        text: aiReply,
        timestamp: new Date().toISOString(),
      };
      setMessages([...trimmed, newModelMessage]);
    } catch (err: any) {
      const errorMessage: AIChatMessage = {
        id: `error_${Date.now()}`,
        role: 'model',
        text: `দুঃখিত, পুনরায় তৈরিতে ত্রুটি হয়েছে: ${err.message}`,
        timestamp: new Date().toISOString(),
        isError: true,
      };
      setMessages([...trimmed, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopyText = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleShareMessage = async (msg: AIChatMessage) => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'টেকেল এআই (Tekel AI) উত্তর',
          text: msg.text,
        });
        return;
      } catch {}
    }

    // Fallback: Copy to clipboard and show badge
    navigator.clipboard.writeText(msg.text);
    setShareNoticeId(msg.id);
    setTimeout(() => setShareNoticeId(null), 2500);
  };

  const handleClearHistory = () => {
    if (confirm(t('confirmClearChat'))) {
      const resetMessages: AIChatMessage[] = [
        {
          id: `welcome_${Date.now()}`,
          role: 'model',
          text: 'চ্যাট ইতিহাস পরিষ্কার করা হয়েছে। আমি আপনাকে কীভাবে সাহায্য করতে পারি?',
          timestamp: new Date().toISOString(),
        },
      ];
      setMessages(resetMessages);
      localStorage.removeItem(STORAGE_KEY);
    }
  };

  // Basic Markdown-like parser for bold, headings, and bullet points
  const renderFormattedText = (text: string) => {
    const lines = text.split('\n');
    return (
      <div className="space-y-1.5 leading-relaxed text-sm select-text">
        {lines.map((line, idx) => {
          if (line.startsWith('### ')) {
            return (
              <h4 key={idx} className="font-bold text-base text-zinc-900 dark:text-zinc-50 pt-2 pb-0.5">
                {line.replace('### ', '')}
              </h4>
            );
          }
          if (line.startsWith('## ')) {
            return (
              <h3 key={idx} className="font-bold text-lg text-zinc-900 dark:text-white pt-2 pb-1">
                {line.replace('## ', '')}
              </h3>
            );
          }
          if (line.startsWith('# ')) {
            return (
              <h2 key={idx} className="font-bold text-xl text-zinc-900 dark:text-white pt-3 pb-1 border-b border-zinc-200 dark:border-zinc-800">
                {line.replace('# ', '')}
              </h2>
            );
          }
          if (line.trim().startsWith('- ') || line.trim().startsWith('* ')) {
            const bulletText = line.trim().replace(/^[-*]\s+/, '');
            return (
              <div key={idx} className="flex items-start gap-2 pl-1 py-0.5">
                <span className="text-emerald-500 font-bold">•</span>
                <span>{renderInlineBold(bulletText)}</span>
              </div>
            );
          }
          if (/^\d+\.\s/.test(line.trim())) {
            const match = line.trim().match(/^(\d+)\.\s+(.*)$/);
            if (match) {
              return (
                <div key={idx} className="flex items-start gap-2 pl-1 py-0.5">
                  <span className="text-emerald-600 dark:text-emerald-400 font-bold shrink-0">{match[1]}.</span>
                  <span>{renderInlineBold(match[2])}</span>
                </div>
              );
            }
          }
          if (!line.trim()) {
            return <div key={idx} className="h-1.5" />;
          }
          return <p key={idx}>{renderInlineBold(line)}</p>;
        })}
      </div>
    );
  };

  const renderInlineBold = (str: string) => {
    const parts = str.split(/(\*\*.*?\*\*)/g);
    return parts.map((part, i) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return (
          <strong key={i} className="font-semibold text-zinc-950 dark:text-white">
            {part.slice(2, -2)}
          </strong>
        );
      }
      return part;
    });
  };

  return (
    <div className="max-w-2xl mx-auto flex flex-col h-[82vh] bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200 dark:border-zinc-800 shadow-sm overflow-hidden mb-20 animate-in fade-in duration-200">
      
      {/* Header */}
      <div className="px-4 py-3.5 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between bg-zinc-50/70 dark:bg-zinc-850/80 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <div className="relative flex items-center justify-center w-10 h-10 rounded-2xl bg-gradient-to-tr from-indigo-600 via-purple-600 to-pink-500 text-white shadow-md shadow-purple-500/20">
            <Sparkles className="w-5 h-5 animate-pulse" />
            <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-500 rounded-full ring-2 ring-white dark:ring-zinc-900" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h1 className="font-bold text-base text-zinc-900 dark:text-white leading-tight">
                {t('tekelAI')}
              </h1>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-100 text-purple-700 dark:bg-purple-950/80 dark:text-purple-300 border border-purple-200 dark:border-purple-800">
                PRO 3.8
              </span>
            </div>
            <p className="text-[11px] text-zinc-500 dark:text-zinc-400 font-medium">
              বাংলা ও ইংরেজি বুদ্ধিমান সহকারী
            </p>
          </div>
        </div>

        {/* Clear History Button */}
        <button
          onClick={handleClearHistory}
          className="p-2 text-zinc-400 hover:text-rose-600 dark:hover:text-rose-400 rounded-xl hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
          title={t('clearChat')}
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-zinc-50/40 dark:bg-zinc-950/40">
        
        {/* Suggested Prompts Grid (shows if few messages) */}
        {messages.length <= 2 && (
          <div className="mb-4 space-y-2.5">
            <p className="text-xs font-semibold text-zinc-400 uppercase tracking-wider px-1 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-purple-500" />
              <span>{t('suggestedPrompts')}:</span>
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {SUGGESTED_PROMPTS.map((item, idx) => {
                const IconComponent = item.icon;
                return (
                  <button
                    key={idx}
                    onClick={() => handleSendMessage(item.prompt)}
                    className="p-3 text-left rounded-2xl bg-white dark:bg-zinc-850 hover:bg-purple-50/60 dark:hover:bg-purple-950/30 border border-zinc-200/80 dark:border-zinc-800/80 hover:border-purple-300 dark:hover:border-purple-800/60 shadow-2xs hover:shadow-xs transition-all cursor-pointer group"
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <span className="p-1.5 rounded-xl bg-purple-100 dark:bg-purple-950 text-purple-600 dark:text-purple-400 group-hover:scale-105 transition-transform">
                        <IconComponent className="w-4 h-4" />
                      </span>
                      <span className="text-xs font-bold text-zinc-900 dark:text-zinc-100">
                        {item.title}
                      </span>
                    </div>
                    <p className="text-[11px] text-zinc-500 dark:text-zinc-400 line-clamp-2">
                      {item.desc}
                    </p>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Message Bubbles */}
        {messages.map((msg) => {
          const isUser = msg.role === 'user';
          return (
            <div
              key={msg.id}
              className={`flex items-start gap-2.5 sm:gap-3 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}
            >
              {/* Avatar */}
              <div className="shrink-0 mt-0.5">
                {isUser ? (
                  <img
                    src={currentUser?.photoURL || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80'}
                    alt=""
                    className="w-8 h-8 rounded-full object-cover ring-2 ring-emerald-500/40"
                  />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-indigo-600 via-purple-600 to-pink-500 flex items-center justify-center text-white shadow-xs">
                    <Bot className="w-4 h-4" />
                  </div>
                )}
              </div>

              {/* Message Content Container */}
              <div
                className={`flex flex-col max-w-[85%] sm:max-w-[78%] ${
                  isUser ? 'items-end' : 'items-start'
                }`}
              >
                <div
                  className={`px-4 py-3 rounded-2xl shadow-2xs ${
                    isUser
                      ? 'bg-gradient-to-tr from-emerald-600 to-teal-600 text-white rounded-tr-xs'
                      : msg.isError
                      ? 'bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-900 text-rose-700 dark:text-rose-300 rounded-tl-xs'
                      : 'bg-white dark:bg-zinc-850 text-zinc-900 dark:text-zinc-100 border border-zinc-200/80 dark:border-zinc-800/80 rounded-tl-xs'
                  }`}
                >
                  {isUser ? (
                    <p className="whitespace-pre-line text-sm select-text leading-relaxed">
                      {msg.text}
                    </p>
                  ) : (
                    renderFormattedText(msg.text)
                  )}
                </div>

                {/* AI Actions Toolbar (Copy, Regenerate, Share) */}
                {!isUser && !msg.isError && (
                  <div className="flex items-center gap-1.5 mt-1.5 px-1 text-xs">
                    
                    {/* Copy Button */}
                    <button
                      onClick={() => handleCopyText(msg.id, msg.text)}
                      className="p-1.5 rounded-lg text-zinc-500 hover:text-zinc-800 dark:text-zinc-400 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors flex items-center gap-1"
                      title={t('copy')}
                    >
                      {copiedId === msg.id ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-500" />
                          <span className="text-[10px] text-emerald-500 font-semibold">{t('copied')}</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5" />
                          <span className="text-[10px] hidden sm:inline">{t('copy')}</span>
                        </>
                      )}
                    </button>

                    {/* Regenerate Button */}
                    <button
                      onClick={() => handleRegenerate(msg.id)}
                      className="p-1.5 rounded-lg text-zinc-500 hover:text-zinc-800 dark:text-zinc-400 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors flex items-center gap-1"
                      title={t('regenerate')}
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      <span className="text-[10px] hidden sm:inline">{t('regenerate')}</span>
                    </button>

                    {/* Share Button */}
                    <button
                      onClick={() => handleShareMessage(msg)}
                      className="p-1.5 rounded-lg text-zinc-500 hover:text-zinc-800 dark:text-zinc-400 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors flex items-center gap-1"
                      title={t('shareExternal')}
                    >
                      <Share2 className="w-3.5 h-3.5" />
                      <span className="text-[10px] hidden sm:inline">{t('shareExternal')}</span>
                    </button>

                    {/* Share Directly as Post on Tekel Live */}
                    {onShareAsPost && (
                      <button
                        onClick={() => onShareAsPost(msg.text)}
                        className="px-2 py-1 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-100 border border-emerald-500/20 text-[10px] font-semibold flex items-center gap-1 transition-colors"
                        title={t('shareToFeed')}
                      >
                        <FileText className="w-3 h-3 text-emerald-500" />
                        <span>পোস্টে শেয়ার</span>
                      </button>
                    )}

                    {shareNoticeId === msg.id && (
                      <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-medium animate-in fade-in">
                        ক্লিপবোর্ডে কপি করা হয়েছে!
                      </span>
                    )}

                  </div>
                )}

              </div>
            </div>
          );
        })}

        {/* Loading Indicator Waveform */}
        {isLoading && (
          <div className="flex items-start gap-2.5 sm:gap-3">
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-indigo-600 via-purple-600 to-pink-500 flex items-center justify-center text-white shrink-0 shadow-xs">
              <Sparkles className="w-4 h-4 animate-spin" />
            </div>

            <div className="p-3.5 bg-white dark:bg-zinc-850 rounded-2xl rounded-tl-xs border border-zinc-200/80 dark:border-zinc-800/80 shadow-2xs flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-purple-500 animate-bounce" style={{ animationDelay: '0ms' }} />
              <span className="w-2 h-2 rounded-full bg-indigo-500 animate-bounce" style={{ animationDelay: '150ms' }} />
              <span className="w-2 h-2 rounded-full bg-pink-500 animate-bounce" style={{ animationDelay: '300ms' }} />
              <span className="text-xs text-zinc-500 dark:text-zinc-400 font-medium ml-1">
                {t('aiThinking')}
              </span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Bar */}
      <div className="p-3 border-t border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSendMessage();
          }}
          className="flex items-center gap-2"
        >
          <input
            type="text"
            value={inputPrompt}
            onChange={(e) => setInputPrompt(e.target.value)}
            placeholder={t('askAIPlaceholder')}
            disabled={isLoading}
            className="flex-1 px-4 py-2.5 text-xs sm:text-sm rounded-2xl bg-zinc-100 dark:bg-zinc-800 border-0 text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 dark:placeholder-zinc-500 focus:ring-2 focus:ring-purple-500 focus:outline-hidden"
          />

          <button
            type="submit"
            disabled={!inputPrompt.trim() || isLoading}
            className="p-2.5 rounded-2xl bg-gradient-to-tr from-indigo-600 via-purple-600 to-pink-600 hover:opacity-90 text-white shadow-md shadow-purple-600/30 disabled:opacity-40 transition-all cursor-pointer shrink-0"
            title={t('send')}
          >
            <Send className="w-4 h-4" />
          </button>
        </form>

        <p className="text-[10px] text-zinc-400 text-center mt-2 truncate px-2">
          {t('aiDisclaimer')}
        </p>
      </div>

    </div>
  );
};
