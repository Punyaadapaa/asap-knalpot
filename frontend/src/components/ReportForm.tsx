import React, { useState } from 'react';
import { ArrowLeft, ArrowRight, CheckCircle2, Lock, MapPin, Clock, Sparkles } from 'lucide-react';
import { LocationItem, SymptomItem, SubmitReportResponse } from '../types';
import { SymptomCard } from './SymptomCard';
import { submitLapor } from '../api';
import { kecamatanTerdekat } from '../geo';

interface ReportFormProps {
    locations: LocationItem[];
    symptoms: SymptomItem[];
    defaultLocationId?: string;
    onReportSuccess: (response: SubmitReportResponse['data']) => void;
    onCancel: () => void;
}

export const ReportForm: React.FC<ReportFormProps> = ({
    locations,
    symptoms,
    defaultLocationId,
    onReportSuccess,
    onCancel,
}) => {
    const [step, setStep] = useState<1 | 2 | 3>(1);
    const [selectedLocationId, setSelectedLocationId] = useState<string>(
        defaultLocationId || locations[0]?.id || ''
    );
    const [selectedSymptoms, setSelectedSymptoms] = useState<string[]>([]);
    const [durationDays, setDurationDays] = useState<number>(1);
    const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [isLocating, setIsLocating] = useState<boolean>(false);
    const [detectedLocationId, setDetectedLocationId] = useState<string | null>(null);
    const [locationHint, setLocationHint] = useState<{
        tone: 'success' | 'error';
        text: string;
    } | null>(null);

    const toggleSymptom = (id: string) => {
        setSelectedSymptoms((prev) =>
            prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
        );
    };

    // Deteksi lokasi asli lewat peramban, lalu petakan ke kecamatan terdekat
    // dari daftar yang sudah dimuat. Wilayah di luar Kota Yogyakarta (mis.
    // Sleman) tetap dipetakan ke kecamatan terdekat, tanpa peringatan.
    const handleUseMyLocation = () => {
        if (isLocating) return;

        if (locations.length === 0) {
            setLocationHint({ tone: 'error', text: 'Daftar kecamatan belum termuat.' });
            return;
        }
        if (!('geolocation' in navigator)) {
            setLocationHint({
                tone: 'error',
                text: 'Peramban ini tidak mendukung deteksi lokasi. Silakan pilih kecamatan manual.',
            });
            return;
        }

        setIsLocating(true);
        setLocationHint(null);

        navigator.geolocation.getCurrentPosition(
            (pos) => {
                const hasil = kecamatanTerdekat(
                    locations,
                    pos.coords.latitude,
                    pos.coords.longitude
                );

                if (!hasil) {
                    setLocationHint({
                        tone: 'error',
                        text: 'Kecamatan terdekat tidak dapat ditentukan. Silakan pilih kecamatan manual.',
                    });
                } else {
                    setSelectedLocationId(hasil.location.id);
                    setDetectedLocationId(hasil.location.id);
                    setLocationHint({
                        tone: 'success',
                        text:
                            hasil.jarakKm <= 5
                                ? `Terdeteksi ${hasil.location.nama} (±${hasil.jarakKm.toFixed(1)} km dari pusat kecamatan).`
                                : `Wilayah terdekat: ${hasil.location.nama}.`,
                    });
                }
                setIsLocating(false);
            },
            (err) => {
                setLocationHint({
                    tone: 'error',
                    text:
                        err.code === err.PERMISSION_DENIED
                            ? 'Izin lokasi ditolak. Silakan pilih kecamatan manual.'
                            : 'Lokasi tidak dapat dideteksi. Silakan pilih kecamatan manual.',
                });
                setIsLocating(false);
            },
            { enableHighAccuracy: false, timeout: 8000, maximumAge: 300000 }
        );
    };

    const handleSubmit = async () => {
        if (selectedSymptoms.length === 0) {
            setErrorMessage('Pilih minimal satu gejala');
            return;
        }

        setIsSubmitting(true);
        setErrorMessage(null);

        try {
            const data = await submitLapor({
                location_id: selectedLocationId,
                symptoms: selectedSymptoms,
                duration_days: durationDays,
            });

            // Save to LocalStorage for "Gejala Saya"
            try {
                const existing = JSON.parse(localStorage.getItem('influenza_gejala_saya') || '[]');
                const newRecord = {
                    id: String(data.report_id || Date.now()),
                    created_at: data.created_at,
                    location_id: data.location.id,
                    location_nama: data.location.nama,
                    symptoms: data.symptoms,
                    duration_days: data.duration_days,
                    triage: data.triage,
                };
                localStorage.setItem(
                    'influenza_gejala_saya',
                    JSON.stringify([newRecord, ...existing.slice(0, 9)])
                );
            } catch (err) {
                console.error('Failed to save local symptom card', err);
            }

            onReportSuccess(data);
        } catch (err: any) {
            setErrorMessage(err.message || 'Terjadi kesalahan saat mengirim laporan');
        } finally {
            setIsSubmitting(false);
        }
    };

    const selectedLocation = locations.find((l) => l.id === selectedLocationId) || locations[0];

    return (
        <div className="bg-white rounded-2xl p-5 md:p-7 border border-slate-200/90 shadow-sm transition-all max-w-xl md:max-w-2xl mx-auto">
            {/* Header with Back button and Title */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
                <button
                    onClick={() => {
                        if (step > 1) setStep((step - 1) as any);
                        else onCancel();
                    }}
                    className="p-1.5 rounded-xl text-slate-500 hover:text-slate-800 hover:bg-slate-100 cursor-pointer flex items-center space-x-1"
                >
                    <ArrowLeft size={18} />
                    <span className="text-xs font-semibold">Kembali</span>
                </button>
                <span className="text-xs font-bold text-slate-500">
                    Langkah {step} dari 3
                </span>
            </div>

            {/* Step Progress Bar (Section 7, 8, 9) */}
            <div className="flex items-center justify-center space-x-2 mb-6">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${step >= 1 ? 'bg-teal-600 text-white' : 'bg-slate-200 text-slate-500'}`}>
                    1
                </div>
                <div className={`h-1 w-12 sm:w-20 rounded-full ${step >= 2 ? 'bg-teal-600' : 'bg-slate-200'}`} />
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${step >= 2 ? 'bg-teal-600 text-white' : 'bg-slate-200 text-slate-500'}`}>
                    2
                </div>
                <div className={`h-1 w-12 sm:w-20 rounded-full ${step >= 3 ? 'bg-teal-600' : 'bg-slate-200'}`} />
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${step === 3 ? 'bg-teal-600 text-white' : 'bg-slate-200 text-slate-500'}`}>
                    3
                </div>
            </div>

            {/* Error banner if any */}
            {errorMessage && (
                <div className="mb-4 p-3 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl text-xs font-medium">
                    {errorMessage}
                </div>
            )}

            {/* STEP 1: Lokasi */}
            {step === 1 && (
                <div className="space-y-4 animate-in fade-in duration-200">
                    <div>
                        <h2 className="text-xl font-bold text-slate-900">Di wilayah mana kamu berada?</h2>
                        <p className="text-xs text-slate-500 mt-1">
                            Data dicatat secara agregat pada tingkat kecamatan untuk melindungi privasi.
                        </p>
                    </div>

                    <div className="space-y-2">
                        <label className="text-xs font-bold uppercase text-slate-600 tracking-wider">
                            Pilih Kecamatan
                        </label>
                        <select
                            value={selectedLocationId}
                            onChange={(e) => {
                                setSelectedLocationId(e.target.value);
                                setDetectedLocationId(null);
                                setLocationHint(null);
                            }}
                            className="w-full h-12 px-3.5 rounded-2xl border border-slate-300 bg-white text-slate-800 font-semibold focus:outline-none focus:ring-2 focus:ring-teal-600 text-sm"
                        >
                            {locations.map((loc) => (
                                <option key={loc.id} value={loc.id}>
                                    {loc.nama}, {loc.kota}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="space-y-1.5">
                        <button
                            type="button"
                            onClick={handleUseMyLocation}
                            disabled={isLocating}
                            className="w-full py-2.5 px-3 bg-teal-50 hover:bg-teal-100 text-teal-800 rounded-xl text-xs font-semibold flex items-center justify-center space-x-1.5 transition-colors cursor-pointer disabled:opacity-60 disabled:cursor-default"
                        >
                            <MapPin size={15} />
                            <span>
                                {isLocating
                                    ? 'Mendeteksi lokasi…'
                                    : detectedLocationId
                                      ? `Gunakan Lokasi Saat Ini (${selectedLocation?.nama})`
                                      : 'Gunakan Lokasi Saat Ini'}
                            </span>
                        </button>
                        {locationHint && (
                            <p
                                className={`text-2xs leading-relaxed ${
                                    locationHint.tone === 'success'
                                        ? 'text-teal-700'
                                        : locationHint.tone === 'error'
                                          ? 'text-rose-600'
                                          : 'text-slate-500'
                                }`}
                            >
                                {locationHint.text}
                            </p>
                        )}
                    </div>

                    <button
                        type="button"
                        onClick={() => setStep(2)}
                        className="w-full h-12 bg-teal-700 hover:bg-teal-800 text-white rounded-2xl font-bold text-sm shadow-md flex items-center justify-center space-x-2 transition-all cursor-pointer mt-4"
                    >
                        <span>Lanjut ke Pilih Gejala</span>
                        <ArrowRight size={16} />
                    </button>
                </div>
            )}

            {/* STEP 2: Pilih Gejala & Durasi */}
            {step === 2 && (
                <div className="space-y-4 animate-in fade-in duration-200">
                    <div>
                        <h2 className="text-xl font-bold text-slate-900">Apa yang kamu rasakan?</h2>
                        <p className="text-xs text-slate-500 mt-1">
                            Pilih semua gejala yang sedang kamu alami.
                        </p>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 max-h-72 overflow-y-auto pr-1">
                        {symptoms.map((symptom) => (
                            <SymptomCard
                                key={symptom.id}
                                symptom={symptom}
                                selected={selectedSymptoms.includes(symptom.id)}
                                onToggle={toggleSymptom}
                            />
                        ))}
                    </div>

                    <div className="pt-2 border-t border-slate-100">
                        <label className="text-xs font-bold uppercase text-slate-600 tracking-wider block mb-1.5 flex items-center space-x-1">
                            <Clock size={14} className="text-teal-600" />
                            <span>Durasi Gejala</span>
                        </label>
                        <select
                            value={durationDays}
                            onChange={(e) => setDurationDays(Number(e.target.value))}
                            className="w-full h-12 px-3.5 rounded-2xl border border-slate-300 bg-white text-slate-800 font-semibold focus:outline-none focus:ring-2 focus:ring-teal-600 text-sm"
                        >
                            <option value={1}>1 hari</option>
                            <option value={2}>2 hari</option>
                            <option value={3}>3 hari</option>
                            <option value={4}>4 hari</option>
                            <option value={5}>5 hari</option>
                            <option value={7}>7 hari atau lebih</option>
                        </select>
                    </div>

                    <button
                        type="button"
                        onClick={() => {
                            if (selectedSymptoms.length === 0) {
                                setErrorMessage('Pilih minimal satu gejala');
                                return;
                            }
                            setErrorMessage(null);
                            setStep(3);
                        }}
                        className="w-full h-12 bg-teal-700 hover:bg-teal-800 text-white rounded-2xl font-bold text-sm shadow-md flex items-center justify-center space-x-2 transition-all cursor-pointer mt-4"
                    >
                        <span>Lanjut ke Konfirmasi</span>
                        <ArrowRight size={16} />
                    </button>
                </div>
            )}

            {/* STEP 3: Konfirmasi Laporan */}
            {step === 3 && (
                <div className="space-y-4 animate-in fade-in duration-200">
                    <div>
                        <h2 className="text-xl font-bold text-slate-900">Periksa Laporan</h2>
                        <p className="text-xs text-slate-500 mt-1">
                            Pastikan data laporan gejala sudah benar sebelum dikirim.
                        </p>
                    </div>

                    <div className="border-t border-slate-200 pt-4 space-y-3">
                        <div className="flex items-start justify-between">
                            <div className="flex items-center space-x-2 text-xs text-slate-500">
                                <MapPin size={15} className="text-teal-600" />
                                <span className="font-semibold">Lokasi Kecamatan</span>
                            </div>
                            <span className="text-sm font-bold text-slate-900">
                                {selectedLocation?.nama}, {selectedLocation?.kota}
                            </span>
                        </div>

                        <div className="pt-1">
                            <div className="flex items-center space-x-2 text-xs text-slate-500 mb-2">
                                <span className="font-semibold">Gejala yang Dipilih</span>
                            </div>
                            <div className="flex flex-wrap gap-1.5">
                                {selectedSymptoms.map((id) => {
                                    const s = symptoms.find((sym) => sym.id === id);
                                    return (
                                        <span
                                            key={id}
                                            className="inline-flex items-center px-2.5 py-1 rounded-xl bg-white border border-slate-200 text-xs font-semibold text-slate-800 shadow-xs"
                                        >
                                            
                                            <span>{s?.nama || id}</span>
                                        </span>
                                    );
                                })}
                            </div>
                        </div>

                        <div className="flex items-center justify-between border-t border-slate-200/60 pt-2">
                            <div className="flex items-center space-x-2 text-xs text-slate-500">
                                <Clock size={15} className="text-teal-600" />
                                <span className="font-semibold">Durasi</span>
                            </div>
                            <span className="text-sm font-bold text-slate-900">
                                {durationDays} hari
                            </span>
                        </div>
                    </div>

                    {/* Privacy Guarantee Box (Section 9) */}
                    <div className="bg-teal-50/70 border border-teal-200/90 rounded-2xl p-3 flex items-start space-x-2.5 text-xs text-teal-900">
                        <Lock size={16} className="text-teal-700 flex-shrink-0 mt-0.5" />
                        <div>
                            <strong className="font-bold block">Privasi Terjamin</strong>
                            <p className="text-2xs text-teal-800 mt-0.5 leading-relaxed">
                                Sistem tidak meminta nama atau NIK. Laporan diproses secara anonim untuk sinyal kesehatan publik.
                            </p>
                        </div>
                    </div>

                    <button
                        type="button"
                        onClick={handleSubmit}
                        disabled={isSubmitting}
                        className="w-full h-12 bg-teal-700 hover:bg-teal-800 text-white rounded-2xl font-bold text-sm shadow-md flex items-center justify-center space-x-2 transition-all cursor-pointer disabled:opacity-50"
                    >
                        {isSubmitting ? (
                            <span>Mengirim Laporan...</span>
                        ) : (
                            <>
                                <CheckCircle2 size={18} />
                                <span>Kirim Laporan</span>
                            </>
                        )}
                    </button>
                </div>
            )}
        </div>
    );
};
