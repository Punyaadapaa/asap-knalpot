import React from 'react';
import { Info, Lock } from 'lucide-react';

interface MapLegendProps {
    activeLayer: 'gejala' | 'aqi' | 'rth';
}

export const MapLegend: React.FC<MapLegendProps> = ({ activeLayer }) => {
    return (
        <div className="bg-white/95 backdrop-blur-xs rounded-2xl p-3 border border-slate-200/90 shadow-xs text-xs space-y-2">
            <div className="font-bold text-slate-700 flex items-center justify-between">
                <span>Legenda: {activeLayer === 'gejala' ? 'Laporan Gejala' : activeLayer === 'aqi' ? 'Kualitas Udara (AQI)' : 'Ruang Terbuka Hijau'}</span>
                <span className="text-3xs text-slate-400 font-normal">Tingkat Kecamatan</span>
            </div>

            {activeLayer === 'gejala' && (
                <div className="space-y-1.5 pt-1">
                    <div className="flex items-center space-x-2">
                        <span className="w-3 h-3 rounded-full bg-green-600 flex-shrink-0" />
                        <span className="text-slate-700 font-medium">Zona hijau</span>
                        <span className="text-slate-400 text-2xs">— laporan stabil</span>
                    </div>
                    <div className="flex items-center space-x-2">
                        <span className="w-3 h-3 rounded-full bg-red-600 flex-shrink-0 animate-pulse" />
                        <span className="text-slate-700 font-medium">Zona merah</span>
                        <span className="text-slate-400 text-2xs">— laporan naik</span>
                    </div>
                    <div className="flex items-center space-x-2">
                        <span className="w-3 h-3 rounded-full border-2 border-slate-400 bg-slate-100 flex-shrink-0 flex items-center justify-center">
                            <span className="w-1 h-1 rounded-full bg-slate-400" />
                        </span>
                        <span className="text-slate-700 font-medium flex items-center space-x-1">
                            <span>Belum cukup data</span>
                            <Lock size={10} className="text-slate-500" />
                        </span>
                        <span className="text-slate-400 text-2xs">— &lt; 3 laporan</span>
                    </div>
                    <p className="text-3xs text-slate-500 pt-1 italic border-t border-slate-100">
                        *Warna menunjukkan tren laporan warga, bukan diagnosis medis.
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

            {activeLayer === 'rth' && (
                <div className="space-y-1.5 pt-1">
                    <div className="flex items-center space-x-2">
                        <span className="w-3 h-3 rounded-full bg-emerald-600 flex-shrink-0" />
                        <span className="text-slate-700 font-medium">Tinggi (≥ 20%)</span>
                        <span className="text-slate-400 text-2xs">— Daya serap polusi optimal</span>
                    </div>
                    <div className="flex items-center space-x-2">
                        <span className="w-3 h-3 rounded-full bg-teal-500 flex-shrink-0" />
                        <span className="text-slate-700 font-medium">Sedang (15–19.9%)</span>
                    </div>
                    <div className="flex items-center space-x-2">
                        <span className="w-3 h-3 rounded-full bg-amber-400 flex-shrink-0" />
                        <span className="text-slate-700 font-medium">Rendah (&lt; 15%)</span>
                        <span className="text-slate-400 text-2xs">— Minim vegetasi pelindung</span>
                    </div>
                </div>
            )}
        </div>
    );
};
