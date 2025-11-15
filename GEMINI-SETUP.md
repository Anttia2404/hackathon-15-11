# 🤖 Hướng dẫn Setup Google Gemini AI

## Bước 1: Lấy API Key

1. Truy cập: https://makersuite.google.com/app/apikey
2. Đăng nhập bằng Google Account
3. Click **"Create API Key"**
4. Copy API key (dạng: `AIzaSy...`)

## Bước 2: Cấu hình Backend

Mở file `backend/.env` và thêm:

```env
GEMINI_API_KEY=AIzaSy_your_actual_api_key_here
```

## Bước 3: Cài đặt dependencies

```bash
cd backend
npm install
```

Package `@google/generative-ai` đã được thêm vào `package.json`.

## Bước 4: Khởi động lại backend

```bash
npm run dev
```

## Bước 5: Test API

### Test 1: Parse Timetable với AI

```powershell
$body = @{
    text = "Monday 8:00-10:00 Calculus II - Room A101
Monday 14:00-16:00 Physics Lab - Lab B203"
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:5000/api/schedule/parse-text" -Method Post -ContentType "application/json" -Body $body
```

### Test 2: Generate Study Plan với AI

```powershell
$body = @{
    deadlines = @(
        @{
            title = "Bài tập Toán"
            dueDate = "2025-11-18"
            estimatedHours = 4
            details = "Em yếu môn này"
        }
    )
    lifestyle = @{
        sleepHours = 8
        lunchDuration = 60
        dinnerDuration = 60
    }
    studyMode = "sprint"
    timetableData = @()
    hardLimits = @{
        noAfter23 = $true
        noSundays = $false
    }
    useAI = $true
} | ConvertTo-Json -Depth 10

Invoke-RestMethod -Uri "http://localhost:5000/api/schedule/generate" -Method Post -ContentType "application/json" -Body $body
```

## Tính năng AI

### 1. Parse Timetable Text (API 1)
- **Endpoint**: `POST /api/schedule/parse-text`
- **Chức năng**: Đọc text thời khóa biểu lộn xộn và chuyển thành JSON
- **Input**: Đoạn text copy từ UTEX, Google Calendar...
- **Output**: JSON structured timetable

### 2. Generate Smart Study Plan (API 2)
- **Endpoint**: `POST /api/schedule/generate`
- **Chức năng**: Tạo kế hoạch học tập thông minh
- **AI Features**:
  - ✅ Phân tích deadline khẩn cấp
  - ✅ Tự động tăng thời gian nếu sinh viên "yếu" môn
  - ✅ Thương lượng giờ ăn/ngủ theo chế độ học
  - ✅ Tránh xung đột với TKB cứng
  - ✅ Đưa ra cảnh báo workload

## Chế độ Fallback

Nếu không có Gemini API key, hệ thống sẽ tự động dùng thuật toán local (không cần AI).

## Giới hạn Free Tier

- **60 requests/minute**
- **1,500 requests/day**
- Đủ để demo và test!

## Troubleshooting

### Lỗi: "Gemini API key not configured"
→ Kiểm tra file `.env` có `GEMINI_API_KEY` chưa

### Lỗi: "Failed to parse timetable with AI"
→ Kiểm tra API key có đúng không
→ Kiểm tra internet connection

### Lỗi: "Invalid AI response format"
→ Gemini đang trả về format không đúng
→ Thử lại hoặc dùng fallback mode (bỏ `useAI: true`)

## Demo cho Ban Giám Khảo

1. **Wow Factor 1**: Import TKB bằng text
   - Copy đoạn text lộn xộn
   - Paste vào ô
   - Click "Import with AI"
   - → Tự động parse thành lịch đẹp!

2. **Wow Factor 2**: AI "thương lượng" thời gian
   - Thêm deadline khẩn
   - Chọn chế độ "Nước rút 🚀"
   - → AI tự động giảm giờ ngủ, rút ngắn bữa ăn!

3. **Wow Factor 3**: AI phân tích "yếu môn"
   - Thêm deadline với details: "Em yếu môn này"
   - → AI tự động tăng thời gian lên 30%!
