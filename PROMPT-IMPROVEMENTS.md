# 🎯 Cải tiến Prompt cho Gemini AI

## Tóm tắt thay đổi

Đã viết lại prompt trong `backend/src/services/geminiService.js` để AI hiểu rõ hơn và chính xác hơn.

## Những cải tiến chính

### 1. **Làm rõ quy tắc ngày tháng**
- ✅ Giải thích rõ: lịch bắt đầu từ NGÀY MAI (không phải hôm nay)
- ✅ Liệt kê tất cả ngày hợp lệ cho mỗi deadline
- ✅ Cảnh báo rõ ràng về ngày không hợp lệ

### 2. **Phát hiện "yếu môn" tự động**
- ✅ AI tự động detect từ khóa: "yếu", "weak", "chưa có nền"
- ✅ Tự động tăng 30% thời gian học
- ✅ Đánh dấu rõ ràng trong prompt

### 3. **Hướng dẫn "thương lượng" theo Study Mode**
- ✅ Sprint: Giảm ngủ xuống 6h, bữa ăn 30min
- ✅ Normal: Giảm ngủ xuống 7h, bữa ăn 45min
- ✅ Relaxed: Giữ nguyên lifestyle

### 4. **Phân tích Workload**
- ✅ Tính toán tỷ lệ workload (totalHours / availableHours)
- ✅ Đưa ra đánh giá: Nhẹ / Vừa / Nặng / Quá tải
- ✅ Yêu cầu AI giải thích strategy

### 5. **Cấu trúc prompt rõ ràng hơn**
- ✅ Sử dụng emoji để phân loại thông tin
- ✅ Chia thành các section rõ ràng
- ✅ Nhấn mạnh các quy tắc tuyệt đối

## File mới được tạo

### `backend/GEMINI-AI-PROMPT-GUIDE.md`
Tài liệu chi tiết 200+ dòng giải thích:
- Cấu trúc dữ liệu đầu vào
- Quy tắc AI phải tuân thủ
- Template prompt chính xác
- Validation checklist
- Ví dụ cụ thể

## So sánh Before/After

### Before (Prompt cũ)
```
Create study schedule. Focus on CORRECT DATES.
RULE 1: NEVER use dates BEFORE 2025-11-16
RULE 2: NEVER use dates ON or AFTER deadline date
...
```

### After (Prompt mới)
```
Bạn là AI trợ lý lập lịch học thông minh.

📅 THÔNG TIN NGÀY THÁNG (TUYỆT ĐỐI - KHÔNG SAI)
- Hôm nay: 2025-11-15
- Bắt đầu lịch: 2025-11-16 (NGÀY MAI)

🚨 QUY TẮC NGÀY THÁNG (VI PHẠM = LỖI NGHIÊM TRỌNG):
1. KHÔNG BAO GIỜ schedule vào 2025-11-15 (hôm nay)
2. KHÔNG BAO GIỜ schedule vào ngày deadline
...

📚 DEADLINES CẦN XỬ LÝ:
1. "Bài tập Toán"
   📅 Deadline: 2025-11-20 (còn 5 ngày)
   ⏱️ Giờ ước tính: 4h → 🚨 YẾU MÔN → 5.2h (tăng 30%)
   ✅ NGÀY HỢP LỆ: 2025-11-16, 2025-11-17, 2025-11-18, 2025-11-19
   ❌ NGÀY KHÔNG HỢP LỆ: 2025-11-20 và sau đó
   ⚠️ ĐÂY LÀ MÔN YẾU - Ưu tiên schedule sớm!
...
```

## Kết quả mong đợi

1. **Ngày tháng chính xác hơn** - AI hiểu rõ boundary
2. **Phát hiện yếu môn** - Tự động tăng thời gian
3. **Thương lượng thông minh** - Điều chỉnh theo mode
4. **Workload analysis tốt hơn** - Giải thích rõ ràng
5. **Ít lỗi validation** - Prompt rõ ràng hơn

## Test

Để test prompt mới:

```bash
cd backend
npm run dev
```

Sau đó test API:
```powershell
$body = @{
    deadlines = @(
        @{
            title = "Bài tập Toán"
            dueDate = "2025-11-20"
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
    scheduleWeeks = 1
} | ConvertTo-Json -Depth 10

Invoke-RestMethod -Uri "http://localhost:5000/api/schedule/generate" -Method Post -ContentType "application/json" -Body $body
```

Kỳ vọng:
- ✅ AI phát hiện "yếu môn" → tăng lên 5.2h
- ✅ Sprint mode → giảm ngủ xuống 6h
- ✅ Không schedule vào hôm nay (2025-11-15)
- ✅ Không schedule vào deadline day (2025-11-20)
- ✅ Workload analysis có giải thích rõ ràng
