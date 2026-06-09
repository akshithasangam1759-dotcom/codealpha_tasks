# 🐝 BuzzBee — Music Social Platform

> Instagram + Spotify + Snapchat Avatars + Gen Z Aesthetics + Futuristic Music Culture

---

## 🚀 Quick Start (VS Code)

### Prerequisites
- Node.js v18+ → https://nodejs.org
- MongoDB (local or Atlas) → https://www.mongodb.com/atlas (free tier)
- A code editor (VS Code recommended)

---

## 📦 Installation

### 1. Open terminal in VS Code (`Ctrl + `` ` ``)

```bash
cd buzzbee/backend
npm install
```

### 2. Set up environment variables

```bash
# In buzzbee/backend/ folder, copy the example env:
cp .env.example .env
```

Then open `.env` and fill in your values (see API Keys section below).

### 3. Start the server

```bash
# In buzzbee/backend/ folder:
npm run dev        # Development (auto-restarts)
# OR
npm start          # Production
```

### 4. Open the app

Open your browser to: **http://localhost:5000**

---

## 🔑 API Keys Setup

### MongoDB (Required)
1. Go to https://www.mongodb.com/atlas
2. Create a free account → Create a free cluster
3. Click **Connect** → **Drivers** → Copy URI
4. Replace `MONGODB_URI` in `.env`:
   ```
   MONGODB_URI=mongodb+srv://youruser:yourpass@cluster.mongodb.net/buzzbee
   ```
   **OR** use local MongoDB:
   ```
   MONGODB_URI=mongodb://localhost:27017/buzzbee
   ```

### Cloudinary (Required for image/video uploads)
1. Go to https://cloudinary.com → Free account
2. Dashboard → Copy Cloud Name, API Key, API Secret
3. Add to `.env`:
   ```
   CLOUDINARY_CLOUD_NAME=your_cloud_name
   CLOUDINARY_API_KEY=your_api_key
   CLOUDINARY_API_SECRET=your_api_secret
   ```

### Jamendo API (Music — Free)
1. Go to https://developer.jamendo.com
2. Register → Create an app → Copy Client ID
3. Add to `.env`:
   ```
   JAMENDO_CLIENT_ID=your_client_id
   ```
   > **Note:** A demo fallback key is included, but get your own for production!

### Grok AI / Vibey (Optional)
1. Go to https://console.x.ai
2. Get an API key
3. Add to `.env`:
   ```
   GROK_API_KEY=your_grok_api_key
   ```
   > **Note:** Vibey works with witty fallback responses even without a key!

---

## 📁 Project Structure

```
buzzbee/
├── backend/
│   ├── config/
│   │   ├── db.js              # MongoDB connection
│   │   └── cloudinary.js      # Cloudinary + Multer setup
│   ├── controllers/
│   │   ├── authController.js  # Register, login, logout, profile
│   │   ├── userController.js  # Follow, search, suggested users
│   │   ├── postController.js  # CRUD posts, reactions, comments
│   │   ├── storyController.js # Stories (auto-expire 24h)
│   │   ├── messageController.js # DMs, conversations
│   │   ├── notificationController.js # Real-time notifications
│   │   ├── musicController.js # Jamendo API integration
│   │   └── vibeyController.js # Grok AI / Vibey assistant
│   ├── middleware/
│   │   └── auth.js            # JWT protect middleware
│   ├── models/
│   │   ├── User.js            # User schema
│   │   ├── Post.js            # Post + comments schema
│   │   ├── Story.js           # Story schema (24h TTL)
│   │   ├── Message.js         # Message + Conversation schemas
│   │   └── Notification.js    # Notification schema
│   ├── routes/
│   │   ├── auth.js            # /api/auth/*
│   │   ├── users.js           # /api/users/*
│   │   ├── posts.js           # /api/posts/*
│   │   └── combined.js        # stories, messages, notifs, music, vibey
│   ├── uploads/               # Local upload fallback
│   ├── server.js              # Express + Socket.io server
│   ├── package.json
│   └── .env.example           # Environment variables template
│
└── frontend/
    ├── css/
    │   └── main.css           # Full dark/light theme + animations
    ├── js/
    │   ├── api.js             # API client + utilities
    │   ├── auth.js            # Auth module (login/register/splash)
    │   ├── feed.js            # Feed, posts, stories
    │   ├── music.js           # Music player, explore, messages, notifications
    │   └── app.js             # Profile, avatar, Vibey, main init
    └── index.html             # Full single-page app
```

---

## ✨ Features

