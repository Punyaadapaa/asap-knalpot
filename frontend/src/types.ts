export interface LocationItem {
    id: string;
    nama: string;
    kota: string;
    latitude: number;
    longitude: number;
    aqi: number;
    aqi_category: string;
    aqi_source: string;
    aqi_updated_at: string;
    rth_percentage: number;
    total_reports_7d: number | null;
    raw_reports_count?: number;
    previous_reports_7d: number | null;
    change_percent: number | null;
    status: 'normal' | 'naik' | 'data_belum_cukup';
    privacy_hidden: boolean;
    daily_trend: Array<{
        date: string;
        label: string;
        count: number | null;
    }>;
}

export interface SymptomItem {
    id: string;
    nama: string;
    is_emergency: boolean;
    sort_order?: number;
}

export interface TriageAction {
    label: string;
    type: string;
    target: string;
    primary?: boolean;
}

export interface TriageResultData {
    level: 'ringan' | 'perlu_pemeriksaan' | 'gawat_darurat';
    title: string;
    badge: string;
    color: 'success' | 'warning' | 'danger';
    description: string;
    subtext: string;
    recommendations: string[];
    actions: TriageAction[];
}

export interface SubmitReportResponse {
    status: string;
    message: string;
    data: {
        report_id: number;
        location: {
            id: string;
            nama: string;
            kota: string;
        };
        symptoms: string[];
        duration_days: number;
        triage: TriageResultData;
        created_at: string;
    };
}

export interface LocalSymptomCard {
    id: string;
    created_at: string;
    location_id: string;
    location_nama: string;
    symptoms: string[];
    duration_days: number;
    triage: TriageResultData;
}

export interface PetaDataResponse {
    locations: LocationItem[];
    layers: Array<{
        id: 'gejala' | 'aqi' | 'rth';
        name: string;
        description: string;
    }>;
    legend: {
        gejala: Array<{ label: string; color: string; status: string; desc: string }>;
        aqi: Array<{ label: string; color: string }>;
        rth: Array<{ label: string; color: string }>;
    };
}

export interface DashboardResponseData {
    summary: {
        total_laporan: number;
        wilayah_meningkat: number;
        perubahan_mingguan: number;
        area_terpantau: number;
    };
    trend_chart: Array<{
        date: string;
        label: string;
        count: number;
    }>;
    kecamatan_list: LocationItem[];
    last_updated: string;
}
