export type UserRole = 'user' | 'admin' | 'moderator';

export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  username: string;
  photoURL: string;
  bio?: string;
  coverURL?: string;
  followersCount: number;
  followingCount: number;
  postsCount: number;
  role: UserRole;
  isVerified?: boolean;
  isBanned?: boolean;
  createdAt: string;
  updatedAt?: string;
}

export type PostType = 'text' | 'photo' | 'video';

export interface Post {
  id: string;
  authorId: string;
  authorName: string;
  authorPhoto: string;
  authorUsername: string;
  authorRole?: UserRole;
  isAuthorVerified?: boolean;
  type: PostType;
  content: string;
  mediaUrl?: string;
  videoUrl?: string;
  likesCount: number;
  commentsCount: number;
  sharesCount: number;
  isLikedByMe?: boolean;
  tags?: string[];
  createdAt: string;
  updatedAt?: string;
}

export interface Comment {
  id: string;
  postId: string;
  authorId: string;
  authorName: string;
  authorPhoto: string;
  authorUsername: string;
  text: string;
  createdAt: string;
}

export interface Follow {
  id: string;
  followerId: string;
  followingId: string;
  createdAt: string;
}

export interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  senderName: string;
  senderPhoto?: string;
  text: string;
  mediaUrl?: string;
  createdAt: string;
  read?: boolean;
}

export interface ParticipantInfo {
  displayName: string;
  photoURL: string;
  username: string;
}

export interface Conversation {
  id: string;
  participants: string[];
  participantDetails?: Record<string, ParticipantInfo>;
  lastMessage: string;
  lastMessageTime: string;
  updatedAt: string;
  unreadCount?: number;
}

export type NotificationType = 'like' | 'comment' | 'follow' | 'message' | 'admin';

export interface NotificationItem {
  id: string;
  recipientId: string;
  senderId: string;
  senderName: string;
  senderPhoto: string;
  type: NotificationType;
  targetId?: string;
  message: string;
  read: boolean;
  createdAt: string;
}

export interface StoryItem {
  id: string;
  authorId: string;
  authorName: string;
  authorPhoto: string;
  mediaUrl: string;
  type: 'photo' | 'video';
  caption?: string;
  createdAt: string;
  expiresAt: string;
}

export interface ReportItem {
  id: string;
  reporterId: string;
  targetType: 'post' | 'user';
  targetId: string;
  reason: string;
  status: 'pending' | 'resolved' | 'dismissed';
  createdAt: string;
}
