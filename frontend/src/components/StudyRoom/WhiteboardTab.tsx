import { Tldraw } from "tldraw";
import "tldraw/tldraw.css";
import { Card } from "../ui/card";
import { Button } from "../ui/button";
import { Download, RotateCcw, RotateCw } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

interface WhiteboardTabProps {
  roomId: string;
}

export function WhiteboardTab({ roomId }: WhiteboardTabProps) {
  const [editor, setEditor] = useState<any>(null);

  const handleExport = () => {
    if (editor) {
      // Export as image
      const svg = editor.getSvg();
      if (svg) {
        const svgData = new XMLSerializer().serializeToString(svg);
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");
        const img = new Image();
        
        img.onload = () => {
          canvas.width = img.width;
          canvas.height = img.height;
          ctx?.drawImage(img, 0, 0);
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
        };
        img.src = "data:image/svg+xml;base64," + btoa(svgData);
      }
    }
  };

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <Card className="p-3 bg-white">
        <div className="flex items-center justify-between">
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
              onClick={() => editor?.undo()}
              title="Undo"
            >
              <RotateCcw className="w-4 h-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => editor?.redo()}
              title="Redo"
            >
              <RotateCw className="w-4 h-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleExport}
            >
              <Download className="w-4 h-4 mr-2" />
              Export Image
            </Button>
          </div>
        </div>
      </Card>

      {/* Whiteboard */}
      <Card className="p-0 overflow-hidden border-2 border-gray-200">
        <div className="w-full h-[600px] bg-white">
          <Tldraw 
            persistenceKey={`whiteboard-${roomId}`}
            onMount={(editor) => setEditor(editor)}
          />
        </div>
      </Card>

      {/* Info */}
      <Card className="p-4 bg-purple-50 border-purple-200">
        <div className="flex items-start gap-2 text-purple-800">
          <div className="text-sm">
            <p className="font-semibold mb-1">✏️ Tính năng Whiteboard:</p>
            <ul className="list-disc list-inside space-y-1 text-xs">
              <li>Vẽ shapes, arrows, text với nhiều màu sắc</li>
              <li>Real-time collaboration - nhiều người vẽ cùng lúc</li>
              <li>Undo/Redo để sửa lỗi</li>
              <li>Export as image để lưu lại</li>
            </ul>
          </div>
        </div>
      </Card>
    </div>
  );
}

