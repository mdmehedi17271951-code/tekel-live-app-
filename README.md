PROJECT: TEKEL LIVE
TASK: COMPLETE SOCIAL MEDIA APP UPGRADE

Transform my existing Tekel Live application into
a professional TikTok-style short video social media
platform.

IMPORTANT:
Do not create a new project.
Upgrade my existing application.
Preserve existing user accounts and database.
Do not delete existing features.
Use my existing React, TypeScript, Vite,
Firebase and Cloudinary configuration.

=================================
1. AUTHENTICATION SYSTEM
=================================

Implement real Firebase Authentication.

Add these login options:

- Continue with Google (Gmail)
- Continue with Facebook
- Email and password registration
- Email and password login
- Forgot password
- Logout
- User profile creation

Add beautiful Google and Facebook login buttons.

Use Firebase GoogleAuthProvider and
FacebookAuthProvider.

Implement proper OAuth redirects and error handling.

Never use fake login buttons.
Never store passwords manually.
Protect private routes.

=================================
2. TIKTOK STYLE VIDEO FEED
=================================

Create a full-screen vertical video feed.

Features:

- Smooth vertical swipe navigation.
- Automatic video playback.
- Pause and play on tap.
- Mute and unmute.
- Video progress bar.
- For You feed.
- Following feed.
- Trending videos.
- Recommended videos.

Each video must display:

- Creator profile picture.
- Username.
- Follow button.
- Video caption.
- Hashtags.
- Like button.
- Comment button.
- Share button.
- Save video button.
- Music and audio information.

Make the video feed mobile-first.

=================================
3. VIDEO UPLOAD SYSTEM
=================================

Build a professional video upload studio.

Allow users to:

- Select videos from phone gallery.
- Record videos using camera.
- Upload MP4, MOV and WebM.
- Add captions.
- Add hashtags.
- Select thumbnails.
- Add audio information.
- Preview videos before posting.
- See upload progress.
- Cancel uploads.
- Publish videos.

Use my existing Cloudinary integration
for video storage.

Save video metadata in Firebase Firestore.

Validate file type and file size.
Show upload errors properly.

After publishing, display the video
automatically in the home feed.

=================================
4. SOCIAL MEDIA FEATURES
=================================

Implement:

- Like and unlike videos.
- Real-time comments.
- Reply to comments.
- Share videos.
- Follow and unfollow users.
- Followers and following lists.
- User profiles.
- Profile bio and profile picture.
- User video gallery.
- Saved videos.
- Notifications.
- Search users and videos.
- Report inappropriate content.

Prevent duplicate likes and follows.

=================================
5. DESIGN AND UI
=================================

Create a premium modern design.

Main colors:
Black: #080808
Turquoise: #00D5C8
Green: #00C58A
White: #FFFFFF

Design requirements:

- TikTok-style vertical video layout.
- Smooth animations.
- Beautiful icons.
- Rounded buttons.
- Modern typography.
- Responsive mobile interface.
- Dark and light themes.
- Bengali and English languages.

Bottom navigation:

HOME
EXPLORE
CREATE VIDEO
INBOX
PROFILE

Fix all horizontal overflow issues.
Remove unwanted white sidebars.
Make every screen fit Android mobile displays.

=================================
6. FIREBASE BACKEND
=================================

Use Firebase Authentication.
Use Cloud Firestore.
Use Firebase Storage only if needed.

Create proper collections:

users
videos
comments
likes
followers
notifications
messages
reports

Implement secure Firestore rules.

Users can edit only their own profiles.
Users can delete only their own videos.
Protect private user information.
Validate all user-generated data.

=================================
7. ADMIN PANEL
=================================

Create an admin dashboard.

Admin can:

- View registered users.
- Manage videos.
- Remove inappropriate posts.
- Manage reported content.
- Block abusive accounts.
- View platform statistics.

Only authorized admin accounts
can access the admin dashboard.

=================================
8. PERFORMANCE
=================================

Optimize video loading.
Use lazy loading.
Use video thumbnails.
Avoid loading all videos at once.
Use pagination.
Optimize Android performance.
Prevent unnecessary Firebase requests.

=================================
9. FINAL REQUIREMENTS
=================================

Do not use mock authentication.
Do not use fake upload functionality.
Do not use placeholder buttons.
Do not break existing Firebase data.
Do not expose API secrets.
Do not overwrite existing configuration.

Keep the existing Capacitor Android setup.
Preserve the existing app ID and app name.

Fix all TypeScript errors.
Fix all React errors.
Fix all build errors.

Run npm run build and ensure it succeeds.

FINAL RESULT:

Tekel Live must become a complete,
professional, TikTok-style social media
application with real Google login,
Facebook login, video uploads, video feeds,
likes, comments, followers and notifications.

Keep Tekel Live as the original brand.
