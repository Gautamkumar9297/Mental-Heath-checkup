# 🗄️ MongoDB Setup Guide for Mental Health System

## 📥 **STEP 1: Install MongoDB**

### **Option A: Download MongoDB Community Server**
1. Go to: https://www.mongodb.com/try/download/community
2. Select: Windows x64
3. Download and install MongoDB

### **Option B: Using Chocolatey (if installed)**
```powershell
choco install mongodb
```

### **Option C: Using MongoDB Atlas (Cloud)**
1. Go to: https://www.mongodb.com/atlas
2. Sign up for free account
3. Create a cluster
4. Get connection string

---

## 🚀 **STEP 2: Start MongoDB**

### **If Installed Locally:**
```bash
# Start MongoDB Service (as Administrator)
net start MongoDB

# Or start manually
mongod --dbpath "C:\Program Files\MongoDB\Server\6.0\data"
```

### **Check if MongoDB is Running:**
```bash
# This should connect without errors
mongo
# or
mongosh
```

---

## 🔗 **STEP 3: Connection Configuration**

### **Local MongoDB Connection:**
```javascript
// In your backend/.env file:
MONGODB_URI=mongodb://localhost:27017/mental-health-support
```

### **MongoDB Atlas (Cloud) Connection:**
```javascript
// In your backend/.env file:
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/mental-health-support
```

---

## 📊 **STEP 4: Sample Data Structure**

Here's what your mental health data will look like in MongoDB:

### **Users Collection:**
```json
{
  "_id": "ObjectId",
  "firstName": "John",
  "lastName": "Doe", 
  "email": "john@example.com",
  "password": "hashed_password",
  "phone": "555-0123",
  "dateOfBirth": "1990-01-01",
  "gender": "male",
  "createdAt": "2025-01-12T19:00:00Z",
  "updatedAt": "2025-01-12T19:00:00Z"
}
```

### **Mood Entries Collection:**
```json
{
  "_id": "ObjectId",
  "userId": "user_object_id",
  "mood": 7,
  "energy": 6,
  "anxiety": 3,
  "notes": "Feeling better today",
  "date": "2025-01-12T19:00:00Z"
}
```

### **Chat Sessions Collection:**
```json
{
  "_id": "ObjectId",
  "userId": "user_object_id",
  "messages": [
    {
      "sender": "user",
      "content": "I'm feeling anxious",
      "timestamp": "2025-01-12T19:00:00Z"
    },
    {
      "sender": "ai",
      "content": "I understand. Let's talk about it.",
      "timestamp": "2025-01-12T19:00:01Z"
    }
  ],
  "startTime": "2025-01-12T19:00:00Z",
  "endTime": "2025-01-12T19:30:00Z"
}
```

---

## 🛠️ **STEP 5: Ready to Use!**

Once MongoDB is running, your mental health system will:
- ✅ Store user registrations
- ✅ Save mood tracking data  
- ✅ Store chat conversations
- ✅ Generate analytics from the data
- ✅ Provide real-time support

Your system is designed to automatically create these collections when users start using the app!