| Feature | Status |
|---------|--------|
| JWT Authentication | ✅ Real |
| User Registration/Login | ✅ Real |
| Profile with Avatar | ✅ Real |
| Follow/Unfollow System | ✅ Real |
| Feed (following posts) | ✅ Real |
| Create Posts (text/image/music/mood) | ✅ Real |
| Gen Z Reactions (Slay/Drip/Vibe/W/Ate/Mood/Fire) | ✅ Real |
| Comments | ✅ Real |
| Save Posts | ✅ Real |
| Stories (24h auto-expire) | ✅ Real |
| Real-time DM Messaging | ✅ Socket.io |
| Typing Indicators | ✅ Real-time |
| Online Status | ✅ Real-time |
| Notifications | ✅ Real |
| Music Exploration | ✅ Jamendo API |
| Music Player (mini) | ✅ Real |
| Genre Browsing | ✅ Real |
| Artist Discovery | ✅ Real |
| Track Search | ✅ Real |
| Favorite Tracks | ✅ Real |
| Avatar Builder | ✅ Functional |
| Vibey AI Assistant | ✅ Grok/Fallback |
| Dark/Light Theme | ✅ Animated |
| Glassmorphism UI | ✅ |
| Responsive Mobile | ✅ |
| Image Uploads | ✅ Cloudinary |
| Video Uploads | ✅ Cloudinary |
| Explore Page | ✅ Real |
| Search Users | ✅ Real |
| Trending Users | ✅ Real |

---

## 🎨 Theme

### Dark Mode (default)
- Deep matte black backgrounds
- Gold/amber accent colors
- Glassmorphism cards
- Neon glow effects

### Light Mode
- Cream backgrounds
- Navy blue accents
- Soft gradients
- Elegant shadows

Toggle: Click ☀️/🌙 in sidebar or settings.

---

## 🔌 API Endpoints

### Auth
```
POST /api/auth/register     - Create account
POST /api/auth/login        - Sign in
GET  /api/auth/me           - Get current user
POST /api/auth/logout       - Sign out
PUT  /api/auth/profile      - Update profile
PUT  /api/auth/avatar       - Save avatar config
```

### Posts
```
GET    /api/posts/feed         - Get following feed
GET    /api/posts/explore      - Explore all posts
POST   /api/posts              - Create post
GET    /api/posts/:id          - Get single post
DELETE /api/posts/:id          - Delete post
POST   /api/posts/:id/react    - React to post
POST   /api/posts/:id/comments - Add comment
POST   /api/posts/:id/save     - Save/unsave post
GET    /api/posts/saved        - Get saved posts
```

### Users
```
GET  /api/users/search         - Search users
GET  /api/users/suggested      - Suggested to follow
GET  /api/users/trending       - Trending creators
GET  /api/users/:username      - User profile + posts
POST /api/users/:id/follow     - Follow/unfollow
POST /api/users/me/favorites   - Toggle favorite track
```

### Music (Jamendo)
```
GET /api/music/trending        - Trending tracks
GET /api/music/search          - Search tracks
GET /api/music/artists         - Trending artists
GET /api/music/genres          - Music genres
GET /api/music/recommended     - Recommendations
```

### Stories
```
GET    /api/stories            - Stories feed
POST   /api/stories            - Create story
POST   /api/stories/:id/view   - Mark viewed
POST   /api/stories/:id/react  - React to story
DELETE /api/stories/:id        - Delete story
```

### Messages
```
GET  /api/messages/conversations           - All conversations
GET  /api/messages/conversations/:uid/open - Get/create DM
GET  /api/messages/:conversationId         - Get messages
POST /api/messages/:conversationId         - Send message
```

### Vibey AI
```
POST /api/vibey/chat           - Chat with Vibey
```

---

## 🛠 Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | HTML5, CSS3, Vanilla JS |
| Backend | Node.js, Express.js |
| Database | MongoDB + Mongoose |
| Auth | JWT + bcryptjs |
| Real-time | Socket.io |
| Media | Cloudinary |
| Music | Jamendo API |
| AI | Grok (xAI) |
| Architecture | MVC, REST API |

---

## 🔒 Security

- Passwords hashed with bcrypt (salt 12)
- JWT tokens with 7-day expiry
- Rate limiting (500 req/15min per IP)
- Protected API routes via middleware
- Input validation on all forms
- CORS configuration

---

## 📱 Mobile

Fully responsive for:
- Desktop (1200px+)
- Tablet (768px–1199px)
- Mobile (<768px) — Bottom navigation bar

---

## 🐛 Troubleshooting

**MongoDB connection fails:**
- Check your MONGODB_URI in .env
- Whitelist your IP in MongoDB Atlas

**Cloudinary uploads fail:**
- Verify all 3 Cloudinary credentials in .env
- Posts without images still work (text-only)

**Music not loading:**
- Get your Jamendo client ID from developer.jamendo.com
- A demo fallback key is included but may be rate-limited

**Socket.io not connecting:**
- Make sure FRONTEND_URL in .env matches where you open the app
- For local dev: `FRONTEND_URL=http://localhost:5000`

---

## 🐝 Made with ❤️ by BuzzBee Team
