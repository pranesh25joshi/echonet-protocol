# 🧪 Testing Guide - Password Authentication

## Quick Test Checklist

### ✅ Registration Test
1. Navigate to http://localhost:5173
2. Click "ACCESS ECHONET"
3. Select **[REGISTER ACCOUNT]**
4. Fill in the form:
   - Username: `test_agent_007`
   - Email: `test@echonet.com` (optional)
   - Password: `test123456`
   - Confirm Password: `test123456`
5. Click **[CONFIRM IDENTITY]**
6. ✅ Should redirect to Dashboard
7. ✅ Username should show "test_agent_007" (not Guest_xxx)

### ✅ Login Test
1. Open new incognito/private window
2. Navigate to http://localhost:5173
3. Click "ACCESS ECHONET"
4. Select **[LOGIN]**
5. Enter credentials:
   - Username: `test_agent_007`
   - Password: `test123456`
6. Click **[LOGIN]**
7. ✅ Should redirect to Dashboard
8. ✅ Username should show "test_agent_007"
9. ✅ Proves you can access your account from different browser/device!

### ✅ Password Validation Test
1. Try to register with password "abc" (< 6 chars)
   - ❌ Should show alert: "Password must be at least 6 characters"
2. Try passwords that don't match
   - Password: `test123456`
   - Confirm: `test654321`
   - ❌ Should show alert: "Passwords do not match"
3. Try empty fields
   - ❌ Should show alerts for missing required fields

### ✅ Session Persistence Test
1. After login, refresh the page (F5)
   - ✅ Should remain logged in
2. Close the browser completely
3. Reopen and navigate to http://localhost:5173
   - ✅ Should auto-login (session valid for 90 days)

### ✅ Wrong Credentials Test
1. Go to Login
2. Enter wrong password
   - Username: `test_agent_007`
   - Password: `wrongpassword`
3. ❌ Should show alert: "Login failed. Please check your credentials."

### ✅ Database Verification
Open MongoDB Atlas or Compass and check:

1. **User document should have:**
   ```json
   {
     "username": "test_agent_007",
     "password": "$2b$10$...hashedPasswordHere...",
     "email": "test@echonet.com",
     "isGuest": false,
     "sessionToken": "32-char-hex-string",
     "sessionExpiry": "90 days from now"
   }
   ```

2. **Password should be hashed:**
   - ✅ Starts with `$2b$10$` (bcrypt)
   - ✅ NOT plain text "test123456"

---

## Step-by-Step Registration Flow

### Step 1: Access Onboarding
```
http://localhost:5173 → Click "ACCESS ECHONET" → Onboarding Page
```

### Step 2: Mode Selection
You should see three options:
- **[GUEST MODE]** - Anonymous access
- **[REGISTER ACCOUNT]** - Create new account
- **[LOGIN]** - Access existing account

Select **[REGISTER ACCOUNT]**

### Step 3: Registration Form
The form should show:

**Username Field:**
- Label: "CHOOSE USERNAME *"
- Prefix: `@`
- Placeholder: "agent_name"
- Max length: 20 characters

**Email Field:**
- Label: "EMAIL (Optional)"
- Icon: Mail icon
- Placeholder: "agent@echonet.protocol"

**Password Field:**
- Label: "PASSWORD *"
- Icon: Lock icon
- Placeholder: "Enter password"
- Show/Hide toggle (eye icon)
- Minimum: 6 characters

**Confirm Password Field:**
- Label: "CONFIRM PASSWORD *"
- Icon: Lock icon
- Placeholder: "Confirm password"
- Must match password

**Submit Button:**
- Text: "[CONFIRM IDENTITY]"
- Disabled until username + valid password entered

**Back Button:**
- Text: "[BACK]"
- Returns to mode selection

### Step 4: Fill Form
Enter test data:
```
Username: test_agent_007
Email: test@echonet.com (optional)
Password: test123456
Confirm Password: test123456
```

