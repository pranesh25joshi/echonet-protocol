# 🔐 EchoNet Protocol - Authentication System

## 📋 Overview

EchoNet uses a **hybrid authentication system** that supports:
- **Anonymous (guest) users** - Browser fingerprint-based, 30-day sessions
- **Registered users** - Username + Password authentication, 90-day sessions
- **Persistent identity** - Cross-device access for registered users

### ✅ PASSWORD AUTHENTICATION NOW IMPLEMENTED
Registered users can now prove their identity with username and password when they return!

---

## 🎯 How User Identity Works

### **1. Anonymous/Guest Users**

When a user first visits EchoNet:

```
1. User opens app → No credentials needed
2. System generates browser fingerprint
3. Creates guest account in database
4. Issues 30-day session token
5. User can chat immediately
```

#### **Browser Fingerprinting**
- Combines: UserAgent, Screen Resolution, Timezone, Language, Canvas fingerprint
- Creates unique hash for each browser
- Stored in database with user record

#### **What Happens When User Returns?**

**Same Browser (localStorage intact):**
```
✅ User recognized → Same identity
✅ All history preserved
✅ Same username and XP
```

**Same Browser (localStorage cleared):**
```
⚠️ Checks fingerprint in database
✅ If match found → Welcome back! (same identity)
❌ If no match → New guest account created
```

**Different Browser/Device:**
```
❌ Different fingerprint → New guest account
💡 Solution: Register for permanent account
```

---

### **2. Registered Users**

Users can register for a permanent account with password protection:

```
1. Click "Register Account" in onboarding
2. Choose unique username
3. Enter password (minimum 6 characters)
4. Confirm password
5. Optional: Provide email for recovery
6. Gets permanent account (90-day session)
7. Can login from any device with credentials
```

**Benefits:**
- ✅ Same identity across all devices
- ✅ Permanent username (not Guest_XXXX)
- ✅ **Password-protected account**
- ✅ Longer session (90 vs 30 days)
- ✅ **Secure login from anywhere**
- ✅ Future features: Email notifications, profile customization

**Security:**
- 🔒 Passwords hashed with bcrypt (salt rounds: 10)
- 🔒 Never stored in plain text
- 🔒 Session tokens for authentication
- 🔒 90-day session expiry

---

### **3. Login (Returning Registered Users)**

Registered users can prove their identity:

```
1. Click "Login" in onboarding
2. Enter username
3. Enter password
4. System verifies credentials
5. Issues new session token
6. Access granted with your identity
```

**How it works:**
```
Username + Password → Server verifies → 
Password hash compared → Valid? → 
New session token → Logged in
```

---

## 🔄 Authentication Flow

### **First Visit**
```
┌─────────────┐
│ Open App    │
└──────┬──────┘
       │
       ▼
┌─────────────────────┐
│ No localStorage     │
│ No session token    │
└──────┬──────────────┘
       │
       ▼
┌────────────────────────┐
│ Generate fingerprint   │
│ fp_abc123_1234567890   │
└──────┬─────────────────┘
       │
       ▼
┌───────────────────────────┐
│ API: POST /auth/create-  │
│      guest               │
│                          │
│ Body: {                  │
│   username: "Guest_XYZ"  │
│   fingerprint: "fp_..."  │
│ }                        │
└──────┬────────────────────┘
       │
       ▼
┌──────────────────────────────┐
│ Database saves:              │
│ - userId: guest_1234_abc     │
│ - username: Guest_XYZ        │
│ - fingerprint: fp_...        │
│ - isGuest: true              │
└──────┬───────────────────────┘
       │
       ▼
┌──────────────────────────────┐
│ Response:                    │
│ - user object                │
│ - sessionToken (32-char hex) │
└──────┬───────────────────────┘
       │
       ▼
┌──────────────────────────────┐
│ Store in localStorage:       │
│ - echonet_user               │
│ - echonet_session_token      │
│ - echonet_fingerprint        │
└──────────────────────────────┘
```

### **Returning Visit**
```
┌─────────────┐
│ Open App    │
└──────┬──────┘
       │
       ▼
┌─────────────────────┐
│ localStorage exists │
│ - user              │
│ - session_token     │
└──────┬──────────────┘
       │
       ▼
┌───────────────────────────┐
│ API: POST /auth/verify-  │
│      session             │
│                          │
│ Body: {                  │
│   userId: "guest_1234"   │
│   sessionToken: "abc..."  │
│ }                        │
└──────┬────────────────────┘
       │
       ├─── Valid? ──────────────┐
       │                         │
       ▼                         ▼
┌──────────────┐        ┌────────────────┐
│ Session OK   │        │ Session Invalid│
│ Welcome back!│        │ Re-authenticate│
└──────────────┘        └────────────────┘
```

---

## 💾 Data Storage

### **Client (Browser)**
```javascript
localStorage.setItem('echonet_user', JSON.stringify({
  id: 'guest_1234_abc',
  userId: 'guest_1234_abc',
  username: 'Guest_XYZ',
  isGuest: true,
  totalXP: 150,
  createdAt: '2025-10-31T...'
}))

localStorage.setItem('echonet_session_token', 'a1b2c3d4...')
localStorage.setItem('echonet_fingerprint', 'fp_abc123_...')
```

