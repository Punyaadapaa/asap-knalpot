import React, { useState } from 'react';
import { CheckCircle2, AlertTriangle, AlertOctagon, PhoneCall, Hospital, ArrowRight, ShieldAlert, X } from 'lucide-react';
import { TriageResultData } from '../types';

interface TriageResultProps {
    triage: TriageResultData;
    locationName?: string;
    onViewMap: () => void;
    onReset: () => void;
}

export const TriageResult: React.FC<TriageResultProps> = ({
    triage,
    locationName = 'Gondokusuman',
    onViewMap,
    onReset,
}) => {
    const [showGuideModal, setShowGuideModal] = useState<'igd' | 'faskes' | null>(null);

    const isRingan = triage.level === 'ringan';
    const isPerluPemeriksaan = triage.level === 'perlu_pemeriksaan';
    const isGawatDarurat = triage.level === 'gawat_darurat';

    return (
        <div className="bg-white rounded-2xl p-6 border border-slate-200/90 shadow-sm max-w-md mx-auto text-center animate-in fade-in zoom-in-95 duration-200">
            {/* Header Success Tag */}
            <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-teal-50 text-teal-800 text-xs font-bold mb-4">
                <CheckCircle2 size={14} className="text-teal-600" />
                <span>Laporan Terkirim</span>
            </div>

            {/* Level Symbol & Title */}
            <div className="my-2">
                {isRingan && (
                    <div className="w-14 h-14 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto mb-3">
                        <CheckCircle2 size={28} />
                    </div>
                )}
                {isPerluPemeriksaan && (
                    <div className="w-14 h-14 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mx-auto mb-3">
                        <AlertTriangle size={28} />
                    </div>
                )}
                {isGawatDarurat && (
                    <div className="w-14 h-14 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mx-auto mb-3">
                        <AlertOctagon size={28} />
                    </div>
                )}

                <h2
                    className={`text-xl font-black uppercase tracking-wider ${
                        isRingan
                            ? 'text-emerald-700'
                            : isPerluPemeriksaan
                            ? 'text-amber-700'
                            : 'text-rose-700'
                    }`}
                >
                    {triage.title}
                </h2>
                <p className="text-xs text-slate-500 mt-1">
                    Wilayah: <strong>{locationName}</strong>
                </p>
            </div>

            {/* Description & Subtext */}
            <p className="text-sm text-slate-700 font-medium my-3 px-2">
                {triage.description}
            </p>

            {/* Recommendations List (Section 10.1) */}
            <div className="my-4 py-4 border-y border-slate-200 text-left space-y-2">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
                    Arahan Tindakan:
                </span>
                {triage.recommendations.map((rec, i) => (
                    <div key={i} className="flex items-start space-x-2 text-xs text-slate-700 font-medium">
                        <CheckCircle2 size={14} className="text-teal-600 mt-0.5 shrink-0" />
                        <span>{rec}</span>
                    </div>
                ))}
            </div>

            {triage.subtext && (
                <p className="text-xs font-semibold text-slate-500 mb-5">
                    {triage.subtext}
                </p>
            )}

            {/* Action Buttons based on Triage Category */}
            <div className="space-y-2.5">
                {isGawatDarurat && (
                    <>
                        <a
                            href="tel:119"
                            className="w-full h-12 bg-rose-600 hover:bg-rose-700 text-white rounded-2xl font-bold text-sm shadow-md flex items-center justify-center space-x-2 transition-all cursor-pointer"
                        >
                            <PhoneCall size={18} />
                            <span>Hubungi 119</span>
                        </a>
                        <button
                            onClick={() => setShowGuideModal('igd')}
                            className="w-full h-11 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-2xl font-bold text-xs flex items-center justify-center space-x-1.5 transition-colors cursor-pointer"
                        >
                            <Hospital size={16} />
                            <span>Lihat Petunjuk IGD</span>
                        </button>
                    </>
                )}

                {isPerluPemeriksaan && (
                    <button
                        onClick={() => setShowGuideModal('faskes')}
                        className="w-full h-12 bg-amber-600 hover:bg-amber-700 text-white rounded-2xl font-bold text-sm shadow-md flex items-center justify-center space-x-2 transition-all cursor-pointer"
                    >
                        <Hospital size={18} />
                        <span>Cari Fasilitas Kesehatan Terdekat</span>
                    </button>
                )}

                <button
                    onClick={onViewMap}
                    className="w-full h-12 bg-teal-700 hover:bg-teal-800 text-white rounded-2xl font-bold text-sm shadow-md flex items-center justify-center space-x-2 transition-all cursor-pointer"
                >
                    <span>Lihat Kondisi Wilayah</span>
                    <ArrowRight size={16} />
                </button>

                <button
                    onClick={onReset}
                    className="w-full py-2 text-xs font-semibold text-slate-500 hover:text-slate-800 cursor-pointer"
                >
                    Buat Laporan Baru
                </button>
            </div>

            {/* Disclaimer footer */}
            <div className="mt-4 pt-3 border-t border-slate-100 text-3xs text-slate-400">
                Arahan triase merupakan panduan awal kesehatan publik dan bukan pengganti diagnosis medis resmi dokter.
            </div>

            {/* Modals for IGD / Faskes guides */}
            {showGuideModal && (
                <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl max-w-sm w-full p-5 shadow-2xl border border-slate-100 text-left">
                        <div className="flex items-center justify-between mb-3">
                            <h3 className="font-bold text-slate-900 flex items-center space-x-2">
                                <Hospital size={18} className="text-teal-700" />
                                <span>{showGuideModal === 'igd' ? 'Petunjuk Menuju IGD' : 'Daftar Puskesmas & RS'}</span>
                            </h3>
                            <button
                                onClick={() => setShowGuideModal(null)}
                                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg cursor-pointer"
                            >
                                <X size={18} />
                            </button>
                        </div>

                        {showGuideModal === 'igd' ? (
                            <div className="space-y-2.5 text-xs text-slate-600">
                                <p className="font-medium text-slate-800">Langkah Penting Saat Gawat Darurat:</p>
                                <ul className="list-disc pl-4 space-y-1">
                                    <li>Bawa kartu identitas (KTP/BPJS jika ada).</li>
                                    <li>Minta bantuan orang terdekat untuk mengantar, hindari mengemudi sendiri.</li>
                                    <li>Hubungi <strong>119</strong> jika pasien mengalami kehilangan kesadaran atau sesak napas berat.</li>
                                    <li>IGD RS terdekat di Gondokusuman: <strong>RS Panti Rapih</strong> (Jl. C. Simanjuntak) atau <strong>RS Bethesda</strong> (Jl. Jend. Sudirman).</li>
                                </ul>
                            </div>
                        ) : (
                            <div className="space-y-2.5 text-xs text-slate-600">
                                <p className="font-medium text-slate-800">Fasilitas Kesehatan Terdekat (Yogyakarta):</p>
                                <div className="space-y-2">
                                    <div className="py-2.5">
                                        <strong className="block text-slate-900">Puskesmas Gondokusuman I & II</strong>
                                        <span className="text-2xs text-slate-500">Layanan Umum & Pemeriksaan Saluran Pernapasan</span>
                                    </div>
                                    <div className="py-2.5">
                                        <strong className="block text-slate-900">Puskesmas Jetis</strong>
                                        <span className="text-2xs text-slate-500">Jl. Pasiraman No.9, Jetis</span>
                                    </div>
                                    <div className="py-2.5">
                                        <strong className="block text-slate-900">RS Pratama Kota Yogyakarta</strong>
                                        <span className="text-2xs text-slate-500">Mergangsan, Yogyakarta</span>
                                    </div>
                                </div>
                            </div>
                        )}

                        <button
                            onClick={() => setShowGuideModal(null)}
                            className="mt-4 w-full py-2.5 bg-slate-900 text-white font-semibold text-xs rounded-xl cursor-pointer"
                        >
                            Tutup
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};
