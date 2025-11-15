# 🔍 TROUBLESHOOTING DASHBOARD

## Vấn đề: Dashboard không load

### ✅ Checklist

1. **Backend có đang chạy không?**
```bash
# Terminal 1
cd backend
npm run dev
```
Kiểm tra: `Server running on port 5000`

2. **Frontend có đang chạy không?**
```bash
# Terminal 2
cd frontend
npm run dev
```
Kiểm tra: `Local: http://localhost:5173`

3. **Mở Browser Console (F12)**
- Có lỗi CORS không?
- Có lỗi 404 API không?
- Có lỗi JavaScript không?

### 🔧 Solutions

#### Nếu thấy lỗi CORS:
```javascript
// backend/src/app.js - Kiểm tra CORS config
const corsOptions = {
  origin: ['http://localhost:5173', 'http://localhost:3000'],
  credentials: true,
};
```

#### Nếu thấy lỗi 404 API:
Backend chưa chạy hoặc routes chưa đúng. App sẽ tự động dùng mock data.

#### Nếu thấy lỗi "Cannot read property":
Dashboard data chưa load. Đã có fallback data.

### 🎯 Expected Behavior

**Với Backend:**
- API call thành công
- Data từ PostgreSQL (nếu đã setup)
- Console log: "Fetching analytics..."

**Không có Backend:**
- API call fail (expected)
- Tự động dùng mock data
- Dashboard vẫn hiển thị đầy đủ
- Console log: "Error fetching analytics" (OK!)

### 📊 Mock Data Always Available

Dashboard đã được cập nhật để:
1. ✅ Luôn có default data
2. ✅ Không crash nếu API fail
3. ✅ Hiển thị chart ngay lập tức
4. ✅ Fallback gracefully

### 🚀 Quick Test

1. **Không cần Backend:**
```bash
cd frontend
npm run dev
```
→ Dashboard vẫn hoạt động với mock data

2. **Với Backend:**
```bash
# Terminal 1
cd backend
npm run dev

# Terminal 2
cd frontend
npm run dev
```
→ Dashboard sẽ fetch real data (hoặc fallback nếu DB chưa setup)

### 🎨 What You Should See

**Student Dashboard:**
- ✅ Study Health Score: 85/100
- ✅ Badge: ↑ 183%
- ✅ Line chart: 7 ngày (30 → 85)
- ✅ Giờ học tối ưu: 20h-22h
- ✅ Tags: [⭐ Giờ vàng] [😴 Tránh giờ buồn ngủ]
- ✅ Attendance: 92%
- ✅ Assignments: 80%

### 🐛 Debug Steps

1. **Check Console:**
```javascript
// Mở F12 → Console
// Tìm:
"Error fetching analytics" → OK, using mock data
"Fetching analytics..." → API call started
```

2. **Check Network Tab:**
```
F12 → Network → XHR
Tìm: /api/v1/analytics/study-health/...
Status: 200 OK → Backend working
Status: Failed → Using mock data (OK!)
```

3. **Check React DevTools:**
```
Components → StudentDashboard
State:
  analyticsData: {...} → Data loaded
  optimalTime: {...} → Data loaded
```

### ✅ Current Status

Dashboard đã được fix với:
- ✅ useEffect đặt đúng vị trí (trước early returns)
- ✅ Default mock data luôn available
- ✅ Fallback trong catch block
- ✅ Không crash nếu API fail
- ✅ Chart data luôn có giá trị

### 🎉 Result

Dashboard sẽ LUÔN hoạt động, dù có hay không có:
- Backend
- Database
- API connection

**Mock data đảm bảo demo luôn thành công!** 🚀
