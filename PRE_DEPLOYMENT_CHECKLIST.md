# 📋 Pre-Deployment Checklist

## Before Deploying:

### ✅ Code Preparation
- [ ] All features working locally
- [ ] No console errors in browser
- [ ] Backend running on port 5000
- [ ] Frontend running on port 5173
- [ ] Both servers can communicate

### ✅ Environment Variables
- [ ] `.env` exists in `server/` folder (with real MongoDB URI)
- [ ] `.env` is in `.gitignore` (should be already)
- [ ] `.env.example` exists for both client and server
- [ ] Ready to set environment variables on Vercel and Render

### ✅ Git & GitHub
- [ ] All changes committed
- [ ] Pushed to GitHub
- [ ] Repository is public or you have Vercel/Render access to private repos

### ✅ Database
- [ ] MongoDB Atlas is set up
- [ ] Database connection works locally
- [ ] IP whitelist allows all IPs (0.0.0.0/0) for Render

---

## Deployment Order:

1. **Backend First** (Render)
   - Get backend URL: `https://your-backend.onrender.com`
   
2. **Frontend Second** (Vercel)
   - Use backend URL in environment variables
   - Get frontend URL: `https://your-app.vercel.app`
   
3. **Update Backend**
   - Add frontend URL to `CLIENT_URL` env variable
   - Backend auto-redeploys

---

## After Deployment:

### ✅ Testing
- [ ] Frontend loads
- [ ] Can create guest account
- [ ] Can register new account
- [ ] Can login
- [ ] Can create room
- [ ] Can join room (different browser/incognito)
- [ ] Real-time chat works
- [ ] Timer works
- [ ] Room control panel works

### ✅ Performance
- [ ] No CORS errors in console
- [ ] Socket.io connects successfully
- [ ] Messages send/receive instantly
- [ ] Timer counts down correctly

---

## Quick Deploy Commands:

### Deploy Frontend (Vercel CLI):
```bash
cd client
vercel --prod
```

### Check Backend Logs (Render):
Visit: https://dashboard.render.com → Your Service → Logs

### Check Frontend Logs (Vercel):
Visit: https://vercel.com/dashboard → Your Project → Deployments

---

## Emergency Rollback:

### Vercel:
1. Go to Deployments
2. Find previous working deployment
3. Click "..." → "Promote to Production"

### Render:
1. Go to your service
2. Click "Manual Deploy"
3. Select previous commit

---

## Support Links:

- Vercel Docs: https://vercel.com/docs
- Render Docs: https://render.com/docs
- MongoDB Atlas: https://cloud.mongodb.com
- Socket.io Docs: https://socket.io/docs/v4/

---

**Ready to deploy? Follow DEPLOYMENT.md step by step! 🚀**
