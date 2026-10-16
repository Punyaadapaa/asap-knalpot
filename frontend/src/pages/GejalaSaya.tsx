import React, { useEffect, useState } from 'react';
import { UserCheck, Trash2, Eye, Lock, PlusCircle, AlertCircle, Calendar, Clock, MapPin, X } from 'lucide-react';
import { LocalSymptomCard, SymptomItem, TriageResultData } from '../types';

interface GejalaSayaProps {
    symptomsList: SymptomItem[];
    onStartReport: () => void;
    onViewTriageDetails: (triage: TriageResultData, locationName: string) => void;
    isDesktop?: boolean;
}

export const GejalaSaya: React.FC<GejalaSayaProps> = ({
    symptomsList,
    onStartReport,
    onViewTriageDetails,
    isDesktop = false,
}) => {
    const [records, setRecords] = useState<LocalSymptomCard[]>([]);
    const [selectedCard, setSelectedCard] = useState<LocalSymptomCard | null>(null);

    useEffect(() => {
        loadRecords();
    }, []);

    const loadRecords = () => {
        try {
            const raw = localStorage.getItem('influenza_gejala_saya');
            if (raw) {
                setRecords(JSON.parse(raw));
            } else {
                setRecords([]);
            }
        } catch (e) {
            console.error('Error reading local symptoms', e);
        }
    };

    const handleDeleteRecord = (id: string) => {
        const updated = records.filter((r) => r.id !== id);
        setRecords(updated);
        try {
            localStorage.setItem('influenza_gejala_saya', JSON.stringify(updated));
        } catch (e) {
            console.error(e);
        }
        if (selectedCard?.id === id) {
            setSelectedCard(null);
        }
    };

    const handleClearAll = () => {
        if (window.confirm('Hapus seluruh riwayat kartu gejala dari perangkat ini?')) {
            localStorage.removeItem('influenza_gejala_saya');
            setRecords([]);
            setSelectedCard(null);
        }
    };

    const getSymptomMeta = (id: string) => {
        return symptomsList.find((s) => s.id === id) || { nama: id, icon: '😷' };
    };

    return (
        <div className="space-y-4 pb-16 animate-in fade-in duration-150">
            {/* Mobile Header (Hidden in desktop since App.tsx header already shows title) */}
            {!isDesktop && (
                <div className="flex items-center justify-between pt-1">
                    <div>
                        <h1 className="text-xl font-black text-slate-900 flex items-center gap-2">
                            <UserCheck size={20} className="text-teal-700" />
                            <span>Gejala Saya</span>
                        </h1>
                        <p className="text-[11px] text-slate-500 font-medium">
                            Kartu riwayat laporan lokal di perangkat ini
                        </p>
                    </div>
                    {records.length > 0 && (
                        <button
                            onClick={handleClearAll}
                            className="text-xs text-rose-600 hover:text-rose-800 font-semibold cursor-pointer"
                        >
                            Hapus Semua
                        </button>
                    )}
                </div>
            )}

            {/* Desktop Overview & Action Toolbar */}
            {isDesktop && (
                <div className="bg-white rounded-2xl p-4 border border-slate-200/90 shadow-xs flex flex-wrap items-center justify-between gap-3">
                    <div className="flex items-center space-x-6">
                        <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 rounded-xl bg-teal-50 text-teal-700 flex items-center justify-center font-bold text-lg">
                                📋
                            </div>
                            <div>
                                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                                    Riwayat Tersimpan
                                </span>
                                <span className="text-base font-extrabold text-slate-900">
                                    {records.length} Laporan Gejala
                                </span>
                            </div>
                        </div>

                        <div className="h-8 w-px bg-slate-200 hidden sm:block" />

                        <div className="flex items-center space-x-2 text-xs text-slate-600">
                            <Lock size={15} className="text-teal-600 shrink-0" />
                            <span>Tersimpan di peramban lokal perangkatmu</span>
                        </div>
                    </div>

                    <div className="flex items-center space-x-2">
                        <button
                            onClick={onStartReport}
                            className="py-2 px-3.5 bg-teal-700 hover:bg-teal-800 text-white rounded-xl font-bold text-xs inline-flex items-center space-x-1.5 transition-colors cursor-pointer shadow-xs"
                        >
                            <PlusCircle size={15} />
                            <span>Lapor Gejala Baru</span>
                        </button>
                        {records.length > 0 && (
                            <button
                                onClick={handleClearAll}
                                className="py-2 px-3 text-rose-600 hover:bg-rose-50 rounded-xl font-semibold text-xs inline-flex items-center space-x-1 transition-colors cursor-pointer border border-rose-200"
                            >
                                <Trash2 size={14} />
                                <span>Hapus Semua</span>
                            </button>
                        )}
                    </div>
                </div>
            )}

            {/* Privacy notice banner for mobile */}
            {!isDesktop && (
                <div className="bg-teal-50/70 border border-teal-200/90 rounded-2xl p-3.5 flex items-start space-x-2.5 text-xs text-teal-900 shadow-xs">
                    <Lock size={16} className="text-teal-700 flex-shrink-0 mt-0.5" />
                    <p className="leading-relaxed text-[11px]">
                        <strong>Penyimpanan Lokal:</strong> Data ini hanya tersimpan di browser perangkat kamu dan tidak dijadikan rekam medis server.
                    </p>
                </div>
            )}

            {/* Empty state if no records */}
            {records.length === 0 ? (
                <div className="bg-white rounded-2xl p-12 border border-slate-200/90 text-center space-y-4 max-w-xl mx-auto shadow-xs my-8">
                    <div className="w-14 h-14 rounded-2xl bg-teal-50 text-teal-700 flex items-center justify-center mx-auto">
                        <UserCheck size={26} />
                    </div>
                    <div>
                        <h3 className="font-extrabold text-slate-900 text-lg">Belum Ada Riwayat Gejala</h3>
                        <p className="text-sm text-slate-500 mt-2 leading-relaxed">
                            Setiap kali kamu melaporkan keluhan kesehatan pernapasan, kartu riwayat dan rekomendasi triase mandiri akan otomatis tercatat rapi di sini.
                        </p>
                    </div>
                    <button
                        onClick={onStartReport}
                        className="py-3 px-6 bg-teal-700 hover:bg-teal-800 text-white rounded-xl font-bold text-sm inline-flex items-center space-x-2 cursor-pointer shadow-md shadow-teal-700/20 transition-all"
                    >
                        <PlusCircle size={18} />
                        <span>Laporkan Gejala Sekarang</span>
                    </button>
                </div>
            ) : (
                /* Grid cards: 3 columns on large desktop, 2 on medium, 1 on mobile */
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {records.map((rec) => {
                        const dateFormatted = new Date(rec.created_at).toLocaleDateString('id-ID', {
                            day: 'numeric',
                            month: 'long',
                            year: 'numeric',
                        });

                        const isGawat = rec.triage?.level === 'gawat_darurat';
                        const isPerlu = rec.triage?.level === 'perlu_pemeriksaan';

                        return (
                            <div
                                key={rec.id}
                                className="bg-white rounded-2xl p-6 border border-slate-200/90 shadow-xs flex flex-col justify-between space-y-4 transition-all hover:shadow-lg hover:border-slate-300"
                            >
                                <div className="space-y-3.5">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center space-x-1.5 text-xs text-slate-500 font-medium">
                                            <Calendar size={14} className="text-teal-600" />
                                            <span>Tanggal:</span>
                                            <strong className="text-slate-800">{dateFormatted}</strong>
                                        </div>
                                        <span
                                            className={`px-3 py-1 rounded-full text-xs font-bold ${
                                                isGawat
                                                    ? 'bg-rose-100 text-rose-800 border border-rose-200'
                                                    : isPerlu
                                                    ? 'bg-amber-100 text-amber-800 border border-amber-200'
                                                    : 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                                            }`}
                                        >
                                            {rec.triage?.badge || 'Gejala Ringan'}
                                        </span>
                                    </div>

                                    <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-slate-600">
                                        <MapPin size={15} className="text-teal-600 shrink-0" />
                                        <span>Wilayah: <strong>{rec.location_nama}</strong></span>
                                        <span className="text-slate-400">·</span>
                                        <Clock size={14} className="text-slate-400 shrink-0" />
                                        <span>Durasi: <strong>{rec.duration_days} hari</strong></span>
                                    </div>

                                    {/* Symptoms list */}
                                    <div className="space-y-1.5">
                                        <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                                            Gejala yang dirasakan:
                                        </span>
                                        <div className="flex flex-wrap gap-2">
                                            {rec.symptoms.map((symId) => {
                                                const meta = getSymptomMeta(symId);
                                                return (
                                                    <span
                                                        key={symId}
                                                        className="inline-flex items-center gap-1 text-xs font-medium text-slate-600"
                                                    >
                                                        <span>{meta.icon}</span>
                                                        <span>{meta.nama}</span>
                                                    </span>
                                                );
                                            })}
                                        </div>
                                    </div>
                                </div>

                                {/* Actions: [ Lihat ] [ Hapus ] */}
                                <div className="flex items-center space-x-2 pt-3.5 border-t border-slate-100">
                                    <button
                                        onClick={() => onViewTriageDetails(rec.triage, rec.location_nama)}
                                        className="flex-1 py-2.5 px-3 bg-teal-50 hover:bg-teal-100 text-teal-800 rounded-xl font-bold text-xs flex items-center justify-center space-x-1.5 transition-colors cursor-pointer"
                                    >
                                        <Eye size={15} />
                                        <span>Lihat Arahan Triase</span>
                                    </button>
                                    <button
                                        onClick={() => handleDeleteRecord(rec.id)}
                                        className="py-2.5 px-3 text-rose-600 hover:bg-rose-50 rounded-xl font-semibold text-xs flex items-center space-x-1 transition-colors cursor-pointer border border-transparent hover:border-rose-100"
                                        title="Hapus kartu ini"
                                    >
                                        <Trash2 size={15} />
                                        <span>Hapus</span>
                                    </button>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
};
