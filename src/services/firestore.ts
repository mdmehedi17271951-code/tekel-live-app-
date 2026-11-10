import { 
  db, 
  handleFirestoreError, 
  OperationType 
} from '../lib/firebase';
import { 
  collection, 
  doc, 
  getDocs, 
  getDoc, 
  setDoc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  where, 
  orderBy, 
  limit, 
  increment,
  onSnapshot
} from 'firebase/firestore';
import { 
  Post, 
  Comment, 
  UserProfile, 
  Message, 
  Conversation, 
  NotificationItem 
} from '../types';
import { INITIAL_POSTS, SAMPLE_USERS } from '../utils/mockData';

export const FirestoreService = {
  // POSTS
  async fetchPosts(): Promise<Post[]> {
    try {
      const q = query(collection(db, 'posts'), orderBy('createdAt', 'desc'), limit(30));
      const snap = await getDocs(q);
      if (snap.empty) {
        // Return seeded initial posts if Firestore is fresh
        return INITIAL_POSTS;
      }
      return snap.docs.map(d => ({ id: d.id, ...d.data() } as Post));
    } catch (err) {
      console.warn('Firestore fetchPosts fallback to local mock:', err);
      return INITIAL_POSTS;
    }
  },

  subscribePosts(callback: (posts: Post[]) => void): () => void {
    try {
      const q = query(collection(db, 'posts'), orderBy('createdAt', 'desc'), limit(30));
      return onSnapshot(
        q,
        (snap) => {
          if (!snap.empty) {
            const list = snap.docs.map(d => ({ id: d.id, ...d.data() } as Post));
            callback(list);
          } else {
            callback(INITIAL_POSTS);
          }
        },
        (error) => {
          console.warn('Firestore posts subscription fallback:', error);
          callback(INITIAL_POSTS);
        }
      );
    } catch {
      callback(INITIAL_POSTS);
      return () => {};
    }
  },

  async createPost(post: Omit<Post, 'id' | 'likesCount' | 'commentsCount' | 'sharesCount' | 'createdAt'>): Promise<Post> {
    const newPost: Post = {
      ...post,
      id: `post_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      likesCount: 0,
      commentsCount: 0,
      sharesCount: 0,
      createdAt: new Date().toISOString(),
    };

    try {
      await setDoc(doc(db, 'posts', newPost.id), newPost);
      return newPost;
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, `posts/${newPost.id}`);
    }
  },

  async toggleLikePost(postId: string, userId: string, currentlyLiked: boolean): Promise<boolean> {
    const postRef = doc(db, 'posts', postId);
    const likeRef = doc(db, `posts/${postId}/likes`, userId);

    try {
      if (currentlyLiked) {
        await deleteDoc(likeRef);
        await updateDoc(postRef, { likesCount: increment(-1) });
        return false;
      } else {
        await setDoc(likeRef, { userId, createdAt: new Date().toISOString() });
        await updateDoc(postRef, { likesCount: increment(1) });
        return true;
      }
    } catch (err) {
      console.warn('Like toggle failed on Firestore:', err);
      return !currentlyLiked;
    }
  },

  async deletePost(postId: string): Promise<void> {
    try {
      await deleteDoc(doc(db, 'posts', postId));
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, `posts/${postId}`);
    }
  },

  // BOOKMARKS / SAVED POSTS
  async toggleSavePost(userId: string, postId: string, currentlySaved: boolean): Promise<boolean> {
    const savedRef = doc(db, `users/${userId}/savedPosts`, postId);
    const localKey = `tekel_saved_${userId}`;
    
    // Update local storage cache
    let localSaved: string[] = [];
    try {
      const raw = localStorage.getItem(localKey);
      if (raw) localSaved = JSON.parse(raw);
    } catch {}

    try {
      if (currentlySaved) {
        // Unsave
        localSaved = localSaved.filter(id => id !== postId);
        localStorage.setItem(localKey, JSON.stringify(localSaved));
        await deleteDoc(savedRef);
        return false;
      } else {
        // Save
        if (!localSaved.includes(postId)) localSaved.push(postId);
        localStorage.setItem(localKey, JSON.stringify(localSaved));
        await setDoc(savedRef, {
          postId,
          userId,
          createdAt: new Date().toISOString(),
        });
        return true;
      }
    } catch (err) {
      console.warn('Toggle save post Firestore fallback:', err);
      return !currentlySaved;
    }
  },

  async fetchSavedPostIds(userId: string): Promise<string[]> {
    const localKey = `tekel_saved_${userId}`;
    let cached: string[] = [];
    try {
      const raw = localStorage.getItem(localKey);
      if (raw) cached = JSON.parse(raw);
    } catch {}

    try {
      const snap = await getDocs(collection(db, `users/${userId}/savedPosts`));
      if (!snap.empty) {
        const firestoreIds = snap.docs.map(d => d.id);
        const combined = Array.from(new Set([...cached, ...firestoreIds]));
        localStorage.setItem(localKey, JSON.stringify(combined));
        return combined;
      }
      return cached;
    } catch (err) {
      console.warn('Fetch saved posts Firestore fallback to local cache:', err);
      return cached;
    }
  },

  async checkIsPostSaved(userId: string, postId: string): Promise<boolean> {
    const localKey = `tekel_saved_${userId}`;
    try {
      const raw = localStorage.getItem(localKey);
      if (raw) {
        const list: string[] = JSON.parse(raw);
        if (list.includes(postId)) return true;
      }
    } catch {}

    try {
      const snap = await getDoc(doc(db, `users/${userId}/savedPosts`, postId));
      return snap.exists();
    } catch {
      return false;
    }
  },

  // COMMENTS
  async fetchComments(postId: string): Promise<Comment[]> {
    try {
      const q = query(collection(db, `posts/${postId}/comments`), orderBy('createdAt', 'asc'));
      const snap = await getDocs(q);
      return snap.docs.map(d => ({ id: d.id, ...d.data() } as Comment));
    } catch {
      return [];
    }
  },

  async addComment(postId: string, author: UserProfile, text: string): Promise<Comment> {
    const commentId = `comment_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    const comment: Comment = {
      id: commentId,
      postId,
      authorId: author.uid,
      authorName: author.displayName,
      authorPhoto: author.photoURL,
      authorUsername: author.username,
      text,
      createdAt: new Date().toISOString(),
    };

    try {
      await setDoc(doc(db, `posts/${postId}/comments`, commentId), comment);
      await updateDoc(doc(db, 'posts', postId), { commentsCount: increment(1) });
      return comment;
    } catch (err) {
      console.warn('Add comment Firestore fallback:', err);
      return comment;
    }
  },

  // FOLLOWS
  async toggleFollow(currentUserId: string, targetUserId: string, isCurrentlyFollowing: boolean): Promise<boolean> {
    const followId = `${currentUserId}_${targetUserId}`;
    const followRef = doc(db, 'follows', followId);

    try {
      if (isCurrentlyFollowing) {
        await deleteDoc(followRef);
        await updateDoc(doc(db, 'users', currentUserId), { followingCount: increment(-1) }).catch(() => {});
        await updateDoc(doc(db, 'users', targetUserId), { followersCount: increment(-1) }).catch(() => {});
        return false;
      } else {
        await setDoc(followRef, {
          followerId: currentUserId,
          followingId: targetUserId,
          createdAt: new Date().toISOString()
        });
        await updateDoc(doc(db, 'users', currentUserId), { followingCount: increment(1) }).catch(() => {});
        await updateDoc(doc(db, 'users', targetUserId), { followersCount: increment(1) }).catch(() => {});
        return true;
      }
    } catch (err) {
      console.warn('Follow toggle error:', err);
      return !isCurrentlyFollowing;
    }
  },

  async checkIsFollowing(currentUserId: string, targetUserId: string): Promise<boolean> {
    try {
      const followId = `${currentUserId}_${targetUserId}`;
      const snap = await getDoc(doc(db, 'follows', followId));
      return snap.exists();
    } catch {
      return false;
    }
  },

  // MESSAGES
  async fetchConversations(userId: string): Promise<Conversation[]> {
    try {
      const q = query(
        collection(db, 'conversations'),
        where('participants', 'array-contains', userId),
        orderBy('updatedAt', 'desc'),
        limit(20)
      );
      const snap = await getDocs(q);
      return snap.docs.map(d => ({ id: d.id, ...d.data() } as Conversation));
    } catch {
      return [];
    }
  },

  async fetchMessages(conversationId: string): Promise<Message[]> {
    try {
      const q = query(
        collection(db, `conversations/${conversationId}/messages`),
        orderBy('createdAt', 'asc'),
        limit(50)
      );
      const snap = await getDocs(q);
      return snap.docs.map(d => ({ id: d.id, ...d.data() } as Message));
    } catch {
      return [];
    }
  },

  async sendMessage(conversationId: string, message: Omit<Message, 'id' | 'createdAt'>): Promise<Message> {
    const msgId = `msg_${Date.now()}`;
    const fullMsg: Message = {
      ...message,
      id: msgId,
      createdAt: new Date().toISOString(),
      read: false,
    };

    try {
      await setDoc(doc(db, `conversations/${conversationId}/messages`, msgId), fullMsg);
      await updateDoc(doc(db, 'conversations', conversationId), {
        lastMessage: fullMsg.text,
        lastMessageTime: fullMsg.createdAt,
        updatedAt: fullMsg.createdAt,
      });
      return fullMsg;
    } catch (err) {
      console.warn('Send message error:', err);
      return fullMsg;
    }
  },

  // NOTIFICATIONS
  async fetchNotifications(userId: string): Promise<NotificationItem[]> {
    try {
      const q = query(
        collection(db, 'notifications'),
        where('recipientId', '==', userId),
        orderBy('createdAt', 'desc'),
        limit(30)
      );
      const snap = await getDocs(q);
      return snap.docs.map(d => ({ id: d.id, ...d.data() } as NotificationItem));
    } catch {
      return [];
    }
  },

  async createNotification(item: Omit<NotificationItem, 'id' | 'createdAt' | 'read'>): Promise<void> {
    try {
      const id = `notif_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
      await setDoc(doc(db, 'notifications', id), {
        ...item,
        id,
        read: false,
        createdAt: new Date().toISOString(),
      });
    } catch (e) {
      console.warn('Failed to send notification to Firestore:', e);
    }
  },

  // USERS & SEARCH
  async searchUsers(searchQuery: string): Promise<UserProfile[]> {
    const lower = searchQuery.trim().toLowerCase();
    if (!lower) return SAMPLE_USERS;

    try {
      const snap = await getDocs(collection(db, 'users'));
      const dbUsers = snap.docs.map(d => d.data() as UserProfile);
      const combined = [...SAMPLE_USERS, ...dbUsers];
      const seen = new Set<string>();
      return combined.filter(u => {
        if (seen.has(u.uid)) return false;
        seen.add(u.uid);
        return (
          u.displayName.toLowerCase().includes(lower) ||
          u.username.toLowerCase().includes(lower) ||
          (u.bio && u.bio.toLowerCase().includes(lower))
        );
      });
    } catch {
      return SAMPLE_USERS.filter(
        u => u.displayName.toLowerCase().includes(lower) || u.username.toLowerCase().includes(lower)
      );
    }
  },

  async getAllUsers(): Promise<UserProfile[]> {
    try {
      const snap = await getDocs(collection(db, 'users'));
      const list = snap.docs.map(d => d.data() as UserProfile);
      const map = new Map<string, UserProfile>();
      SAMPLE_USERS.forEach(u => map.set(u.uid, u));
      list.forEach(u => map.set(u.uid, u));
      return Array.from(map.values());
    } catch {
      return SAMPLE_USERS;
    }
  },

  async updateUserRoleOrStatus(userId: string, updates: Partial<UserProfile>): Promise<void> {
    try {
      await updateDoc(doc(db, 'users', userId), updates);
    } catch (err) {
      console.warn('Update user status failed:', err);
    }
  }
};
