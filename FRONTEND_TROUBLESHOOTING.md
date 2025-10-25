# 🔧 Frontend Troubleshooting Guide

## ✅ **SOLUTION FOUND!**

The issue was that you were looking at the **wrong port**. Your frontend is running on **port 5173**, not 3000.

---

## 🌐 **CORRECT URLS**

### **Frontend Application:**
- **Main App**: http://localhost:5173/
- **Registration**: http://localhost:5173/register
- **Login**: http://localhost:5173/login  
- **Enhanced Chat**: http://localhost:5173/chat-new

### **Backend API:**
- **API Base**: http://localhost:5000/api
- **Health Check**: http://localhost:5000/api/health

---

## 🚀 **HOW TO START THE PROJECT**

### **Option 1: Manual Start (Step by Step)**

1. **Start Backend** (Terminal 1):
   ```bash
   cd C:\Users\nonte\OneDrive\Desktop\SIH\mental-health-support-system\backend
   npm run dev
   ```
   ✅ Backend will run on http://localhost:5000

2. **Start Frontend** (Terminal 2):
   ```bash
   cd C:\Users\nonte\OneDrive\Desktop\SIH\mental-health-support-system\frontend
   npm start
   ```
   ✅ Frontend will run on http://localhost:5173

3. **Visit**: http://localhost:5173

### **Option 2: Automated Start**
```powershell
PowerShell -ExecutionPolicy Bypass -File "C:\Users\nonte\OneDrive\Desktop\SIH\mental-health-support-system\START_PROJECT.ps1"
```

---

## ⚡ **QUICK CHECKS**

### **✅ Frontend Running?**
- Check terminal shows: `VITE v7.1.5 ready in XXX ms`
- Check URL: http://localhost:5173
- Port should be **5173**, not 3000

### **✅ Backend Running?**  
- Check terminal shows: `🚀 Mental Health Support System server running on port 5000`
- Check health: http://localhost:5000/api/health
- MongoDB should be connected

---

## 🐛 **COMMON ISSUES & SOLUTIONS**

### **Issue 1: "UI Not Appearing"**
**Solution**: Visit http://localhost:5173 (not 3000)

### **Issue 2: "Cannot connect to backend"**
**Solution**: 
1. Ensure backend is running on port 5000
2. Check CORS settings in backend/.env: `CORS_ORIGIN=http://localhost:5173`

### **Issue 3: "Socket.IO not connecting"**
**Solution**:
1. Check backend Socket.IO server is running
2. Check frontend .env: `REACT_APP_SOCKET_URL=http://localhost:5000`

### **Issue 4: "MongoDB connection error"**
**Solution**:
```bash
# Start MongoDB (as Administrator)
net start MongoDB
```

### **Issue 5: "Missing dependencies"**
**Solution**:
```bash
# In both frontend and backend directories
npm install
```

---

## 🔍 **VERIFICATION STEPS**

1. **Frontend Check**:
   - Visit: http://localhost:5173
   - Should see the mental health app interface
   - Check browser console for errors (F12)

2. **Backend Check**:
   - Visit: http://localhost:5000/api/health
   - Should return JSON: `{"status": "OK", ...}`

3. **Full System Check**:
   - Register account: http://localhost:5173/register
   - Login: http://localhost:5173/login
   - Test chat: http://localhost:5173/chat-new

---

## 📝 **PORT REFERENCE**

| Service | Port | URL |
|---------|------|-----|
| **Frontend (Vite)** | 5173 | http://localhost:5173 |
| **Backend (Express)** | 5000 | http://localhost:5000 |
| **MongoDB** | 27017 | mongodb://localhost:27017 |

---

## 🎯 **NEXT STEPS**

1. ✅ **Open**: http://localhost:5173
2. ✅ **Register**: Create a new account
3. ✅ **Login**: Sign in with your credentials  
4. ✅ **Test Chat**: Try the enhanced chat at `/chat-new`
5. ✅ **Explore**: Dashboard, assessment tools, resources

---

## 🆘 **STILL HAVING ISSUES?**

### **Check Browser Console**
1. Open browser (Chrome/Firefox/Edge)
2. Press F12 to open Developer Tools
3. Check Console tab for error messages
4. Look for network errors in Network tab

### **Check Terminal Output**
1. Backend terminal should show "MongoDB Connected"
2. Frontend terminal should show "VITE v7.1.5 ready"
3. No red error messages

### **Restart Everything**
```bash
# Kill all processes
# Restart backend: npm run dev
# Restart frontend: npm start  
# Visit: http://localhost:5173
```

---

## ✅ **SUCCESS INDICATORS**

You'll know everything is working when:
- ✅ Frontend loads at http://localhost:5173
- ✅ Registration form appears and works
- ✅ Login system functions properly
- ✅ Chat interface loads and connects
- ✅ Dashboard shows analytics components
- ✅ No console errors in browser

---

**🎉 Your Mental Health Support System is ready to use!**

**Main URL: http://localhost:5173** 🚀