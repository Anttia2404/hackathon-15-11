import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Mic, MicOff, Volume2, X } from "lucide-react";
import { Button } from "../ui/button";
import { Card } from "../ui/card";

export function VoiceAssistant() {
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [response, setResponse] = useState("");
  const [isVisible, setIsVisible] = useState(true);

  // Web Speech API
  const startListening = () => {
    if (!('webkitSpeechRecognition' in window)) {
      alert('Trình duyệt không hỗ trợ Voice Recognition');
      return;
    }

    const recognition = new (window as any).webkitSpeechRecognition();
    recognition.lang = 'vi-VN';
    recognition.continuous = false;
    recognition.interimResults = false;

    recognition.onstart = () => {
      setIsListening(true);
      setTranscript("Đang nghe...");
    };

    recognition.onresult = (event: any) => {
      const text = event.results[0][0].transcript;
      setTranscript(text);
      handleVoiceCommand(text);
    };

    recognition.onerror = () => {
      setIsListening(false);
      setTranscript("Lỗi khi nghe. Vui lòng thử lại.");
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognition.start();
  };

  const handleVoiceCommand = (command: string) => {
    let aiResponse = "";

    if (command.toLowerCase().includes("tóm tắt") || command.toLowerCase().includes("toán")) {
      aiResponse = "Chương 3 nói về đạo hàm, có 2 công thức chính: đạo hàm của hàm số và đạo hàm của hàm hợp. Bạn cần ôn kỹ phần này nhé!";
    } else if (command.toLowerCase().includes("lịch học")) {
      aiResponse = "Hôm nay bạn có 3 lớp: Toán lúc 8 giờ, Lý lúc 10 giờ, và Anh văn lúc 2 giờ chiều.";
    } else if (command.toLowerCase().includes("điểm")) {
      aiResponse = "Study Health Score của bạn là 85 điểm, tăng 150% so với tuần trước. Xuất sắc!";
    } else {
      aiResponse = "Tôi có thể giúp bạn tóm tắt slide, xem lịch học, hoặc kiểm tra điểm. Bạn cần gì?";
    }

    setResponse(aiResponse);
    speakResponse(aiResponse);
  };

  const speakResponse = (text: string) => {
    if (!('speechSynthesis' in window)) {
      return;
    }

    setIsSpeaking(true);
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'vi-VN';
    utterance.rate = 0.9;
    utterance.pitch = 1;

    utterance.onend = () => {
      setIsSpeaking(false);
    };

    window.speechSynthesis.speak(utterance);
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.8, y: 20 }}
          className="fixed bottom-6 right-6 z-50"
        >
          <Card className="w-80 p-4 shadow-2xl border-2 border-purple-200">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                  <Volume2 className="w-4 h-4 text-white" />
                </div>
                <span className="font-medium text-gray-900">AI Voice Assistant</span>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsVisible(false)}
                className="h-6 w-6 p-0"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>

            <div className="mb-3 p-3 bg-gray-50 rounded-lg min-h-[60px]">
              {transcript && (
                <div className="mb-2">
                  <p className="text-xs text-gray-500 mb-1">Bạn nói:</p>
                  <p className="text-sm text-gray-900">{transcript}</p>
                </div>
              )}
              {response && (
                <div>
                  <p className="text-xs text-purple-600 mb-1">AI trả lời:</p>
                  <p className="text-sm text-gray-900">{response}</p>
                </div>
              )}
              {!transcript && !response && (
                <p className="text-sm text-gray-500 text-center">
                  Nhấn mic để nói: "Tóm tắt slide môn Toán"
                </p>
              )}
            </div>

            <Button
              onClick={startListening}
              disabled={isListening || isSpeaking}
              className={`w-full ${
                isListening
                  ? "bg-red-500 hover:bg-red-600"
                  : isSpeaking
                  ? "bg-blue-500 hover:bg-blue-600"
                  : "bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
              }`}
            >
              {isListening ? (
                <>
                  <MicOff className="mr-2 w-4 h-4 animate-pulse" />
                  Đang nghe...
                </>
              ) : isSpeaking ? (
                <>
                  <Volume2 className="mr-2 w-4 h-4 animate-pulse" />
                  Đang nói...
                </>
              ) : (
                <>
                  <Mic className="mr-2 w-4 h-4" />
                  Bắt đầu nói
                </>
              )}
            </Button>

            <p className="text-xs text-gray-500 text-center mt-2">
              Thử: "Tóm tắt slide Toán", "Lịch học hôm nay"
            </p>
          </Card>
        </motion.div>
      )}

      {/* Floating Button when hidden */}
      {!isVisible && (
        <motion.button
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 1, scale: 1 }}
          onClick={() => setIsVisible(true)}
          className="fixed bottom-6 right-6 w-14 h-14 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full shadow-lg flex items-center justify-center hover:scale-110 transition-transform z-50"
        >
          <Mic className="w-6 h-6 text-white" />
        </motion.button>
      )}
    </AnimatePresence>
  );
}
