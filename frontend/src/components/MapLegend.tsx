import React from 'react';
import { Info, Lock } from 'lucide-react';

interface MapLegendProps {
    activeLayer: 'gejala' | 'aqi';
}

export const MapLegend: React.FC<MapLegendProps> = ({ activeLayer }) => {
    return (
        <div className="bg-white/95 backdrop-blur-xs rounded-2xl p-3 border border-slate-200/90 shadow-xs text-xs space-y-2">
            <div className="font-bold text-slate-700 flex items-center justify-between gap-2">
                <span className="min-w-0">Legenda: {activeLayer === 'gejala' ? 'Laporan Gejala' : 'Kualitas Udara (AQI)'}</span>
                <span className="text-[10px] text-slate-400 font-normal whitespace-nowrap shrink-0">Tingkat Kecamatan</span>
            </div>

            {activeLayer === 'gejala' && (
                <div className="space-y-1.5 pt-1">
                    <div className="flex items-center space-x-2">
                        <span className="w-3 h-3 rounded-full bg-emerald-500 flex-shrink-0" />
                        <span className="text-slate-700 font-medium">Normal</span>
                        <span className="text-slate-400 text-[11px]">— Laporan relatif stabil</span>
                    </div>
                    <div className="flex items-center space-x-2">
                        <span className="w-3 h-3 rounded-full bg-amber-500 flex-shrink-0 animate-pulse" />
                        <span className="text-slate-700 font-medium">Laporan Meningkat</span>
                        <span className="text-slate-400 text-[11px]">— Kenaikan tren laporan</span>
                    </div>
                    <div className="flex items-center space-x-2">
                        <span className="w-3 h-3 rounded-full border-2 border-slate-400 bg-slate-100 flex-shrink-0 flex items-center justify-center">
                            <span className="w-1 h-1 rounded-full bg-slate-400" />
                        </span>
                        <span className="text-slate-700 font-medium flex items-center space-x-1">
                            <span>Data Belum Cukup</span>
                            <Lock size={10} className="text-slate-500" />
                        </span>
                        <span className="text-slate-400 text-[11px]">— &lt; 3 laporan (privasi)</span>
                    </div>
                    <p className="text-[10px] text-slate-500 pt-1 italic border-t border-slate-100">
                        *Warna menunjukkan tren laporan warga, bukan penegakan diagnosis medis.
                    </p>
                </div>
            )}

            {activeLayer === 'aqi' && (
                <div className="grid grid-cols-2 gap-1.5 pt-1">
                    <div className="flex items-center space-x-1.5">
                        <span className="w-3 h-3 rounded-full bg-emerald-500 flex-shrink-0" />
                        <span className="text-slate-700">Baik (0–50)</span>
                    </div>
                    <div className="flex items-center space-x-1.5">
                        <span className="w-3 h-3 rounded-full bg-amber-500 flex-shrink-0" />
                        <span className="text-slate-700">Sedang (51–100)</span>
                    </div>
                    <div className="flex items-center space-x-1.5">
                        <span className="w-3 h-3 rounded-full bg-orange-500 flex-shrink-0" />
                        <span className="text-slate-700">Tidak Sehat (101–199)</span>
                    </div>
                    <div className="flex items-center space-x-1.5">
                        <span className="w-3 h-3 rounded-full bg-purple-600 flex-shrink-0" />
                        <span className="text-slate-700">Sgt Tdk Sehat (200+)</span>
                    </div>
                </div>
            )}

        </div>
    );
};
