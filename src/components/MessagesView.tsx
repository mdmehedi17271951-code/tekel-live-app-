import React, { useState, useEffect } from 'react';
import { 
  Send, 
  Image, 
  Smile, 
  ArrowLeft, 
  Search, 
  MessageCircle, 
  CheckCheck,
  User as UserIcon,
  Circle
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { Conversation, Message, UserProfile } from '../types';
import { FirestoreService } from '../services/firestore';
import { SAMPLE_USERS } from '../utils/mockData';
import { formatTimeAgoInBengali } from '../utils/translations';

interface MessagesViewProps {
  initialChatTarget?: UserProfile | null;
}

export const MessagesView: React.FC<MessagesViewProps> = ({ initialChatTarget }) => {
  const { currentUser, language, t } = useAuth();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConversation, setActiveConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [messageText, setMessageText] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [availableUsers, setAvailableUsers] = useState<UserProfile[]>([]);

  // Sample quick messages
  const QUICK_REPLIES = ['কেমন আছেন? 😊', 'ধন্যবাদ! 🙏', 'কোথায় আছেন এখন?', 'ছবিটি অনেক সুন্দর হয়েছে! ✨'];

  useEffect(() => {
    if (!currentUser) return;

    // Load available chat partner users
    const others = SAMPLE_USERS.filter(u => u.uid !== currentUser.uid);
    setAvailableUsers(others);

    // Initial mock conversations if Firestore has none
    const dummyConvs: Conversation[] = others.map(u => ({
      id: `conv_${currentUser.uid}_${u.uid}`,
      participants: [currentUser.uid, u.uid],
      participantDetails: {
        [u.uid]: {
          displayName: u.displayName,
          photoURL: u.photoURL,
          username: u.username,
        },
      },
      lastMessage: u.bio?.slice(0, 30) || 'টেকেল লাইভে বার্তা আদান-প্রদান শুরু করুন',
      lastMessageTime: new Date(Date.now() - 3600000).toISOString(),
      updatedAt: new Date().toISOString(),
    }));

    setConversations(dummyConvs);

    // If an initial target user was passed from profile "Message" button
    if (initialChatTarget) {
      const existing = dummyConvs.find(c => c.participants.includes(initialChatTarget.uid));
      if (existing) {
        setActiveConversation(existing);
      } else {
        const newConv: Conversation = {
          id: `conv_${currentUser.uid}_${initialChatTarget.uid}`,
          participants: [currentUser.uid, initialChatTarget.uid],
          participantDetails: {
            [initialChatTarget.uid]: {
              displayName: initialChatTarget.displayName,
              photoURL: initialChatTarget.photoURL,
              username: initialChatTarget.username,
            },
          },
          lastMessage: 'নতুন কথোপকথন',
          lastMessageTime: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        setConversations([newConv, ...dummyConvs]);
        setActiveConversation(newConv);
      }
    }
  }, [currentUser, initialChatTarget]);

  // Load messages when conversation is opened
  useEffect(() => {
    if (!activeConversation || !currentUser) return;

    // Initial seed messages for lively chat experience
    const otherUserId = activeConversation.participants.find(p => p !== currentUser.uid) || '';
    const otherUser = SAMPLE_USERS.find(u => u.uid === otherUserId);

    const initialMessages: Message[] = [
      {
        id: 'msg_1',
        conversationId: activeConversation.id,
        senderId: otherUserId,
        senderName: otherUser?.displayName || 'ব্যবহারকারী',
        senderPhoto: otherUser?.photoURL,
        text: 'আসসালামু আলাইকুম! টেকেল লাইভে আপনাকে স্বাগতম। কেমন আছেন?',
        createdAt: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
        read: true,
      },
      {
        id: 'msg_2',
        conversationId: activeConversation.id,
        senderId: currentUser.uid,
        senderName: currentUser.displayName,
        senderPhoto: currentUser.photoURL,
        text: 'ওয়ালাইকুম আসসালাম! আলহামদুলিল্লাহ ভালো আছি। অ্যাপটি ব্যবহার করে দারুণ লাগছে।',
        createdAt: new Date(Date.now() - 1000 * 60 * 20).toISOString(),
        read: true,
      }
    ];

    setMessages(initialMessages);

    // Also fetch any live Firestore messages
    FirestoreService.fetchMessages(activeConversation.id).then(live => {
      if (live.length > 0) {
        setMessages(live);
      }
    });
  }, [activeConversation, currentUser]);

  const handleSendMessage = async (e?: React.FormEvent, customText?: string) => {
    if (e) e.preventDefault();
    const textToSend = (customText || messageText).trim();
    if (!textToSend || !activeConversation || !currentUser) return;

    const newMsg: Message = {
      id: `msg_${Date.now()}`,
      conversationId: activeConversation.id,
      senderId: currentUser.uid,
      senderName: currentUser.displayName,
      senderPhoto: currentUser.photoURL,
      text: textToSend,
      createdAt: new Date().toISOString(),
      read: false,
    };

    setMessages(prev => [...prev, newMsg]);
    setMessageText('');

    // Update conversation last message preview
    setConversations(prev =>
      prev.map(c =>
        c.id === activeConversation.id
          ? { ...c, lastMessage: textToSend, lastMessageTime: newMsg.createdAt }
          : c
      )
    );

    // Save to Firestore
    await FirestoreService.sendMessage(activeConversation.id, {
      conversationId: activeConversation.id,
      senderId: currentUser.uid,
      senderName: currentUser.displayName,
      senderPhoto: currentUser.photoURL,
      text: textToSend,
    });
  };

  const getPartnerInfo = (conv: Conversation) => {
    if (!currentUser) return { displayName: 'ব্যবহারকারী', photoURL: '', username: '' };
    const otherId = conv.participants.find(p => p !== currentUser.uid) || '';
    if (conv.participantDetails && conv.participantDetails[otherId]) {
      return conv.participantDetails[otherId];
    }
    const sample = SAMPLE_USERS.find(u => u.uid === otherId);
    return {
      displayName: sample?.displayName || 'ব্যবহারকারী',
      photoURL: sample?.photoURL || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80',
      username: sample?.username || 'user',
    };
  };

  const filteredConversations = conversations.filter(c => {
    const partner = getPartnerInfo(c);
    return (
      partner.displayName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      partner.username.toLowerCase().includes(searchQuery.toLowerCase())
    );
  });

  return (
    <div className="max-w-2xl mx-auto h-[82vh] bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200 dark:border-zinc-800 shadow-sm overflow-hidden flex flex-col mb-20">
      
      {/* If No Conversation is Selected: Show Conversation List */}
      {!activeConversation ? (
        <div className="flex-1 flex flex-col h-full">
          {/* Header */}
          <div className="p-4 border-b border-zinc-200 dark:border-zinc-800">
            <h1 className="text-lg font-bold text-zinc-900 dark:text-white flex items-center gap-2">
              <MessageCircle className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
              <span>{t('chatTitle')}</span>
            </h1>

            {/* Search filter */}
            <div className="relative mt-3">
              <Search className="w-4 h-4 text-zinc-400 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="বার্তা বা বন্ধু খুঁজুন..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 text-xs rounded-full bg-zinc-100 dark:bg-zinc-800 border-0 text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>

          {/* Conversations List */}
          <div className="flex-1 overflow-y-auto divide-y divide-zinc-100 dark:divide-zinc-800/80">
            {filteredConversations.length === 0 ? (
              <div className="p-8 text-center text-zinc-400 text-xs">
                কোনো বার্তা পাওয়া যায়নি
              </div>
            ) : (
              filteredConversations.map(conv => {
                const partner = getPartnerInfo(conv);
                return (
                  <div
                    key={conv.id}
                    onClick={() => setActiveConversation(conv)}
                    className="flex items-center gap-3.5 p-4 hover:bg-zinc-50 dark:hover:bg-zinc-800/50 cursor-pointer transition-colors"
                  >
                    <div className="relative">
                      <img
                        src={partner.photoURL}
                        alt=""
                        className="w-12 h-12 rounded-full object-cover ring-2 ring-emerald-500/20"
                      />
                      <span className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 rounded-full ring-2 ring-white dark:ring-zinc-900" />
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-bold text-sm text-zinc-900 dark:text-zinc-100 truncate">
                          {partner.displayName}
                        </span>
                        <span className="text-[10px] text-zinc-400">
                          {formatTimeAgoInBengali(conv.lastMessageTime, language)}
                        </span>
                      </div>
                      <p className="text-xs text-zinc-500 dark:text-zinc-400 truncate">
                        {conv.lastMessage}
                      </p>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      ) : (
        /* Conversation Open: Chat View */
        <div className="flex-1 flex flex-col h-full">
          
          {/* Chat Room Top Bar */}
          <div className="p-3.5 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between bg-zinc-50/80 dark:bg-zinc-850">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setActiveConversation(null)}
                className="p-1.5 rounded-full hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-600 dark:text-zinc-300 transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>

              {(() => {
                const partner = getPartnerInfo(activeConversation);
                return (
                  <div className="flex items-center gap-2.5">
                    <div className="relative">
                      <img
                        src={partner.photoURL}
                        alt=""
                        className="w-9 h-9 rounded-full object-cover"
                      />
                      <Circle className="w-2.5 h-2.5 fill-emerald-500 text-emerald-500 absolute -bottom-0.5 -right-0.5 ring-2 ring-white dark:ring-zinc-900 rounded-full" />
                    </div>
                    <div>
                      <h2 className="text-sm font-bold text-zinc-900 dark:text-white leading-tight">
                        {partner.displayName}
                      </h2>
                      <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-medium">
                        {t('online')}
                      </span>
                    </div>
                  </div>
                );
              })()}
            </div>
          </div>

          {/* Messages Thread Container */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-zinc-50/40 dark:bg-zinc-950/40">
            {messages.map(msg => {
              const isMe = msg.senderId === currentUser?.uid;
              return (
                <div
                  key={msg.id}
                  className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}
                >
                  <div
                    className={`max-w-[78%] px-4 py-2.5 rounded-2xl text-xs sm:text-sm select-text leading-relaxed shadow-2xs ${
                      isMe
                        ? 'bg-emerald-600 text-white rounded-br-xs'
                        : 'bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 rounded-bl-xs border border-zinc-200/80 dark:border-zinc-700/60'
                    }`}
                  >
                    <p className="whitespace-pre-line">{msg.text}</p>
                    <div
                      className={`flex items-center justify-end gap-1 text-[9px] mt-1 ${
                        isMe ? 'text-emerald-100' : 'text-zinc-400'
                      }`}
                    >
                      <span>{new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                      {isMe && <CheckCheck className="w-3 h-3" />}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Quick Reply Pills */}
          <div className="px-3 py-1.5 bg-white dark:bg-zinc-900 border-t border-zinc-100 dark:border-zinc-800 flex items-center gap-1.5 overflow-x-auto no-scrollbar">
            {QUICK_REPLIES.map((qr, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleSendMessage(undefined, qr)}
                className="px-2.5 py-1 text-[11px] rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 hover:bg-emerald-50 hover:text-emerald-600 dark:hover:bg-emerald-950/60 dark:hover:text-emerald-400 transition-colors shrink-0"
              >
                {qr}
              </button>
            ))}
          </div>

          {/* Input Bar */}
          <form
            onSubmit={handleSendMessage}
            className="p-3 border-t border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 flex items-center gap-2"
          >
            <input
              type="text"
              placeholder={t('typeMessage')}
              value={messageText}
              onChange={(e) => setMessageText(e.target.value)}
              className="flex-1 px-4 py-2.5 text-xs sm:text-sm rounded-full bg-zinc-100 dark:bg-zinc-800 border-0 text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus:ring-2 focus:ring-emerald-500"
            />
            <button
              type="submit"
              disabled={!messageText.trim()}
              className="p-2.5 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white disabled:opacity-40 transition-colors cursor-pointer shrink-0"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>

        </div>
      )}

    </div>
  );
};
