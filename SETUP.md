# 🚀 Quick Setup Guide for EchoNet Protocol

## Prerequisites
- **Node.js** (v18 or higher) - [Download](https://nodejs.org/)
- **MongoDB** (local or Atlas) - [Download](https://www.mongodb.com/try/download/community) or use [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
- **npm** or **yarn**

---

## 📦 Installation Steps

### 1. Install Dependencies

Open **two terminal windows** in VS Code (or your preferred terminal).

#### Terminal 1: Install Server Dependencies
```powershell
cd server
npm install
```

#### Terminal 2: Install Client Dependencies
```powershell
cd client
npm install
```

---

### 2. Set Up MongoDB

#### Option A: Local MongoDB
Make sure MongoDB is running on your machine:
```powershell
# Start MongoDB service (Windows)
net start MongoDB

# Or if using mongod directly
mongod
```

#### Option B: MongoDB Atlas (Cloud)
1. Create a free account at [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create a cluster
3. Get your connection string
4. Update `server/.env` with your connection string

---

### 3. Configure Environment Variables

The server already has a `.env` file. Verify or update it:

**File: `server/.env`**
```env
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/echonet-protocol
CLIENT_URL=http://localhost:5173
```

> **Note**: If using MongoDB Atlas, replace `MONGODB_URI` with your Atlas connection string.

---

### 4. Run the Application

#### Terminal 1: Start the Server
```powershell
cd server
npm run dev
```

You should see:
```
╔═══════════════════════════════════════════════════════╗
║   🌐 ECHONET PROTOCOL SERVER                          ║
║   🚀 Server running on port 5000                      ║
║   📡 Socket.io enabled                                ║
╚═══════════════════════════════════════════════════════╝
```

#### Terminal 2: Start the Client
```powershell
cd client
npm run dev
```

You should see:
```
  VITE v5.x.x  ready in xxx ms

  ➜  Local:   http://localhost:5173/
  ➜  Network: use --host to expose
```

---

### 5. Open in Browser

Navigate to: **http://localhost:5173**

You should see the **EchoNet Protocol Landing Page** 🎉

---

## 🧪 Testing the Application

### Test Create Room Flow:
1. Click **[ CREATE ROOM ]**
2. Fill in room details:
   - Room Name: `Test Room`
   - Room Type: `Game`
   - Max Participants: `10`
3. Click **[ GENERATE ACCESS KEY ]**
4. Copy the generated key (e.g., `A7B9-93KD-ZX2Q`)

### Test Join Room Flow:
1. Open a new **incognito/private browser window**
2. Navigate to: **http://localhost:5173**
3. Click **[ JOIN ROOM ]**
4. Enter the access key from above
5. Click **Join Room**

---

## 📁 Project Structure

```
echonet-protocol/
├── client/                 # React frontend (Vite)
│   ├── src/
│   │   ├── pages/         # Page components
│   │   ├── context/       # React Context (Auth, Socket)
│   │   ├── index.css      # Global styles + Tailwind
│   │   ├── App.jsx        # Main app with routing
│   │   └── index.jsx      # Entry point
│   ├── index.html
│   └── package.json
│
├── server/                # Express + Socket.io backend
│   ├── src/
│   │   ├── models/        # MongoDB models
│   │   ├── routes/        # API routes
│   │   ├── controllers/   # Route handlers
│   │   ├── services/      # Socket.io logic
│   │   ├── config/        # Database config
│   │   ├── utils/         # Helper functions
│   │   └── index.js       # Server entry point
│   ├── .env
│   └── package.json
│
└── README.md
```

---

## 🔧 Troubleshooting

### Port Already in Use
If you get an error that port 5000 or 5173 is already in use:

**Change Server Port:**
Edit `server/.env`:
```env
PORT=5001
```

**Change Client Port:**
Edit `client/vite.config.js`:
```js
server: {
  port: 5174,
}
```

### MongoDB Connection Error
- Ensure MongoDB is running
- Check your `MONGODB_URI` in `server/.env`
- For Atlas, ensure your IP is whitelisted

### Socket.io Not Connecting
- Ensure both client and server are running
- Check browser console for errors
- Verify `CLIENT_URL` in `server/.env` matches your client URL

---

## 🎨 Next Steps

### Pages to Complete:
- ✅ Landing Page
- ✅ Create Room
- ✅ Join Room
- ✅ Access Granted
- ✅ Access Denied
- ⚠️ Chat Room (placeholder - needs full implementation)
- ⚠️ Dashboard (placeholder - needs full implementation)
- ⚠️ Room Control Panel (placeholder - needs full implementation)

### Features to Add:
- Full chat interface with real-time messaging
- User authentication system
- Room management dashboard
- XP and leaderboard system
- QR code generation for room keys
- File/image sharing
- Voice/video chat (future)

---

## 📚 API Endpoints

### Room Endpoints
- `POST /api/rooms` - Create a new room
- `GET /api/rooms/:key` - Get room details by key
- `GET /api/rooms/:key/messages` - Get room messages
- `DELETE /api/rooms/:key` - Delete/deactivate room

### Socket Events (Client → Server)
- `join-room` - Join a chat room
- `send-message` - Send a message
- `typing` - Typing indicator
- `leave-room` - Leave room

### Socket Events (Server → Client)
- `room-joined` - Confirmation of joining
- `user-joined` - Another user joined
- `user-left` - User left the room
- `receive-message` - New message received
- `user-typing` - Someone is typing
- `error` - Error notification

---

## 🎯 Design Theme

- **Colors**: Black & White with Cyan (#00FFFF) / Magenta (#FF00FF) accents
- **Fonts**: Orbitron, Rajdhani, Fira Code, Space Grotesk
- **Style**: Terminal/Console, Cyberpunk, Web3 Inspired
- **Animations**: Glows, pulses, flickers

---

## 🤝 Need Help?

If you encounter any issues:
1. Check the browser console for errors
2. Check the server terminal for backend errors
3. Ensure MongoDB is running
4. Verify all environment variables are set correctly

---

**You're all set! Happy building! 🚀**
