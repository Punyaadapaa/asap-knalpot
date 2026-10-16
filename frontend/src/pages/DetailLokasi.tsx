import React, { useEffect, useState } from 'react';
import { ArrowLeft, TrendingUp, Minus, Wind, Trees, Lock, ShieldCheck, Calendar, Info } from 'lucide-react';
import { LocationItem } from '../types';
import { fetchLokasiTren } from '../api';
import { TrendChart } from '../components/TrendChart';
import { PrivacyCard } from '../components/PrivacyCard';
import { formatPersen } from '../format';

interface DetailLokasiProps {
    locationId: string;
    initialLocation?: LocationItem;
    onBack: () => void;
    onStartReport: (locationId: string) => void;
    isDesktop?: boolean;
}

export const DetailLokasi: React.FC<DetailLokasiProps> = ({
    locationId,
    initialLocation,
    onBack,
    onStartReport,
    isDesktop = false,
}) => {
    const [location, setLocation] = useState<LocationItem | null>(initialLocation || null);
    const [loading, setLoading] = useState<boolean>(!initialLocation);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        let isMounted = true;
        const loadTrend = async () => {
            try {
                setLoading(true);
                const data = await fetchLokasiTren(locationId);
                if (isMounted) setLocation(data);
            } catch (err: any) {
                if (isMounted) setError(err.message || 'Gagal memuat detail wilayah');
            } finally {
                if (isMounted) setLoading(false);
            }
        };

        loadTrend();
        return () => {
            isMounted = false;
        };
    }, [locationId]);

    if (loading) {
        return (
            <div className="space-y-4 py-4 animate-pulse">
                <div className="h-6 w-32 bg-slate-200 rounded-lg" />
                <div className="h-32 bg-slate-200 rounded-2xl" />
                <div className="h-44 bg-slate-200 rounded-2xl" />
                <div className="h-24 bg-slate-200 rounded-2xl" />
            </div>
        );
    }

    if (error || !location) {
        return (
            <div className="py-8 text-center space-y-3">
                <p className="text-sm text-slate-600">{error || 'Data wilayah tidak ditemukan'}</p>
                <button
                    onClick={onBack}
                    className="px-4 py-2 bg-slate-800 text-white rounded-xl text-xs font-semibold cursor-pointer"
                >
                    Kembali
                </button>
            </div>
        );
    }

    const isNaik = location.status === 'naik';

    return (
        <div className="space-y-4 pb-16 animate-in fade-in duration-150">
            {/* Header Toolbar */}
            <div className="flex items-center justify-between pt-1">
                <div className="flex items-center space-x-2">
                    <button
                        onClick={onBack}
                        className="p-1.5 rounded-xl hover:bg-slate-200 text-slate-600 transition-colors cursor-pointer flex items-center space-x-1"
                    >
                        <ArrowLeft size={18} />
                        <span className="text-xs font-semibold">Kembali</span>
                    </button>
                    <div>
                        <h1 className="text-xl font-black text-slate-900 leading-tight">
                            {location.nama}
                        </h1>
                        <p className="text-xs text-slate-500 font-medium">{location.kota}</p>
                    </div>
                </div>

                <span
                    className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold ${
                        isNaik
                            ? 'bg-amber-100 text-amber-900 border border-amber-200'
                            : 'bg-emerald-100 text-emerald-900 border border-emerald-200'
                    }`}
                >
                    {isNaik ? '↑ STATUS NAIK' : 'STATUS NORMAL'}
                </span>
            </div>

            {/* Desktop: 2 Columns | Mobile: Stack */}
            <div className={`grid grid-cols-1 ${isDesktop ? 'lg:grid-cols-12' : ''} gap-5 items-start`}>
                {/* Left (7 cols on desktop): Trend & Laporan */}
                <div className={`${isDesktop ? 'lg:col-span-7' : ''} space-y-4`}>
                    {/* Laporan Gejala & Grafik Tren */}
                    <div className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-xs space-y-4">
                        <div className="flex items-start justify-between">
                            <div>
                                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
                                    Sinyal Laporan Gejala
                                </span>
                                {location.privacy_hidden ? (
                                    <div className="mt-2">
                                        <PrivacyCard compact />
                                    </div>
                                ) : (
                                    <div className="mt-1">
                                        <div className="flex items-baseline space-x-2">
                                            <span className="text-3xl font-black text-slate-900">
                                                {location.total_reports_7d}
                                            </span>
                                            <span className="text-sm font-semibold text-slate-600">
                                                laporan / 7 hari terakhir
                                            </span>
                                        </div>
                                        {location.change_percent !== null && (
                                            <div className="flex items-center space-x-1 mt-1 text-xs font-bold">
                                                {isNaik ? (
                                                    <>
                                                        <TrendingUp size={15} className="text-amber-600" />
                                                        <span className="text-amber-700">
                                                            ↑ {location.change_percent}% dibanding periode lalu
                                                        </span>
                                                    </>
                                                ) : (
                                                    <>
                                                        <Minus size={15} className="text-emerald-600" />
                                                        <span className="text-emerald-700">
                                                            {location.change_percent}% (laporan relatif stabil)
                                                        </span>
                                                    </>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Grafik Tren */}
                        <div className="pt-2 border-t border-slate-100">
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-xs font-bold text-slate-700 flex items-center space-x-1.5">
                                    <Calendar size={14} className="text-teal-600" />
                                    <span>Grafik Tren Harian (7 Hari Terakhir)</span>
                                </span>
                                <span className="text-[11px] text-slate-400">Data Agregat</span>
                            </div>

                            <TrendChart
                                data={location.daily_trend}
                                color={isNaik ? '#f59e0b' : '#0d9488'}
                                height={isDesktop ? 160 : 130}
                            />
                        </div>
                    </div>
                </div>

                {/* Right (5 cols on desktop): AQI + RTH + Action */}
                <div className={`${isDesktop ? 'lg:col-span-5' : ''} space-y-4`}>
                    {/* Kualitas Udara (AQI) Card */}
                    <div className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-xs space-y-3">
                        <div className="flex items-center space-x-2">
                            <Wind size={18} className="text-teal-700" />
                            <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                                Kualitas Udara (AQI)
                            </span>
                        </div>

                        <div>
                            <div className="text-2xl font-black text-slate-900">
                                AQI {location.aqi} — <span className="text-base font-bold text-amber-600">{location.aqi_category}</span>
                            </div>
                            <p className="text-xs text-slate-500 mt-1">
                                Sumber: <strong className="text-slate-700">{location.aqi_source}</strong>
                            </p>
                        </div>

                        {location.aqi_source.toLowerCase().includes('model') && (
                            <div className="p-3 bg-amber-50/70 border border-amber-200/80 rounded-xl text-[11px] text-amber-900 leading-relaxed flex items-start space-x-2">
                                <Info size={14} className="text-amber-700 shrink-0 mt-0.5" />
                                <span>
                                    Data merupakan estimasi/model, bukan hasil pengukuran langsung dari stasiun.
                                </span>
                            </div>
                        )}
                    </div>

                    {/* Ruang Hijau (RTH) Card */}
                    <div className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-xs flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center">
                                <Trees size={20} />
                            </div>
                            <div>
                                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
                                    Ruang Terbuka Hijau (RTH)
                                </span>
                                <div className="text-xl font-black text-emerald-800">
                                    {formatPersen(location.rth_percentage)}
                                </div>
                            </div>
                        </div>
                        <div className="text-right text-xs text-slate-500">
                            {location.rth_percentage >= 20 ? (
                                <span className="text-emerald-700 font-semibold bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                                    Cakupan Baik
                                </span>
                            ) : (
                                <span className="text-amber-700 font-semibold bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200">
                                    Cakupan Sedang
                                </span>
                            )}
                        </div>
                    </div>

                    {/* Action button to report for this location */}
                    <button
                        onClick={() => onStartReport(location.id)}
                        className="w-full h-12 bg-teal-700 hover:bg-teal-800 text-white rounded-xl font-bold text-sm shadow-md flex items-center justify-center space-x-2 transition-all cursor-pointer"
                    >
                        <span>Laporkan Gejala di {location.nama}</span>
                    </button>
                </div>
            </div>
        </div>
    );
};
