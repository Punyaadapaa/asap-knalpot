import React from 'react';
import { Wind } from 'lucide-react';
import { LocationItem } from '../types';
import { InfoModal } from './InfoModal';

interface AQICardProps {
    location: LocationItem;
}

export const AQICard: React.FC<AQICardProps> = ({ location }) => {
    // Color theme helper
    const getAQITheme = (aqi: number) => {
        if (aqi <= 50) {
            return {
                bg: 'bg-emerald-50',
                border: 'border-emerald-200',
                text: 'text-emerald-700',
                badgeBg: 'bg-emerald-100',
                badgeText: 'text-emerald-800',
                glow: 'shadow-emerald-100',
            };
        }
        if (aqi <= 100) {
            return {
                bg: 'bg-amber-50',
                border: 'border-amber-200',
                text: 'text-amber-700',
                badgeBg: 'bg-amber-100',
                badgeText: 'text-amber-800',
                glow: 'shadow-amber-100',
            };
        }
        if (aqi <= 199) {
            return {
                bg: 'bg-orange-50',
                border: 'border-orange-200',
                text: 'text-orange-700',
                badgeBg: 'bg-orange-100',
                badgeText: 'text-orange-900',
                glow: 'shadow-orange-100',
            };
        }
        return {
            bg: 'bg-purple-50',
            border: 'border-purple-200',
            text: 'text-purple-700',
            badgeBg: 'bg-purple-100',
            badgeText: 'text-purple-900',
            glow: 'shadow-purple-100',
        };
    };

    const theme = getAQITheme(location.aqi);
    const updatedFormatted = location.aqi_updated_at
        ? new Date(location.aqi_updated_at).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })
        : '08:00';

    return (
        <div className={`rounded-2xl p-5 border ${theme.border} ${theme.bg} shadow-sm transition-all duration-300 relative overflow-hidden`}>
            <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-2">
                    <Wind className={theme.text} size={20} />
                    <span className="text-xs font-bold tracking-wider uppercase text-slate-600">
                        Kualitas Udara
                    </span>
                </div>
                <InfoModal title="Tentang Data Kualitas Udara">
                    <p>
                        Data kualitas udara (AQI) ditampilkan secara transparan untuk memberikan konteks lingkungan di sekitarmu.
                    </p>
                    {location.aqi_source.toLowerCase().includes('model') ? (
                        <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-amber-900 text-xs">
                            <strong>Catatan Sumber Model:</strong> Data merupakan estimasi/model matematis, bukan hasil pengukuran sensor langsung dari stasiun pemantau.
                        </div>
                    ) : (
                        <div className="p-3 bg-teal-50 border border-teal-200 rounded-xl text-teal-900 text-xs">
                            <strong>Stasiun Resmi:</strong> Data diukur langsung oleh sensor stasiun pemantau lingkungan fisik.
                        </div>
                    )}
                    <p className="text-xs text-slate-500">
                        Angka AQI bertujuan memberikan kesadaran perlindungan diri seperti penggunaan masker atau pembatasan aktivitas fisik berat di luar ruangan.
                    </p>
                    <p className="text-xs text-slate-500">
                        Nilainya berlaku untuk wilayah Kota Yogyakarta, jadi sama di setiap kecamatan.
                    </p>
                </InfoModal>
            </div>

            <div className="flex flex-col items-center justify-center my-3 text-center">
                <span className="text-xs font-semibold text-slate-500 tracking-wider uppercase">
                    AQI
                </span>
                <div className={`text-5xl font-extrabold tracking-tight ${theme.text} my-1`}>
                    {location.aqi}
                </div>
                <div className={`inline-flex items-center px-3.5 py-1 rounded-full text-sm font-bold ${theme.badgeBg} ${theme.badgeText}`}>
                    {location.aqi_category}
                </div>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-200/60 flex items-center justify-between text-xs text-slate-600">
                <span className="flex items-center space-x-1">
                    <span className="text-slate-400">Sumber:</span>
                    <strong className="font-semibold text-slate-700">{location.aqi_source}</strong>
                </span>
                <span className="flex items-center space-x-1">
                    <span className="text-slate-400">Diperbarui:</span>
                    <strong className="font-semibold text-slate-700">{updatedFormatted} WIB</strong>
                </span>
            </div>
        </div>
    );
};