### Step 5: Submit
Click **[CONFIRM IDENTITY]**

**What happens:**
1. Client validates:
   - Username not empty ✓
   - Password entered ✓
   - Password >= 6 chars ✓
   - Passwords match ✓

2. Client sends POST to `/api/auth/register`:
   ```json
   {
     "username": "test_agent_007",
     "password": "test123456",
     "email": "test@echonet.com"
   }
   ```

3. Server processes:
   - Checks username uniqueness
   - Hashes password with bcrypt
   - Creates user in database
   - Generates 90-day session token

4. Server responds:
   ```json
   {
     "user": {
       "id": "...",
       "username": "test_agent_007",
       "email": "test@echonet.com",
       "isGuest": false
     },
     "sessionToken": "a1b2c3d4e5f6..."
   }
   ```

5. Client stores in localStorage:
   - `echonet_user`
   - `echonet_session_token`

6. Redirects to Dashboard

---

## Step-by-Step Login Flow

### Step 1: Access Login
```
http://localhost:5173 → "ACCESS ECHONET" → [LOGIN]
```

### Step 2: Login Form
The form should show:

**Username Field:**
- Label: "USERNAME"
- Prefix: `@`
- Placeholder: "agent_name"

**Password Field:**
- Label: "PASSWORD"
- Icon: Lock icon
- Placeholder: "Enter password"
- Show/Hide toggle

**Submit Button:**
- Text: "[LOGIN]"
- Disabled until both fields filled

**Register Link:**
- Text: "Don't have an account? [REGISTER]"
- Switches to registration form

### Step 3: Enter Credentials
```
Username: test_agent_007
Password: test123456
```

### Step 4: Submit
Click **[LOGIN]**

**What happens:**
1. Client validates:
   - Username not empty ✓
   - Password entered ✓

2. Client sends POST to `/api/auth/login`:
   ```json
   {
     "username": "test_agent_007",
     "password": "test123456"
   }
   ```

3. Server processes:
   - Finds user by username
   - Includes password field (select: '+password')
   - Calls user.comparePassword('test123456')
   - bcrypt compares with hash
   - If valid, generates new session token

4. Server responds:
   ```json
   {
     "user": {
       "id": "...",
       "username": "test_agent_007",
       "email": "test@echonet.com",
       "isGuest": false
     },
     "sessionToken": "new-session-token..."
   }
   ```

5. Client stores in localStorage
6. Redirects to Dashboard

---

## Common Issues & Solutions

### ❌ "Username already taken"
**Problem:** Username already exists in database  
**Solution:** Choose a different username

### ❌ "Password must be at least 6 characters"
**Problem:** Password too short  
**Solution:** Enter password with minimum 6 characters

### ❌ "Passwords do not match"
**Problem:** Password and Confirm Password don't match  
**Solution:** Make sure both fields have identical text

### ❌ "Invalid credentials" on login
**Problem:** Username or password incorrect  
**Solution:** 
- Verify username is exact (case-sensitive)
- Check password is correct
- Ensure you registered this account (not guest)

### ❌ Server not responding
**Problem:** Backend server not running  
**Solution:** Check terminal shows "Server running on port 5000"

### ❌ MongoDB not connected
**Problem:** Database connection failed  
**Solution:** Check terminal shows "MongoDB: Connected"

### ❌ Can't see password being typed
**Problem:** Password field is hidden by default  
**Solution:** Click the eye icon to show/hide password

---

## Backend Logs to Watch

### Successful Registration
```
POST /api/auth/register 201
User registered: test_agent_007
```

### Successful Login
```
POST /api/auth/login 200
User logged in: test_agent_007
```

### Failed Login
```
POST /api/auth/login 401
Invalid credentials for username: test_agent_007
```

---

## Testing with MongoDB Compass

### View Registered User
1. Connect to: `your_mongodb_connection_string`
2. Select database: `echonet-protocol`
3. Select collection: `users`
4. Find document with username: `test_agent_007`

