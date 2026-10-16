import React from 'react';
import { Check } from 'lucide-react';
import { SymptomItem } from '../types';

interface SymptomCardProps {
    symptom: SymptomItem;
    selected: boolean;
    onToggle: (id: string) => void;
}

export const SymptomCard: React.FC<SymptomCardProps> = ({
    symptom,
    selected,
    onToggle,
}) => {
    return (
        <button
            type="button"
            onClick={() => onToggle(symptom.id)}
            className={`w-full flex items-center justify-between p-3.5 rounded-2xl border text-left transition-all duration-200 cursor-pointer select-none ${
                selected
                    ? 'bg-teal-50/90 border-teal-600 shadow-xs ring-1 ring-teal-600'
                    : 'bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50/60 shadow-xs'
            }`}
        >
            <div>
                <span className={`text-sm font-bold block ${selected ? 'text-teal-950' : 'text-slate-800'}`}>
                    {symptom.nama}
                </span>
                {symptom.is_emergency && (
                    <span className="text-[10px] font-semibold text-rose-600 uppercase tracking-wider block">
                        Prioritas Medis
                    </span>
                )}
            </div>

            <div
                className={`w-5 h-5 rounded-lg flex items-center justify-center transition-colors ${
                    selected
                        ? 'bg-teal-600 text-white'
                        : 'border border-slate-300 bg-slate-50'
                }`}
            >
                {selected && <Check size={14} strokeWidth={3} />}
            </div>
        </button>
    );
};
