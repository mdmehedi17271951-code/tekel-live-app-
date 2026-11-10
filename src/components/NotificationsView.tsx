import React, { useState, useEffect } from 'react';
import { 
  Bell, 
  Heart, 
  MessageCircle, 
  UserPlus, 
  ShieldAlert, 
  CheckCheck,
  Sparkles
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { NotificationItem, NotificationType } from '../types';
import { FirestoreService } from '../services/firestore';
import { formatTimeAgoInBengali } from '../utils/translations';

interface NotificationsViewProps {
  onNotificationClick?: (targetId?: string) => void;
}

export const NotificationsView: React.FC<NotificationsViewProps> = ({ onNotificationClick }) => {
  const { currentUser, language, t } = useAuth();
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);

  useEffect(() => {
    if (!currentUser) return;

    // Seed realistic notifications if empty
    const seedNotifs: NotificationItem[] = [
      {
        id: 'notif_1',
        recipientId: currentUser.uid,
        senderId: 'user_abir_ctg',
        senderName: 'আবির আহমেদ',
        senderPhoto: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&auto=format&fit=crop&q=80',
        type: 'like',
        message: 'আবির আহমেদ আপনার পোস্টে লাইক দিয়েছেন',
        read: false,
        createdAt: new Date(Date.now() - 1000 * 60 * 15).toISOString(),
      },
      {
        id: 'notif_2',
        recipientId: currentUser.uid,
        senderId: 'user_tania_dhaka',
        senderName: 'তানিয়া আক্তার',
        senderPhoto: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&auto=format&fit=crop&q=80',
        type: 'comment',
        message: 'তানিয়া আক্তার আপনার ছবিতে মন্তব্য করেছেন: "অসাধারণ দৃশ্য!"',
        read: false,
        createdAt: new Date(Date.now() - 1000 * 60 * 65).toISOString(),
      },
      {
        id: 'notif_3',
        recipientId: currentUser.uid,
        senderId: 'user_shakib_sports',
        senderName: 'সাকিব চৌধুরী',
        senderPhoto: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&auto=format&fit=crop&q=80',
        type: 'follow',
        message: 'সাকিব চৌধুরী আপনাকে অনুসরণ করা শুরু করেছেন',
        read: true,
        createdAt: new Date(Date.now() - 1000 * 60 * 300).toISOString(),
      },
      {
        id: 'notif_4',
        recipientId: currentUser.uid,
        senderId: 'admin',
        senderName: 'টেকেল লাইভ টিম',
        senderPhoto: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200&auto=format&fit=crop&q=80',
        type: 'admin',
        message: 'টেকেল লাইভের নতুন ফিচারে স্বাগতম! ভিডিও ও ফটো শেয়ারিং এখন আরও দ্রুত ও মসৃণ।',
        read: true,
        createdAt: new Date(Date.now() - 1000 * 3600 * 24).toISOString(),
      }
    ];

    setNotifications(seedNotifs);

    // Also fetch live Firestore notifications
    FirestoreService.fetchNotifications(currentUser.uid).then(live => {
      if (live.length > 0) {
        setNotifications(live);
      }
    });
  }, [currentUser]);

  const handleMarkAllRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const getIconForType = (type: NotificationType) => {
    switch (type) {
      case 'like':
        return <Heart className="w-4 h-4 fill-rose-500 text-rose-500" />;
      case 'comment':
        return <MessageCircle className="w-4 h-4 fill-teal-500 text-teal-500" />;
      case 'follow':
        return <UserPlus className="w-4 h-4 text-emerald-600" />;
      case 'admin':
        return <ShieldAlert className="w-4 h-4 text-amber-500" />;
      default:
        return <Bell className="w-4 h-4 text-zinc-500" />;
    }
  };

  return (
    <div className="max-w-xl mx-auto pb-24">
      {/* Header */}
      <div className="flex items-center justify-between p-4 bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200 dark:border-zinc-800 shadow-xs mb-3">
        <div className="flex items-center gap-2.5">
          <span className="p-2 rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
            <Bell className="w-5 h-5" />
          </span>
          <div>
            <h1 className="text-base sm:text-lg font-bold text-zinc-900 dark:text-white">
              {t('notificationTitle')}
            </h1>
            <p className="text-[11px] text-zinc-400">সাম্প্রতিক কার্যক্রমের নোটিফিকেশন</p>
          </div>
        </div>

        <button
          onClick={handleMarkAllRead}
          className="flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/50 transition-colors"
        >
          <CheckCheck className="w-4 h-4" />
          <span>{t('markAllAsRead')}</span>
        </button>
      </div>

      {/* Notifications List */}
      <div className="space-y-2">
        {notifications.length === 0 ? (
          <div className="p-12 text-center text-zinc-400 text-xs sm:text-sm bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200 dark:border-zinc-800">
            {t('noNotifications')}
          </div>
        ) : (
          notifications.map((notif) => (
            <div
              key={notif.id}
              onClick={() => onNotificationClick && onNotificationClick(notif.targetId)}
              className={`flex items-start gap-3.5 p-3.5 sm:p-4 rounded-2xl border transition-all cursor-pointer ${
                notif.read
                  ? 'bg-white dark:bg-zinc-900/60 border-zinc-200/80 dark:border-zinc-800/80'
                  : 'bg-emerald-50/70 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-800/60 shadow-xs'
              }`}
            >
              <div className="relative shrink-0">
                <img
                  src={notif.senderPhoto}
                  alt=""
                  className="w-11 h-11 rounded-full object-cover ring-2 ring-emerald-500/30"
                />
                <span className="absolute -bottom-1 -right-1 p-1 rounded-full bg-white dark:bg-zinc-800 shadow-sm border border-zinc-200 dark:border-zinc-700">
                  {getIconForType(notif.type)}
                </span>
              </div>

              <div className="flex-1 min-w-0">
                <p className="text-xs sm:text-sm text-zinc-800 dark:text-zinc-200 font-medium leading-relaxed">
                  {notif.message}
                </p>
                <span className="text-[10px] text-zinc-400 mt-1 block">
                  {formatTimeAgoInBengali(notif.createdAt, language)}
                </span>
              </div>

              {!notif.read && (
                <span className="w-2.5 h-2.5 bg-emerald-500 rounded-full shrink-0 mt-1.5" />
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};
