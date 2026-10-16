import React, { useState } from 'react';
import { MapPin, ChevronDown, Check } from 'lucide-react';
import { LocationItem } from '../types';

interface LocationCardProps {
    currentLocation: LocationItem;
    locations: LocationItem[];
    onSelectLocation: (loc: LocationItem) => void;
}

export const LocationCard: React.FC<LocationCardProps> = ({
    currentLocation,
    locations,
    onSelectLocation,
}) => {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <div className="relative">
            <div className="flex items-center justify-between bg-white border border-slate-200/90 rounded-2xl p-3.5 shadow-xs transition-all">
                <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 rounded-xl bg-teal-50 flex items-center justify-center text-teal-700">
                        <MapPin size={22} />
                    </div>
                    <div>
                        <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">
                            Lokasimu
                        </span>
                        <h2 className="text-base font-bold text-slate-900 leading-tight">
                            {currentLocation.nama}, {currentLocation.kota}
                        </h2>
                    </div>
                </div>
                <button
                    onClick={() => setIsOpen(!isOpen)}
                    className="flex items-center space-x-1 text-xs font-medium text-teal-700 bg-teal-50/80 hover:bg-teal-100 py-1.5 px-3 rounded-lg transition-colors cursor-pointer"
                >
                    <span>Ganti</span>
                    <ChevronDown size={14} className={`transform transition-transform ${isOpen ? 'rotate-180' : ''}`} />
                </button>
            </div>

            {isOpen && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl shadow-xl border border-slate-200 z-30 p-2 max-h-60 overflow-y-auto animate-in fade-in slide-in-from-top-2 duration-150">
                    <div className="px-2 py-1.5 text-xs font-medium text-slate-400">Pilih Kecamatan:</div>
                    {locations.map((loc) => (
                        <button
                            key={loc.id}
                            onClick={() => {
                                onSelectLocation(loc);
                                setIsOpen(false);
                            }}
                            className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-left text-sm transition-colors cursor-pointer ${
                                loc.id === currentLocation.id
                                    ? 'bg-teal-50 text-teal-800 font-semibold'
                                    : 'hover:bg-slate-50 text-slate-700'
                            }`}
                        >
                            <span>{loc.nama}, {loc.kota}</span>
                            {loc.id === currentLocation.id && <Check size={16} className="text-teal-600" />}
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
};
