import React, { useState } from 'react';
import { Target, X, Check } from 'lucide-react';

interface GoalModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentGoalMinutes: number;
  onSaveGoal: (minutes: number) => void;
}

export const GoalModal: React.FC<GoalModalProps> = ({
  isOpen,
  onClose,
  currentGoalMinutes,
  onSaveGoal,
}) => {
  const [selectedHours, setSelectedHours] = useState<number>(currentGoalMinutes / 60);

  if (!isOpen) return null;

  const PRESETS = [4, 5, 6, 7, 8, 10, 12];

  const handleSave = () => {
    onSaveGoal(selectedHours * 60);
    onClose();
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
          <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
            <Target className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-extrabold text-white">Daily Focus Target</h3>
            <p className="text-xs text-zinc-400">Set your revision goal per day</p>
          </div>
        </div>

        <div className="space-y-3">
          <div className="text-center py-3 bg-black rounded-2xl border border-zinc-800">
            <span className="text-4xl font-black font-mono text-emerald-400 tabular-nums">
              {selectedHours} hrs
            </span>
            <p className="text-[11px] text-zinc-500 mt-0.5">({selectedHours * 60} minutes daily)</p>
          </div>

          <div className="grid grid-cols-4 gap-2">
            {PRESETS.map(h => {
              const isSelected = selectedHours === h;
              return (
                <button
                  key={h}
                  onClick={() => setSelectedHours(h)}
                  className={`py-2 rounded-xl text-xs font-bold font-mono transition border ${
                    isSelected
                      ? 'bg-emerald-600 text-white border-emerald-500'
                      : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-white'
                  }`}
                >
                  {h}h
                </button>
              );
            })}
          </div>

          <div className="pt-2">
            <button
              onClick={handleSave}
              className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs rounded-xl shadow-lg transition flex items-center justify-center gap-2 active:scale-95"
            >
              <Check className="w-4 h-4" />
              <span>Update Daily Goal</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
