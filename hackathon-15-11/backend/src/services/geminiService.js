import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

/**
 * Parse timetable text using Gemini AI
 */
export async function parseTimetableWithAI(rawText) {
  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-pro' });

    const prompt = `Bạn là một AI trích xuất dữ liệu. Hãy đọc đoạn text thời khóa biểu sau đây và trả về một cấu trúc JSON của tất cả các lịch học.

Định dạng JSON cần trả về:
[
  {
    "day": "Monday",
    "startTime": "08:00",
    "endTime": "10:00",
    "title": "Calculus II",
    "location": "Room A101"
  }
]

Quy tắc:
- day phải là: Monday, Tuesday, Wednesday, Thursday, Friday, Saturday, Sunday
- startTime và endTime theo định dạng HH:MM (24h)
- Chỉ trả về JSON, không có text giải thích

Text thời khóa biểu:
${rawText}`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    // Extract JSON from response (remove markdown code blocks if present)
    const jsonMatch = text.match(/\[[\s\S]*\]/);
    if (jsonMatch) {
      const schedule = JSON.parse(jsonMatch[0]);
      // Mark as imported
      return schedule.map(slot => ({ ...slot, isImported: true }));
    }
    
    return [];
  } catch (error) {
    console.error('Gemini AI parsing error:', error);
    throw new Error('Failed to parse timetable with AI');
  }
}

/**
 * Generate optimized study plan using Gemini AI
 */
export async function generateStudyPlan(input) {
  try {
    const { timetable, deadlines, lifestyle, studyMode, hardLimits } = input;
    const today = new Date().toISOString().split('T')[0];
    const tomorrow = new Date(Date.now() + 86400000).toISOString().split('T')[0];

    const model = genAI.getGenerativeModel({ model: 'gemini-pro' });

    const prompt = `Bạn là "ProPlanner", một cố vấn học tập AI chuyên nghiệp. Nhiệm vụ của bạn là tạo ra một kế hoạch học tập (To-Do List) cho "Hôm nay" và "Ngày mai".

Hãy phân tích 6 bối cảnh (context) đầu vào sau:

CONTEXT 1: HÔM NAY LÀ
${today} (Hôm nay)
${tomorrow} (Ngày mai)

CONTEXT 2: THỜI KHÓA BIỂU CỐ ĐỊNH (GIỜ BẬN CỨNG)
(Sinh viên bận học/làm. KHÔNG được lập lịch vào giờ này.)
${JSON.stringify(timetable, null, 2)}

CONTEXT 3: GIỜ "NHẠY CẢM" (GIỜ BẬN MỀM)
(Đây là giờ ăn/ngủ tiêu chuẩn mà sinh viên muốn. BẠN ĐƯỢC PHÉP dời hoặc rút ngắn.)
- Giờ ngủ mong muốn: ${lifestyle.sleepHours || 8} giờ/ngày
- Thời gian ăn trưa: ${lifestyle.lunchDuration || 60} phút
- Thời gian ăn tối: ${lifestyle.dinnerDuration || 60} phút

CONTEXT 4: DANH SÁCH DEADLINE (NHIỆM VỤ)
${JSON.stringify(deadlines, null, 2)}

CONTEXT 5: CHẾ ĐỘ HỌC (MONG MUỐN CỦA SV)
Chế độ hiện tại: ${studyMode === 'sprint' ? 'Nước rút 🚀' : studyMode === 'relaxed' ? 'Thư giãn 🧘' : 'Bình thường 🏃'}

CONTEXT 6: CÁC QUY TẮC LẬP KẾ HOẠCH
1. Ưu tiên (Khẩn cấp & Nỗ lực): Phải ưu tiên các deadline có 'dueDate' gần nhất VÀ 'estimatedHours' cao nhất.
2. Phân tích (Chi tiết): Đọc kỹ 'details'. Nếu sinh viên nói họ "yếu", "chưa có nền", hãy TỰ ĐỘNG TĂNG 'estimatedHours' của nhiệm vụ đó lên 30%.
3. Thời gian rảnh: Chỉ được lập lịch học (task) vào các "khe thời gian rảnh" (là các giờ KHÔNG nằm trong CONTEXT 2).
4. Thương lượng (Linh hoạt): (QUAN TRỌNG NHẤT)
   - Nếu là "Nước rút 🚀", HÃY dời và rút ngắn CONTEXT 3 (ăn/ngủ) để tối đa hóa thời gian học. (Giới hạn: ngủ tối thiểu 6h).
   - Nếu là "Thư giãn 🧘", HÃY giữ nguyên CONTEXT 3.
   - Nếu là "Bình thường 🏃", cho phép giảm ngủ còn 7h, giảm ăn còn 45p.
5. Giới hạn cứng:
   ${hardLimits?.noAfter23 ? '- KHÔNG được lập lịch sau 23:00' : ''}
   ${hardLimits?.noSundays ? '- KHÔNG được lập lịch vào Chủ Nhật' : ''}
   - Không được bỏ bữa
   - Không được lập lịch ngủ dưới 6 giờ/ngày
   - Không được lập lịch học liên tục quá 3 giờ

YÊU CẦU ĐẦU RA (OUTPUT):
Chỉ trả lời bằng một định dạng JSON. KHÔNG dùng văn bản thuần. JSON phải có cấu trúc:

{
  "workloadAnalysis": {
    "score": 7,
    "warning": "Kế hoạch này khá căng thẳng. Tôi đã phải giảm giờ ngủ của bạn xuống 7 giờ."
  },
  "plan": [
    {
      "date": "Hôm nay, ${today}",
      "tasks": [
        { "time": "14:00 - 16:00", "activity": "Làm Bài tập Toán", "category": "study" },
        { "time": "19:00 - 19:30", "activity": "Ăn tối (Đã rút ngắn 30p)", "category": "meal" }
      ]
    },
    {
      "date": "Ngày mai, ${tomorrow}",
      "tasks": [
        { "time": "09:00 - 11:00", "activity": "Học Báo cáo Web", "category": "study" }
      ]
    }
  ]
}

Category có thể là: "study", "meal", "sleep", "break", "class"`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    // Extract JSON from response
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
    
    throw new Error('Invalid AI response format');
  } catch (error) {
    console.error('Gemini AI generation error:', error);
    throw new Error('Failed to generate study plan with AI');
  }
}
