import { DashboardResponseData, LocationItem, PetaDataResponse, SubmitReportResponse, SymptomItem } from './types';

// Default: same-origin '/api' (dev lewat proxy Vite).
// Saat FE dan BE dipisah (mis. Render), set VITE_API_BASE saat build:
//   VITE_API_BASE=https://<backend>.onrender.com/api
const API_BASE = import.meta.env.VITE_API_BASE || '/api';

export async function fetchLokasi(): Promise<LocationItem[]> {
    const res = await fetch(`${API_BASE}/lokasi`);
    if (!res.ok) {
        throw new Error('Gagal memuat data lokasi');
    }
    const json = await res.json();
    return json.data;
}

export async function fetchGejala(): Promise<SymptomItem[]> {
    const res = await fetch(`${API_BASE}/gejala`);
    if (!res.ok) {
        throw new Error('Gagal memuat daftar gejala');
    }
    const json = await res.json();
    return json.data;
}

export async function submitLapor(payload: {
    location_id: string;
    symptoms: string[];
    duration_days: number;
}): Promise<SubmitReportResponse['data']> {
    const res = await fetch(`${API_BASE}/lapor`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'X-Requested-With': 'XMLHttpRequest',
        },
        body: JSON.stringify(payload),
    });

    if (!res.ok) {
        const errJson = await res.json().catch(() => null);
        throw new Error(errJson?.message || 'Gagal mengirim laporan gejala');
    }

    const json = await res.json();
    return json.data;
}

export async function fetchPeta(): Promise<PetaDataResponse> {
    const res = await fetch(`${API_BASE}/peta`);
    if (!res.ok) {
        throw new Error('Gagal memuat data peta');
    }
    const json = await res.json();
    return json.data;
}

export async function fetchLokasiTren(id: string): Promise<LocationItem> {
    const res = await fetch(`${API_BASE}/lokasi/${id}/tren`);
    if (!res.ok) {
        throw new Error('Gagal memuat data tren wilayah');
    }
    const json = await res.json();
    return json.data;
}

export async function fetchDashboard(): Promise<DashboardResponseData> {
    const res = await fetch(`${API_BASE}/dashboard`);
    if (!res.ok) {
        throw new Error('Gagal memuat data dashboard');
    }
    const json = await res.json();
    return json.data;
}

export function getExportCsvUrl(): string {
    return `${API_BASE}/dashboard.csv`;
}
