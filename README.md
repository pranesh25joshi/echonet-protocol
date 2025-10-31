# 🧠 EchoNet Protocol

**The Key-Based Real-Time Communication Network**

A futuristic, key-gated real-time communication platform that lets anyone create or join chat rooms instantly — without accounts, logins, or friction.

## 🎯 Core Features

- **🔑 Instant Key-Based Access** - Each room identified by a unique key
- **🕹️ Multiple Room Themes** - Private, Public, Broadcast, Timed, Gaming Arena
- **👤 Guest Mode** - Join instantly without signup
- **💠 Cyberpunk Web3 Theme** - Terminal-style, high-contrast interface
- **⚡ Real-time Communication** - Powered by Socket.io
- **🎮 Gamified Layer** - XP system and leaderboards

## 🚀 Quick Start

### Prerequisites

- Node.js (v18 or higher)
- MongoDB (local or Atlas)
- npm or yarn

### Installation

1. **Clone the repository**
```bash
git clone <your-repo-url>
cd echonet-protocol
```

2. **Install dependencies**
```bash
# Install server dependencies
cd server
npm install

# Install client dependencies
cd ../client
npm install
```

3. **Set up environment variables**
```bash
# Copy .env.example to .env in root
cp .env.example .env

# Edit .env with your MongoDB URI and other configs
```

4. **Start MongoDB**
```bash
# If running locally
mongod
```

5. **Run the application**

```bash
# Terminal 1: Start server
cd server
npm run dev

# Terminal 2: Start client
cd client
npm run dev
```

6. **Open your browser**
```
http://localhost:5173
```

## 📁 Project Structure

```
echonet-protocol/
├── client/                 # React frontend
│   ├── public/
│   ├── src/
│   │   ├── pages/         # Page components
│   │   ├── components/    # Reusable components
│   │   ├── hooks/         # Custom React hooks
│   │   ├── context/       # Context providers
│   │   ├── utils/         # Helper functions
│   │   └── styles/        # CSS files
│   └── package.json
├── server/                # Express backend
│   ├── src/
│   │   ├── models/        # MongoDB models
│   │   ├── routes/        # API routes
│   │   ├── controllers/   # Route controllers
│   │   ├── services/      # Business logic
│   │   ├── middleware/    # Custom middleware
│   │   ├── config/        # Configuration files
│   │   └── index.js       # Server entry point
│   └── package.json
└── README.md
```

## 🛠️ Tech Stack

### Frontend
- React 18
- React Router v6
- Socket.io Client
- Tailwind CSS
- Vite

### Backend
- Node.js
- Express.js
- MongoDB with Mongoose
- Socket.io
- dotenv

## 📖 API Documentation

### Room Endpoints

- `POST /api/rooms` - Create a new room
- `GET /api/rooms/:key` - Get room by key
- `PUT /api/rooms/:key` - Update room settings
- `DELETE /api/rooms/:key` - Delete room

### User Endpoints

- `POST /api/users/guest` - Create guest user
- `GET /api/users/:id` - Get user info

### Socket Events

- `join-room` - Join a room
- `leave-room` - Leave a room
- `send-message` - Send message
- `receive-message` - Receive message
- `user-joined` - User joined notification
- `user-left` - User left notification
- `typing` - Typing indicator

## 🎨 Design Theme

- **Colors**: Monochrome (black, white, grey) with cyan/magenta highlights
- **Fonts**: Orbitron, Rajdhani, Fira Code, Space Grotesk
- **Style**: Terminal/console aesthetic, Web3 inspired
- **Animations**: Glows, flickers, smooth transitions

## 📄 License

MIT License

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

---

Built with 💙 for builders, gamers, and creators who value privacy, aesthetics, and speed.
