import React from 'react';
import { Lock, ShieldCheck } from 'lucide-react';

interface PrivacyCardProps {
    compact?: boolean;
}

export const PrivacyCard: React.FC<PrivacyCardProps> = ({ compact = false }) => {
    if (compact) {
        return (
            <div className="bg-slate-50 border border-slate-200/90 rounded-2xl p-4 text-center">
                <div className="w-8 h-8 mx-auto mb-2 rounded-full bg-slate-200 flex items-center justify-center text-slate-600">
                    <Lock size={16} />
                </div>
                <h4 className="text-sm font-bold text-slate-800">Data belum cukup</h4>
                <p className="text-xs text-slate-500 mt-1">
                    Informasi disembunyikan untuk menjaga privasi laporan warga (&lt; 3 laporan).
                </p>
            </div>
        );
    }

    return (
        <div className="bg-slate-100/90 border border-slate-200 rounded-2xl p-4 flex items-start space-x-3 text-slate-700 shadow-xs">
            <div className="w-9 h-9 rounded-xl bg-white border border-slate-200 flex-shrink-0 flex items-center justify-center text-slate-600">
                <Lock size={18} />
            </div>
            <div>
                <h4 className="text-sm font-bold text-slate-900">Perlindungan Privasi Komunitas</h4>
                <p className="text-xs text-slate-600 mt-0.5 leading-relaxed">
                    Sistem tidak meminta nama, nomor telepon, atau NIK. Jika laporan di wilayah ini kurang dari 3, angka disembunyikan untuk mencegah identifikasi pelapor.
                </p>
                <div className="flex items-center space-x-1.5 mt-2 text-2xs font-semibold text-teal-800">
                    <ShieldCheck size={14} className="text-teal-600" />
                    <span>Privacy-by-Design terverifikasi</span>
                </div>
            </div>
        </div>
    );
};
