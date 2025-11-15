# 🚀 Quick Start - Smart Scheduler với Gemini AI

## Bước 1: Setup Backend

```bash
cd backend
npm install
```

Thêm Gemini API key vào `backend/.env`:
```env
GEMINI_API_KEY=AIzaSy_your_key_here
```

Lấy key tại: https://makersuite.google.com/app/apikey

Khởi động backend:
```bash
npm run dev
```

Backend chạy tại: http://localhost:5000

## Bước 2: Setup Frontend

Mở terminal mới:

```bash
cd frontend
npm install
```

Khởi động frontend:
```bash
npm run dev
```

Frontend chạy tại: http://localhost:5173

## Bước 3: Test Smart Scheduler

### Tab 1: Context (Bối cảnh)

1. **Import TKB với AI**:
   - Copy text này:
   ```
   Monday 8:00-10:00 Calculus II - Room A101
   Monday 14:00-16:00 Physics Lab - Lab B203
   Tuesday 9:00-11:00 Data Structures - Room C305
   ```
   - Paste vào ô "Import Timetable via Text"
   - ✅ Check "Sử dụng Google Gemini AI"
   - Click "Import với AI"
   - → Xem các ô xanh lá xuất hiện trong grid!

2. **Hard Limits**:
   - ☑️ Check "Do not schedule after 23:00"

### Tab 2: Generator (Tạo lịch)

1. **Thêm Deadlines**:
   - Title: `Bài tập Toán`
   - Due Date: `2025-11-18`
   - Estimated Hours: `4`
   - Details: `Em yếu môn này, cần ôn lại từ đầu`
   - Click "Thêm Deadline"

2. **Chọn Study Mode**:
   - Chọn: 🚀 **Sprint** (Nước rút)

3. **Generate**:
   - ✅ Check "Sử dụng Google Gemini AI"
   - Click "Tạo Kế hoạch Học tập"
   - → Xem AI tạo lịch với "thương lượng" thời gian!

## 🎯 Wow Factors cho BGK

### 1. Parse TKB bằng Text (Gemini AI)
- Copy text lộn xộn từ UTEX
- AI tự động hiểu và parse thành JSON
- Hiển thị đẹp trong grid

### 2. AI "Thương lượng" thời gian
- Chế độ Sprint → AI giảm giờ ngủ xuống 6-7h
- Chế độ Relaxed → AI giữ nguyên 8h ngủ
- AI tự động rút ngắn bữa ăn nếu cần

### 3. AI phân tích "yếu môn"
- Viết "em yếu môn này" trong details
- AI tự động tăng thời gian lên 30%
- Hiển thị trong workload analysis

## 📊 So sánh: Có AI vs Không AI

| Tính năng | Không AI (Local) | Có AI (Gemini) |
|-----------|------------------|----------------|
| Parse TKB | Regex đơn giản | Hiểu ngữ cảnh |
| Lập lịch | Thuật toán cố định | Thương lượng linh hoạt |
| Phân tích | Không có | Workload score + warning |
| "Yếu môn" | Không hiểu | Tự động tăng 30% |

## 🔧 Troubleshooting

### Backend không chạy?
```bash
cd backend
npm install @google/generative-ai
npm run dev
```

### Frontend không kết nối?
- Kiểm tra `frontend/.env` có `VITE_API_URL=http://localhost:5000`
- Reload trang (Ctrl+R)

### Gemini API lỗi?
- Kiểm tra API key trong `backend/.env`
- Bỏ check "Sử dụng Gemini AI" để dùng local mode

## 📝 Demo Script

1. **Mở trang** → Vào Smart Scheduler
2. **Tab Context** → Import TKB bằng text (WOW 1)
3. **Tab Generator** → Thêm deadline với "yếu môn"
4. **Chọn Sprint mode** → Generate
5. **Xem kết quả** → AI đã giảm giờ ngủ! (WOW 2)
6. **Xem workload score** → AI cảnh báo quá tải (WOW 3)

Thời gian demo: ~3 phút
