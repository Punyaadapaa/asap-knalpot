import React, { useState } from 'react';

interface TrendChartProps {
    data: Array<{
        date: string;
        label: string;
        count: number | null;
    }>;
    color?: string;
    height?: number;
    showPoints?: boolean;
}

export const TrendChart: React.FC<TrendChartProps> = ({
    data,
    color = '#0d9488',
    height = 140,
    showPoints = true,
}) => {
    const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

    if (!data || data.length === 0) {
        return (
            <div className="flex items-center justify-center h-28 text-xs text-slate-400 bg-slate-50 rounded-xl">
                Tidak ada data tren
            </div>
        );
    }

    const width = 360;
    const padding = { top: 20, right: 20, bottom: 25, left: 25 };
    const chartWidth = width - padding.left - padding.right;
    const chartHeight = height - padding.top - padding.bottom;

    // Filter valid numerical values
    const validCounts = data
        .map((d) => d.count)
        .filter((c): c is number => c !== null);

    const isAllHidden = validCounts.length === 0;

    if (isAllHidden) {
        return (
            <div className="flex flex-col items-center justify-center h-28 text-center p-3 bg-slate-100/60 rounded-xl border border-dashed border-slate-200">
                <span className="text-xs font-semibold text-slate-600">Grafik tren tidak tersedia</span>
                <span className="text-[11px] text-slate-400 mt-0.5">Jumlah laporan belum memenuhi ambang privasi minimum</span>
            </div>
        );
    }

    const maxCount = Math.max(...validCounts, 4);
    const minCount = 0;

    // Calculate (x, y) coordinates
    const points = data.map((d, index) => {
        const x = padding.left + (index / (data.length - 1)) * chartWidth;
        const val = d.count ?? 0;
        const y = padding.top + chartHeight - ((val - minCount) / (maxCount - minCount || 1)) * chartHeight;
        return { x, y, ...d };
    });

    const pathD = points.reduce((acc, curr, i) => {
        return i === 0 ? `M ${curr.x} ${curr.y}` : `${acc} L ${curr.x} ${curr.y}`;
    }, '');

    // Area fill path
    const areaD = `${pathD} L ${points[points.length - 1].x} ${padding.top + chartHeight} L ${points[0].x} ${padding.top + chartHeight} Z`;

    return (
        <div className="w-full relative select-none">
            <svg
                viewBox={`0 0 ${width} ${height}`}
                className="w-full h-auto overflow-visible"
            >
                <defs>
                    <linearGradient id={`trend-gradient-${color.replace('#', '')}`} x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor={color} stopOpacity="0.25" />
                        <stop offset="100%" stopColor={color} stopOpacity="0.0" />
                    </linearGradient>
                </defs>

                {/* Horizontal reference grid lines */}
                <line
                    x1={padding.left}
                    y1={padding.top}
                    x2={width - padding.right}
                    y2={padding.top}
                    stroke="#e2e8f0"
                    strokeDasharray="3 3"
                />
                <line
                    x1={padding.left}
                    y1={padding.top + chartHeight / 2}
                    x2={width - padding.right}
                    y2={padding.top + chartHeight / 2}
                    stroke="#e2e8f0"
                    strokeDasharray="3 3"
                />
                <line
                    x1={padding.left}
                    y1={padding.top + chartHeight}
                    x2={width - padding.right}
                    y2={padding.top + chartHeight}
                    stroke="#cbd5e1"
                />

                {/* Area under curve */}
                <path d={areaD} fill={`url(#trend-gradient-${color.replace('#', '')})`} />

                {/* Main line */}
                <path
                    d={pathD}
                    fill="none"
                    stroke={color}
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                />

                {/* Points */}
                {showPoints &&
                    points.map((p, idx) => (
                        <g key={idx}>
                            <circle
                                cx={p.x}
                                cy={p.y}
                                r={hoveredIndex === idx ? 5 : 3.5}
                                fill="#ffffff"
                                stroke={color}
                                strokeWidth={hoveredIndex === idx ? 3 : 2}
                                className="transition-all duration-150 cursor-pointer"
                                onMouseEnter={() => setHoveredIndex(idx)}
                                onMouseLeave={() => setHoveredIndex(null)}
                            />
                            {/* X-axis labels */}
                            <text
                                x={p.x}
                                y={padding.top + chartHeight + 16}
                                textAnchor="middle"
                                className="text-[10px] fill-slate-400 font-medium"
                            >
                                {p.label}
                            </text>
                        </g>
                    ))}
            </svg>

            {/* Hover tooltip */}
            {hoveredIndex !== null && points[hoveredIndex] && (
                <div
                    className="absolute z-10 bg-slate-900 text-white text-[11px] font-semibold px-2 py-1 rounded-md shadow-md pointer-events-none transform -translate-x-1/2 -translate-y-8"
                    style={{
                        left: `${(points[hoveredIndex].x / width) * 100}%`,
                        top: `${(points[hoveredIndex].y / height) * 100}%`,
                    }}
                >
                    {points[hoveredIndex].count !== null ? (
                        <span>{points[hoveredIndex].count} laporan</span>
                    ) : (
                        <span>Data dirahasiakan</span>
                    )}
                </div>
            )}
        </div>
    );
};
