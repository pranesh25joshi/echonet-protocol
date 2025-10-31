# 🚀 START GUIDE - EchoNet Protocol

## ✅ Installation Complete!

Your EchoNet Protocol MERN stack application is ready to run!

---

## 🏃 Running the Application

### Option 1: Manual Start (Recommended for Development)

**Open TWO terminals in VS Code:**

**Terminal 1 - Start Server:**
```powershell
cd server
npm run dev
```

**Terminal 2 - Start Client:**
```powershell
cd client
npm run dev
```

### Option 2: Quick Test

You can also use VS Code's built-in terminal split view:
- Click the **+** dropdown in the terminal → Select **Split Terminal**
- Run server in left terminal, client in right terminal

---

## 🌐 Access the Application

Once both are running, open your browser:

**Frontend:** http://localhost:5173
**Backend API:** http://localhost:5000/api/health

---

## 🧪 Testing the Chat Room

### 1️⃣ Create a Room:
1. Navigate to http://localhost:5173
2. Click **[ CREATE ROOM ]**
3. Fill in:
   - Room Name: `Test Room`
   - Room Type: `Game` (or any type)
   - Max Participants: `10`
4. Click **[ GENERATE ACCESS KEY ]**
5. **Copy the key** (e.g., `A7B9-K3XD-ZQ2M`)

### 2️⃣ Join from Another Window:
1. Open a **new incognito/private browser window**
2. Navigate to http://localhost:5173
3. Click **[ JOIN ROOM ]**
4. Paste the access key
5. Click **Join Room**

### 3️⃣ Test Real-Time Chat:
1. Type a message in one window
2. See it appear instantly in the other window
3. Watch typing indicators in action!

---

## 📊 What's Working Now

✅ **Landing Page** - Cyberpunk theme with animated cursor
✅ **Create Room** - Generates unique keys, stores in MongoDB
✅ **Join Room** - Validates keys, enters room
✅ **Chat Interface** - Full real-time messaging with:
   - Live message updates
   - Participant list
   - Typing indicators
   - System messages (user joined/left)
   - Auto-scroll to latest message
   - Message persistence

✅ **Socket.io** - Real-time WebSocket connection
✅ **MongoDB** - Data persistence
✅ **Access Control** - Key validation, expired room handling

---

## 🔧 MongoDB Setup (If Not Running)

### Option A: Local MongoDB

**Windows:**
```powershell
# Start MongoDB service
net start MongoDB

# Or if installed manually:
mongod --dbpath "C:\data\db"
```

### Option B: MongoDB Atlas (Cloud - Free)

1. Go to https://www.mongodb.com/cloud/atlas
2. Create free account
3. Create a cluster (free tier)
4. Get connection string
5. Update `server/.env`:
   ```env
   MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/echonet-protocol
   ```

---

## 🎨 Features Showcase

### 🔑 Key Generation System
- Unique alphanumeric keys (XXXX-XXXX-XXXX format)
- Copy to clipboard functionality
- QR code ready (dependency installed)

### 💬 Real-Time Chat
- Instant message delivery
- Typing indicators
- Online user tracking
- System notifications

### 🎭 Guest Mode
- No signup required
- Auto-generated anonymous usernames
- Instant access

### ⏰ Room Expiry
- Time-based rooms
- Auto-cleanup
- MongoDB TTL indexes

---

## 📁 Project Structure Overview

```
echonet-protocol/
├── client/                    # React Frontend
│   ├── src/pages/
│   │   ├── LandingPage.jsx   ✅ Complete
│   │   ├── CreateRoom.jsx    ✅ Complete
│   │   ├── JoinRoom.jsx      ✅ Complete
│   │   ├── ChatRoom.jsx      ✅ Complete (NEW!)
│   │   ├── Dashboard.jsx     ⏳ Placeholder
│   │   └── RoomControl.jsx   ⏳ Placeholder
│   └── src/context/
│       ├── AuthContext.jsx   ✅ Guest user management
│       └── SocketContext.jsx ✅ WebSocket connection
│
└── server/                    # Express Backend
    ├── src/models/
    │   ├── Room.js           ✅ Room schema with auto-expiry
    │   ├── User.js           ✅ User schema
    │   └── Message.js        ✅ Message schema with TTL
    └── src/services/
        └── socketService.js  ✅ Real-time event handlers
```

---

## 🐛 Troubleshooting

### Server won't start:
- ✅ Check if port 5000 is available
- ✅ Verify MongoDB is running
- ✅ Check `server/.env` configuration

### Client won't start:
- ✅ Check if port 5173 is available
- ✅ Run `npm install` in client folder

### Socket not connecting:
- ✅ Ensure server is running first
- ✅ Check browser console for errors
- ✅ Verify CORS settings in `server/src/index.js`

### Messages not sending:
- ✅ Check Socket.io connection status (green dot)
- ✅ Verify user is in the room
- ✅ Check server terminal for errors

---

## 🎯 Next Steps (Optional Enhancements)

### High Priority:
- [ ] Dashboard page (room management)
- [ ] Room control panel (admin features)
- [ ] Onboarding flow

### Medium Priority:
- [ ] QR code generation for room keys
- [ ] Message reactions/emojis
- [ ] File upload support
- [ ] User profiles

### Advanced:
- [ ] Voice/Video chat
- [ ] Web3 wallet integration
- [ ] NFT room keys
- [ ] Leaderboards & XP system

---

## 💡 Pro Tips

1. **Use Chrome DevTools** - Check WebSocket connection in Network tab
2. **MongoDB Compass** - Visual tool to inspect database
3. **React DevTools** - Debug component state and props
4. **Socket.io DevTools** - Monitor real-time events

---

## 🎉 You're All Set!

Your **EchoNet Protocol** is fully functional with:
- ✅ Real-time chat messaging
- ✅ Room creation & joining
- ✅ Socket.io integration
- ✅ MongoDB persistence
- ✅ Cyberpunk UI theme

**Start chatting and enjoy your futuristic communication platform! 🚀**

---

Need help? Check the browser console and server logs for errors.
