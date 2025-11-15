import { useState } from 'react';
import { Sparkles, Upload } from 'lucide-react';

interface TimetableImporterProps {
  timetableData: any[];
  setTimetableData: (data: any[]) => void;
}

export function TimetableImporter({ timetableData, setTimetableData }: TimetableImporterProps) {
  const [rawText, setRawText] = useState('');
  const [isImporting, setIsImporting] = useState(false);
  const [error, setError] = useState('');
  const [preview, setPreview] = useState<any[]>([]);
  const [showPreview, setShowPreview] = useState(false);

  const handleImport = async () => {
    setIsImporting(true);
    setError('');
    setShowPreview(false);

    try {
      const { parseTimetableWithAI } = await import('../../utils/aiScheduler');
      const result = await parseTimetableWithAI(rawText);
      setPreview(result);
      setShowPreview(true);
    } catch (err: any) {
      setError(err.message || 'Không thể phân tích. Vui lòng kiểm tra lại định dạng.');
    } finally {
      setIsImporting(false);
    }
  };

  const handleApply = () => {
    const importedSlots = preview.map(slot => ({ ...slot, isImported: true }));
    setTimetableData(importedSlots);
    setShowPreview(false);
    setRawText('');
  };

  return (
    <div className="space-y-4">
      <textarea
        placeholder="Paste your timetable here...
Example:
Monday 9:00-11:00 Math - Room 101
Tuesday 14:00-16:00 Physics - Lab A
..."
        value={rawText}
        onChange={(e) => {
          setRawText(e.target.value);
          setError('');
        }}
        className="w-full h-32 p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm font-mono"
      />

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {showPreview && preview.length > 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm font-semibold text-blue-900">
              ✅ Found {preview.length} classes
            </span>
          </div>
          <div className="space-y-2 max-h-40 overflow-y-auto">
            {preview.slice(0, 3).map((slot, idx) => (
              <div key={idx} className="bg-white rounded p-2 text-xs">
                <span className="font-semibold">{slot.day}</span> • {slot.startTime}-{slot.endTime} • {slot.title}
              </div>
            ))}
            {preview.length > 3 && (
              <p className="text-xs text-blue-600 text-center">+ {preview.length - 3} more...</p>
            )}
          </div>
          <div className="flex gap-2">
            <button
              onClick={handleApply}
              className="flex-1 py-2 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-lg transition-colors text-sm"
            >
              ✓ Apply
            </button>
            <button
              onClick={() => setShowPreview(false)}
              className="flex-1 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 font-semibold rounded-lg transition-colors text-sm"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      <button
        onClick={handleImport}
        disabled={!rawText.trim() || isImporting || showPreview}
        className="w-full py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 disabled:from-slate-300 disabled:to-slate-400 text-white font-semibold rounded-lg transition-all flex items-center justify-center gap-2"
      >
        {isImporting ? (
          <>
            <Sparkles className="w-4 h-4 animate-spin" />
            AI is analyzing...
          </>
        ) : (
          <>
            <Upload className="w-4 h-4" />
            Import with AI
          </>
        )}
      </button>

      {timetableData.length > 0 && (
        <div className="text-center text-sm text-green-600 font-medium">
          ✓ {timetableData.length} classes imported
        </div>
      )}
    </div>
  );
}
