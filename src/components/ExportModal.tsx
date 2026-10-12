import React, { useRef } from 'react';
import { Download, Upload, X, FileSpreadsheet, RotateCcw } from 'lucide-react';
import { StudySession } from '../types';
import { getInitialSessions } from '../utils/storage';

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  sessions: StudySession[];
  onImportSessions: (sessions: StudySession[]) => void;
}

export const ExportModal: React.FC<ExportModalProps> = ({
  isOpen,
  onClose,
  sessions,
  onImportSessions,
}) => {
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  if (!isOpen) return null;

  const handleExportJSON = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(sessions, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `al_study_tracker_backup_${new Date().toISOString().split('T')[0]}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const handleExportCSV = () => {
    const headers = ['Date', 'Subject', 'Topic', 'Duration (Minutes)', 'Hours', 'Time Range'];
    const rows = sessions.map(s => [
      `"${s.date}"`,
      `"${s.subject}"`,
      `"${(s.topic || '').replace(/"/g, '""')}"`,
      s.minutes,
      (s.minutes / 60).toFixed(2),
      `"${s.timeRange || ''}"`
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `al_study_sessions_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    link.remove();
  };

  const handleImportFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = event => {
      try {
        const text = event.target?.result as string;
        const parsed = JSON.parse(text);
        if (Array.isArray(parsed)) {
          onImportSessions(parsed);
          alert(`Successfully imported ${parsed.length} sessions!`);
          onClose();
        } else {
          alert('Invalid file format: JSON array expected.');
        }
      } catch (err) {
        alert('Failed to parse JSON file.');
      }
    };
    reader.readAsText(file);
  };

  const handleResetSampleData = () => {
    if (window.confirm('Reset study logs to initial sample data?')) {
      onImportSessions(getInitialSessions());
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-zinc-950 border border-zinc-800 rounded-3xl max-w-sm w-full p-4 sm:p-6 shadow-2xl relative space-y-4 my-auto max-h-[92vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-zinc-400 hover:text-white p-1 rounded-lg"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-blue-500/20 border border-blue-500/40 flex items-center justify-center text-blue-400">
            <FileSpreadsheet className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-extrabold text-white">Data & Backup</h3>
            <p className="text-xs text-zinc-400">Export or restore your study records</p>
          </div>
        </div>

        <div className="space-y-2 pt-2">
          <button
            onClick={handleExportCSV}
            className="w-full py-2.5 px-4 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-white rounded-xl text-xs font-bold transition flex items-center justify-between"
          >
            <span className="flex items-center gap-2">
              <Download className="w-4 h-4 text-emerald-400" /> Export as CSV (Spreadsheet)
            </span>
            <span className="text-[10px] text-zinc-500 font-mono">.csv</span>
          </button>

          <button
            onClick={handleExportJSON}
            className="w-full py-2.5 px-4 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-white rounded-xl text-xs font-bold transition flex items-center justify-between"
          >
            <span className="flex items-center gap-2">
              <Download className="w-4 h-4 text-blue-400" /> Export JSON Backup
            </span>
            <span className="text-[10px] text-zinc-500 font-mono">.json</span>
          </button>

          <button
            onClick={() => fileInputRef.current?.click()}
            className="w-full py-2.5 px-4 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-white rounded-xl text-xs font-bold transition flex items-center justify-between"
          >
            <span className="flex items-center gap-2">
              <Upload className="w-4 h-4 text-amber-400" /> Import JSON Backup
            </span>
            <span className="text-[10px] text-zinc-500">Restore</span>
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept=".json"
            onChange={handleImportFile}
            className="hidden"
          />

          <button
            onClick={handleResetSampleData}
            className="w-full py-2.5 px-4 bg-zinc-950 hover:bg-zinc-900 border border-zinc-800/80 text-zinc-400 hover:text-zinc-200 rounded-xl text-xs font-semibold transition flex items-center justify-between"
          >
            <span className="flex items-center gap-2">
              <RotateCcw className="w-3.5 h-3.5" /> Restore Default Sample Data
            </span>
          </button>
        </div>
      </div>
    </div>
  );
};
