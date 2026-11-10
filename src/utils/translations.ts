export type Language = 'bn' | 'en';

export const translations = {
  bn: {
    // Brand
    appName: 'টেকেল লাইভ',
    tagline: 'বাংলাদেশের আপনার নিজস্ব সামাজিক যোগাযোগ মাধ্যম',
    
    // Navigation
    home: 'হোম',
    explore: 'অন্বেষণ',
    create: 'পোস্ট',
    messages: 'বার্তা',
    notifications: 'বিজ্ঞপ্তি',
    profile: 'প্রোফাইল',
    admin: 'অ্যাডমিন প্যানেল',
    settings: 'সেটিংস',
    search: 'অনুসন্ধান',
    
    // Auth
    login: 'লগইন করুন',
    signup: 'নতুন অ্যাকাউন্ট তৈরি করুন',
    loginTitle: 'টেকেল লাইভে স্বাগতম',
    loginSubtitle: 'বন্ধু ও পরিবারের সাথে যুক্ত থাকুন এবং আপনার চিন্তা প্রকাশ করুন',
    email: 'ইমেইল অ্যাড্রেস',
    password: 'পাসওয়ার্ড',
    displayName: 'আপনার পুরো নাম',
    username: 'ইউজারনেম',
    googleSignIn: 'গুগল দিয়ে সাইন ইন করুন',
    quickDemoLogin: 'ডেমো অ্যাকাউন্ট দিয়ে দেখুন',
    demoUser1: 'ডেমো ব্যবহারকারী ১ (আবির)',
    demoUser2: 'ডেমো ব্যবহারকারী ২ (তানিয়া)',
    demoAdmin: 'ডেমো অ্যাডমিন (মেহেদী)',
    dontHaveAccount: 'অ্যাকাউন্ট নেই? নতুন তৈরি করুন',
    alreadyHaveAccount: 'ইতিমধ্যেই অ্যাকাউন্ট আছে? লগইন করুন',
    logout: 'লগআউট',
    loggingIn: 'লগইন হচ্ছে...',
    signingUp: 'নিবন্ধন হচ্ছে...',
    
    // Create Post
    createPost: 'নতুন পোস্ট তৈরি করুন',
    whatsOnYourMind: 'আজ আপনার মনে কী চলছে, বলুন...',
    addPhoto: 'ছবি যোগ করুন',
    addVideo: 'ভিডিও যোগ করুন',
    enterPhotoUrl: 'ছবির লিঙ্ক (URL) দিন অথবা নিচে থেকে বেছে নিন',
    enterVideoUrl: 'ভিডিও লিঙ্ক (MP4/Web) দিন অথবা ডেমো বেছে নিন',
    uploadFromDevice: 'ডিভাইস থেকে ফাইল নির্বাচন করুন',
    publish: 'প্রকাশ করুন',
    publishing: 'পোস্ট হচ্ছে...',
    tagsPlaceholder: 'ট্যাগ যোগ করুন (কমা দিয়ে আলাদা করুন: #বাংলাদেশ, #প্রযুক্তি)',
    feelings: 'অনুভূতি / কার্যকলাপ',
    happy: 'আনন্দিত 😊',
    excited: 'উত্তেজিত 🤩',
    blessed: 'ধন্য 🤲',
    traveling: 'ভ্রমণরত ✈️',
    listening: 'গান শুনছি 🎵',
    eating: 'খাবার খাচ্ছি 🍔',
    cancel: 'বাতিল',
    postSuccess: 'আপনার পোস্ট সফলভাবে প্রকাশিত হয়েছে!',
    
    // Home Feed
    forYou: 'আপনার জন্য',
    following: 'অনুসরণ করছেন',
    videos: 'ভিডিওসমূহ',
    trending: 'জনপ্রিয়',
    stories: 'স্টোরিসমূহ',
    addStory: 'স্টোরি দিন',
    noPostsYet: 'এখনো কোনো পোস্ট নেই',
    beFirstToPost: 'প্রথম পোস্টটি আপনিই করে ফেলুন!',
    loadingPosts: 'পোস্ট লোড হচ্ছে...',
    
    // Post Card
    like: 'লাইক',
    liked: 'পছন্দ করেছেন',
    comment: 'মন্তব্য',
    comments: 'মন্তব্যসমূহ',
    share: 'শেয়ার',
    shared: 'শেয়ার করা হয়েছে',
    writeComment: 'একটি সুন্দর মন্তব্য লিখুন...',
    sendComment: 'পাঠান',
    noComments: 'এখনো কোনো মন্তব্য নেই। প্রথম মন্তব্যটি করুন!',
    deletePost: 'পোস্টটি মুছুন',
    reportPost: 'রিপোর্ট করুন',
    copyLink: 'লিঙ্ক কপি করুন',
    linkCopied: 'পোস্টের লিঙ্ক কপি করা হয়েছে!',
    follow: 'অনুসরণ করুন',
    followingBtn: 'অনুসরণ করছেন',
    unfollow: 'অনুসরণ বাতিল',
    verified: 'যাচাইকৃত',
    save: 'সংরক্ষণ',
    saved: 'সংরক্ষিত',
    savePost: 'পোস্ট সংরক্ষণ করুন',
    unsavePost: 'সংরক্ষণ থেকে সরান',
    postSaved: 'পোস্টটি আপনার প্রোফাইলে সংরক্ষিত হয়েছে!',
    postUnsaved: 'পোস্টটি সংরক্ষণ তালিকা থেকে সরানো হয়েছে!',
    
    // Profile
    postsCount: 'পোস্ট',
    followersCount: 'অনুসারী',
    followingCount: 'অনুসরণ',
    editProfile: 'প্রোফাইল সম্পাদনা',
    bio: 'বায়ো (নিজের সম্পর্কে কিছু লিখুন)',
    saveChanges: 'সংরক্ষণ করুন',
    saving: 'সংরক্ষণ হচ্ছে...',
    joinedOn: 'যোগদান করেছেন',
    allPosts: 'সকল পোস্ট',
    photosAndVideos: 'ছবি ও ভিডিও',
    likedPosts: 'পছন্দের পোস্ট',
    savedPosts: 'সংরক্ষিত পোস্টসমূহ',
    noBioYet: 'এখনো কোনো বায়ো যোগ করা হয়নি।',
    noSavedPosts: 'আপনার এখনো কোনো সংরক্ষিত পোস্ট নেই।',
    noSavedPostsDesc: 'পছন্দের যেকোনো পোস্টের "সংরক্ষণ" (Bookmark) আইকনে ক্লিক করে এখানে জমা রাখুন।',
    changePhoto: 'ছবি পরিবর্তন করুন',
    changeCover: 'কভার পরিবর্তন করুন',
    choosePresetAvatar: 'তৈরি অবতার নির্বাচন করুন',
    
    // Search
    searchPlaceholder: 'নাম বা ইউজারনেম দিয়ে খুঁজুন...',
    suggestedUsers: 'যাদের আপনি অনুসরণ করতে পারেন',
    trendingTopics: 'জনপ্রিয় বিষয়সমূহ',
    noUsersFound: 'কোনো ব্যবহারকারী খুঁজে পাওয়া যায়নি',
    
    // Messages
    chatTitle: 'বার্তা আদান-প্রদান',
    typeMessage: 'একটি বার্তা লিখুন...',
    startConversation: 'কথোপকথন শুরু করতে একজন ব্যবহারকারী বেছে নিন',
    online: 'অনলাইন',
    sent: 'পাঠানো হয়েছে',
    noMessagesYet: 'এখনো কোনো বার্তা আদান-প্রদান হয়নি',
    
    // Notifications
    notificationTitle: 'বিজ্ঞপ্তি ও আপডেট',
    likedYourPost: 'আপনার পোস্টে লাইক দিয়েছেন',
    commentedYourPost: 'আপনার পোস্টে একটি মন্তব্য করেছেন',
    startedFollowing: 'আপনাকে অনুসরণ করা শুরু করেছেন',
    sentYouMessage: 'আপনাকে একটি বার্তা পাঠিয়েছেন',
    noNotifications: 'আপাতত কোনো নতুন বিজ্ঞপ্তি নেই',
    markAllAsRead: 'সবগুলো পঠিত হিসেবে চিহ্নিত করুন',
    
    // Admin Dashboard
    adminTitle: 'টেকেল লাইভ — অ্যাডমিন নিয়ন্ত্রণ কক্ষ',
    adminSubtitle: 'প্ল্যাটফর্মের ব্যবহারকারী, পোস্ট ও কনটেন্ট মডারেশন পরিচালনা করুন',
    totalUsers: 'মোট ব্যবহারকারী',
    totalPosts: 'মোট পোস্ট',
    totalInteractions: 'মোট ইন্টারঅ্যাকশন',
    pendingReports: 'অ্যাক্টিভ রিপোর্ট',
    userManagement: 'ব্যবহারকারী পরিচালনা',
    contentModeration: 'কনটেন্ট মডারেশন',
    broadcastNotice: 'সাধারণ বিজ্ঞপ্তি প্রচার',
    broadcastPlaceholder: 'সকল ব্যবহারকারীদের জন্য গুরুত্বপূর্ণ বার্তা লিখুন...',
    sendBroadcast: 'বিজ্ঞপ্তি পাঠান',
    banUser: 'স্থগিত করুন',
    unbanUser: 'সক্রিয় করুন',
    makeAdmin: 'অ্যাডমিন বানান',
    removeAdmin: 'অ্যাডমিন সরান',
    verifyBadge: 'যাচাই ব্যাজ দিন',
    removeBadge: 'ব্যাজ সরান',
    actionSuccess: 'পদক্ষেপ সফল হয়েছে',
    notAuthorized: 'আপনার অ্যাডমিন অ্যাক্সেসের অনুমতি নেই।',
    
    // System & Theme
    darkMode: 'ডার্ক মোড',
    lightMode: 'লাইট মোড',
    language: 'ভাষা',
    bengali: 'বাংলা',
    english: 'English',
  },
  en: {
    // Brand
    appName: 'Tekel Live',
    tagline: 'Your Homegrown Social Network',
    
    // Navigation
    home: 'Home',
    explore: 'Explore',
    create: 'Create',
    messages: 'Messages',
    notifications: 'Notifications',
    profile: 'Profile',
    admin: 'Admin Panel',
    settings: 'Settings',
    search: 'Search',
    
    // Auth
    login: 'Log In',
    signup: 'Create Account',
    loginTitle: 'Welcome to Tekel Live',
    loginSubtitle: 'Connect with friends, share your passions, and discover community.',
    email: 'Email Address',
    password: 'Password',
    displayName: 'Full Name',
    username: 'Username handle',
    googleSignIn: 'Sign in with Google',
    quickDemoLogin: 'Quick Demo Sign In',
    demoUser1: 'Demo User 1 (Abir)',
    demoUser2: 'Demo User 2 (Tania)',
    demoAdmin: 'Demo Admin (Mehedi)',
    dontHaveAccount: "Don't have an account? Sign up",
    alreadyHaveAccount: 'Already have an account? Log in',
    logout: 'Log Out',
    loggingIn: 'Logging in...',
    signingUp: 'Creating account...',
    
    // Create Post
    createPost: 'Create New Post',
    whatsOnYourMind: "What's on your mind today...",
    addPhoto: 'Add Photo',
    addVideo: 'Add Video',
    enterPhotoUrl: 'Image URL or pick below',
    enterVideoUrl: 'Video URL (MP4) or pick sample',
    uploadFromDevice: 'Choose file from device',
    publish: 'Publish',
    publishing: 'Publishing...',
    tagsPlaceholder: 'Add tags (comma separated: #bangladesh, #tech)',
    feelings: 'Feelings / Activity',
    happy: 'Happy 😊',
    excited: 'Excited 🤩',
    blessed: 'Blessed 🤲',
    traveling: 'Traveling ✈️',
    listening: 'Listening 🎵',
    eating: 'Eating 🍔',
    cancel: 'Cancel',
    postSuccess: 'Your post was published successfully!',
    
    // Home Feed
    forYou: 'For You',
    following: 'Following',
    videos: 'Videos',
    trending: 'Trending',
    stories: 'Stories',
    addStory: 'Add Story',
    noPostsYet: 'No posts yet',
    beFirstToPost: 'Be the first to share something!',
    loadingPosts: 'Loading feed...',
    
    // Post Card
    like: 'Like',
    liked: 'Liked',
    comment: 'Comment',
    comments: 'Comments',
    share: 'Share',
    shared: 'Shared',
    writeComment: 'Write a thoughtful comment...',
    sendComment: 'Send',
    noComments: 'No comments yet. Be the first to comment!',
    deletePost: 'Delete Post',
    reportPost: 'Report Post',
    copyLink: 'Copy Link',
    linkCopied: 'Post link copied to clipboard!',
    follow: 'Follow',
    followingBtn: 'Following',
    unfollow: 'Unfollow',
    verified: 'Verified',
    save: 'Save',
    saved: 'Saved',
    savePost: 'Save Post',
    unsavePost: 'Remove from Saved',
    postSaved: 'Post saved to your profile!',
    postUnsaved: 'Post removed from saved!',
    
    // Profile
    postsCount: 'Posts',
    followersCount: 'Followers',
    followingCount: 'Following',
    editProfile: 'Edit Profile',
    bio: 'Bio (Tell the world about yourself)',
    saveChanges: 'Save Changes',
    saving: 'Saving...',
    joinedOn: 'Joined on',
    allPosts: 'All Posts',
    photosAndVideos: 'Photos & Videos',
    likedPosts: 'Liked Posts',
    savedPosts: 'Saved Posts',
    noBioYet: 'No bio added yet.',
    noSavedPosts: 'No saved posts yet.',
    noSavedPostsDesc: 'Bookmark posts you want to revisit later by clicking the Save icon.',
    changePhoto: 'Change Profile Picture',
    changeCover: 'Change Cover Photo',
    choosePresetAvatar: 'Choose Preset Avatar',
    
    // Search
    searchPlaceholder: 'Search people by name or username...',
    suggestedUsers: 'People you may know',
    trendingTopics: 'Trending Topics',
    noUsersFound: 'No users found',
    
    // Messages
    chatTitle: 'Direct Messages',
    typeMessage: 'Type a message...',
    startConversation: 'Select a conversation to start chatting',
    online: 'Online',
    sent: 'Sent',
    noMessagesYet: 'No messages exchanged yet',
    
    // Notifications
    notificationTitle: 'Notifications & Alerts',
    likedYourPost: 'liked your post',
    commentedYourPost: 'commented on your post',
    startedFollowing: 'started following you',
    sentYouMessage: 'sent you a message',
    noNotifications: 'No notifications right now',
    markAllAsRead: 'Mark all as read',
    
    // Admin Dashboard
    adminTitle: 'Tekel Live Admin Dashboard',
    adminSubtitle: 'Manage users, content moderation, reports and announcements',
    totalUsers: 'Total Users',
    totalPosts: 'Total Posts',
    totalInteractions: 'Total Interactions',
    pendingReports: 'Active Reports',
    userManagement: 'User Management',
    contentModeration: 'Content Moderation',
    broadcastNotice: 'Broadcast Announcement',
    broadcastPlaceholder: 'Write an announcement to broadcast to all users...',
    sendBroadcast: 'Broadcast Message',
    banUser: 'Ban User',
    unbanUser: 'Unban User',
    makeAdmin: 'Make Admin',
    removeAdmin: 'Remove Admin',
    verifyBadge: 'Grant Verified Badge',
    removeBadge: 'Remove Badge',
    actionSuccess: 'Action completed successfully',
    notAuthorized: 'You are not authorized to view the admin area.',
    
    // System & Theme
    darkMode: 'Dark Mode',
    lightMode: 'Light Mode',
    language: 'Language',
    bengali: 'বাংলা',
    english: 'English',
  }
};

