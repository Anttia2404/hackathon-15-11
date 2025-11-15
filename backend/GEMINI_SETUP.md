# Gemini AI Integration

## Lấy API Key

1. Truy cập [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Đăng nhập bằng tài khoản Google
3. Click "Create API Key"
4. Copy API key

## Cấu hình

1. Mở file `.env` trong thư mục `backend/`
2. Thêm dòng:

```
GEMINI_API_KEY=your_api_key_here
```

## Sử dụng

### Với API Key

Khi có `GEMINI_API_KEY`, hệ thống sẽ sử dụng Gemini AI để generate câu hỏi thông minh:

- Câu hỏi chất lượng cao, phù hợp với chủ đề
- Đáp án chính xác với giải thích chi tiết
- Hỗ trợ nhiều ngôn ngữ (Tiếng Việt)

### Không có API Key (Fallback Mode)

Nếu không có API key, hệ thống sẽ tự động chuyển sang fallback mode:

- Sử dụng knowledge base có sẵn
- Câu hỏi template cho các chủ đề phổ biến
- Vẫn hoạt động bình thường nhưng câu hỏi ít đa dạng hơn

## Test Connection

Để kiểm tra kết nối Gemini AI:

```javascript
const geminiAIService = require('./src/services/geminiAIService');

geminiAIService.testConnection().then(result => {
  console.log(result);
});
```

## Giới hạn

- **Free tier**: 60 requests/minute
- **Rate limit**: Nếu vượt quá, sẽ tự động chuyển sang fallback mode
- **Token limit**: Mỗi request tối đa ~30,000 tokens

## Tính năng

✅ Generate câu hỏi trắc nghiệm tự động
✅ Hỗ trợ 4 mức độ: easy, medium, hard, mixed  
✅ Giải thích chi tiết cho mỗi câu hỏi
✅ Fallback mode khi không có API key
✅ Error handling tự động
✅ Parse JSON response từ Gemini

## Example Request

```javascript
POST /api/v1/quizzes/generate
{
  "topic": "Machine Learning",
  "difficulty": "medium",
  "num_questions": 5,
  "description": "Kiểm tra kiến thức cơ bản về ML"
}
```

## Example Response

```json
{
  "message": "Quiz generated successfully",
  "quiz": {
    "quiz_id": "...",
    "topic": "Machine Learning",
    "difficulty": "medium",
    "total_questions": 5
  },
  "questions": [
    {
      "question_text": "Machine Learning là gì?",
      "question_type": "multiple_choice",
      "options": ["...", "...", "...", "..."],
      "correct_answer": "...",
      "explanation": "...",
      "points": 2.0,
      "question_order": 1
    }
  ]
}
```
