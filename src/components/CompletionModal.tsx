import React from 'react';
import { Sparkles, CheckCircle2, ArrowRight } from 'lucide-react';

interface CompletionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onViewHistory: () => void;
}

export const CompletionModal: React.FC<CompletionModalProps> = ({
  isOpen,
  onClose,
  onViewHistory,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-xl flex items-center justify-center p-4 animate-fade-in">
      <div className="bg-zinc-950 border border-zinc-800 rounded-3xl max-w-sm w-full p-6 text-center space-y-4 shadow-[0_20px_50px_rgba(0,0,0,0.9)] ring-1 ring-emerald-500/20">
        <div className="w-14 h-14 rounded-3xl bg-emerald-500/20 border border-emerald-500/50 flex items-center justify-center text-emerald-400 mx-auto">
          <Sparkles className="w-7 h-7" />
        </div>

        <div className="space-y-1">
          <h3 className="text-xl font-black text-white tracking-tight">
            Focus Session Completed!
          </h3>
          <p className="text-xs text-zinc-400">
            Great job! Your study session has been recorded to your history and daily stats.
          </p>
        </div>

        <div className="pt-2 flex flex-col gap-2">
          <button
            onClick={onClose}
            className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs rounded-xl shadow-lg shadow-emerald-500/20 transition active:scale-95"
          >
            Continue Studying
          </button>
          <button
            onClick={() => {
              onClose();
              onViewHistory();
            }}
            className="w-full py-2.5 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-300 hover:text-white font-bold text-xs rounded-xl transition flex items-center justify-center gap-1.5"
          >
            <span>View in History</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
