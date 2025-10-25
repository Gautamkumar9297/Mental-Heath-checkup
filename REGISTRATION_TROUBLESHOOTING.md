# 🔧 Registration Page Troubleshooting

## 🚀 **QUICK DIAGNOSIS**

I've created diagnostic tools to help identify the issue. Follow these steps:

---

## 📋 **STEP 1: Access Diagnostic Pages**

Visit these URLs to test different components:

### **1. System Diagnostics**
- **URL**: http://localhost:5174/diagnostic
- **Purpose**: Check API connectivity, environment variables, and auth status

### **2. Simple Registration Test**  
- **URL**: http://localhost:5174/register-test
- **Purpose**: Test basic registration without complex UI

### **3. Original Registration**
- **URL**: http://localhost:5174/register
- **Purpose**: Full registration form

---

## 🔍 **STEP 2: Check Browser Console**

1. **Open Developer Tools** (F12)
2. **Go to Console tab**
3. **Visit registration page**
4. **Look for error messages**

**Common errors to look for:**
- Environment variable errors
- Network/CORS errors
- Component rendering errors
- Authentication context errors

---

## 🛠️ **STEP 3: Common Issues & Solutions**

### **Issue 1: "Page Not Loading"**
**Solution**: 
- Check if frontend is running on correct port
- Visit: http://localhost:5174 (or check terminal for actual port)

### **Issue 2: "API Connection Errors"**
**Solution**:
1. Ensure backend is running: `cd backend && npm run dev`
2. Check backend health: http://localhost:5000/api/health
3. Verify CORS settings in backend/.env: `CORS_ORIGIN=http://localhost:5174`

### **Issue 3: "Environment Variables Not Working"**
**Solution**:
1. Check .env file has VITE_ prefixes (not REACT_APP_)
2. Restart frontend server after .env changes
3. Use: `import.meta.env.VITE_API_URL` not `process.env.REACT_APP_API_URL`

### **Issue 4: "Form Not Submitting"**
**Solution**:
1. Check browser console for JavaScript errors
2. Verify AuthContext is working properly
3. Test with simple registration form first

### **Issue 5: "Authentication Context Error"**
**Solution**:
1. Ensure AuthProvider is wrapping the app
2. Check if useAuth hook is being called correctly
3. Verify axios baseURL is set correctly

---

## 🧪 **STEP 4: Test Sequence**

**Follow this order to isolate the issue:**

### **1. Test Basic Connectivity**
```bash
# Check backend
curl http://localhost:5000/api/health

# Should return: {"message": "Mental Health Support System API is running!", ...}
```

### **2. Test Frontend Loading**
- Visit: http://localhost:5174/diagnostic
- Check if page loads without errors

### **3. Test Simple Registration**
- Visit: http://localhost:5174/register-test
- Try to register with test data

### **4. Test Full Registration**
- Visit: http://localhost:5174/register
- Try multi-step registration form

---

## 🔍 **STEP 5: Specific Error Checks**

### **Check Environment Variables**
Visit `/diagnostic` page and verify:
- `VITE_API_URL: http://localhost:5000/api`
- `VITE_SOCKET_URL: http://localhost:5000`
- `MODE: development`
- `DEV: true`

### **Check API Connection**
The diagnostic page should show:
- ✅ API Connected: Mental Health Support System API is running!

### **Check Authentication**
The diagnostic page should show:
- Is Authenticated: No (initially)
- Loading: No
- Error: None
- Token: None

---

## 🚨 **STEP 6: Most Likely Issues**

### **Issue A: Wrong Port**
- Frontend might be on different port (5173, 5174, etc.)
- Check terminal output for actual port
- Update backend CORS_ORIGIN if needed

### **Issue B: Environment Variables**
- Using REACT_APP_ instead of VITE_
- Not restarting after .env changes
- Missing .env file

### **Issue C: Backend Not Running**
- Backend server stopped
- MongoDB connection issues
- Port 5000 already in use

### **Issue D: Component Errors**
- Missing dependencies
- Import/export errors
- React component rendering issues

---

## 📞 **STEP 7: Get Specific Error Details**

**Tell me exactly what you see:**

1. **What URL are you visiting?**
   - http://localhost:5174/register
   - http://localhost:5173/register
   - Other?

2. **What happens when you visit the page?**
   - Blank page?
   - Error message?
   - Form loads but doesn't work?
   - Page loads but no styling?

3. **Browser Console Errors**
   - Open F12 → Console
   - Copy any red error messages

4. **Network Tab Errors**
   - F12 → Network
   - Try to register
   - Any failed requests (red)?

---

## ✅ **EXPECTED WORKING STATE**

When everything is working correctly:

1. **http://localhost:5174/diagnostic** shows:
   - ✅ API Connected
   - All environment variables present
   - No errors

2. **http://localhost:5174/register-test** allows:
   - Filling out simple form
   - Successful registration
   - "Registration successful!" alert

3. **http://localhost:5174/register** shows:
   - Beautiful multi-step form
   - Step-by-step progress
   - Working validation
   - Successful registration

---

## 🎯 **NEXT STEPS**

1. **Visit**: http://localhost:5174/diagnostic
2. **Test**: Simple registration at /register-test  
3. **Report back**: What specific errors you see
4. **Share**: Browser console errors (if any)

Let me know what you discover with these diagnostic tools! 🚀