**Expected fields:**
```json
{
  "_id": ObjectId("..."),
  "username": "test_agent_007",
  "password": "$2b$10$ABC...XYZ", // HASHED, not plain text!
  "email": "test@echonet.com",
  "isGuest": false,
  "browserFingerprint": null, // Only for guests
  "sessionToken": "a1b2c3d4e5f6...",
  "sessionExpiry": ISODate("2024-04-15T..."),
  "createdAt": ISODate("2024-01-15T..."),
  "__v": 0
}
```

### Verify Password Hash
- Password should start with `$2b$10$`
- Should be 60 characters long
- Should NOT be plain text
- Different users with same password should have different hashes (salt)

---

## Security Verification

### ✅ Password Never Sent in Plain Text
Open browser DevTools → Network tab:

1. Register or login
2. Find POST request to `/api/auth/register` or `/api/auth/login`
3. Check request payload
4. ✅ Password should be visible in request (HTTPS encrypts in production)
5. Check response
6. ✅ Password should NOT be in response

### ✅ Password Hash in Database
- ✅ Never plain text
- ✅ Starts with `$2b$10$`
- ✅ 60 characters long
- ✅ Different for each user (even same password)

### ✅ Session Token Generated
- ✅ 32-byte random hex string
- ✅ Stored in user document
- ✅ Has expiry date
- ✅ Validated on each request

---

## Full Test Scenario

### Scenario: New User Registration and Cross-Device Access

**Part 1: Register on Desktop**
1. Open Chrome on desktop
2. Navigate to http://localhost:5173
3. Register:
   - Username: `mobile_test`
   - Email: `mobile@test.com`
   - Password: `secure123`
4. ✅ Redirected to Dashboard
5. Create a test room
6. Close browser

**Part 2: Login on Mobile/Different Browser**
1. Open Firefox (or mobile browser)
2. Navigate to http://localhost:5173
3. Login:
   - Username: `mobile_test`
   - Password: `secure123`
4. ✅ Redirected to Dashboard
5. ✅ See same username
6. ✅ Can join rooms

**Part 3: Session Persistence**
1. Refresh page
2. ✅ Still logged in
3. Close browser
4. Reopen after 1 hour
5. ✅ Still logged in (90-day session)

**Part 4: Logout and Re-Login**
1. Click logout (if implemented)
2. Session cleared
3. Login again with credentials
4. ✅ Access restored

---

## Expected vs Actual

### Registration
**Expected:**
- Form accepts username, email, password
- Password hashed before storage
- Session token generated
- Redirect to dashboard
- Username shows as registered (not Guest_xxx)

**How to verify:**
- Check MongoDB for hashed password
- Check localStorage for session token
- Check Dashboard shows correct username
- Check Network tab for API calls

### Login
**Expected:**
- Form accepts username, password
- Server verifies credentials
- New session token issued
- Redirect to dashboard
- Works from any device

**How to verify:**
- Try wrong password - should fail
- Try correct password - should succeed
- Login from incognito - should work
- Check Network tab for 200 response

---

## Next Steps After Testing

Once you've confirmed:
✅ Registration works with password
✅ Login works with credentials
✅ Sessions persist
✅ Passwords are hashed in database

You can:
1. Add password recovery (forgot password)
2. Add email verification
3. Add password strength meter
4. Add account settings page
5. Add change password feature
6. Add two-factor authentication

---

## Questions to Answer

After testing, you should be able to answer:

1. ✅ Can I register with a username and password?
2. ✅ Is my password stored securely (hashed)?
3. ✅ Can I login from a different browser/device?
4. ✅ Does the session persist across browser restarts?
5. ✅ Does wrong password get rejected?
6. ✅ Can I see my registered username in the Dashboard?
7. ✅ Does the show/hide password toggle work?
8. ✅ Are password validation rules enforced?

**If you answered YES to all, the authentication system is working! 🎉**
