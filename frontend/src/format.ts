/**
 * Format angka persen dengan kebiasaan Indonesia (koma sebagai pemisah desimal),
 * sekaligus memangkas angka di belakang koma yang tidak ada gunanya.
 *
 *   23.351 -> "23,4%"    20 -> "20%"    NaN -> "–"
 */
export function formatPersen(nilai: number, desimal = 1): string {
    if (!Number.isFinite(nilai)) return '–';
    const dibulatkan = Number(nilai.toFixed(desimal));
    return `${dibulatkan.toLocaleString('id-ID', { maximumFractionDigits: desimal })}%`;
}
