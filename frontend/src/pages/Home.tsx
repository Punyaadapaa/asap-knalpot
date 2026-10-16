import React, { useState } from 'react';
import {
    AlertTriangle,
    PlusCircle,
    Shield,
    Activity,
    Building2,
    Wind,
    Trees,
    TrendingUp,
    MapPin,
    PhoneCall,
    ChevronRight,
    Hospital,
    ArrowRight,
    Map as MapIcon,
    ChevronDown,
    Check,
    Info,
    Sparkles,
} from 'lucide-react';
import { LocationItem } from '../types';
import { LocationCard } from '../components/LocationCard';
import { AQICard } from '../components/AQICard';
import { CommunitySignalCard } from '../components/CommunitySignalCard';
import { TrendChart } from '../components/TrendChart';
import { InfoModal } from '../components/InfoModal';
import { formatPersen } from '../format';

interface HomeProps {
    currentLocation: LocationItem;
    locations: LocationItem[];
    onSelectLocation: (loc: LocationItem) => void;
    onStartReport: () => void;
    onViewDetail: (id: string) => void;
    onSwitchToDashboard: () => void;
    isDesktop?: boolean;
}

export const Home: React.FC<HomeProps> = ({
    currentLocation,
    locations,
    onSelectLocation,
    onStartReport,
    onViewDetail,
    onSwitchToDashboard,
    isDesktop = false,
}) => {
    const [isLocationDropdownOpen, setIsLocationDropdownOpen] = useState(false);

    const getRecommendation = () => {
        const isNaik = currentLocation.status === 'naik';
        const isUnhealthyAQI = currentLocation.aqi > 100;

        if (isUnhealthyAQI && isNaik) {
            return {
                title: 'Perhatian Lingkungan & Komunitas',
                text: 'Kualitas udara sedang tidak sehat dan laporan gejala meningkat di wilayah ini. Gunakan masker medis saat beraktivitas di luar dan batasi durasi di luar ruangan.',
                alertColor: 'amber',
            };
        }
        if (isUnhealthyAQI) {
            return {
                title: 'Kualitas Udara Menurun',
                text: 'Gunakan masker dan hindari area berpolusi tinggi atau jalan raya yang padat kendaraan.',
                alertColor: 'amber',
            };
        }
        if (isNaik) {
            return {
                title: 'Kenaikan Sinyal Gejala',
                text: 'Laporan gejala pernapasan sedang mengalami kenaikan. Jaga daya tahan tubuh dan istirahat yang cukup.',
                alertColor: 'blue',
            };
        }
        return {
            title: 'Kondisi Relatif Stabil',
            text: 'Kondisi lingkungan dan laporan gejala terpantau stabil. Tetap jaga kebersihan tangan dan konsumsi air minum yang cukup.',
            alertColor: 'emerald',
        };
    };

    const rec = getRecommendation();
    const isNaik = currentLocation.status === 'naik';

    // Neighboring / other locations in Yogyakarta
    const otherLocations = locations.filter((loc) => loc.id !== currentLocation.id).slice(0, 4);

    // ─────────────────────────────────────────────────────────────────────────────
    // DESKTOP LAYOUT — Full width, rich desktop web layout
    // ─────────────────────────────────────────────────────────────────────────────
    if (isDesktop) {
        return (
            <div className="space-y-8 pb-16 animate-in fade-in duration-150">
                {/* ── Top Hero / Welcome Banner ── */}
                <div className="bg-slate-900 text-white rounded-2xl p-7 lg:p-8 border border-slate-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                    <div className="space-y-3 max-w-2xl">
                        <div className="inline-flex items-center gap-2 text-teal-300 text-xs font-bold uppercase tracking-wider">
                            <span className="w-1.5 h-1.5 rounded-full bg-teal-400 animate-pulse" />
                            <span>Kota Yogyakarta</span>
                        </div>
                        <h1 className="text-2xl lg:text-3xl font-black tracking-tight leading-tight">
                            Pantauan Kualitas Udara & Sinyal Gejala Pernapasan
                        </h1>
                        <p className="text-sm lg:text-base text-slate-300 leading-relaxed">
                            Deteksi dini gejala pernapasan dan paparan polusi dari laporan warga di 14 kecamatan.
                        </p>
                    </div>

                    {/* Wilayah Aktif Quick Selector */}
                    <div className="relative shrink-0 w-full md:w-auto">
                        <div className="text-left border-t border-white/15 pt-5 md:border-t-0 md:border-l md:pl-6 md:min-w-[260px]">
                            <span className="text-xs font-black text-teal-300 uppercase tracking-wider block">
                                Wilayah Aktif Terpilih
                            </span>
                            <div className="flex items-center justify-between mt-2">
                                <div>
                                    <h3 className="text-2xl font-black text-white">
                                        {currentLocation.nama}
                                    </h3>
                                    <p className="text-xs text-slate-300 font-bold mt-0.5">{currentLocation.kota} · D.I. Yogyakarta</p>
                                </div>
                                <button
                                    onClick={() => setIsLocationDropdownOpen(!isLocationDropdownOpen)}
                                    className="px-3.5 py-2 bg-white/20 hover:bg-white/30 rounded-xl text-white transition-all cursor-pointer flex items-center space-x-1.5 text-xs font-bold"
                                >
                                    <span>Ganti</span>
                                    <ChevronDown size={16} className={isLocationDropdownOpen ? 'rotate-180 transition-transform' : 'transition-transform'} />
                                </button>
                            </div>
                        </div>

                        {/* Location picker dropdown */}
                        {isLocationDropdownOpen && (
                            <div className="absolute top-full right-0 mt-3 w-80 bg-white text-slate-900 rounded-2xl shadow-2xl border border-slate-200 z-50 p-2.5 max-h-80 overflow-y-auto animate-in fade-in duration-100">
                                <div className="px-3.5 py-2 text-xs font-black text-slate-400 uppercase tracking-wider">
                                    Pilih Kecamatan di Yogyakarta
                                </div>
                                {locations.map((loc) => (
                                    <button
                                        key={loc.id}
                                        onClick={() => {
                                            onSelectLocation(loc);
                                            setIsLocationDropdownOpen(false);
                                        }}
                                        className={`w-full flex items-center justify-between px-3.5 py-3 rounded-xl text-left text-sm transition-colors cursor-pointer ${
                                            loc.id === currentLocation.id
                                                ? 'bg-teal-50 text-teal-900 font-black'
                                                : 'hover:bg-slate-50 text-slate-700 font-medium'
                                        }`}
                                    >
                                        <div className="flex items-center space-x-2.5">
                                            <span
                                                className={`w-2.5 h-2.5 rounded-full shrink-0 ${
                                                    loc.status === 'naik'
                                                        ? 'bg-orange-500'
                                                        : 'bg-emerald-500'
                                                }`}
                                            />
                                            <span>{loc.nama}</span>
                                        </div>
                                        <span className="text-slate-500 font-mono text-xs font-bold">
                                            AQI {loc.aqi}
                                        </span>
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* ── Top 4 Key Metric Cards (Row across the desktop width) ── */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    {/* Card 1: Kualitas Udara AQI */}
                    <div className="bg-white rounded-2xl p-7 lg:p-8 border border-slate-200 shadow-xs space-y-4 hover:shadow-md transition-shadow">
                        <div className="flex items-center justify-between">
                            <span className="text-sm font-extrabold text-slate-600 uppercase tracking-wider flex items-center space-x-2">
                                <Wind size={20} className="text-teal-600" />
                                <span>Kualitas Udara (AQI)</span>
                            </span>
                            <span
                                className={`px-3 py-1 rounded-xl text-xs font-black ${
                                    currentLocation.aqi > 100
                                        ? 'bg-orange-100 text-orange-950 border border-orange-200'
                                        : currentLocation.aqi > 50
                                        ? 'bg-amber-100 text-amber-950 border border-amber-200'
                                        : 'bg-emerald-100 text-emerald-950 border border-emerald-200'
                                }`}
                            >
                                {currentLocation.aqi_category}
                            </span>
                        </div>

                        <div className="flex items-baseline space-x-3 pt-1">
                            <span className="text-5xl lg:text-6xl font-black text-slate-900 tracking-tight">
                                {currentLocation.aqi}
                            </span>
                            <span className="text-sm font-bold text-slate-500">Indeks AQI</span>
                        </div>

                        {/* Visual AQI Gauge Bar */}
                        <div className="space-y-2">
                            <div className="h-3.5 w-full bg-slate-100 rounded-full overflow-hidden flex">
                                <div className="h-full bg-emerald-500 flex-1" title="Baik (0-50)" />
                                <div className="h-full bg-amber-400 flex-1" title="Sedang (51-100)" />
                                <div className="h-full bg-orange-500 flex-1" title="Tidak Sehat (101-199)" />
                                <div className="h-full bg-purple-600 flex-1" title="Sangat Tidak Sehat (200+)" />
                            </div>
                            <div className="flex justify-between text-xs text-slate-500 font-bold">
                                <span>0 (Baik)</span>
                                <span>100</span>
                                <span>200+ (Bahaya)</span>
                            </div>
                        </div>

                        <div className="flex items-center justify-between gap-3 pt-3 border-t border-slate-100">
                            <p className="text-xs text-slate-500 font-medium">
                                Stasiun Sensor: <strong className="text-slate-800">{currentLocation.aqi_source}</strong>
                            </p>
                            <InfoModal title="Tentang Data Kualitas Udara">
                                <p>
                                    Data kualitas udara (AQI) ditampilkan secara transparan untuk memberikan
                                    konteks lingkungan di sekitarmu.
                                </p>
                                <p>
                                    Angka AQI bertujuan memberikan kesadaran perlindungan diri seperti
                                    penggunaan masker atau pembatasan aktivitas fisik berat di luar ruangan.
                                </p>
                                <div className="p-3 bg-teal-50 border border-teal-200 rounded-xl text-teal-900 text-xs">
                                    <strong>Skala kota:</strong> angka ini berasal dari stasiun pemantau BMKG
                                    untuk wilayah Kota Yogyakarta, jadi nilainya sama di setiap kecamatan.
                                </div>
                            </InfoModal>
                        </div>
                    </div>

                    {/* Card 2: Sinyal Gejala Warga (7 Hari) */}
                    <div className="bg-white rounded-2xl p-7 lg:p-8 border border-slate-200 shadow-xs space-y-4 hover:shadow-md transition-shadow">
                        <div className="flex items-center justify-between">
                            <span className="text-sm font-extrabold text-slate-600 uppercase tracking-wider flex items-center space-x-2">
                                <Activity size={20} className="text-teal-600" />
                                <span>Sinyal Gejala (7 Hari)</span>
                            </span>
                            <span
                                className={`px-3 py-1 rounded-xl text-xs font-black ${
                                    isNaik
                                        ? 'bg-amber-100 text-amber-950 border border-amber-200'
                                        : 'bg-emerald-100 text-emerald-950 border border-emerald-200'
                                }`}
                            >
                                {isNaik ? '↑ NAIK' : 'STABIL'}
                            </span>
                        </div>

                        <div className="flex items-baseline space-x-3 pt-1">
                            <span className="text-5xl lg:text-6xl font-black text-slate-900 tracking-tight">
                                {currentLocation.total_reports_7d ?? '<3'}
                            </span>
                            <span className="text-sm font-bold text-slate-500">Laporan Terkumpul</span>
                        </div>

                        <div className="flex items-center space-x-2 text-sm font-bold">
                            {isNaik ? (
                                <>
                                    <TrendingUp size={18} className="text-amber-600 shrink-0" />
                                    <span className="text-amber-800">
                                        ↑ {currentLocation.change_percent}% dibanding 7 hari lalu
                                    </span>
                                </>
                            ) : (
                                <span className="text-emerald-700">
                                    Laporan gejala relatif terkendali
                                </span>
                            )}
                        </div>

                        <p className="text-xs text-slate-500 pt-3 border-t border-slate-100 font-medium">
                            Partisipasi warga terlindungi secara anonim
                        </p>
                    </div>

                    {/* Card 3: Ruang Terbuka Hijau (RTH) */}
                    <div className="bg-white rounded-2xl p-7 lg:p-8 border border-slate-200 shadow-xs space-y-4 hover:shadow-md transition-shadow">
                        <div className="flex items-center justify-between">
                            <span className="text-sm font-extrabold text-slate-600 uppercase tracking-wider flex items-center space-x-2">
                                <Trees size={20} className="text-emerald-600" />
                                <span>Ruang Terbuka Hijau</span>
                            </span>
                            <span className="px-3 py-1 rounded-xl text-xs font-black bg-emerald-100 text-emerald-950 border border-emerald-200">
                                {currentLocation.rth_percentage >= 20 ? 'Cakupan Baik' : 'Cakupan Sedang'}
                            </span>
                        </div>

                        <div className="flex items-baseline space-x-3 pt-1">
                            <span className="text-5xl lg:text-6xl font-black text-emerald-800 tracking-tight">
                                {formatPersen(currentLocation.rth_percentage)}
                            </span>
                            <span className="text-sm font-bold text-slate-500">Cakupan Wilayah</span>
                        </div>

                        {/* Progress Bar */}
                        <div className="space-y-2">
                            <div className="h-3.5 w-full bg-slate-100 rounded-full overflow-hidden">
                                <div
                                    className="h-full bg-emerald-600 rounded-full transition-all duration-500"
                                    style={{ width: `${Math.min(currentLocation.rth_percentage * 3, 100)}%` }}
                                />
                            </div>
                            <div className="flex justify-between text-xs text-slate-500 font-bold">
                                <span>Target Minimal Kota: 20%</span>
                                <span>{formatPersen(currentLocation.rth_percentage)} Tercapai</span>
                            </div>
                        </div>

                        <div className="flex items-center justify-between gap-3 pt-3 border-t border-slate-100">
                            <p className="text-xs text-slate-500 font-medium">
                                Mereduksi konsentrasi debu &amp; asap knalpot
                            </p>
                            <InfoModal title="Tentang Ruang Terbuka Hijau (RTH)">
                                <p>
                                    Ruang Terbuka Hijau (RTH) adalah persentase wilayah yang masih berupa
                                    taman, kebun, sawah, atau area hijau lain.
                                </p>
                                <p>
                                    Makin tinggi angkanya, makin baik wilayah itu menyerap debu dan asap
                                    knalpot sehingga udara sekitarnya lebih sehat.
                                </p>
                                <div className="p-3 bg-teal-50 border border-teal-200 rounded-xl text-teal-900 text-xs">
                                    <strong>Skala kota:</strong> angka ini dihitung untuk seluruh Kota
                                    Yogyakarta (target minimal 20%), jadi nilainya sama di setiap kecamatan.
                                </div>
                            </InfoModal>
                        </div>
                    </div>

                    {/* Card 4: Status Peringatan Wilayah */}
                    <div className="bg-white rounded-2xl p-7 lg:p-8 border border-slate-200 shadow-xs space-y-4 hover:shadow-md transition-shadow flex flex-col justify-between">
                        <div>
                            <div className="flex items-center justify-between mb-3">
                                <span className="text-sm font-extrabold text-slate-600 uppercase tracking-wider flex items-center space-x-2">
                                    <AlertTriangle size={20} className="text-amber-600" />
                                    <span>Status Kesehatan</span>
                                </span>
                            </div>

                            <h3 className="text-lg font-black text-slate-900 leading-snug">
                                {rec.title}
                            </h3>
                            <p className="text-sm text-slate-700 mt-2 leading-relaxed">
                                {rec.text}
                            </p>
                        </div>

                        <button
                            onClick={() => onViewDetail(currentLocation.id)}
                            className="w-full py-3 px-4 bg-slate-50 hover:bg-slate-100 text-teal-900 rounded-2xl text-sm font-black flex items-center justify-center space-x-2 transition-colors cursor-pointer border border-slate-200 shadow-2xs mt-4"
                        >
                            <span>Lihat Rincian Wilayah Lengkap</span>
                            <ChevronRight size={16} />
                        </button>
                    </div>
                </div>

                {/* ── Main Dashboard Columns (8 cols left + 4 cols right) ── */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                    {/* ── Left Column: 8 Cols (Trend Chart + Recommendations + Neighborhood Table) ── */}
                    <div className="lg:col-span-8 space-y-8">
                        {/* 1. Grafik Tren Harian Sinyal Gejala */}
                        <div className="bg-white rounded-2xl p-8 lg:p-9 border border-slate-200 shadow-xs space-y-6">
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
                                <div>
                                    <h3 className="text-2xl font-black text-slate-900 flex items-center space-x-2.5">
                                        
                                        <span>Tren Laporan Gejala Pernapasan — {currentLocation.nama}</span>
                                    </h3>
                                    <p className="text-sm text-slate-500 mt-1 font-medium">
                                        Laporan harian 7 hari terakhir.
                                    </p>
                                </div>
                                <button
                                    onClick={() => onViewDetail(currentLocation.id)}
                                    className="text-sm font-black text-teal-700 hover:text-teal-900 inline-flex items-center space-x-1.5 self-start sm:self-auto cursor-pointer"
                                >
                                    <span>Lihat Detail Wilayah</span>
                                    <ChevronRight size={18} />
                                </button>
                            </div>

                            {/* Wide Trend Chart with generous height */}
                            <div className="pt-2">
                                <TrendChart
                                    data={currentLocation.daily_trend}
                                    color={isNaik ? '#f59e0b' : '#0d9488'}
                                    height={260}
                                />
                            </div>
                        </div>

                        {/* 2. Panduan Perlindungan & Kesehatan Warga Terpadu */}
                        <div className="bg-white rounded-2xl p-8 lg:p-9 border border-slate-200 shadow-xs space-y-6">
                            <div className="flex items-center space-x-3.5">
                                <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-800 flex items-center justify-center font-black shrink-0">
                                    <Shield size={26} />
                                </div>
                                <div>
                                    <h3 className="text-2xl font-black text-slate-900">
                                        Panduan Perlindungan Diri Terhadap Polusi & Influenza
                                    </h3>
                                    <p className="text-sm text-slate-500 font-medium mt-0.5">
                                        Rekomendasi pencegahan penularan dan iritasi saluran pernapasan di wilayah {currentLocation.nama}
                                    </p>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2">
                                <div className="space-y-2.5 border-t border-slate-200 pt-4">
                                    <div className="flex items-center gap-2 text-slate-900">
                                        <Shield size={18} className="text-slate-500 shrink-0" />
                                        <span className="text-base font-bold">Warga Umum</span>
                                    </div>
                                    <p className="text-sm text-slate-600 leading-relaxed">
                                        Gunakan masker medis atau KN95 saat berkendara di jalan protokol. Minum air putih 2 liter per hari untuk menjaga kelembapan saluran napas.
                                    </p>
                                </div>

                                <div className="space-y-2.5 border-t border-slate-200 pt-4">
                                    <div className="flex items-center gap-2 text-slate-900">
                                        <AlertTriangle size={18} className="text-slate-500 shrink-0" />
                                        <span className="text-base font-bold">Kelompok Rentan</span>
                                    </div>
                                    <p className="text-sm text-slate-600 leading-relaxed">
                                        Balita, lansia, dan penderita asma sebaiknya membatasi aktivitas di luar ruangan saat kualitas udara memburuk.
                                    </p>
                                </div>

                                <div className="space-y-2.5 border-t border-slate-200 pt-4">
                                    <div className="flex items-center gap-2 text-slate-900">
                                        <PlusCircle size={18} className="text-slate-500 shrink-0" />
                                        <span className="text-base font-bold">Bila Merasa Bergejala</span>
                                    </div>
                                    <p className="text-sm text-slate-600 leading-relaxed">
                                        Lapor lewat form anonim untuk mendapat arahan triase, istirahat cukup, dan segera ke faskes bila sesak berlanjut.
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* 3. Kecamatan Sekitar di Kota Yogyakarta (Table / Overview) */}
                        <div className="bg-white rounded-2xl p-8 border border-slate-200 shadow-xs space-y-5">
                            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                                <div>
                                    <h3 className="text-base font-black text-slate-900 uppercase tracking-wider">
                                        Perbandingan Kecamatan Sekitar
                                    </h3>
                                    <p className="text-sm text-slate-500 mt-0.5 font-medium">
                                        Kondisi kualitas udara dan tren gejala di wilayah tetangga
                                    </p>
                                </div>
                                <span className="text-xs text-slate-500 font-extrabold uppercase tracking-wider bg-slate-100 px-3 py-1 rounded-full">
                                    Kota Yogyakarta
                                </span>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                                {otherLocations.map((loc) => (
                                    <div
                                        key={loc.id}
                                        onClick={() => onSelectLocation(loc)}
                                        className="p-4 border-t border-slate-200 hover:bg-slate-50 transition-colors cursor-pointer space-y-2.5"
                                    >
                                        <div className="flex items-center justify-between">
                                            <span className="text-sm font-black text-slate-900">
                                                {loc.nama}
                                            </span>
                                            <span
                                                className={`w-3 h-3 rounded-full ${
                                                    loc.status === 'naik'
                                                        ? 'bg-orange-500'
                                                        : 'bg-emerald-500'
                                                }`}
                                            />
                                        </div>
                                        <div className="flex items-baseline justify-between text-sm">
                                            <span className="text-slate-500 font-semibold">AQI</span>
                                            <span className="font-black text-slate-900 text-base">{loc.aqi}</span>
                                        </div>
                                        <div className="flex items-baseline justify-between text-xs">
                                            <span className="text-slate-500 font-medium">Status</span>
                                            <span className={`font-black ${loc.status === 'naik' ? 'text-orange-700' : 'text-emerald-700'}`}>
                                                {loc.status === 'naik' ? '↑ Naik' : 'Normal'}
                                            </span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* ── Right Column: 4 Cols (Hero Report CTA + Faskes Info + Tips) ── */}
                    <div className="lg:col-span-4 space-y-8">
                        {/* 1. Hero Report Action Card */}
                        <div className="bg-teal-800 text-white rounded-2xl p-8 lg:p-9 space-y-6">
                            <div className="flex items-center space-x-2.5 text-teal-200 text-xs font-black uppercase tracking-wider">
                                <Sparkles size={18} className="text-teal-300" />
                                <span>Partisipasi Warga Anonim</span>
                            </div>

                            <div>
                                <h3 className="text-2xl lg:text-3xl font-black leading-tight text-white">
                                    Sedang Mengalami Gejala Pernapasan?
                                </h3>
                                <p className="text-sm lg:text-base text-teal-100 mt-3 leading-relaxed font-normal">
                                    Bantu deteksi dini gejala pernapasan dan dampak polusi di wilayahmu lewat laporan anonim.
                                </p>
                            </div>

                            <button
                                onClick={onStartReport}
                                className="w-full h-16 bg-white hover:bg-teal-50 active:scale-[0.99] text-teal-950 rounded-2xl font-black text-base shadow-xl flex items-center justify-center space-x-3 transition-all hover:scale-[1.02] cursor-pointer"
                            >
                                <PlusCircle size={22} className="text-teal-700" />
                                <span>Laporkan Gejala Sekarang</span>
                            </button>

                            <div className="space-y-3 pt-3 border-t border-teal-600/50 text-xs font-bold text-teal-100">
                                <div className="flex items-center space-x-2.5">
                                    <Shield size={18} className="text-teal-300 shrink-0" />
                                    <span>100% Anonim tanpa meminta nama atau NIK</span>
                                </div>
                                <div className="flex items-center space-x-2.5">
                                    <Activity size={18} className="text-teal-300 shrink-0" />
                                    <span>Dapatkan arahan triase mandiri otomatis</span>
                                </div>
                            </div>
                        </div>

                        {/* 2. Fasilitas Kesehatan & Kontak Darurat */}
                        <div className="bg-white rounded-2xl p-8 border border-slate-200 shadow-xs space-y-5">
                            <div className="flex items-center space-x-2.5 text-sm font-black text-slate-800 uppercase tracking-wider">
                                <Hospital size={20} className="text-teal-600" />
                                <span>Faskes & Kontak Darurat</span>
                            </div>

                            <div className="p-5 rounded-2xl bg-rose-50 border border-rose-200 space-y-3">
                                <div className="flex items-center justify-between">
                                    <span className="text-base font-black text-rose-950">
                                        Hotline PSC 119 Yogyakarta
                                    </span>
                                    <span className="text-xs bg-rose-200 text-rose-950 font-black px-2.5 py-1 rounded-full">
                                        24 Jam
                                    </span>
                                </div>
                                <p className="text-sm text-rose-900 leading-relaxed font-medium">
                                    Layanan ambulans gratis dan penanganan medis darurat Kota Yogyakarta.
                                </p>
                                <a
                                    href="tel:119"
                                    className="w-full py-3.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-sm font-black flex items-center justify-center space-x-2 transition-colors cursor-pointer shadow-md shadow-rose-600/20"
                                >
                                    <PhoneCall size={18} />
                                    <span>Hubungi 119 (Bebas Pulsa)</span>
                                </a>
                            </div>

                            <div className="py-5 border-y border-slate-200 space-y-2 text-sm">
                                <span className="font-black text-slate-900 text-base block">
                                    Puskesmas {currentLocation.nama}
                                </span>
                                <p className="text-slate-600 leading-relaxed font-normal">
                                    Layanan pemeriksaan ISPA, rawat jalan, dan rujukan faskes tingkat pertama BPJS.
                                </p>
                                <button
                                    onClick={onSwitchToDashboard}
                                    className="mt-2 text-teal-700 hover:text-teal-900 font-black text-sm inline-flex items-center space-x-1.5 cursor-pointer"
                                >
                                    <span>Masuk Dashboard Puskesmas</span>
                                    <ArrowRight size={16} />
                                </button>
                            </div>
                        </div>

                        {/* 3. Edukasi: Influenza vs Polusi Knalpot */}
                        <div className="bg-white rounded-2xl p-8 border border-slate-200 shadow-xs space-y-4">
                            <div className="flex items-center space-x-2 text-slate-900">
                                
                                <h3 className="text-base font-black">Kenali Perbedaan Gejala</h3>
                            </div>
                            <p className="text-xs text-slate-500 font-medium">
                                Gejala akibat polusi knalpot vs infeksi flu
                            </p>

                            <div className="space-y-3 pt-1">
                                <div className="space-y-1 border-t-2 border-amber-300 pt-3">
                                    <span className="text-xs font-black text-amber-900 uppercase tracking-wide block">
                                        Akibat Asap & Polusi
                                    </span>
                                    <p className="text-sm font-medium text-amber-950 leading-relaxed">
                                        Batuk kering, mata perih, tenggorokan berdahak gatal <strong>tanpa demam tinggi</strong>. Membaik saat berada di ruangan bersih.
                                    </p>
                                </div>

                                <div className="space-y-1 border-t-2 border-blue-300 pt-3">
                                    <span className="text-xs font-black text-blue-900 uppercase tracking-wide block">
                                        Akibat Infeksi Flu / ISPA
                                    </span>
                                    <p className="text-sm font-medium text-blue-950 leading-relaxed">
                                        Demam mendadak &gt;38°C, badan menggigil, nyeri otot &amp; sendi, lemas berat, pilek, serta sakit kepala.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    // ─────────────────────────────────────────────────────────────────────────────
    // MOBILE LAYOUT — Compact, touch-friendly stack
    // ─────────────────────────────────────────────────────────────────────────────
    return (
        <div className="space-y-4 pb-6 animate-in fade-in duration-150">
            {/* Mobile Header */}
            <div className="flex items-center justify-between pt-1">
                <div>
                    <div className="flex items-center space-x-2">
                        <div className="w-8 h-8 rounded-xl bg-teal-600 text-white flex items-center justify-center font-black shadow-xs">
                            IA
                        </div>
                        <h1 className="text-lg font-black tracking-tight text-slate-900">
                            InfluenzaAware
                        </h1>
                    </div>
                    <p className="text-[11px] text-slate-500 font-medium">
                        Pantau Udara. Kenali Gejala. Jaga Kota.
                    </p>
                </div>
                <button
                    onClick={onSwitchToDashboard}
                    className="flex items-center space-x-1 py-1.5 px-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition-colors cursor-pointer border border-slate-200/80"
                    title="Akses Dashboard Pengelola / Puskesmas"
                >
                    <Building2 size={14} className="text-teal-700" />
                    <span>Puskesmas</span>
                </button>
            </div>

            {/* Mobile Stack */}
            <div className="space-y-4">
                <LocationCard
                    currentLocation={currentLocation}
                    locations={locations}
                    onSelectLocation={onSelectLocation}
                />

                <AQICard location={currentLocation} />

                <CommunitySignalCard
                    location={currentLocation}
                    onViewDetail={() => onViewDetail(currentLocation.id)}
                />

                {/* Rekomendasi */}
                <div className="bg-white rounded-2xl p-4 border border-slate-200/90 shadow-xs">
                    <div className="flex items-start space-x-3">
                        <div className="p-2 rounded-xl bg-amber-50 text-amber-700 mt-0.5">
                            <AlertTriangle size={18} />
                        </div>
                        <div>
                            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                                {rec.title}
                            </h3>
                            <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                                {rec.text}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Primary Report Button */}
                <div className="pt-1">
                    <button
                        onClick={onStartReport}
                        className="w-full h-14 bg-teal-700 hover:bg-teal-800 active:scale-[0.99] text-white rounded-2xl font-black text-base shadow-lg shadow-teal-700/25 flex items-center justify-center space-x-2.5 transition-all cursor-pointer"
                    >
                        <PlusCircle size={22} className="text-teal-200" />
                        <span>Laporkan Gejala</span>
                    </button>
                    <div className="flex items-center justify-center space-x-1.5 mt-2 text-[11px] text-slate-400">
                        <Shield size={12} className="text-teal-600" />
                        <span>Laporan anonim · Butuh waktu ~30 detik · Tanpa akun</span>
                    </div>
                </div>
            </div>
        </div>
    );
};
