import { useState, useRef, useEffect } from "react";
import Editor from "@monaco-editor/react";
import { Play, FileCode, X, Save } from "lucide-react";
import { Button } from "../ui/button";
import { Card } from "../ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { toast } from "sonner";

interface CodeFile {
  id: string;
  name: string;
  language: string;
  code: string;
}

interface CodeEditorTabProps {
  roomId: string;
}

const defaultCode = {
  python: `# Python Example
def hello_world():
    print("Hello, World!")
    return "Study together! 🚀"

result = hello_world()
print(result)
`,
  javascript: `// JavaScript Example
function helloWorld() {
    console.log("Hello, World!");
    return "Study together! 🚀";
}

const result = helloWorld();
console.log(result);
`,
  java: `// Java Example
public class HelloWorld {
    public static void main(String[] args) {
        System.out.println("Hello, World!");
        System.out.println("Study together! 🚀");
    }
}
`,
  cpp: `// C++ Example
#include <iostream>
using namespace std;

int main() {
    cout << "Hello, World!" << endl;
    cout << "Study together! 🚀" << endl;
    return 0;
}
`,
};

export function CodeEditorTab({ roomId }: CodeEditorTabProps) {
  const [files, setFiles] = useState<CodeFile[]>([
    {
      id: "1",
      name: "main.py",
      language: "python",
      code: defaultCode.python,
    },
  ]);
  const [activeFileId, setActiveFileId] = useState("1");
  const [output, setOutput] = useState("");
  const [isRunning, setIsRunning] = useState(false);

  const activeFile = files.find((f) => f.id === activeFileId);

  const handleCodeChange = (value: string | undefined) => {
    if (!value) return;
    setFiles((prev) =>
      prev.map((file) =>
        file.id === activeFileId ? { ...file, code: value } : file
      )
    );
  };

  const addFile = (language: string) => {
    const extensions: Record<string, string> = {
      python: "py",
      javascript: "js",
      java: "java",
      cpp: "cpp",
    };
    const ext = extensions[language] || "txt";
    const newFile: CodeFile = {
      id: Date.now().toString(),
      name: `file${files.length + 1}.${ext}`,
      language,
      code: defaultCode[language as keyof typeof defaultCode] || "",
    };
    setFiles((prev) => [...prev, newFile]);
    setActiveFileId(newFile.id);
  };

  const removeFile = (id: string) => {
    if (files.length === 1) {
      toast.error("Không thể xóa file cuối cùng!");
      return;
    }
    setFiles((prev) => prev.filter((f) => f.id !== id));
    if (activeFileId === id) {
      setActiveFileId(files[0]?.id || "");
    }
  };

  const runCode = async () => {
    if (!activeFile) return;

    setIsRunning(true);
    setOutput("Đang chạy code...\n");

    // Simulate code execution (in production, use Judge0 API or backend)
    setTimeout(() => {
      const mockOutputs: Record<string, string> = {
        python: "Hello, World!\nStudy together! 🚀\n",
        javascript: "Hello, World!\nStudy together! 🚀\n",
        java: "Hello, World!\nStudy together! 🚀\n",
        cpp: "Hello, World!\nStudy together! 🚀\n",
      };

      setOutput(mockOutputs[activeFile.language] || "Code executed successfully!");
      setIsRunning(false);
      toast.success("Code đã chạy thành công!");
    }, 1000);
  };

  return (
    <div className="space-y-4">
      {/* File Tabs */}
      <Card className="p-2">
        <div className="flex items-center gap-2 overflow-x-auto">
          {files.map((file) => (
            <div
              key={file.id}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg cursor-pointer transition-colors ${
                activeFileId === file.id
                  ? "bg-indigo-100 text-indigo-700"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
              onClick={() => setActiveFileId(file.id)}
            >
              <FileCode className="w-4 h-4" />
              <span className="text-sm font-medium">{file.name}</span>
              {files.length > 1 && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    removeFile(file.id);
                  }}
                  className="ml-1 hover:text-red-600"
                >
                  <X className="w-3 h-3" />
                </button>
              )}
            </div>
          ))}
          <div className="flex items-center gap-2 ml-auto">
            <Button
              variant="outline"
              size="sm"
              onClick={() => addFile("python")}
            >
              + Python
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => addFile("javascript")}
            >
              + JS
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => addFile("java")}
            >
              + Java
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => addFile("cpp")}
            >
              + C++
            </Button>
          </div>
        </div>
      </Card>

      {/* Editor and Output */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Code Editor */}
        <Card className="p-0 overflow-hidden">
          <div className="h-[500px] border-b">
            <Editor
              height="100%"
              language={activeFile?.language || "python"}
              value={activeFile?.code || ""}
              onChange={handleCodeChange}
              theme="vs-dark"
              options={{
                minimap: { enabled: true },
                fontSize: 14,
                wordWrap: "on",
                automaticLayout: true,
              }}
            />
          </div>
          <div className="p-3 bg-gray-900 flex items-center justify-between">
            <div className="text-sm text-gray-400">
              {activeFile?.name} • {activeFile?.language}
            </div>
            <div className="flex gap-2">
              <Button
                size="sm"
                variant="outline"
                className="bg-gray-800 text-white border-gray-700"
              >
                <Save className="w-4 h-4 mr-1" />
                Save
              </Button>
              <Button
                size="sm"
                onClick={runCode}
                disabled={isRunning}
                className="bg-gradient-to-r from-green-600 to-emerald-600"
              >
                <Play className="w-4 h-4 mr-1" />
                {isRunning ? "Running..." : "Run Code"}
              </Button>
            </div>
          </div>
        </Card>

        {/* Output */}
        <Card className="p-4">
          <div className="flex items-center gap-2 mb-3">
            <h3 className="font-semibold text-gray-900">Output</h3>
          </div>
          <div className="bg-gray-900 text-green-400 p-4 rounded-lg font-mono text-sm h-[500px] overflow-auto">
            <pre className="whitespace-pre-wrap">{output || "Output sẽ hiển thị ở đây..."}</pre>
          </div>
        </Card>
      </div>

      {/* Info */}
      <Card className="p-4 bg-green-50 border-green-200">
        <div className="text-sm text-green-800">
          <p className="font-semibold mb-2">💻 Tính năng Code Editor:</p>
          <ul className="list-disc list-inside space-y-1 text-xs">
            <li>Syntax highlighting cho Python, JavaScript, Java, C++</li>
            <li>Real-time collaboration - nhiều người code cùng lúc</li>
            <li>Multiple tabs (files) để quản lý nhiều file</li>
            <li>Run code button để test code ngay</li>
            <li>Auto-save và sync với nhóm</li>
          </ul>
        </div>
      </Card>
    </div>
  );
}

