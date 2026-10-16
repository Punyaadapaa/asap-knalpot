import { LocationItem } from './types';

/** Jarak dua titik koordinat dalam kilometer (rumus haversine). */
export function jarakKm(
    lat1: number,
    lng1: number,
    lat2: number,
    lng2: number
): number {
    const R = 6371; // jari-jari bumi (km)
    const rad = Math.PI / 180;
    const dLat = (lat2 - lat1) * rad;
    const dLng = (lng2 - lng1) * rad;
    const a =
        Math.sin(dLat / 2) ** 2 +
        Math.cos(lat1 * rad) * Math.cos(lat2 * rad) * Math.sin(dLng / 2) ** 2;
    return 2 * R * Math.asin(Math.sqrt(a));
}

/**
 * Kecamatan terdekat dari sebuah titik koordinat.
 *
 * Selalu mengembalikan yang terdekat selama daftar kecamatan tidak kosong —
 * termasuk kalau titiknya berada di luar Kota Yogyakarta (mis. Sleman), karena
 * data yang tersedia hanya 14 kecamatan Kota Yogyakarta dan wilayah tetangga
 * tetap dipetakan ke kecamatan yang paling dekat.
 */
export function kecamatanTerdekat(
    locations: LocationItem[],
    lat: number,
    lng: number
): { location: LocationItem; jarakKm: number } | null {
    let terdekat: LocationItem | null = null;
    let jarak = Infinity;

    for (const loc of locations) {
        const d = jarakKm(lat, lng, loc.latitude, loc.longitude);
        if (d < jarak) {
            jarak = d;
            terdekat = loc;
        }
    }

    if (!terdekat) return null;
    return { location: terdekat, jarakKm: jarak };
}
