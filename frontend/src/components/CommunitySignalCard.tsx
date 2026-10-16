import React from 'react';
import { TrendingUp, TrendingDown, Minus, Lock, AlertCircle } from 'lucide-react';
import { LocationItem } from '../types';
import { PrivacyCard } from './PrivacyCard';

interface CommunitySignalCardProps {
    location: LocationItem;
    onViewDetail?: () => void;
}

export const CommunitySignalCard: React.FC<CommunitySignalCardProps> = ({ location, onViewDetail }) => {
    // If privacy hidden (< 3 reports), show privacy card
    if (location.privacy_hidden || location.status === 'data_belum_cukup') {
        return (
            <div className="space-y-2">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
                    Kondisi Wilayahmu
                </span>
                <PrivacyCard compact />
            </div>
        );
    }

    const isNaik = location.status === 'naik';
    const isNormal = location.status === 'normal';

    return (
        <div className="space-y-2">
            <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
                    Kondisi Wilayahmu
                </span>
                {onViewDetail && (
                    <button
                        onClick={onViewDetail}
                        className="text-xs text-teal-700 font-semibold hover:underline cursor-pointer"
                    >
                        Lihat Detail Wilayah →
                    </button>
                )}
            </div>

            <div
                onClick={onViewDetail}
                className={`p-4 rounded-2xl border transition-all cursor-pointer ${
                    isNaik
                        ? 'bg-amber-50/70 border-amber-200/90 hover:bg-amber-50'
                        : 'bg-emerald-50/70 border-emerald-200/90 hover:bg-emerald-50'
                } shadow-xs`}
            >
                <div className="flex items-start justify-between">
                    <div>
                        <div className="flex items-baseline space-x-1.5">
                            {isNaik ? (
                                <TrendingUp size={20} className="text-amber-600 font-bold self-center" />
                            ) : (
                                <Minus size={18} className="text-emerald-600 font-bold self-center" />
                            )}
                            <span className="text-2xl font-black text-slate-900">
                                {location.total_reports_7d}
                            </span>
                            <span className="text-sm font-semibold text-slate-700">laporan</span>
                        </div>
                        <p className="text-xs text-slate-500 mt-0.5">dalam 7 hari terakhir</p>
                    </div>

                    <span
                        className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold ${
                            isNaik
                                ? 'bg-amber-100 text-amber-900 border border-amber-200'
                                : 'bg-emerald-100 text-emerald-900 border border-emerald-200'
                        }`}
                    >
                        {isNaik ? '↑ NAIK' : 'NORMAL'}
                    </span>
                </div>

                <div className="mt-3 pt-2.5 border-t border-slate-200/60 flex items-center justify-between">
                    <p className="text-xs font-medium text-slate-700">
                        {isNaik
                            ? 'Kenaikan laporan gejala terdeteksi di wilayah ini'
                            : 'Laporan gejala pernapasan relatif stabil'}
                    </p>
                    {location.change_percent !== null && (
                        <span className={`text-xs font-bold ${isNaik ? 'text-amber-700' : 'text-emerald-700'}`}>
                            {location.change_percent > 0 ? `+${location.change_percent}%` : `${location.change_percent}%`}
                        </span>
                    )}
                </div>
            </div>
        </div>
    );
};
