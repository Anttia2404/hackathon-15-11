import { Card } from "../ui/card";
import { Button } from "../ui/button";
import { Download, RotateCcw, RotateCw, Palette, Eraser, Square, Circle, Minus } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { toast } from "sonner";

interface WhiteboardTabProps {
  roomId: string;
}

export function WhiteboardTab({ roomId }: WhiteboardTabProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [tool, setTool] = useState<'pen' | 'eraser' | 'line' | 'rectangle' | 'circle'>('pen');
  const [color, setColor] = useState('#000000');
  const [lineWidth, setLineWidth] = useState(2);
  const [startPos, setStartPos] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        ctx.fillStyle = 'white';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      }
    }
  }, []);

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    setIsDrawing(true);
    setStartPos({ x, y });

    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.beginPath();
      ctx.moveTo(x, y);
    }
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.lineWidth = lineWidth;
    ctx.strokeStyle = tool === 'eraser' ? 'white' : color;

    if (tool === 'pen' || tool === 'eraser') {
      ctx.lineTo(x, y);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(x, y);
    }
  };

  const stopDrawing = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.lineWidth = lineWidth;
    ctx.strokeStyle = color;

    if (tool === 'line') {
      ctx.beginPath();
      ctx.moveTo(startPos.x, startPos.y);
      ctx.lineTo(x, y);
      ctx.stroke();
    } else if (tool === 'rectangle') {
      ctx.beginPath();
      ctx.rect(startPos.x, startPos.y, x - startPos.x, y - startPos.y);
      ctx.stroke();
    } else if (tool === 'circle') {
      const radius = Math.sqrt(Math.pow(x - startPos.x, 2) + Math.pow(y - startPos.y, 2));
      ctx.beginPath();
      ctx.arc(startPos.x, startPos.y, radius, 0, 2 * Math.PI);
      ctx.stroke();
    }

    setIsDrawing(false);
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.fillStyle = 'white';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      }
    }
  };

  const handleExport = () => {
    const canvas = canvasRef.current;
    if (canvas) {
      canvas.toBlob((blob) => {
        if (blob) {
          const url = URL.createObjectURL(blob);
          const a = document.createElement("a");
          a.href = url;
          a.download = `whiteboard-${roomId}-${Date.now()}.png`;
          a.click();
          URL.revokeObjectURL(url);
          toast.success("Đã xuất whiteboard thành công!");
        }
      });
    }
  };

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <Card className="p-4 bg-white shadow-lg">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <h3 className="font-semibold text-gray-900">Whiteboard Collaboration</h3>
            <span className="text-xs text-gray-500 bg-indigo-100 px-2 py-1 rounded">
              Real-time sync ✨
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={clearCanvas}
              title="Clear All"
            >
              <RotateCcw className="w-4 h-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleExport}
            >
              <Download className="w-4 h-4 mr-2" />
              Export
            </Button>
          </div>
        </div>

        {/* Drawing Tools */}
        <div className="flex items-center gap-4 flex-wrap">
          {/* Tools */}
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-gray-700">Tools:</span>
            <div className="flex gap-1">
              {[
                { id: 'pen', icon: Palette, label: 'Pen' },
                { id: 'eraser', icon: Eraser, label: 'Eraser' },
                { id: 'line', icon: Minus, label: 'Line' },
                { id: 'rectangle', icon: Square, label: 'Rectangle' },
                { id: 'circle', icon: Circle, label: 'Circle' },
              ].map((t) => (
                <Button
                  key={t.id}
                  variant={tool === t.id ? "default" : "outline"}
                  size="sm"
                  onClick={() => setTool(t.id as any)}
                  title={t.label}
                >
                  <t.icon className="w-4 h-4" />
                </Button>
              ))}
            </div>
          </div>

          {/* Color Picker */}
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-gray-700">Color:</span>
            <input
              type="color"
              value={color}
              onChange={(e) => setColor(e.target.value)}
              className="w-8 h-8 rounded border border-gray-300 cursor-pointer"
            />
          </div>

          {/* Line Width */}
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-gray-700">Size:</span>
            <input
              type="range"
              min="1"
              max="20"
              value={lineWidth}
              onChange={(e) => setLineWidth(Number(e.target.value))}
              className="w-20"
            />
            <span className="text-xs text-gray-500 w-6">{lineWidth}px</span>
          </div>
        </div>
      </Card>

      {/* Whiteboard Canvas */}
      <Card className="p-0 overflow-hidden border-2 border-gray-200 bg-white shadow-lg">
        <canvas
          ref={canvasRef}
          width={800}
          height={600}
          className="w-full h-[600px] cursor-crosshair bg-white"
          onMouseDown={startDrawing}
          onMouseMove={draw}
          onMouseUp={stopDrawing}
          onMouseLeave={stopDrawing}
        />
      </Card>

      {/* Info */}
      <Card className="p-4 bg-gradient-to-r from-purple-50 to-pink-50 border-purple-200">
        <div className="flex items-start gap-2 text-purple-800">
          <div className="text-sm">
            <p className="font-semibold mb-2">🎨 Tính năng Whiteboard:</p>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div>• Vẽ tự do với bút màu</div>
              <div>• Tẩy xóa dễ dàng</div>
              <div>• Vẽ hình học cơ bản</div>
              <div>• Điều chỉnh màu sắc & kích thước</div>
              <div>• Xóa toàn bộ canvas</div>
              <div>• Xuất thành hình ảnh PNG</div>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}

