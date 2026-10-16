import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { Info, X } from 'lucide-react';

interface InfoModalProps {
    /** Judul di dalam modal, mis. "Tentang Data Kualitas Udara". */
    title: string;
    /** Teks kecil pada tombol pemicu. */
    buttonLabel?: string;
    /** Ganti kelas tombol kalau perlu menyesuaikan tempat. */
    buttonClassName?: string;
    /** Isi penjelasan, ditulis dalam bahasa awam. */
    children: React.ReactNode;
}

const TOMBOL_DEFAULT =
    'shrink-0 text-slate-500 hover:text-slate-800 text-xs flex items-center space-x-1 bg-white/80 backdrop-blur-xs px-2.5 py-1 rounded-full border border-slate-200/80 cursor-pointer transition-colors';

/**
 * Tombol kecil "Tentang data" yang membuka modal penjelasan istilah.
 * Modal dirender lewat portal ke <body> supaya selalu menutup seluruh layar
 * (tidak terpotong wadahnya) dan berada di atas kanvas peta.
 */
export const InfoModal: React.FC<InfoModalProps> = ({
    title,
    buttonLabel = 'Tentang data',
    buttonClassName = TOMBOL_DEFAULT,
    children,
}) => {
    const [buka, setBuka] = useState(false);

    useEffect(() => {
        if (!buka) return;
        const onKey = (e: KeyboardEvent) => {
            if (e.key === 'Escape') setBuka(false);
        };
        document.addEventListener('keydown', onKey);
        document.body.classList.add('modal-blur');
        return () => {
            document.removeEventListener('keydown', onKey);
            document.body.classList.remove('modal-blur');
        };
    }, [buka]);

    return (
        <>
            <button
                type="button"
                onClick={() => setBuka(true)}
                className={buttonClassName}
                title={title}
            >
                <Info size={13} />
                <span>{buttonLabel}</span>
            </button>

            {buka &&
                createPortal(
                    <div
                        className="fixed inset-0 z-[9999] bg-slate-900/45 flex items-center justify-center p-4"
                        role="dialog"
                        aria-modal="true"
                        aria-label={title}
                        onClick={() => setBuka(false)}
                    >
                        <div
                            className="bg-white rounded-2xl max-w-sm w-full p-5 shadow-2xl border border-slate-100 animate-in fade-in zoom-in-95 duration-200 max-h-[85vh] overflow-y-auto"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className="flex items-center justify-between mb-3">
                                <h3 className="font-bold text-slate-900 flex items-center space-x-2">
                                    <Info size={18} className="text-teal-600 shrink-0" />
                                    <span>{title}</span>
                                </h3>
                                <button
                                    onClick={() => setBuka(false)}
                                    className="p-1 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 cursor-pointer"
                                    aria-label="Tutup"
                                >
                                    <X size={18} />
                                </button>
                            </div>

                            <div className="text-sm text-slate-600 space-y-2">{children}</div>

                            <button
                                onClick={() => setBuka(false)}
                                className="mt-4 w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-semibold text-sm rounded-xl cursor-pointer"
                            >
                                Mengerti
                            </button>
                        </div>
                    </div>,
                    document.body
                )}
        </>
    );
};