export function formatTimeAgoInBengali(dateString: string, lang: Language = 'bn'): string {
  try {
    const now = new Date();
    const past = new Date(dateString);
    const diffInSec = Math.floor((now.getTime() - past.getTime()) / 1000);

    if (diffInSec < 60) {
      return lang === 'bn' ? 'এইমাত্র' : 'just now';
    }
    
    const diffInMin = Math.floor(diffInSec / 60);
    if (diffInMin < 60) {
      if (lang === 'bn') {
        return `${convertNumberToBengali(diffInMin)} মিনিট আগে`;
      }
      return `${diffInMin}m ago`;
    }
    
    const diffInHour = Math.floor(diffInMin / 60);
    if (diffInHour < 24) {
      if (lang === 'bn') {
        return `${convertNumberToBengali(diffInHour)} ঘণ্টা আগে`;
      }
      return `${diffInHour}h ago`;
    }
    
    const diffInDays = Math.floor(diffInHour / 24);
    if (diffInDays < 30) {
      if (lang === 'bn') {
        return `${convertNumberToBengali(diffInDays)} দিন আগে`;
      }
      return `${diffInDays}d ago`;
    }

    const diffInMonths = Math.floor(diffInDays / 30);
    if (diffInMonths < 12) {
      if (lang === 'bn') {
        return `${convertNumberToBengali(diffInMonths)} মাস আগে`;
      }
      return `${diffInMonths}mo ago`;
    }

    const diffInYears = Math.floor(diffInDays / 365);
    if (lang === 'bn') {
      return `${convertNumberToBengali(diffInYears)} বছর আগে`;
    }
    return `${diffInYears}y ago`;
  } catch {
    return dateString;
  }
}

export function convertNumberToBengali(num: number | string): string {
  const bnDigits = ['০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯'];
  return String(num).replace(/[0-9]/g, (w) => bnDigits[+w]);
}
