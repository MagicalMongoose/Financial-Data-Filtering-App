import React from 'react';
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
} from "recharts";

function RevenueChart({ data, loading, formatLargeNumbers }) {
    const chartData = React.useMemo(() => {
        if (!data) return [];
        return [...data].sort((a, b) => new Date(b.date) - new Date(a.date));
    }, [data]);

    if (loading) {
        return (
            <aside className="w-full 2xl:w-1/4 p-5 border-4 border-[#42484b] rounded-lg">
                <div className="w-full h-[400px] border-[#42484b]/30 rounded animate-pulse" />
            </aside>
        );
    }

    return (
        <aside className="w-full 2xl:w-1/4 p-5 border-4 border-[#42484b] rounded-lg">
            <ResponsiveContainer width="100%" height={400}>
                <LineChart
                    data={chartData}
                    margin={{
                        top: 80,
                        right: 0,
                        left: 0,
                        bottom: 50,
                    }}
                >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis
                        dataKey="date"
                        tick={{ fill: "white", angle: 90, textAnchor: "start" }}
                        reversed={true}
                        allowDataOverflow={true}
                        interval={0}
                        ticks={chartData.map((data) => data.date)}
                    />
                    <YAxis
                        tick={{ fill: "white" }}
                        tickFormatter={formatLargeNumbers}
                        domain={["dataMin", "dataMax"]}
                        type="number"
                    />
                    <Tooltip
                        formatter={(value) => formatLargeNumbers(value)}
                        labelStyle={{ color: "black" }}
                    />
                    <Line
                        type="monotone"
                        dataKey="revenue"
                        stroke="#09809e"
                        strokeWidth={2}
                        dot={{ fill: "#8884d8" }}
                    />
                </LineChart>
            </ResponsiveContainer>
        </aside>
    );
}

export default RevenueChart;