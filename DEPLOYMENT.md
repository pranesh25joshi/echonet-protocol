# 🚀 Deployment Guide - EchoNet Protocol

This guide will help you deploy the EchoNet Protocol app with:
- **Frontend (Client)**: Vercel
- **Backend (Server)**: Render

---

## 📋 Prerequisites

1. GitHub account
2. Vercel account (https://vercel.com)
3. Render account (https://render.com)
4. MongoDB Atlas database (already set up)

---

## 🔧 Part 1: Deploy Backend to Render

### Step 1: Prepare Your Repository
1. Make sure your code is pushed to GitHub
2. Ensure `.env` is in `.gitignore` (already done)

### Step 2: Create New Web Service on Render
1. Go to https://render.com/dashboard
2. Click **"New +"** → **"Web Service"**
3. Connect your GitHub repository
4. Select the `echonet-protocol` repository

### Step 3: Configure the Service
Fill in the following settings:

**Basic Settings:**
- **Name**: `echonet-protocol-backend` (or any name you prefer)
- **Region**: Choose closest to your users
- **Branch**: `main` (or your default branch)
- **Root Directory**: `server`
- **Environment**: `Node`
- **Build Command**: `npm install`
- **Start Command**: `npm start`

**Instance Type:**
- Select **Free** (or paid if you need more resources)

### Step 4: Add Environment Variables
Click **"Advanced"** → **"Environment Variables"** and add:

```
NODE_ENV=production
PORT=5000
MONGODB_URI=mongodb+srv://pranesh25joshi_db_user:nXKG7O3T7VzIyMx2@socketproject.dik1bhi.mongodb.net/echonet-protocol?retryWrites=true&w=majority&appName=socketproject
CLIENT_URL=https://your-app-name.vercel.app
JWT_SECRET=generate_a_strong_random_secret_here
```

**⚠️ Important Notes:**
- Replace `CLIENT_URL` with your Vercel URL after deploying frontend (Step 5)
- Generate a strong JWT_SECRET: Use a random string generator or run `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`

### Step 5: Deploy
1. Click **"Create Web Service"**
2. Wait for deployment to complete (5-10 minutes)
3. Copy your backend URL: `https://your-service-name.onrender.com`

### Step 6: Test Backend
Visit: `https://your-service-name.onrender.com/api/health`
You should see: `{ "status": "OK" }`

---

## 🎨 Part 2: Deploy Frontend to Vercel

### Step 1: Create Environment File
Create `client/.env.production` with:

```
VITE_API_URL=https://your-backend-url.onrender.com/api
VITE_SOCKET_URL=https://your-backend-url.onrender.com
```

Replace `your-backend-url` with your Render backend URL from Part 1, Step 5.

### Step 2: Deploy to Vercel

**Option A: Using Vercel CLI (Recommended)**
```bash
# Install Vercel CLI
npm install -g vercel

# Navigate to client folder
cd client

# Deploy
vercel

# Follow the prompts:
# - Link to existing project? No
# - Project name: echonet-protocol (or your choice)
# - Directory: ./
# - Override settings? No

# Deploy to production
vercel --prod
```

**Option B: Using Vercel Dashboard**
1. Go to https://vercel.com/dashboard
2. Click **"Add New..."** → **"Project"**
3. Import your GitHub repository
4. Configure:
   - **Framework Preset**: Vite
   - **Root Directory**: `client`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
   - **Install Command**: `npm install`

5. Add Environment Variables:
   - Click **"Environment Variables"**
   - Add `VITE_API_URL`: Your Render backend URL + `/api`
   - Add `VITE_SOCKET_URL`: Your Render backend URL
   
6. Click **"Deploy"**
7. Wait 2-5 minutes for deployment

### Step 3: Update Backend Environment
1. Go back to Render dashboard
2. Select your backend service
3. Go to **"Environment"** tab
4. Update `CLIENT_URL` to your Vercel URL: `https://your-app.vercel.app`
5. Save changes (service will auto-redeploy)

---

## ✅ Part 3: Verify Deployment

### Test Checklist:
- [ ] Visit your Vercel URL (frontend loads)
- [ ] Landing page displays correctly
- [ ] Can login/register
- [ ] Can create a room
- [ ] Can join a room
- [ ] Real-time chat works
- [ ] Timer functionality works
- [ ] Room control panel accessible (for creators)

---

## 🐛 Troubleshooting

### Issue: "Failed to fetch" or CORS errors
**Solution**: 
1. Check `CLIENT_URL` in Render environment variables matches your Vercel URL exactly
2. Make sure no trailing slashes
3. Redeploy backend after changing `CLIENT_URL`

### Issue: Socket.io not connecting
**Solution**:
1. Check `VITE_SOCKET_URL` in Vercel environment variables
2. Make sure it points to your Render backend URL (without `/api`)
3. Redeploy frontend after changing environment variables

### Issue: MongoDB connection errors
**Solution**:
1. Check MongoDB Atlas IP whitelist allows connections from anywhere (0.0.0.0/0) or Render IPs
2. Verify `MONGODB_URI` is correct in Render environment variables

### Issue: Build fails on Vercel
**Solution**:
1. Check build logs for specific errors
2. Make sure all dependencies are in `package.json`
3. Verify `vite.config.js` is correct

### Issue: Backend "Application Error" on Render
**Solution**:
1. Check Render logs for error details
2. Verify all environment variables are set
3. Make sure PORT is set to 5000

---

## 🔄 Updating Your App

### Frontend Updates:
```bash
# Make changes locally
git add .
git commit -m "Update feature"
git push origin main

# Vercel will auto-deploy from GitHub
```

### Backend Updates:
```bash
# Make changes locally
git add .
git commit -m "Update backend"
git push origin main

# Render will auto-deploy from GitHub
```

---

## 📝 Important URLs to Save

After deployment, save these URLs:

- **Frontend (Vercel)**: `https://your-app.vercel.app`
- **Backend (Render)**: `https://your-backend.onrender.com`
- **MongoDB Atlas**: `https://cloud.mongodb.com`

---

## 🔒 Security Checklist

- ✅ JWT_SECRET is a strong random string
- ✅ .env files are NOT committed to Git
- ✅ MongoDB credentials are secure
- ✅ CORS is properly configured (CLIENT_URL)
- ✅ All environment variables are set in production

---

## 💡 Tips

1. **Free Tier Limitations**:
   - Render free tier: Server spins down after 15 min of inactivity (cold start ~30 seconds)
   - Vercel free tier: 100GB bandwidth/month
   
2. **Monitoring**:
   - Check Render logs for backend errors
   - Check Vercel logs for frontend errors
   
3. **Custom Domain** (Optional):
   - Vercel: Project Settings → Domains
   - Render: Settings → Custom Domain

---

## 🎉 You're Done!

Your EchoNet Protocol app is now live! Share your Vercel URL with users.

**Example**: `https://echonet-protocol.vercel.app`

---

Need help? Check the logs:
- **Vercel**: Dashboard → Your Project → Deployments → View Logs
- **Render**: Dashboard → Your Service → Logs
