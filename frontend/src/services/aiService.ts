// Hugging Face AI Service
const HF_API_URL = 'https://api-inference.huggingface.co/models';
const HF_TOKEN = import.meta.env.VITE_HF_TOKEN || ''; // Add to .env: VITE_HF_TOKEN=your_token

interface SummaryResponse {
  summary_text?: string;
  generated_text?: string;
}

export const aiService = {
  // Generate summary from text using Hugging Face
  async generateSummary(text: string): Promise<string> {
    try {
      // Limit text to avoid token limits (free tier)
      const truncatedText = text.slice(0, 1024);
      
      const response = await fetch(`${HF_API_URL}/facebook/bart-large-cnn`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${HF_TOKEN}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          inputs: truncatedText,
          parameters: {
            max_length: 150,
            min_length: 40,
            do_sample: false,
          }
        }),
      });

      if (!response.ok) {
        throw new Error(`HF API error: ${response.status}`);
      }

      const data: SummaryResponse[] = await response.json();
      return data[0]?.summary_text || 'Không thể tạo tóm tắt';
    } catch (error) {
      console.error('AI Summary error:', error);
      throw error;
    }
  },

  // Extract text from PDF file (simplified - in production use pdf.js)
  async extractTextFromPDF(file: File): Promise<string> {
    // For demo: return mock text
    // In production: use pdfjs-dist library
    return `Machine Learning is a branch of artificial intelligence that enables computers to learn from data without explicit programming. 
    There are three main types: Supervised Learning uses labeled data, Unsupervised Learning finds patterns in unlabeled data, 
    and Reinforcement Learning learns through trial and error. Neural Networks mimic the human brain structure with interconnected layers. 
    Deep Learning uses multiple neural network layers to learn complex features. Overfitting occurs when a model learns training data too well, 
    performing poorly on new data. Cross-validation helps evaluate model accuracy. Quality training data is more important than complex algorithms. 
    Feature engineering is crucial for model performance. Regularization techniques help prevent overfitting.`;
  },

  // Generate quiz questions (using text generation model)
  async generateQuiz(text: string, numQuestions: number = 3): Promise<any[]> {
    // For demo: return structured quiz based on text
    // In production: use GPT-2 or similar model
    return [
      {
        question: "What is Machine Learning?",
        options: [
          "A programming language",
          "A branch of AI that learns from data",
          "A database system",
          "A web framework"
        ],
        correct: 1
      }
    ];
  }
};
