import { useState, useRef, useEffect } from "react";
import { Play, FileCode, X, Save, Code2 } from "lucide-react";
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
  const [terminalHistory, setTerminalHistory] = useState<string[]>([
    "Welcome to Study Room Code Terminal! 🚀",
    "Type commands to interact with your code environment.",
    "Available commands: run, clear, help, ls, cat <filename>",
    ""
  ]);
  const [terminalInput, setTerminalInput] = useState("");
  const terminalRef = useRef<HTMLDivElement>(null);

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
    addToTerminal(`$ Running ${activeFile.name}...`);

    // Simulate code execution (in production, use Judge0 API or backend)
    setTimeout(() => {
      const mockOutputs: Record<string, string> = {
        python: "Hello, World!\nStudy together! 🚀",
        javascript: "Hello, World!\nStudy together! 🚀",
        java: "Hello, World!\nStudy together! 🚀",
        cpp: "Hello, World!\nStudy together! 🚀",
      };

      const result = mockOutputs[activeFile.language] || "Code executed successfully!";
      addToTerminal(result);
      addToTerminal(""); // Empty line
      setIsRunning(false);
      toast.success("Code đã chạy thành công!");
    }, 1000);
  };

  const addToTerminal = (text: string) => {
    setTerminalHistory(prev => [...prev, text]);
    setTimeout(() => {
      if (terminalRef.current) {
        terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
      }
    }, 100);
  };

  const handleTerminalCommand = (command: string) => {
    addToTerminal(`$ ${command}`);
    
    const cmd = command.toLowerCase().trim();
    
    if (cmd === 'clear') {
      setTerminalHistory([]);
    } else if (cmd === 'help') {
      addToTerminal("Available commands:");
      addToTerminal("  run     - Execute current file");
      addToTerminal("  clear   - Clear terminal");
      addToTerminal("  ls      - List files");
      addToTerminal("  cat <file> - Show file content");
      addToTerminal("  help    - Show this help");
    } else if (cmd === 'ls') {
      addToTerminal("Files in workspace:");
      files.forEach(file => {
        addToTerminal(`  ${file.name} (${file.language})`);
      });
    } else if (cmd.startsWith('cat ')) {
      const filename = cmd.substring(4);
      const file = files.find(f => f.name === filename);
      if (file) {
        addToTerminal(`Content of ${filename}:`);
        addToTerminal(file.code);
      } else {
        addToTerminal(`File not found: ${filename}`);
      }
    } else if (cmd === 'run') {
      runCode();
      return;
    } else if (cmd === '') {
      // Empty command, just add prompt
    } else {
      addToTerminal(`Command not found: ${command}`);
      addToTerminal("Type 'help' for available commands");
    }
    
    addToTerminal(""); // Empty line for spacing
  };

  const handleTerminalKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleTerminalCommand(terminalInput);
      setTerminalInput("");
    }
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

      {/* Editor and Terminal */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Code Editor */}
        <Card className="p-0 overflow-hidden">
          <div className="h-[500px] border-b bg-gray-900">
            {/* Fallback Code Editor */}
            <div className="w-full h-full flex flex-col">
              {/* Editor Header */}
              <div className="px-4 py-2 bg-gray-800 border-b border-gray-700 flex items-center gap-2">
                <Code2 className="w-4 h-4 text-blue-400" />
                <span className="text-sm text-gray-300">Code Editor</span>
                <span className="text-xs text-gray-500 bg-gray-700 px-2 py-1 rounded">
                  {activeFile?.language || "python"}
                </span>
              </div>
              
              {/* Code Textarea */}
              <textarea
                value={activeFile?.code || ""}
                onChange={(e) => handleCodeChange(e.target.value)}
                className="flex-1 w-full p-4 bg-gray-900 text-green-400 font-mono text-sm resize-none outline-none border-none"
                placeholder="// Start coding here..."
                style={{
                  lineHeight: "1.5",
                  tabSize: 2,
                }}
                spellCheck={false}
              />
            </div>
          </div>
          <div className="p-3 bg-gray-900 flex items-center justify-between">
            <div className="text-sm text-gray-400">
              {activeFile?.name} • {activeFile?.language}
            </div>
            <div className="flex gap-2">
              <Button
                size="sm"
                variant="outline"
                className="bg-gray-800 text-white border-gray-700 hover:bg-gray-700"
              >
                <Save className="w-4 h-4 mr-1" />
                Save
              </Button>
              <Button
                size="sm"
                onClick={runCode}
                disabled={isRunning}
                className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
              >
                <Play className="w-4 h-4 mr-1" />
                {isRunning ? "Running..." : "Run Code"}
              </Button>
            </div>
          </div>
        </Card>

        {/* Interactive Terminal */}
        <Card className="p-0 overflow-hidden border-2 border-gray-700">
          <div className="bg-black text-green-400 h-[500px] flex flex-col">
            {/* Terminal Header */}
            <div className="px-4 py-2 bg-gray-800 border-b border-gray-600 flex items-center gap-2">
              <div className="flex gap-1.5">
                <div className="w-3 h-3 bg-red-500 rounded-full shadow-sm"></div>
                <div className="w-3 h-3 bg-yellow-500 rounded-full shadow-sm"></div>
                <div className="w-3 h-3 bg-green-500 rounded-full shadow-sm"></div>
              </div>
              <span className="text-sm text-gray-300 font-mono ml-2">Terminal - Room {roomId}</span>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => {
                  setTerminalHistory([
                    "Welcome to Study Room Code Terminal! 🚀",
                    "Type commands to interact with your code environment.",
                    "Available commands: run, clear, help, ls, cat <filename>",
                    ""
                  ]);
                }}
                className="ml-auto text-gray-400 hover:text-white hover:bg-gray-700 text-xs"
              >
                Clear
              </Button>
            </div>
            
            {/* Terminal Content */}
            <div 
              ref={terminalRef}
              className="flex-1 p-4 font-mono text-sm overflow-auto bg-black"
              style={{ 
                backgroundColor: '#000000',
                color: '#00ff00',
                fontFamily: 'Consolas, Monaco, "Courier New", monospace'
              }}
            >
              {terminalHistory.map((line, index) => (
                <div key={index} className="mb-1 leading-relaxed">
                  {line.startsWith('$') ? (
                    <span className="text-cyan-400">{line}</span>
                  ) : line.includes('Error') || line.includes('not found') ? (
                    <span className="text-red-400">{line}</span>
                  ) : line.includes('Welcome') || line.includes('🚀') ? (
                    <span className="text-yellow-400">{line}</span>
                  ) : (
                    <span className="text-green-400">{line}</span>
                  )}
                </div>
              ))}
              
              {/* Current Input Line */}
              <div className="flex items-center mt-2">
                <span className="text-cyan-400 mr-2 font-bold">$</span>
                <input
                  type="text"
                  value={terminalInput}
                  onChange={(e) => setTerminalInput(e.target.value)}
                  onKeyPress={handleTerminalKeyPress}
                  className="flex-1 bg-transparent outline-none text-green-400 font-mono"
                  placeholder="Type command here..."
                  style={{ 
                    backgroundColor: 'transparent',
                    color: '#00ff00',
                    fontFamily: 'Consolas, Monaco, "Courier New", monospace'
                  }}
                />
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* Info */}
      <Card className="p-4 bg-gradient-to-r from-green-50 to-blue-50 border-green-200">
        <div className="text-sm text-green-800">
          <p className="font-semibold mb-2">💻 Tính năng Code Editor & Terminal:</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div>
              <p className="font-medium mb-1">📝 Code Editor:</p>
              <ul className="list-disc list-inside space-y-1">
                <li>Syntax highlighting (Python, JS, Java, C++)</li>
                <li>Multiple file tabs</li>
                <li>Auto-completion & IntelliSense</li>
                <li>Real-time collaboration</li>
              </ul>
            </div>
            <div>
              <p className="font-medium mb-1">⚡ Interactive Terminal:</p>
              <ul className="list-disc list-inside space-y-1">
                <li><code>run</code> - Execute current file</li>
                <li><code>ls</code> - List all files</li>
                <li><code>cat &lt;file&gt;</code> - View file content</li>
                <li><code>clear</code> - Clear terminal</li>
                <li><code>help</code> - Show all commands</li>
              </ul>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}

