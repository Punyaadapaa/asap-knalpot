import React, { useEffect, useState } from 'react';
import { formatPersen } from '../format';
import {
    Activity,
    TrendingUp,
    TrendingDown,
    Minus,
    Download,
    Building2,
    Calendar,
    Search,
    Filter,
    Lock,
    ExternalLink,
    RefreshCw,
    Shield,
    FileSpreadsheet,
    Home as HomeIcon,
    Map as MapIcon,
} from 'lucide-react';
import { DashboardResponseData, LocationItem } from '../types';
import { fetchDashboard, getExportCsvUrl } from '../api';
import { TrendChart } from '../components/TrendChart';

interface DashboardProps {
    onSwitchToWarga: () => void;
    onViewDetailWilayah: (id: string) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({
    onSwitchToWarga,
    onViewDetailWilayah,
}) => {
    const [data, setData] = useState<DashboardResponseData | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [statusFilter, setStatusFilter] = useState<'all' | 'naik' | 'normal' | 'data_belum_cukup'>('all');
    const [searchQuery, setSearchQuery] = useState<string>('');

    const loadDashboardData = async () => {
        try {
            setLoading(true);
            setError(null);
            const res = await fetchDashboard();
            setData(res);
        } catch (err: any) {
            setError(err.message || 'Gagal memuat data dashboard');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadDashboardData();
    }, []);

    const filteredKecamatan = data?.kecamatan_list.filter((loc) => {
        const matchesQuery = loc.nama.toLowerCase().includes(searchQuery.toLowerCase()) ||
            loc.kota.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesStatus = statusFilter === 'all' || loc.status === statusFilter;
        return matchesQuery && matchesStatus;
    }) || [];

    return (
        <div className="min-h-screen bg-slate-100/70 pb-16">
            {/* Top Navigation Bar */}
            <header className="bg-white border-b border-slate-200/90 sticky top-0 z-30 shadow-xs">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                        <div className="w-9 h-9 rounded-xl bg-teal-700 text-white flex items-center justify-center font-black">
                            IA
                        </div>
                        <div>
                            <div className="flex items-center space-x-2">
                                <h1 className="text-base font-black text-slate-900 leading-tight">
                                    InfluenzaAware
                                </h1>
                                <span className="hidden sm:inline-block bg-teal-50 text-teal-800 text-[10px] font-bold px-2 py-0.5 rounded-md border border-teal-200">
                                    Puskesmas & Pengelola
                                </span>
                            </div>
                            <p className="text-[11px] text-slate-400">
                                
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center space-x-2">
                        <button
                            onClick={loadDashboardData}
                            className="p-2 rounded-xl text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors cursor-pointer"
                            title="Segarkan data"
                        >
                            <RefreshCw size={17} className={loading ? 'animate-spin' : ''} />
                        </button>
                        <button
                            onClick={onSwitchToWarga}
                            title="Kembali ke mode warga"
                            className="flex items-center space-x-1.5 py-2 px-3 rounded-xl bg-teal-700 hover:bg-teal-800 text-white text-xs font-bold transition-all shadow-xs cursor-pointer shrink-0"
                        >
                            <HomeIcon size={14} />
                            <span className="hidden sm:inline">Mode Warga</span>
                        </button>
                    </div>
                </div>
            </header>

            {/* Main Content Area */}
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
                {/* Header banner with Export CSV */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                    <div>
                        <h2 className="text-2xl font-black text-slate-900 tracking-tight">
                            Kondisi Wilayah & Sinyal Komunitas
                        </h2>
                        <p className="text-xs text-slate-500 mt-0.5">
                            Data agregat 7 hari terakhir per kecamatan.
                        </p>
                    </div>

                    <div className="flex items-center space-x-2">
                        <a
                            href={getExportCsvUrl()}
                            download
                            className="inline-flex items-center space-x-2 py-2.5 px-4 bg-white hover:bg-slate-50 border border-slate-300 text-slate-800 rounded-xl text-xs font-bold shadow-xs transition-colors cursor-pointer"
                        >
                            <Download size={15} className="text-teal-700" />
                            <span>Export CSV</span>
                        </a>
                    </div>
                </div>

                {/* Error Banner */}
                {error && (
                    <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl text-rose-800 text-xs font-semibold flex items-center justify-between">
                        <span>{error}</span>
                        <button onClick={loadDashboardData} className="underline ml-3">Coba Lagi</button>
                    </div>
                )}

                {/* Loading Skeleton */}
                {loading && !data && (
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 animate-pulse">
                        {[1, 2, 3, 4].map((i) => (
                            <div key={i} className="h-28 bg-white rounded-2xl border border-slate-200" />
                        ))}
                    </div>
                )}

                {/* KPI Summary Cards (Section 16 & 17) */}
                {data && (
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                        {/* Total Laporan */}
                        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/90 shadow-xs">
                            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                                Total Laporan (7 Hari)
                            </span>
                            <div className="flex items-baseline space-x-2 mt-1">
                                <span className="text-3xl font-black text-slate-900">
                                    {data.summary.total_laporan}
                                </span>
                                <span className="text-xs font-semibold text-slate-500">laporan</span>
                            </div>
                            <span className="text-[11px] text-slate-400 mt-2 block">
                                Sinyal keluhan warga masuk
                            </span>
                        </div>

                        {/* Wilayah Mengalami Kenaikan */}
                        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/90 shadow-xs">
                            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                                Wilayah Meningkat
                            </span>
                            <div className="flex items-baseline space-x-2 mt-1">
                                <span className="text-3xl font-black text-amber-600">
                                    {data.summary.wilayah_meningkat}
                                </span>
                                <span className="text-xs font-semibold text-slate-500">kecamatan</span>
                            </div>
                            <span className="text-[11px] text-amber-700/80 mt-2 block font-medium">
                                Status: ↑ Naik dibanding periode lalu
                            </span>
                        </div>

                        {/* Perubahan Mingguan */}
                        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/90 shadow-xs">
                            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                                Tren Mingguan Kota
                            </span>
                            <div className="flex items-baseline space-x-2 mt-1">
                                <span className={`text-3xl font-black ${data.summary.perubahan_mingguan > 0 ? 'text-amber-600' : 'text-emerald-600'}`}>
                                    {data.summary.perubahan_mingguan > 0 ? `+${data.summary.perubahan_mingguan}%` : `${data.summary.perubahan_mingguan}%`}
                                </span>
                                <span className="text-xs font-semibold text-slate-500">vs 7 hari lalu</span>
                            </div>
                            <span className="text-[11px] text-slate-400 mt-2 block">
                                Perubahan volume kota
                            </span>
                        </div>

                        {/* Area Terpantau */}
                        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/90 shadow-xs">
                            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                                Area Terpantau
                            </span>
                            <div className="flex items-baseline space-x-2 mt-1">
                                <span className="text-3xl font-black text-teal-800">
                                    {data.summary.area_terpantau}
                                </span>
                                <span className="text-xs font-semibold text-slate-500">wilayah</span>
                            </div>
                            <span className="text-[11px] text-slate-400 mt-2 block">
                                Cakupan aktif Yogyakarta
                            </span>
                        </div>
                    </div>
                )}

                {/* Grafik Tren Agregat 7 Hari (Section 16) */}
                {data && (
                    <div className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-xs">
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4">
                            <div>
                                <h3 className="font-bold text-slate-900 text-base flex items-center space-x-2">
                                    <Activity size={18} className="text-teal-700" />
                                    <span>Grafik Tren Laporan Harian (Agregat Kota)</span>
                                </h3>
                                <p className="text-xs text-slate-500 mt-0.5">
                                    Jumlah laporan gejala per hari.
                                </p>
                            </div>
                            <div className="mt-2 sm:mt-0 text-xs text-slate-400 font-medium">
                                Pembaruan terakhir: {new Date(data.last_updated).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })} WIB
                            </div>
                        </div>

                        <div className="pt-2">
                            <TrendChart
                                data={data.trend_chart}
                                color="#0d9488"
                                height={150}
                            />
                        </div>
                    </div>
                )}

                {/* Table of Kecamatan (Section 16 & 18) */}
                {data && (
                    <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs overflow-hidden">
                        {/* Table Controls / Filters */}
                        <div className="p-4 border-b border-slate-200/80 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                            <div>
                                <h3 className="font-bold text-slate-900 text-base">
                                    Daftar Status Kecamatan
                                </h3>
                                <p className="text-xs text-slate-500">
                                    Status sinyal per kecamatan: NORMAL, NAIK, atau DATA BELUM CUKUP.
                                </p>
                            </div>

                            <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
                                {/* Search input */}
                                <div className="relative w-full sm:w-auto">
                                    <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                                    <input
                                        type="text"
                                        placeholder="Cari kecamatan..."
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        className="w-full sm:w-auto pl-8 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-600 text-slate-800"
                                    />
                                </div>

                                {/* Status Filter dropdown */}
                                <div className="flex items-center space-x-1 bg-slate-50 p-1 rounded-xl border border-slate-200 text-xs">
                                    <button
                                        onClick={() => setStatusFilter('all')}
                                        className={`px-2 py-1 rounded-lg font-semibold transition-colors cursor-pointer ${
                                            statusFilter === 'all' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500'
                                        }`}
                                    >
                                        Semua
                                    </button>
                                    <button
                                        onClick={() => setStatusFilter('naik')}
                                        className={`px-2 py-1 rounded-lg font-semibold transition-colors cursor-pointer ${
                                            statusFilter === 'naik' ? 'bg-amber-100 text-amber-900' : 'text-slate-500'
                                        }`}
                                    >
                                        Naik
                                    </button>
                                    <button
                                        onClick={() => setStatusFilter('normal')}
                                        className={`px-2 py-1 rounded-lg font-semibold transition-colors cursor-pointer ${
                                            statusFilter === 'normal' ? 'bg-emerald-100 text-emerald-900' : 'text-slate-500'
                                        }`}
                                    >
                                        Normal
                                    </button>
                                    <button
                                        onClick={() => setStatusFilter('data_belum_cukup')}
                                        className={`px-2 py-1 rounded-lg font-semibold transition-colors cursor-pointer ${
                                            statusFilter === 'data_belum_cukup' ? 'bg-slate-200 text-slate-800' : 'text-slate-500'
                                        }`}
                                    >
                                        &lt; 3 Lap
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Table Element */}
                        <div className="overflow-x-auto">
                            <table className="w-full min-w-[760px] text-left text-xs">
                                <thead className="bg-slate-50/80 text-slate-500 font-bold uppercase tracking-wider border-b border-slate-200">
                                    <tr>
                                        <th className="py-3 px-4">Kecamatan</th>
                                        <th className="py-3 px-4">Status Sinyal</th>
                                        <th className="py-3 px-4">Laporan 7 Hari</th>
                                        <th className="py-3 px-4">Perubahan</th>
                                        <th className="py-3 px-4">AQI / Udara</th>
                                        <th className="py-3 px-4">Ruang Hijau (RTH)</th>
                                        <th className="py-3 px-4 text-right">Aksi</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {filteredKecamatan.length === 0 ? (
                                        <tr>
                                            <td colSpan={7} className="text-center py-8 text-slate-400">
                                                Tidak ada data kecamatan yang sesuai kriteria pencarian.
                                            </td>
                                        </tr>
                                    ) : (
                                        filteredKecamatan.map((loc) => {
                                            const isNaik = loc.status === 'naik';
                                            const isDataBelumCukup = loc.status === 'data_belum_cukup' || loc.privacy_hidden;

                                            return (
                                                <tr key={loc.id} className="hover:bg-slate-50/70 transition-colors">
                                                    <td className="py-3.5 px-4 font-bold text-slate-900">
                                                        {loc.nama}
                                                        <span className="block text-[10px] text-slate-400 font-normal">
                                                            {loc.kota}
                                                        </span>
                                                    </td>

                                                    <td className="py-3.5 px-4">
                                                        {isDataBelumCukup ? (
                                                            <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full bg-slate-100 text-slate-600 font-bold border border-slate-200">
                                                                <Lock size={11} />
                                                                <span>DATA BELUM CUKUP</span>
                                                            </span>
                                                        ) : isNaik ? (
                                                            <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full bg-amber-100 text-amber-900 font-bold border border-amber-200">
                                                                <TrendingUp size={12} className="text-amber-700" />
                                                                <span>NAIK</span>
                                                            </span>
                                                        ) : (
                                                            <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-900 font-bold border border-emerald-200">
                                                                <Minus size={12} className="text-emerald-700" />
                                                                <span>NORMAL</span>
                                                            </span>
                                                        )}
                                                    </td>

                                                    <td className="py-3.5 px-4">
                                                        {isDataBelumCukup ? (
                                                            <span className="text-slate-400 italic">Disembunyikan (&lt; 3)</span>
                                                        ) : (
                                                            <span className="font-bold text-slate-800">
                                                                {loc.total_reports_7d} laporan
                                                            </span>
                                                        )}
                                                    </td>

                                                    <td className="py-3.5 px-4">
                                                        {isDataBelumCukup ? (
                                                            <span className="text-slate-400">-</span>
                                                        ) : (
                                                            <span className={`font-semibold ${isNaik ? 'text-amber-700' : 'text-emerald-700'}`}>
                                                                {loc.change_percent !== null && loc.change_percent > 0
                                                                    ? `+${loc.change_percent}%`
                                                                    : `${loc.change_percent}%`}
                                                            </span>
                                                        )}
                                                    </td>

                                                    <td className="py-3.5 px-4">
                                                        <span className="font-bold text-slate-800">AQI {loc.aqi}</span>
                                                        <span className="block text-[10px] text-slate-500">
                                                            {loc.aqi_category} ({loc.aqi_source})
                                                        </span>
                                                    </td>

                                                    <td className="py-3.5 px-4">
                                                        <span className="font-bold text-emerald-800">
                                                            {formatPersen(loc.rth_percentage)}
                                                        </span>
                                                    </td>

                                                    <td className="py-3.5 px-4 text-right">
                                                        <button
                                                            onClick={() => onViewDetailWilayah(loc.id)}
                                                            className="text-teal-700 hover:text-teal-900 font-bold inline-flex items-center space-x-1 cursor-pointer"
                                                        >
                                                            <span>Detail</span>
                                                            <ExternalLink size={12} />
                                                        </button>
                                                    </td>
                                                </tr>
                                            );
                                        })
                                    )}
                                </tbody>
                            </table>
                        </div>

                        {/* Privacy & Methodology Footer */}
                        <div className="p-4 bg-slate-50 border-t border-slate-200 text-xs text-slate-500 flex flex-col sm:flex-row items-center justify-between gap-2">
                            <div className="flex items-center space-x-2">
                                <Shield size={14} className="text-teal-600" />
                                <span>
                                    Ambang minimum privasi: wilayah dengan kurang dari 3 laporan disamarkan demi menjaga anonimitas warga.
                                </span>
                            </div>
                            <span className="text-[11px] text-slate-400">
                                Standar Kesehatan Publik Digital
                            </span>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
};
