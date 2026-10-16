import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { formatPersen } from '../format';
import {
    Wind,
    Trees,
    Activity,
    ChevronRight,
    Lock,
    Navigation,
    Plus,
    Minus,
    Maximize2,
    Minimize2,
    Layers,
    MapPin,
} from 'lucide-react';
import { LocationItem } from '../types';

interface MapViewProps {
    locations: LocationItem[];
    activeLayer: 'gejala' | 'aqi' | 'rth';
    onLayerChange: (layer: 'gejala' | 'aqi' | 'rth') => void;
    selectedLocation: LocationItem | null;
    onSelectLocation: (loc: LocationItem) => void;
    onViewDetail: (id: string) => void;
}

export const MapView: React.FC<MapViewProps> = ({
    locations,
    activeLayer,
    onLayerChange,
    selectedLocation,
    onSelectLocation,
    onViewDetail,
}) => {
    const mapContainerRef = useRef<HTMLDivElement>(null);
    const mapInstanceRef = useRef<L.Map | null>(null);
    const tileLayerRef = useRef<L.TileLayer | null>(null);
    const markersLayerRef = useRef<L.LayerGroup | null>(null);
    const circleOverlayRef = useRef<L.Circle | null>(null);

    const [mapStyle, setMapStyle] = useState<'streets' | 'satellite'>('streets');
    const [isExpanded, setIsExpanded] = useState<boolean>(false);

    // Color theme helper
    const getPinColor = (loc: LocationItem) => {
        if (activeLayer === 'gejala') {
            if (loc.privacy_hidden || loc.status === 'data_belum_cukup') return '#64748b';
            if (loc.status === 'naik') return '#ea580c';
            return '#0d9488';
        }
        if (activeLayer === 'aqi') {
            if (loc.aqi <= 50) return '#10b981';
            if (loc.aqi <= 100) return '#f59e0b';
            if (loc.aqi <= 199) return '#ea580c';
            return '#8b5cf6';
        }
        if (activeLayer === 'rth') {
            if (loc.rth_percentage >= 20) return '#059669';
            if (loc.rth_percentage >= 15) return '#0d9488';
            return '#d97706';
        }
        return '#0d9488';
    };

    // 1. Initialize Leaflet Map
    useEffect(() => {
        if (!mapContainerRef.current) return;
        if (mapInstanceRef.current) return;

        // Center of Kota Yogyakarta
        const map = L.map(mapContainerRef.current, {
            center: [-7.8014, 110.3745],
            zoom: 13,
            minZoom: 11,
            maxZoom: 18,
            zoomControl: false,
            attributionControl: false,
        });

        // OpenStreetMap standard tiles — 100% free, no API key needed
        const streetTiles = L.tileLayer(
            'https://tile.openstreetmap.org/{z}/{x}/{y}.png',
            {
                maxZoom: 19,
                attribution: '© <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener">OpenStreetMap</a> contributors',
            }
        );

        streetTiles.addTo(map);
        tileLayerRef.current = streetTiles;

        // Attribution control
        L.control
            .attribution({ position: 'bottomright', prefix: false })
            .addTo(map);

        const markersLayer = L.layerGroup().addTo(map);
        markersLayerRef.current = markersLayer;
        mapInstanceRef.current = map;

        // Invalidate size to ensure crisp rendering after layout settles
        const timer = setTimeout(() => {
            map.invalidateSize();
        }, 200);

        return () => {
            clearTimeout(timer);
            map.remove();
            mapInstanceRef.current = null;
        };
    }, []);

    // 2. Handle Basemap Switch (Streets vs Satellite)
    useEffect(() => {
        const map = mapInstanceRef.current;
        if (!map) return;

        if (tileLayerRef.current) {
            map.removeLayer(tileLayerRef.current);
        }

        let newLayer: L.TileLayer;
        if (mapStyle === 'satellite') {
            // Esri World Imagery — 100% free, no API key
            newLayer = L.tileLayer(
                'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
                {
                    maxZoom: 18,
                    attribution:
                        'Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community',
                }
            );
        } else {
            // OpenStreetMap standard — 100% free, no API key
            newLayer = L.tileLayer(
                'https://tile.openstreetmap.org/{z}/{x}/{y}.png',
                {
                    maxZoom: 19,
                    attribution:
                        '© <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener">OpenStreetMap</a> contributors',
                }
            );
        }

        newLayer.addTo(map);
        tileLayerRef.current = newLayer;
    }, [mapStyle]);

    // 3. Render Custom Google Maps-Style Pins & District Boundaries
    useEffect(() => {
        const map = mapInstanceRef.current;
        const markersGroup = markersLayerRef.current;
        if (!map || !markersGroup) return;

        markersGroup.clearLayers();

        locations.forEach((loc) => {
            const isSelected = selectedLocation?.id === loc.id;
            const pinColor = getPinColor(loc);

            // Badge text or icon inside the pin
            let badgeText = '';
            if (activeLayer === 'gejala') {
                badgeText = loc.privacy_hidden ? '🔒' : `${loc.total_reports_7d ?? '•'}`;
            } else if (activeLayer === 'aqi') {
                badgeText = `${loc.aqi}`;
            } else {
                badgeText = `${Math.round(loc.rth_percentage)}%`;
            }

            const isPulsing = activeLayer === 'gejala' && loc.status === 'naik';

            // Custom HTML Marker matching Google Maps Pin aesthetics with badges
            const iconHtml = `
                <div class="relative flex flex-col items-center group cursor-pointer transition-transform duration-200 ${
                    isSelected ? 'scale-110 z-50' : 'hover:scale-105 z-20'
                }" style="transform-origin: bottom center;">
                    ${
                        isPulsing
                            ? `<span class="absolute -top-1.5 w-11 h-11 rounded-full bg-orange-500/40 animate-ping pointer-events-none"></span>`
                            : ''
                    }
                    
                    <!-- Teardrop Pin Shape -->
                    <div class="relative w-9 h-11 drop-shadow-md flex items-center justify-center">
                        <svg viewBox="0 0 36 44" fill="none" class="w-full h-full">
                            <path d="M18 43C18 43 34 27.5 34 18C34 9.16344 26.8366 2 18 2C9.16344 2 2 9.16344 2 18C2 27.5 18 43 18 43Z" 
                                  fill="${pinColor}" 
                                  stroke="${isSelected ? '#ffffff' : 'rgba(255,255,255,0.85)'}" 
                                  stroke-width="${isSelected ? '2.5' : '1.5'}"
                            />
                        </svg>

                        <!-- Inner Badge Content -->
                        <div class="absolute top-2 w-5 h-5 rounded-full bg-white/95 text-slate-900 font-extrabold text-[10px] flex items-center justify-center shadow-xs">
                            ${badgeText}
                        </div>
                    </div>

                    <!-- Label Pill Below Pin -->
                    <div class="mt-0.5 px-2 py-0.5 rounded-full text-[10px] font-bold tracking-tight shadow-md border pointer-events-none whitespace-nowrap transition-colors ${
                        isSelected
                            ? 'bg-slate-900 text-white border-slate-700'
                            : 'bg-white/95 text-slate-800 border-slate-200/90'
                    }">
                        ${loc.nama}
                    </div>
                </div>
            `;

            const customIcon = L.divIcon({
                className: 'custom-map-pin',
                html: iconHtml,
                iconSize: [60, 68],
                iconAnchor: [30, 48],
                popupAnchor: [0, -50],
            });

            const marker = L.marker([loc.latitude, loc.longitude], {
                icon: customIcon,
                title: loc.nama,
            });

            // Rich Google Maps-style popup
            const statusLabel =
                loc.status === 'naik'
                    ? '<span class="text-orange-600 bg-orange-50 font-bold px-2 py-0.5 rounded-full text-[10px]">Laporan Naik ↑</span>'
                    : loc.status === 'normal'
                    ? '<span class="text-emerald-700 bg-emerald-50 font-bold px-2 py-0.5 rounded-full text-[10px]">Normal ✓</span>'
                    : '<span class="text-slate-500 bg-slate-100 font-bold px-2 py-0.5 rounded-full text-[10px]">Privasi (<3)</span>';

            const popupContent = document.createElement('div');
            popupContent.className = 'p-3 bg-white min-w-[200px] text-slate-900';
            popupContent.innerHTML = `
                <div class="flex items-center justify-between gap-2 mb-1">
                    <h4 class="font-extrabold text-sm text-slate-900 leading-tight">${loc.nama}</h4>
                    ${statusLabel}
                </div>
                <div class="text-[11px] text-slate-500 mb-2">Kota Yogyakarta</div>

                <div class="grid grid-cols-3 gap-1.5 p-2 bg-slate-50 rounded-xl text-center text-[10px] mb-2.5 border border-slate-100">
                    <div>
                        <span class="text-slate-400 block font-medium">Laporan</span>
                        <strong class="text-slate-800 font-bold">${loc.privacy_hidden ? '<3' : (loc.total_reports_7d ?? '-')}</strong>
                    </div>
                    <div>
                        <span class="text-slate-400 block font-medium">AQI</span>
                        <strong class="text-slate-800 font-bold">${loc.aqi}</strong>
                    </div>
                    <div>
                        <span class="text-slate-400 block font-medium">RTH</span>
                        <strong class="text-emerald-700 font-bold">${formatPersen(loc.rth_percentage)}</strong>
                    </div>
                </div>

                <button id="btn-detail-${loc.id}" class="w-full py-1.5 px-3 bg-teal-600 hover:bg-teal-700 active:bg-teal-800 text-white font-semibold text-xs rounded-xl shadow-xs transition-colors flex items-center justify-center gap-1 cursor-pointer">
                    <span>Lihat Detail Wilayah</span>
                    <span>→</span>
                </button>
            `;

            // Attach event to button inside popup
            popupContent.querySelector(`#btn-detail-${loc.id}`)?.addEventListener('click', (e) => {
                e.stopPropagation();
                onViewDetail(loc.id);
            });

            marker.bindPopup(popupContent, {
                maxWidth: 240,
                autoPanPadding: [20, 20],
            });

            marker.on('click', () => {
                onSelectLocation(loc);
            });

            markersGroup.addLayer(marker);
        });
    }, [locations, activeLayer, selectedLocation]);

    // 4. Highlight Selected District with Radius Overlay and Smooth FlyTo
    useEffect(() => {
        const map = mapInstanceRef.current;
        if (!map || !selectedLocation) return;

        // Remove previous circle overlay
        if (circleOverlayRef.current) {
            map.removeLayer(circleOverlayRef.current);
            circleOverlayRef.current = null;
        }

        const pinColor = getPinColor(selectedLocation);

        // Add soft glowing coverage circle around selected kecamatan
        const circle = L.circle([selectedLocation.latitude, selectedLocation.longitude], {
            radius: 900,
            color: pinColor,
            weight: 2,
            opacity: 0.8,
            fillColor: pinColor,
            fillOpacity: 0.14,
            dashArray: '4, 4',
        }).addTo(map);

        circleOverlayRef.current = circle;

        // Smooth pan / flyTo to selected position
        map.flyTo([selectedLocation.latitude, selectedLocation.longitude], 14, {
            duration: 0.8,
            easeLinearity: 0.25,
        });
    }, [selectedLocation?.id]);

    // Handle Resize / Expand map
    useEffect(() => {
        const timer = setTimeout(() => {
            mapInstanceRef.current?.invalidateSize();
        }, 250);
        return () => clearTimeout(timer);
    }, [isExpanded]);

    // Control Handlers
    const handleZoomIn = () => mapInstanceRef.current?.zoomIn();
    const handleZoomOut = () => mapInstanceRef.current?.zoomOut();
    const handleResetView = () => {
        if (!mapInstanceRef.current || locations.length === 0) return;
        const bounds = L.latLngBounds(locations.map((l) => [l.latitude, l.longitude]));
        mapInstanceRef.current.fitBounds(bounds, { padding: [40, 40], maxZoom: 14 });
    };

    return (
        <div className="space-y-3">
            {/* Layer Switcher Tabs (Gejala / AQI / RTH) */}
            <div className="flex bg-slate-200/80 p-1 rounded-2xl shadow-inner">
                <button
                    onClick={() => onLayerChange('gejala')}
                    className={`flex-1 flex items-center justify-center space-x-1.5 py-2 px-3 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                        activeLayer === 'gejala'
                            ? 'bg-white text-teal-800 shadow-sm'
                            : 'text-slate-600 hover:text-slate-900'
                    }`}
                >
                    <Activity size={14} className={activeLayer === 'gejala' ? 'text-teal-600' : ''} />
                    <span>Gejala</span>
                </button>
                <button
                    onClick={() => onLayerChange('aqi')}
                    className={`flex-1 flex items-center justify-center space-x-1.5 py-2 px-3 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                        activeLayer === 'aqi'
                            ? 'bg-white text-teal-800 shadow-sm'
                            : 'text-slate-600 hover:text-slate-900'
                    }`}
                >
                    <Wind size={14} className={activeLayer === 'aqi' ? 'text-teal-600' : ''} />
                    <span>AQI</span>
                </button>
                <button
                    onClick={() => onLayerChange('rth')}
                    className={`flex-1 flex items-center justify-center space-x-1.5 py-2 px-3 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                        activeLayer === 'rth'
                            ? 'bg-white text-teal-800 shadow-sm'
                            : 'text-slate-600 hover:text-slate-900'
                    }`}
                >
                    <Trees size={14} className={activeLayer === 'rth' ? 'text-teal-600' : ''} />
                    <span>RTH</span>
                </button>
            </div>

            {/* Interactive Leaflet Map Container */}
            <div
                className={`relative rounded-2xl overflow-hidden shadow-lg border border-slate-200/90 transition-all duration-300 ${
                    isExpanded ? 'h-[500px]' : 'h-[360px]'
                }`}
            >
                {/* Real Interactive Map Canvas */}
                <div ref={mapContainerRef} className="w-full h-full select-none" />

                {/* Floating Top Left: Google Maps Basemap Switcher */}
                <div className="absolute top-3 left-3 z-[1000] flex items-center bg-white/95 backdrop-blur-md rounded-xl p-1 shadow-md border border-slate-200/90 text-xs font-bold text-slate-700">
                    <button
                        onClick={() => setMapStyle('streets')}
                        className={`px-2.5 py-1 rounded-lg transition-colors cursor-pointer flex items-center space-x-1 ${
                            mapStyle === 'streets'
                                ? 'bg-teal-600 text-white shadow-xs'
                                : 'hover:bg-slate-100 text-slate-600'
                        }`}
                        title="Tampilan Peta Jalan"
                    >
                        <span>Jalan</span>
                    </button>
                    <button
                        onClick={() => setMapStyle('satellite')}
                        className={`px-2.5 py-1 rounded-lg transition-colors cursor-pointer flex items-center space-x-1 ${
                            mapStyle === 'satellite'
                                ? 'bg-teal-600 text-white shadow-xs'
                                : 'hover:bg-slate-100 text-slate-600'
                        }`}
                        title="Tampilan Citra Satelit"
                    >
                        <span>Satelit</span>
                    </button>
                </div>

                {/* Floating Top Right: Map Controls (Zoom, Reset Yogya, Expand) */}
                <div className="absolute top-3 right-3 z-[1000] flex flex-col space-y-1.5">
                    {/* Expand / Minimize Map Height */}
                    <button
                        onClick={() => setIsExpanded(!isExpanded)}
                        className="w-8 h-8 rounded-xl bg-white/95 backdrop-blur-md text-slate-700 hover:text-teal-700 shadow-md border border-slate-200/90 flex items-center justify-center transition-colors cursor-pointer"
                        title={isExpanded ? 'Perkecil Peta' : 'Perbesar Peta'}
                    >
                        {isExpanded ? <Minimize2 size={15} /> : <Maximize2 size={15} />}
                    </button>

                    {/* Reset Center / Focus Yogyakarta */}
                    <button
                        onClick={handleResetView}
                        className="w-8 h-8 rounded-xl bg-white/95 backdrop-blur-md text-slate-700 hover:text-teal-700 shadow-md border border-slate-200/90 flex items-center justify-center transition-colors cursor-pointer"
                        title="Pusatkan Peta ke Kota Yogyakarta"
                    >
                        <Navigation size={15} />
                    </button>

                    {/* Zoom In & Out */}
                    <div className="bg-white/95 backdrop-blur-md rounded-xl shadow-md border border-slate-200/90 flex flex-col overflow-hidden">
                        <button
                            onClick={handleZoomIn}
                            className="w-8 h-8 flex items-center justify-center text-slate-700 hover:text-teal-700 hover:bg-slate-50 transition-colors border-b border-slate-100 cursor-pointer"
                            title="Perbesar (Zoom In)"
                        >
                            <Plus size={16} />
                        </button>
                        <button
                            onClick={handleZoomOut}
                            className="w-8 h-8 flex items-center justify-center text-slate-700 hover:text-teal-700 hover:bg-slate-50 transition-colors cursor-pointer"
                            title="Perkecil (Zoom Out)"
                        >
                            <Minus size={16} />
                        </button>
                    </div>
                </div>

                {/* Floating Bottom Left: Yogyakarta Region Indicator */}
                <div className="absolute bottom-2 left-3 z-[1000] bg-white/90 backdrop-blur-xs text-[11px] font-semibold text-slate-700 px-2.5 py-1 rounded-lg border border-slate-200 shadow-xs flex items-center space-x-1.5 pointer-events-none">
                    <span className="w-2 h-2 rounded-full bg-teal-500 animate-pulse" />
                    <span>Kota Yogyakarta ({locations.length} Kecamatan)</span>
                </div>
            </div>

            {/* Selected Location Bottom Card (Section 11 Wireframe) */}
            {selectedLocation && (
                <div
                    onClick={() => onViewDetail(selectedLocation.id)}
                    className="bg-white rounded-2xl p-4 border border-slate-200/90 shadow-md transition-all hover:border-teal-300 hover:shadow-lg cursor-pointer animate-in fade-in slide-in-from-bottom-2 duration-200"
                >
                    <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center space-x-2">
                            <span
                                className="w-3.5 h-3.5 rounded-full ring-2 ring-white shadow-xs"
                                style={{ backgroundColor: getPinColor(selectedLocation) }}
                            />
                            <div>
                                <h3 className="font-extrabold text-slate-900 text-base leading-tight">
                                    {selectedLocation.nama}
                                </h3>
                                <span className="text-[11px] text-slate-400 font-medium">
                                    Kota Yogyakarta
                                </span>
                            </div>
                        </div>
                        <span className="text-xs font-bold text-teal-700 flex items-center space-x-0.5 bg-teal-50 px-2.5 py-1 rounded-full border border-teal-100">
                            <span>Detail Wilayah</span>
                            <ChevronRight size={14} />
                        </span>
                    </div>

                    <div className="grid grid-cols-3 gap-2 mt-3 pt-3 border-t border-slate-100 text-center">
                        <div className="bg-slate-50 p-2 rounded-xl">
                            <span className="text-[10px] uppercase text-slate-400 font-semibold block">
                                Laporan 7 Hari
                            </span>
                            {selectedLocation.privacy_hidden ? (
                                <span className="text-xs font-bold text-slate-500 flex items-center justify-center space-x-0.5 mt-0.5">
                                    <Lock size={11} />
                                    <span>&lt; 3 Laporan</span>
                                </span>
                            ) : (
                                <span className="text-sm font-black text-slate-800">
                                    {selectedLocation.total_reports_7d} lap.
                                    {selectedLocation.status === 'naik' && (
                                        <span className="text-orange-600 text-xs ml-1">↑</span>
                                    )}
                                </span>
                            )}
                        </div>

                        <div className="bg-slate-50 p-2 rounded-xl">
                            <span className="text-[10px] uppercase text-slate-400 font-semibold block">
                                Kualitas Udara
                            </span>
                            <span className="text-sm font-black text-slate-800">
                                AQI {selectedLocation.aqi}
                            </span>
                        </div>

                        <div className="bg-slate-50 p-2 rounded-xl">
                            <span className="text-[10px] uppercase text-slate-400 font-semibold block">
                                Ruang Hijau
                            </span>
                            <span className="text-sm font-black text-emerald-700">
                                {formatPersen(selectedLocation.rth_percentage)}
                            </span>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
