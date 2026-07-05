import React from 'react';
import {
    ComposedChart,
    Area,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    Legend,
    ReferenceLine
} from 'recharts';
import { useCurrency } from '../context/CurrencyContext';
import { formatCurrency } from '../utils/formatCurrency';
import { useTheme } from '../context/ThemeContext';

const PriceChart = ({ history, forecast7Day, forecast30Day }) => {
    const { currency } = useCurrency();
    const { isDarkMode } = useTheme();

    if (!history || history.length === 0) {
        return (
            <div style={{ display: 'flex', height: '100%', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)', fontSize: '0.875rem', fontWeight: 600 }}>
                No historical data available.
            </div>
        );
    }

    // 1. Map historical data
    const chartData = history.map(h => ({
        date: new Date(h.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
        price: h.price,
        forecast7: null,
        forecast30: null
    }));

    // 2. Attach forecasts to make continuous lines
    const lastPoint = chartData[chartData.length - 1];
    const todayDateStr = lastPoint.date;

    if (forecast7Day && forecast7Day.forecastPrice !== undefined) {
        // Link the start of the forecast to the last real data point
        lastPoint.forecast7 = lastPoint.price;

        const date7 = new Date();
        date7.setDate(date7.getDate() + 7);
        chartData.push({
            date: date7.toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
            price: null,
            forecast7: forecast7Day.forecastPrice,
            forecast30: null
        });
    }

    if (forecast30Day && forecast30Day.forecastPrice !== undefined) {
        // Since we want the 30-day forecast to stem from the history, link it up
        lastPoint.forecast30 = lastPoint.price;

        const date30 = new Date();
        date30.setDate(date30.getDate() + 30);
        chartData.push({
            date: date30.toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
            price: null,
            forecast7: null,
            forecast30: forecast30Day.forecastPrice
        });
    }

    // 3. Theme-aware dynamic colors
    const gridColor = isDarkMode ? '#374151' : '#E5E7EB';
    const textColor = isDarkMode ? '#9CA3AF' : '#6B7280';
    const historyLine = isDarkMode ? '#818CF8' : '#4F46E5'; // Indigo
    const f7Line = isDarkMode ? '#34D399' : '#10B981'; // Emerald
    const f30Line = isDarkMode ? '#F87171' : '#EF4444'; // Red

    const CustomTooltip = ({ active, payload, label }) => {
        if (active && payload && payload.length) {
            return (
                <div style={{
                    background: 'var(--bg-card)',
                    border: '1px solid var(--border-medium)',
                    borderRadius: '0.875rem',
                    padding: '0.875rem 1.125rem',
                    boxShadow: '0 20px 60px rgba(0,0,0,0.4)',
                    backdropFilter: 'blur(16px)',
                    minWidth: '160px'
                }}>
                    <p style={{ fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '0.625rem', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{label}</p>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
                        {payload.map((entry, index) => entry.value != null && (
                            <div key={index} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
                                    <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: entry.color, display: 'inline-block', flexShrink: 0 }} />
                                    <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem', fontWeight: 600 }}>{entry.name}</span>
                                </div>
                                <span style={{ fontWeight: 800, color: 'var(--text-primary)', fontSize: '0.85rem' }}>
                                    {formatCurrency(entry.value, currency)}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
            );
        }
        return null;
    };

    return (
        <div className="w-full h-72">
            <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={chartData} margin={{ top: 20, right: 30, left: 10, bottom: 5 }}>
                    <defs>
                        <linearGradient id="colorHistory" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor={historyLine} stopOpacity={0.25} />
                            <stop offset="95%" stopColor={historyLine} stopOpacity={0} />
                        </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke={gridColor} vertical={false} />
                    <XAxis
                        dataKey="date"
                        stroke={textColor}
                        tick={{ fill: textColor, fontSize: 12 }}
                        tickLine={false}
                        axisLine={false}
                        minTickGap={20}
                    />
                    <YAxis
                        stroke={textColor}
                        tick={{ fill: textColor, fontSize: 12 }}
                        tickLine={false}
                        axisLine={false}
                        tickFormatter={(val) => formatCurrency(val, currency).replace(/\.00$/, '')}
                        domain={['auto', 'auto']}
                        width={80}
                    />
                    <Tooltip content={<CustomTooltip />} cursor={{ stroke: isDarkMode ? '#4B5563' : '#D1D5DB', strokeWidth: 1, strokeDasharray: '4 4' }} />
                    <Legend
                        verticalAlign="top"
                        height={36}
                        iconType="circle"
                        wrapperStyle={{ fontSize: '13px', color: textColor }}
                    />

                    <ReferenceLine
                        x={todayDateStr}
                        stroke={isDarkMode ? '#4B5563' : '#9CA3AF'}
                        strokeDasharray="3 3"
                        label={{ position: 'insideTopLeft', value: 'Today', fill: textColor, fontSize: 11, offset: 10 }}
                    />

                    <Area
                        name="Historical"
                        type="monotone"
                        dataKey="price"
                        stroke={historyLine}
                        fillOpacity={1}
                        fill="url(#colorHistory)"
                        strokeWidth={3}
                        activeDot={{ r: 6, stroke: isDarkMode ? '#1F2937' : '#FFFFFF', strokeWidth: 2 }}
                        animationDuration={1200}
                        animationEasing="ease-in-out"
                    />
                    <Line
                        name="7-Day Model"
                        type="monotone"
                        dataKey="forecast7"
                        stroke={f7Line}
                        strokeWidth={2}
                        strokeDasharray="4 4"
                        dot={false}
                        activeDot={{ r: 5 }}
                        animationDuration={1200}
                        animationEasing="ease-in-out"
                    />
                    <Line
                        name="30-Day Model"
                        type="monotone"
                        dataKey="forecast30"
                        stroke={f30Line}
                        strokeWidth={2}
                        strokeDasharray="4 4"
                        dot={false}
                        activeDot={{ r: 5 }}
                        animationDuration={1200}
                        animationEasing="ease-in-out"
                    />
                </ComposedChart>
            </ResponsiveContainer>
        </div>
    );
};

export default PriceChart;