### **Server (MongoDB)**
```javascript
User Document:
{
  _id: ObjectId(...),
  userId: 'guest_1234_abc',
  username: 'Guest_XYZ',
  isGuest: true,
  fingerprint: 'fp_abc123_1234567890',
  email: null,
  totalXP: 150,
  roomsCreated: 2,
  roomsJoined: 5,
  lastActive: ISODate('2025-10-31T...'),
  createdAt: ISODate('2025-10-31T...'),
  updatedAt: ISODate('2025-10-31T...')
}

Session (In-Memory Map):
{
  'guest_1234_abc': {
    token: 'a1b2c3d4e5f6...',
    expiresAt: 1730000000000  // 30 days from now
  }
}
```

---

## 🔒 Security Features

### **Session Management**
- **Tokens**: 32-byte random hex strings
- **Expiry**: 30 days (guest), 90 days (registered)
- **Storage**: In-memory Map (migrate to Redis for production)
- **Validation**: Every API request can verify session

### **Fingerprint Protection**
- Not foolproof, but prevents casual duplication
- Helps identify returning users
- Combines multiple browser characteristics
- Hash-based for privacy

### **Limitations**
⚠️ **Guest accounts are NOT fully secure:**
- Can be bypassed with different browsers
- localStorage can be cleared
- Fingerprint can change (browser updates)

**For sensitive operations → Require registration**

---

## 🔄 Migration Path: Guest → Registered

```javascript
// In Onboarding page or Settings
const handleRegister = async () => {
  try {
    const response = await registerUser(username, email)
    // Guest account converts to registered
    // Keeps: XP, rooms, history
    // Updates: isGuest = false, gets permanent ID
  } catch (error) {
    alert('Username already taken')
  }
}
```

**What's Preserved:**
- ✅ Total XP
- ✅ Rooms created
- ✅ Rooms joined
- ✅ Message history

**What Changes:**
- ❌ Old guest ID → New permanent ID
- ❌ "Guest_XYZ" → Your chosen username
- ✅ isGuest: false
- ✅ 90-day session

---

## 📊 API Endpoints

### **POST /api/auth/create-guest**
Creates anonymous user with fingerprint tracking
```json
Request:
{
  "username": "Guest_ABC123",
  "fingerprint": "fp_hash123_timestamp"
}

Response:
{
  "success": true,
  "user": { userId, username, isGuest, totalXP },
  "sessionToken": "hex_token",
  "isReturningUser": false
}
```

### **POST /api/auth/register**
Converts to permanent account
```json
Request:
{
  "username": "MyUsername",
  "email": "user@example.com",
  "fingerprint": "fp_hash123"
}

Response:
{
  "success": true,
  "user": { userId, username, email, isGuest: false },
  "sessionToken": "hex_token"
}
```

### **POST /api/auth/verify-session**
Validates session token
```json
Request:
{
  "userId": "guest_1234_abc",
  "sessionToken": "hex_token"
}

Response:
{
  "success": true,
  "user": { ...full user object }
}
```

### **POST /api/auth/logout**
Invalidates session
```json
Request:
{
  "userId": "guest_1234_abc"
}

Response:
{
  "success": true,
  "message": "Logged out successfully"
}
```

---

## 🎯 Use Cases

### **Scenario 1: Casual User**
```
1. Opens app → Auto guest account
2. Chats for 30 minutes
3. Closes browser
4. Returns next day → Same identity (localStorage)
5. Happy with anonymous usage
```

### **Scenario 2: Regular User**
```
1. Opens app → Guest account
2. Likes the app
3. Registers with username
4. Now has permanent account
5. Can access from phone, laptop, work PC
```

### **Scenario 3: Privacy-Conscious User**
```
1. Uses app as guest
2. Clears cache daily
3. Fingerprint matches → Re-identified
4. Can opt to register or stay anonymous
```

### **Scenario 4: Multiple Devices**
```
1. Creates room on laptop (Guest_ABC)
2. Tries to join from phone → Different guest account!
3. Solution: Register account
4. Same username across all devices
```

---

## 🚀 Future Enhancements

### **Planned Features**
- [ ] Web3 wallet authentication (MetaMask, WalletConnect)
- [ ] OAuth (Google, GitHub, Discord)
- [ ] Email verification
- [ ] Password-based auth (optional)
- [ ] 2FA for registered users
- [ ] Session management dashboard
- [ ] Device linking (recognize "trusted devices")

### **Production Improvements**
- [ ] Migrate sessions to Redis
- [ ] Add JWT tokens
- [ ] Implement refresh tokens
- [ ] Rate limiting
- [ ] IP-based fraud detection

---

## 📖 For Developers

### **Check if user is authenticated:**
```javascript
const { user, isAuthenticated } = useAuth()

if (!isAuthenticated) {
  // Redirect to onboarding
  navigate('/onboarding')
}
```

### **Create guest user:**
```javascript
const { createGuestUser } = useAuth()
await createGuestUser('CustomUsername')
```

### **Register user:**
```javascript
const { registerUser } = useAuth()
await registerUser('PermanentUsername', 'email@example.com')
```

### **Logout:**
```javascript
const { logout } = useAuth()
logout()
navigate('/')
```

---

## ❓ FAQ

**Q: Can I use the same account on phone and laptop?**
A: Yes, but only if you register. Guest accounts are browser-specific.

**Q: What happens if I clear my browser cache?**
A: If you're a guest, you may get a new identity (unless fingerprint matches). Registered users can log back in.

**Q: Is my data private?**
A: Guest users are anonymous. We only store: username, fingerprint hash, XP, room stats. No personal info.

**Q: Can I change my username?**
A: Currently no, but it's a planned feature for registered users.

**Q: How long do sessions last?**
A: 30 days for guests, 90 days for registered users.

---

**Built with privacy and ease-of-use in mind** 🔐✨
