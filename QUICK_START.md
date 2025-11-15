# ⚡ QUICK START - EDUSMART DEMO

## 🚀 Chạy Project trong 2 phút

### Bước 1: Backend
```bash
cd backend
npm install
npm run dev
```
✅ Backend chạy tại: http://localhost:5000

### Bước 2: Frontend
```bash
cd frontend
npm install
npm run dev
```
✅ Frontend chạy tại: http://localhost:5173

### Bước 3: Login
Mở browser: http://localhost:5173

**Demo Accounts:**
- Student: `student@test.com` / `password123`
- Teacher: `teacher@test.com` / `password123`

---

## 🎬 Demo Flow (5 phút)

### 1️⃣ Student Dashboard (1 phút)
- Login as student
- Xem Study Health Score: **85/100** với badge **↑150%**
- Xem line chart 7 ngày: 30 → 85
- Xem "Giờ học tối ưu": 20h-22h, thứ 3 & 5

### 2️⃣ Voice Assistant (1 phút)
- Click icon **mic** ở góc phải dưới
- Cho phép microphone
- Nói: **"Tóm tắt slide môn Toán"**
- Nghe AI trả lời bằng voice

### 3️⃣ Push Notification (30 giây)
- Chờ notification tự động hiện (sau 3s)
- Click **bell icon** để xem tất cả
- Highlight: "19:00 – Ôn Toán – Giờ vàng!"

### 4️⃣ AI Summary (1.5 phút)
- Click **"AI Summary"** ở navigation
- Upload file PDF (hoặc click "Chọn file")
- Xem loading animation với progress bar
- Kết quả: Tóm tắt + 4 Flashcards + 5 Quiz

### 5️⃣ Teacher Dashboard (1 phút)
- Click **"Dành cho Giảng viên"** ở navigation
- Xem analytics: 45 SV, 68% hoàn thành BT
- Xem charts: Bar + Pie
- Xem "Top 3 sinh viên cần hỗ trợ"
- Click **"Gửi nhắc nhở tự động"**

---

## 🎯 Key Points để nhấn mạnh

1. **"Từ 30 → 85 điểm trong 7 ngày"** 📈
2. **"AI biết bạn học tốt nhất lúc nào"** 🧠
3. **"Nói là AI hiểu ngay"** 🎤
4. **"Upload 1 lần, học cả tuần"** 📚
5. **"Giảng viên tiết kiệm 80% thời gian"** ⏱️

---

## 🐛 Troubleshooting

### Voice không hoạt động?
- Cho phép microphone trong browser
- Chỉ hoạt động trên Chrome/Edge
- Cần kết nối internet

### Backend lỗi?
```bash
cd backend
npm run migrate
npm run seed
```

### Frontend lỗi?
```bash
cd frontend
rm -rf node_modules
npm install
npm run dev
```

---

## 📱 Browser Support

✅ Chrome (Recommended)
✅ Edge
✅ Safari (Voice có thể không hoạt động)
❌ Firefox (Voice không hỗ trợ)

---

## 🎉 READY TO DEMO!

Chúc bạn thành công! 🏆
