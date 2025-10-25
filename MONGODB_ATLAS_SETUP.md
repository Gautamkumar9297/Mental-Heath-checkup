# 🌐 MongoDB Atlas Setup for Mental Health System

## 📝 **STEP 1: Create MongoDB Atlas Account**

1. **Go to**: https://www.mongodb.com/atlas
2. **Click**: "Try Free" or "Get Started"
3. **Sign up** with:
   - Email address
   - Password
   - Choose "I'm learning MongoDB"

## 🏗️ **STEP 2: Create Your First Cluster**

1. **Choose Deployment Type**: 
   - Select **"M0 Sandbox"** (FREE tier)
   - Perfect for development and testing

2. **Cloud Provider & Region**:
   - Provider: **AWS** (recommended)
   - Region: Choose closest to your location (e.g., **N. Virginia (us-east-1)**)

3. **Cluster Name**:
   - Name: `mental-health-cluster` (or any name you prefer)

4. **Click**: "Create Deployment"

## 🔐 **STEP 3: Database Access (Create User)**

1. **Security Tab** → **Database Access**
2. **Click**: "Add New Database User"
3. **Authentication Method**: Password
4. **Username**: `mindbot-admin`
5. **Password**: Generate secure password (SAVE THIS!)
6. **Database User Privileges**: 
   - Select "Atlas admin" for full access
7. **Click**: "Add User"

## 🌐 **STEP 4: Network Access (Allow Connections)**

1. **Security Tab** → **Network Access**
2. **Click**: "Add IP Address"
3. **Options**:
   - **For Development**: Click "Allow Access from Anywhere" (0.0.0.0/0)
   - **For Production**: Add your specific IP address
4. **Click**: "Confirm"

## 🔗 **STEP 5: Get Connection String**

1. **Go to**: Database → Clusters
2. **Click**: "Connect" button on your cluster
3. **Choose**: "Drivers"
4. **Driver**: Node.js
5. **Version**: 4.1 or later
6. **Copy the connection string** - it looks like:
   ```
   mongodb+srv://mindbot-admin:<password>@mental-health-cluster.xxxxx.mongodb.net/?retryWrites=true&w=majority
   ```

## ⚙️ **STEP 6: Configure Your Backend**

### **Update your backend/.env file:**

```env
# Replace your MongoDB URI with Atlas connection
MONGODB_URI=mongodb+srv://mindbot-admin:YOUR_PASSWORD@mental-health-cluster.xxxxx.mongodb.net/mental-health-support?retryWrites=true&w=majority
```

**Important**: Replace:
- `YOUR_PASSWORD` with the actual password you created
- `xxxxx` with your actual cluster ID
- Add `/mental-health-support` as the database name

### **Example:**
```env
MONGODB_URI=mongodb+srv://mindbot-admin:MySecurePass123@mental-health-cluster.abc123.mongodb.net/mental-health-support?retryWrites=true&w=majority
```

---

## 🗄️ **STEP 7: Database Structure**

Your MongoDB Atlas will automatically create these collections:

### **Collections that will be created:**
- `users` - User accounts and profiles
- `moods` - Daily mood tracking entries  
- `sessions` - Chat session data
- `messages` - Individual chat messages
- `assessments` - Mental health assessment results
- `resources` - Help resources and articles

---

## 🧪 **STEP 8: Test Your Connection**

1. **Update your .env file** with the Atlas connection string
2. **Restart your backend server**:
   ```bash
   npm run dev
   ```
3. **Look for**: `MongoDB Connected: mental-health-cluster.xxxxx.mongodb.net`
4. **Test registration** at: http://localhost:5174/register-test

---

## 📊 **STEP 9: View Your Data (MongoDB Compass)**

1. **In Atlas Dashboard**: Click "Connect"
2. **Choose**: "Compass" 
3. **Download MongoDB Compass** (GUI tool)
4. **Connect** using the connection string
5. **Browse your data** visually

---

## 🔒 **Security Best Practices**

### **For Production:**
1. **Create separate users** for different access levels
2. **Use specific IP addresses** instead of "Allow from Anywhere"
3. **Enable monitoring** and alerts
4. **Use strong passwords** and rotate them regularly

### **Database User Roles:**
- `readWrite` - For application access
- `read` - For analytics/reporting
- `atlas-admin` - For full administrative access

---

## 💡 **Atlas Benefits for Your Mental Health System**

✅ **Free Tier**: 512MB storage, perfect for development
✅ **Automatic Backups**: Your data is safe  
✅ **Global Distribution**: Fast access worldwide
✅ **Monitoring**: Built-in performance monitoring
✅ **Security**: Enterprise-grade security features
✅ **Scaling**: Easy to upgrade as you grow

---

## 🚀 **Ready to Go!**

Once you complete these steps:

1. **Your connection string is in .env**
2. **Backend connects to Atlas**  
3. **Registration creates users in cloud**
4. **All data is stored securely**
5. **Analytics work with real data**

Your mental health support system will now use MongoDB Atlas cloud database! 🌟

---

## 🆘 **Common Issues & Solutions**

### **"Authentication failed"**
- Check username/password in connection string
- Ensure user has correct permissions

### **"Network timeout"**  
- Verify IP address is allowlisted
- Check internet connection

### **"Database not found"**
- Database will be created automatically on first use
- No action needed!

Your system is now ready with professional cloud database! 🎉