import React, { useState } from 'react';
import { LocationItem } from '../types';
import { MapView } from '../components/MapView';
import { MapLegend } from '../components/MapLegend';
import { ArrowLeft, Layers } from 'lucide-react';

interface PetaProps {
    locations: LocationItem[];
    selectedLocation: LocationItem | null;
    onSelectLocation: (loc: LocationItem) => void;
    onViewDetail: (id: string) => void;
    onBack?: () => void;
    isDesktop?: boolean;
}

export const Peta: React.FC<PetaProps> = ({
    locations,
    selectedLocation,
    onSelectLocation,
    onViewDetail,
    onBack,
    isDesktop = false,
}) => {
    const [activeLayer, setActiveLayer] = useState<'gejala' | 'aqi'>('gejala');
    const [searchKecamatan, setSearchKecamatan] = useState<string>('');

    const filteredLocations = locations.filter((l) =>
        l.nama.toLowerCase().includes(searchKecamatan.toLowerCase())
    );

    return (
        <div className="flex flex-col gap-4 pb-16 md:pb-4 animate-in fade-in duration-150">
            {/* Mobile-only header (hidden on desktop) */}
            {!isDesktop && (
                <div className="flex items-center justify-between pt-1">
                    <div className="flex items-center space-x-2">
                        {onBack && (
                            <button
                                onClick={onBack}
                                className="p-1.5 rounded-xl hover:bg-slate-200 text-slate-600 transition-colors cursor-pointer"
                            >
                                <ArrowLeft size={18} />
                            </button>
                        )}
                        <div>
                            <h1 className="text-lg font-black text-slate-900 leading-tight">
                                Peta Kondisi Wilayah
                            </h1>
                            <p className="text-[11px] text-slate-500 font-medium">
                                Pantau laporan gejala, AQI, dan ruang hijau
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center space-x-1 text-xs text-teal-700 font-semibold bg-teal-50 px-2.5 py-1 rounded-full">
                        <Layers size={13} />
                        <span className="capitalize">{activeLayer}</span>
                    </div>
                </div>
            )}

            {/* Desktop & Tablet: Map Left + Sidebar Right */}
            <div className={`flex flex-col ${isDesktop ? 'lg:flex-row' : 'md:flex-row'} gap-6 items-start`}>
                {/* Map */}
                <div className="flex-1 min-w-0 w-full">
                    <MapView
                        locations={locations}
                        activeLayer={activeLayer}
                        onLayerChange={setActiveLayer}
                        selectedLocation={selectedLocation}
                        onSelectLocation={onSelectLocation}
                        onViewDetail={onViewDetail}
                    />
                </div>

                {/* Sidebar panel */}
                <div className={`w-full ${isDesktop ? 'lg:w-96' : 'md:w-80'} shrink-0 space-y-5`}>
                    {/* Map Legend */}
                    <MapLegend activeLayer={activeLayer} />

                    {/* Kecamatan list quick-pick */}
                    <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
                        <div className="p-4 border-b border-slate-100 space-y-3">
                            <div className="flex items-center justify-between">
                                <h3 className="text-xs font-black text-slate-700 uppercase tracking-wider">
                                    Semua Kecamatan ({locations.length})
                                </h3>
                                <span className="text-xs font-bold text-slate-400">Kota Yogyakarta</span>
                            </div>
                            <input
                                type="text"
                                value={searchKecamatan}
                                onChange={(e) => setSearchKecamatan(e.target.value)}
                                placeholder="Cari nama kecamatan..."
                                className="w-full text-sm px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-600 transition-all"
                            />
                        </div>
                        <div className="divide-y divide-slate-100 max-h-96 overflow-y-auto">
                            {filteredLocations.map((loc) => (
                                <button
                                    key={loc.id}
                                    onClick={() => onSelectLocation(loc)}
                                    className={`w-full flex items-center justify-between px-4 py-3 text-left text-sm transition-colors cursor-pointer ${
                                        selectedLocation?.id === loc.id
                                            ? 'bg-teal-50 text-teal-900 font-black'
                                            : 'hover:bg-slate-50 text-slate-700 font-medium'
                                    }`}
                                >
                                    <div className="flex items-center space-x-2.5">
                                        <span
                                            className={`w-2.5 h-2.5 rounded-full shrink-0 ${
                                                loc.status === 'naik'
                                                    ? 'bg-orange-500'
                                                    : loc.status === 'normal'
                                                    ? 'bg-emerald-500'
                                                    : 'bg-slate-300'
                                            }`}
                                        />
                                        <span>{loc.nama}</span>
                                    </div>
                                    <span className="text-slate-500 font-mono text-xs font-bold">
                                        AQI {loc.aqi}
                                    </span>
                                </button>
                            ))}
                            {filteredLocations.length === 0 && (
                                <div className="p-6 text-center text-sm text-slate-400 font-medium">
                                    Kecamatan tidak ditemukan
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
