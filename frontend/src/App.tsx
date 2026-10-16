import React, { useEffect, useState } from 'react';
import { LocationItem, SymptomItem, SubmitReportResponse, TriageResultData } from './types';
import { fetchLokasi, fetchGejala } from './api';
import { formatPersen } from './format';
import { InfoModal } from './components/InfoModal';
import { Home } from './pages/Home';
import { Lapor } from './pages/Lapor';
import { Triase } from './pages/Triase';
import { Peta } from './pages/Peta';
import { DetailLokasi } from './pages/DetailLokasi';
import { GejalaSaya } from './pages/GejalaSaya';
import { Dashboard } from './pages/Dashboard';
import {
    AlertCircle,
    RefreshCw,
    Home as HomeIcon,
    FileText,
    Map,
    UserCheck,
    Building2,
    Monitor,
    Smartphone,
    MapPin,
    PanelLeftClose,
    PanelLeftOpen,
} from 'lucide-react';

// ─── Sidebar Navigation (Desktop) ────────────────────────────────────────────
interface SideNavProps {
    currentTab: 'home' | 'lapor' | 'peta' | 'saya';
    onTabChange: (tab: 'home' | 'lapor' | 'peta' | 'saya') => void;
    onSwitchToDashboard: () => void;
    locations: LocationItem[];
    currentLocation: LocationItem | null;
}

const SideNav: React.FC<SideNavProps> = ({
    currentTab,
    onTabChange,
    onSwitchToDashboard,
    locations,
    currentLocation,
}) => {
    const navItems = [
        { id: 'home' as const, label: 'Beranda', icon: HomeIcon },
        { id: 'lapor' as const, label: 'Lapor Gejala', icon: FileText },
        { id: 'peta' as const, label: 'Peta Wilayah', icon: Map },
        { id: 'saya' as const, label: 'Gejala Saya', icon: UserCheck },
    ];

    return (
        <aside className="w-80 xl:w-[340px] shrink-0 flex flex-col h-screen sticky top-0 bg-white border-r border-slate-200 z-30 select-none overflow-y-auto">
            {/* Logo & Branding */}
            <div className="p-6 border-b border-slate-100">
                <div className="flex items-center space-x-3.5">
                    <div className="w-12 h-12 rounded-lg bg-teal-700 text-white flex items-center justify-center font-black text-lg shrink-0">
                        IA
                    </div>
                    <div>
                        <div className="flex items-center space-x-1.5">
                            <h1 className="text-xl font-black text-slate-900 tracking-tight leading-none">
                                InfluenzaAware
                            </h1>
                        </div>
                        <p className="text-xs text-teal-700 font-extrabold mt-1 tracking-wide uppercase">
                            Pantau · Kenali · Jaga Kota
                        </p>
                    </div>
                </div>
            </div>

            {/* Navigation Links */}
            <nav className="p-4 space-y-1">
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider px-3 pt-1 pb-2">
                    Menu
                </p>
                {navItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = currentTab === item.id;
                    return (
                        <button
                            key={item.id}
                            onClick={() => onTabChange(item.id)}
                            aria-current={isActive ? 'page' : undefined}
                            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-semibold transition-colors cursor-pointer ${
                                isActive
                                    ? 'bg-teal-700 text-white'
                                    : 'text-slate-700 hover:bg-slate-100 hover:text-slate-900'
                            }`}
                        >
                            <Icon size={18} className="shrink-0" />
                            <span className="truncate">{item.label}</span>
                        </button>
                    );
                })}

                {/* Dashboard Pengelola link */}
                <div className="pt-4 mt-3 border-t border-slate-100">
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider px-3 pb-2">
                        Pengelola
                    </p>
                    <button
                        onClick={onSwitchToDashboard}
                        className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-100 cursor-pointer"
                    >
                        <Building2 size={18} className="shrink-0" />
                        <span className="truncate">Dashboard Puskesmas</span>
                    </button>
                </div>
            </nav>

            {/* Quick Stats Footer in Sidebar */}
            {currentLocation && (
                <div className="mt-auto p-5 border-t border-slate-100 space-y-3">
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                        Wilayah Aktif
                    </p>
                    <div className="space-y-3">
                        <div className="flex items-center gap-2">
                            <MapPin size={16} className="text-teal-700 shrink-0" />
                            <span className="text-sm font-bold text-slate-900 truncate">{currentLocation.nama}</span>
                            <span className="text-xs text-slate-500">DIY</span>
                        </div>
                        <div className="grid grid-cols-3 divide-x divide-slate-200 border-y border-slate-200 py-3 text-center">
                            <div className="px-1">
                                <span className="block text-lg font-black text-slate-900">
                                    {currentLocation.total_reports_7d ?? '<3'}
                                </span>
                                <span className="text-xs font-medium text-slate-500 leading-tight min-h-8 flex items-center justify-center">
                                    Laporan 7 hari
                                </span>
                            </div>
                            <div className="px-1">
                                <span className="block text-lg font-black text-slate-900">
                                    {currentLocation.aqi}
                                </span>
                                <span className="text-xs font-medium text-slate-500 leading-tight min-h-8 flex items-center justify-center">
                                    Kualitas udara
                                </span>
                            </div>
                            <div className="px-1">
                                <span className="block text-lg font-black text-slate-900">
                                    {formatPersen(currentLocation.rth_percentage)}
                                </span>
                                <span className="text-xs font-medium text-slate-500 leading-tight min-h-8 flex items-center justify-center">
                                    Ruang hijau
                                </span>
                            </div>
                        </div>

                        <div className="flex">
                                <InfoModal title="Tentang Angka Wilayah Ini">
                                    <p>
                                        <strong className="text-slate-800">Laporan 7 hari</strong> = jumlah
                                        warga yang melaporkan gejala pernapasan di kecamatan ini dalam 7
                                        hari terakhir.
                                    </p>
                                    <p>
                                        <strong className="text-slate-800">Kualitas Udara (AQI)</strong> =
                                        indeks kualitas udara dari stasiun pemantau BMKG. 0–50 baik, 51–100
                                        sedang, di atas 100 kurang sehat untuk penderita asma dan lansia.
                                    </p>
                                    <p>
                                        <strong className="text-slate-800">Ruang Hijau (RTH)</strong> =
                                        persentase wilayah yang masih berupa ruang terbuka hijau. Makin
                                        tinggi, makin baik menyerap polusi.
                                    </p>
                                    <div className="p-3 bg-teal-50 border border-teal-200 rounded-xl text-teal-900 text-xs">
                                        <strong>Catatan wilayah:</strong> angka kualitas udara dan ruang
                                        hijau dihitung untuk seluruh Kota Yogyakarta, jadi nilainya sama di
                                        setiap kecamatan. Hanya angka laporan yang khusus kecamatan ini.
                                    </div>
                                    <p className="text-xs text-slate-500">
                                        Kalau jumlah laporan kurang dari 3, angkanya ditampilkan sebagai
                                        &lt;3 demi melindungi privasi pelapor.
                                    </p>
                                </InfoModal>
                            </div>
                        </div>
                    </div>
            )}
        </aside>
    );
};

// ─── Bottom Navigation (Mobile) ──────────────────────────────────────────────
interface BottomNavProps {
    currentTab: 'home' | 'lapor' | 'peta' | 'saya';
    onTabChange: (tab: 'home' | 'lapor' | 'peta' | 'saya') => void;
    isInSimulator?: boolean;
}

const BottomNav: React.FC<BottomNavProps> = ({ currentTab, onTabChange, isInSimulator = false }) => {
    const navItems = [
        { id: 'home' as const, label: 'Home', icon: HomeIcon },
        { id: 'lapor' as const, label: 'Lapor', icon: FileText },
        { id: 'peta' as const, label: 'Peta', icon: Map },
        { id: 'saya' as const, label: 'Saya', icon: UserCheck },
    ];

    return (
        <nav
            className={`${
                isInSimulator ? 'absolute' : 'fixed'
            } bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200/80 shadow-lg px-3 py-2 ${
                isInSimulator ? '' : 'md:hidden'
            }`}
        >
            <div className="flex items-center justify-around">
                {navItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = currentTab === item.id;
                    return (
                        <button
                            key={item.id}
                            onClick={() => onTabChange(item.id)}
                            className={`flex flex-col items-center justify-center py-1.5 px-3 rounded-xl transition-all duration-200 cursor-pointer ${
                                isActive ? 'text-teal-700 font-bold' : 'text-slate-500 hover:text-slate-800'
                            }`}
                        >
                            <div
                                className={`p-1.5 rounded-xl transition-transform ${
                                    isActive
                                        ? 'bg-teal-50 text-teal-700 scale-110 shadow-xs'
                                        : 'hover:bg-slate-100'
                                }`}
                            >
                                <Icon size={20} strokeWidth={isActive ? 2.5 : 2} />
                            </div>
                            <span className="text-xs mt-0.5 font-bold tracking-tight">{item.label}</span>
                        </button>
                    );
                })}
            </div>
        </nav>
    );
};

// ─── View Mode Switcher ───────────────────────────────────────────────────────
interface ViewModeSelectorProps {
    mode: 'desktop' | 'mobile';
    onChange: (mode: 'desktop' | 'mobile') => void;
    compact?: boolean;
}

const ViewModeSelector: React.FC<ViewModeSelectorProps> = ({ mode, onChange, compact = false }) => {
    return (
        <div className="inline-flex items-center bg-slate-100 p-1.5 rounded-2xl border border-slate-200 text-sm font-extrabold shadow-2xs">
            <button
                type="button"
                onClick={() => onChange('desktop')}
                className={`flex items-center space-x-2 px-4 py-2 rounded-xl transition-all cursor-pointer ${
                    mode === 'desktop'
                        ? 'bg-white text-teal-950 shadow-sm font-black'
                        : 'text-slate-600 hover:text-slate-900'
                }`}
                title="Beralih ke Tampilan Desktop (Layar Lebar & Mudah Dibaca)"
            >
                <Monitor size={18} className={mode === 'desktop' ? 'text-teal-600' : ''} />
                <span className={compact ? 'hidden sm:inline' : ''}>Desktop</span>
            </button>
            <button
                type="button"
                onClick={() => onChange('mobile')}
                className={`flex items-center space-x-2 px-4 py-2 rounded-xl transition-all cursor-pointer ${
                    mode === 'mobile'
                        ? 'bg-white text-teal-950 shadow-sm font-black'
                        : 'text-slate-600 hover:text-slate-900'
                }`}
                title="Beralih ke Tampilan Mobile (Simulasi HP)"
            >
                <Smartphone size={18} className={mode === 'mobile' ? 'text-teal-600' : ''} />
                <span className={compact ? 'hidden sm:inline' : ''}>Mobile</span>
            </button>
        </div>
    );
};

// ─── Main App ─────────────────────────────────────────────────────────────────
export const App: React.FC = () => {
    const [currentView, setCurrentView] = useState<
        'home' | 'lapor' | 'triase' | 'peta' | 'detail_lokasi' | 'saya' | 'dashboard'
    >('home');
    const [activeTab, setActiveTab] = useState<'home' | 'lapor' | 'peta' | 'saya'>('home');

    // Display mode choice: 'desktop' or 'mobile'
    const [displayMode, setDisplayMode] = useState<'desktop' | 'mobile'>(() => {
        try {
            const saved = localStorage.getItem('influenza_display_mode');
            if (saved === 'desktop' || saved === 'mobile') return saved;
            return typeof window !== 'undefined' && window.innerWidth >= 768 ? 'desktop' : 'mobile';
        } catch {
            return 'desktop';
        }
    });

    const handleSetDisplayMode = (mode: 'desktop' | 'mobile') => {
        setDisplayMode(mode);
        try {
            localStorage.setItem('influenza_display_mode', mode);
        } catch (e) {
            console.error(e);
        }
    };

    const [locations, setLocations] = useState<LocationItem[]>([]);
    const [symptoms, setSymptoms] = useState<SymptomItem[]>([]);
    const [currentLocation, setCurrentLocation] = useState<LocationItem | null>(null);
    const [selectedLocationForDetail, setSelectedLocationForDetail] = useState<string>('');
    const [lastReportResult, setLastReportResult] = useState<SubmitReportResponse['data'] | null>(null);
    const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(true);

    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    const loadInitialData = async () => {
        try {
            setLoading(true);
            setError(null);
            const [locsData, symsData] = await Promise.all([fetchLokasi(), fetchGejala()]);
            setLocations(locsData);
            setSymptoms(symsData);
            // Wilayah awal sebelum pengguna memilih sendiri di beranda.
            // (Dulu di sini dicari id "gondokusuman" yang tidak pernah ada di
            // basis data, jadi selalu jatuh ke kecamatan pertama.)
            setCurrentLocation(locsData[0] ?? null);
        } catch (err: any) {
            setError(err.message || 'Data belum dapat dimuat. Periksa koneksi internet.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadInitialData();
    }, []);

    const handleTabChange = (tab: 'home' | 'lapor' | 'peta' | 'saya') => {
        setActiveTab(tab);
        if (tab === 'home') setCurrentView('home');
        else if (tab === 'lapor') setCurrentView('lapor');
        else if (tab === 'peta') setCurrentView('peta');
        else if (tab === 'saya') setCurrentView('saya');
    };

    const handleStartReport = (locId?: string) => {
        if (locId) {
            const found = locations.find((l) => l.id === locId);
            if (found) setCurrentLocation(found);
        }
        setActiveTab('lapor');
        setCurrentView('lapor');
    };

    const handleReportSuccess = (data: SubmitReportResponse['data']) => {
        setLastReportResult(data);
        setCurrentView('triase');
    };

    const handleViewDetail = (id: string) => {
        setSelectedLocationForDetail(id);
        setCurrentView('detail_lokasi');
    };

    const handleViewMap = () => {
        setActiveTab('peta');
        setCurrentView('peta');
    };

    const handleViewTriageFromCard = (triage: TriageResultData, locationName: string) => {
        setLastReportResult({
            report_id: 0,
            location: { id: '', nama: locationName, kota: 'Yogyakarta' },
            symptoms: [],
            duration_days: 1,
            triage,
            created_at: new Date().toISOString(),
        });
        setCurrentView('triase');
    };

    // ── Loading State ───────────────────────────────────────────────────────
    if (loading && locations.length === 0) {
        return (
            <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
                <div className="w-full max-w-sm bg-white rounded-2xl p-6 shadow-sm border border-slate-200 space-y-4 animate-pulse">
                    <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 rounded-xl bg-slate-200" />
                        <div className="space-y-1.5 flex-1">
                            <div className="h-4 bg-slate-200 rounded w-28" />
                            <div className="h-3 bg-slate-100 rounded w-44" />
                        </div>
                    </div>
                    <div className="h-28 bg-slate-200 rounded-2xl" />
                    <div className="h-24 bg-slate-100 rounded-2xl" />
                    <div className="h-12 bg-slate-200 rounded-2xl" />
                </div>
                <p className="text-xs text-slate-400 mt-4 font-medium flex items-center space-x-1.5">
                    <RefreshCw size={12} className="animate-spin text-teal-600" />
                    <span>Memuat InfluenzaAware...</span>
                </p>
            </div>
        );
    }

    // ── Error State ─────────────────────────────────────────────────────────
    if (error && locations.length === 0) {
        return (
            <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
                <div className="max-w-sm w-full bg-white rounded-2xl p-6 shadow-sm border border-slate-200 text-center space-y-3">
                    <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mx-auto">
                        <AlertCircle size={28} />
                    </div>
                    <h2 className="text-base font-bold text-slate-900">Data belum dapat dimuat</h2>
                    <p className="text-xs text-slate-500 leading-relaxed">
                        Periksa koneksi internet dan coba lagi.
                    </p>
                    <button
                        onClick={loadInitialData}
                        className="w-full py-2.5 bg-teal-700 hover:bg-teal-800 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer"
                    >
                        Coba Lagi
                    </button>
                </div>
            </div>
        );
    }

    // ── Dashboard (Full-width, no sidebar) ─────────────────────────────────
    if (currentView === 'dashboard') {
        return (
            <Dashboard
                onSwitchToWarga={() => {
                    setCurrentView('home');
                    setActiveTab('home');
                }}
                onViewDetailWilayah={(id) => {
                    setSelectedLocationForDetail(id);
                    setCurrentView('detail_lokasi');
                }}
            />
        );
    }

    // ── Page content resolver ───────────────────────────────────────────────
    const renderContent = (isDesktopView: boolean) => {
        switch (currentView) {
            case 'home':
                return currentLocation ? (
                    <Home
                        currentLocation={currentLocation}
                        locations={locations}
                        onSelectLocation={(loc) => setCurrentLocation(loc)}
                        onStartReport={() => handleStartReport(currentLocation.id)}
                        onViewDetail={handleViewDetail}
                        onSwitchToDashboard={() => setCurrentView('dashboard')}
                        isDesktop={isDesktopView}
                    />
                ) : null;

            case 'lapor':
                return (
                    <Lapor
                        locations={locations}
                        symptoms={symptoms}
                        defaultLocationId={currentLocation?.id}
                        onReportSuccess={handleReportSuccess}
                        onCancel={() => {
                            setCurrentView('home');
                            setActiveTab('home');
                        }}
                    />
                );

            case 'triase':
                return lastReportResult ? (
                    <Triase
                        reportData={lastReportResult}
                        onViewMap={handleViewMap}
                        onReset={() => {
                            setActiveTab('lapor');
                            setCurrentView('lapor');
                        }}
                    />
                ) : null;

            case 'peta':
                return (
                    <Peta
                        locations={locations}
                        selectedLocation={currentLocation}
                        onSelectLocation={(loc) => setCurrentLocation(loc)}
                        onViewDetail={handleViewDetail}
                        isDesktop={isDesktopView}
                    />
                );

            case 'detail_lokasi':
                return (
                    <DetailLokasi
                        locationId={selectedLocationForDetail}
                        initialLocation={locations.find((l) => l.id === selectedLocationForDetail)}
                        onBack={() => {
                            if (activeTab === 'peta') setCurrentView('peta');
                            else setCurrentView('home');
                        }}
                        onStartReport={handleStartReport}
                        isDesktop={isDesktopView}
                    />
                );

            case 'saya':
                return (
                    <GejalaSaya
                        symptomsList={symptoms}
                        onStartReport={() => handleStartReport(currentLocation?.id)}
                        onViewTriageDetails={handleViewTriageFromCard}
                        isDesktop={isDesktopView}
                    />
                );

            default:
                return null;
        }
    };

    // ── Page title helper ───────────────────────────────────────────────────
    const getPageTitle = () => {
        if (currentView === 'home') return 'Beranda';
        if (currentView === 'lapor') return 'Lapor Gejala';
        if (currentView === 'triase') return 'Hasil Triase';
        if (currentView === 'peta') return 'Peta Wilayah';
        if (currentView === 'detail_lokasi') return 'Detail Wilayah';
        if (currentView === 'saya') return 'Gejala Saya';
        return '';
    };

    const getPageSubtitle = () => {
        if (currentView === 'home') return 'Pantau kondisi udara & gejala pernapasan di wilayahmu';
        if (currentView === 'lapor') return 'Laporkan gejala pernapasan secara anonim';
        if (currentView === 'triase') return 'Rekomendasi tindakan berdasarkan gejalamu';
        if (currentView === 'peta') return 'Visualisasi data kualitas udara & laporan per kecamatan';
        if (currentView === 'detail_lokasi') return 'Data lengkap & tren wilayah kecamatan';
        if (currentView === 'saya') return 'Riwayat laporan gejala tersimpan di peramban ini';
        return '';
    };

    // ── Container Width Helper for Desktop ──────────────────────────────────
    const getDesktopContainerClass = () => {
        if (currentView === 'lapor') return 'max-w-3xl mx-auto';
        if (currentView === 'triase') return 'max-w-2xl mx-auto';
        return 'w-full max-w-[1580px] mx-auto';
    };

    // ── Mobile Mode Rendering ───────────────────────────────────────────────
    if (displayMode === 'mobile') {
        return (
            <div className="min-h-screen bg-slate-900 md:bg-slate-950 flex flex-col items-center justify-start md:py-6 md:px-4">
                {/* Desktop Top Control Bar when in Mobile Mode */}
                <div className="hidden md:flex w-full max-w-md bg-slate-800/90 backdrop-blur-md rounded-2xl p-2.5 border border-slate-700/80 mb-4 items-center justify-between shadow-xl">
                    <div className="flex items-center space-x-2 text-xs">
                        <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
                        <span className="font-bold text-white">Mode Mobile Aktif</span>
                        <span className="text-slate-400 text-[11px]">(Simulasi HP)</span>
                    </div>
                    <ViewModeSelector mode={displayMode} onChange={handleSetDisplayMode} />
                </div>

                {/* Smartphone Device Mockup Frame on Desktop / Full Screen on Mobile */}
                <div className="w-full md:w-[412px] bg-slate-50 md:rounded-[42px] md:shadow-2xl md:border-[9px] md:border-slate-800 relative flex flex-col min-h-screen md:min-h-[840px] md:max-h-[92vh] overflow-hidden">
                    {/* Simulated Phone Top Speaker & Camera Notch (Desktop view only) */}
                    <div className="hidden md:flex w-full bg-slate-800 py-1.5 justify-center items-center">
                        <div className="w-24 h-4 bg-slate-950 rounded-full flex items-center justify-center space-x-2 px-2">
                            <div className="w-2 h-2 rounded-full bg-slate-800" />
                            <div className="w-9 h-1 rounded-full bg-slate-800" />
                        </div>
                    </div>

                    {/* Mobile App Header */}
                    <header className="px-4 py-3 bg-white/95 backdrop-blur-md border-b border-slate-200/80 flex items-center justify-between sticky top-0 z-30 shadow-2xs">
                        <div className="flex items-center space-x-2.5">
                            <div className="w-8 h-8 rounded-lg bg-teal-700 text-white flex items-center justify-center font-black text-xs">
                                IA
                            </div>
                            <div>
                                <h1 className="text-sm font-black text-slate-900 leading-tight">
                                    InfluenzaAware
                                </h1>
                                <p className="text-[10px] text-teal-600 font-semibold">
                                    Pantau Udara · Kenali Gejala
                                </p>
                            </div>
                        </div>

                        <div className="flex items-center space-x-2">
                            {/* Mobile View Mode Switcher */}
                            <div className="md:hidden">
                                <ViewModeSelector mode={displayMode} onChange={handleSetDisplayMode} compact />
                            </div>

                            <button
                                onClick={() => setCurrentView('dashboard')}
                                className="py-1 px-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold border border-slate-200/90 transition-colors"
                            >
                                Puskesmas
                            </button>
                        </div>
                    </header>

                    {/* Scrollable Mobile Page Body */}
                    <main className="flex-1 overflow-y-auto px-4 pt-3 pb-24">
                        {renderContent(false)}
                    </main>

                    {/* Mobile Bottom Navigation */}
                    <BottomNav
                        currentTab={activeTab}
                        onTabChange={handleTabChange}
                        isInSimulator={true}
                    />
                </div>
            </div>
        );
    }

    // ── Desktop Mode Layout ─────────────────────────────────────────────────
    return (
        <div className="min-h-screen bg-slate-100/60 flex">
            {/* ── Desktop Sidebar (SideNav, collapsible) ── */}
            <div
                className={`shrink-0 h-screen sticky top-0 overflow-hidden transition-[width] duration-200 ease-out ${
                    isSidebarOpen ? 'w-80 xl:w-[340px]' : 'w-0'
                }`}
            >
                <SideNav
                    currentTab={activeTab}
                    onTabChange={handleTabChange}
                    onSwitchToDashboard={() => setCurrentView('dashboard')}
                    locations={locations}
                    currentLocation={currentLocation}
                />
            </div>

            {/* ── Main Content Area ── */}
            <div className="flex-1 flex flex-col min-h-screen min-w-0">
                {/* ── Top Header Bar (Desktop) ── */}
                <header className="flex items-center justify-between px-10 py-5 bg-white border-b border-slate-200 sticky top-0 z-20 shadow-xs">
                    <div className="flex items-center gap-4 min-w-0">
                        <button
                            onClick={() => setIsSidebarOpen((v) => !v)}
                            aria-label={isSidebarOpen ? 'Sembunyikan menu' : 'Tampilkan menu'}
                            aria-expanded={isSidebarOpen}
                            title={isSidebarOpen ? 'Sembunyikan menu' : 'Tampilkan menu'}
                            className="shrink-0 w-10 h-10 flex items-center justify-center rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition-colors cursor-pointer"
                        >
                            {isSidebarOpen ? <PanelLeftClose size={20} /> : <PanelLeftOpen size={20} />}
                        </button>
                        <div className="min-w-0">
                            <div className="flex items-center space-x-3">
                                <h2 className="text-2xl font-black text-slate-900 tracking-tight leading-tight">
                                    {getPageTitle()}
                                </h2>
                                <span className="bg-teal-50 text-teal-800 text-xs font-black px-3 py-1 rounded-lg border border-teal-200">
                                    Warga
                                </span>
                            </div>
                            <p className="text-sm font-semibold text-slate-500 mt-1">{getPageSubtitle()}</p>
                        </div>
                    </div>

                    {/* Right side: View Mode Switcher + Location Badge + Action */}
                    <div className="flex items-center space-x-4">
                        {/* 🖥️ Desktop / 📱 Mobile View Switcher */}
                        <ViewModeSelector mode={displayMode} onChange={handleSetDisplayMode} />

                        {currentLocation && (
                            <div className="flex items-center space-x-2.5 bg-slate-50 border border-slate-200 rounded-2xl px-4 py-2.5 text-sm text-slate-700 shadow-2xs">
                                <span className="font-black text-slate-900">{currentLocation.nama}</span>
                                <span className="text-slate-300">·</span>
                                <span
                                    className={`font-black ${
                                        currentLocation.aqi > 100
                                            ? 'text-orange-600'
                                            : currentLocation.aqi > 50
                                            ? 'text-amber-600'
                                            : 'text-emerald-600'
                                    }`}
                                >
                                    AQI {currentLocation.aqi}
                                </span>
                                <span className="text-slate-300">·</span>
                                <span className="text-slate-700 font-bold">{currentLocation.aqi_category}</span>
                            </div>
                        )}

                        <button
                            onClick={() => handleStartReport(currentLocation?.id)}
                            className="flex items-center space-x-2.5 bg-teal-600 hover:bg-teal-700 text-white text-sm font-black px-5 py-2.5 rounded-2xl shadow-md shadow-teal-600/25 transition-all hover:scale-[1.02] cursor-pointer"
                        >
                            <FileText size={18} />
                            <span>Lapor Gejala</span>
                        </button>
                    </div>
                </header>

                {/* ── Scrollable Page Content ── */}
                <main className="flex-1 overflow-y-auto px-6 py-6 lg:px-10 lg:py-8">
                    <div className={getDesktopContainerClass()}>
                        {renderContent(true)}
                    </div>
                </main>
            </div>
        </div>
    );
};
