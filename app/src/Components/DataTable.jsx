import React, { useState } from 'react';

function DataTable({ data, loading, error, ticker, onTickerChange, formatLargeNumbers, Icon }) {
    const [tickerTextInput, setTickerTextInput] = useState(ticker); // separate so it doesn't refresh each keystroke
    const [sortConfig, setSortConfig] = useState({
        key: "date",
        direction: "descending",
    });

    const columnConfig = [
        { title: "Date", key: "date" },
        { title: "Revenue", key: "revenue" },
        { title: "Net Income", key: "netIncome" },
        { title: "Gross Profit", key: "grossProfit" },
        { title: "EPS", key: "eps" },
        { title: "Operating Income", key: "operatingIncome" },
    ];

    const handleSort = (key) => {
        setSortConfig((prevSort) => ({
            key,
            direction:
                prevSort.key === key && prevSort.direction === "descending"
                    ? "ascending"
                    : "descending",
        }));
    };

    const sortedData = React.useMemo(() => {
        if (!data) return [];
        return [...data].sort((a, b) => {
            let aValue = a[sortConfig.key];
            let bValue = b[sortConfig.key];

            if (typeof aValue === "string" && aValue.startsWith("$")) {
                aValue = parseFloat(aValue.replace("$", ""));
                bValue = parseFloat(bValue.replace("$", ""));
            }

            if (aValue < bValue) return sortConfig.direction === "ascending" ? -1 : 1;
            if (aValue > bValue) return sortConfig.direction === "ascending" ? 1 : -1;
            return 0;
        });
    }, [data, sortConfig]);

    // Loading
    if (loading) {
        return (
            <div className="flex-grow 2xl:w-2/4 flex flex-col items-center border-4 border-[#42484b] rounded-lg pb-4">
                <div className="w-full text-[2vmin] px-8">
                    <h1 className="font-bold mb-4">Loading...</h1>
                    <table className="w-full border-collapse table-fixed">
                        <thead>
                            <tr>
                                {columnConfig.map(({ title, key }) => (
                                    <th key={key} className="p-2 border border-[#42484b]">
                                        <div className="flex items-center justify-center gap-2 text-[1.75vmin]">
                                            {title}
                                        </div>
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {[...Array(5)].map((_, index) => (
                                <tr key={index}>
                                    {columnConfig.map(({ key }) => (
                                        <td
                                            key={key}
                                            className="border border-[#42484b] p-2 text-center text-[1.5vmin] 2xl:text-[1.55vmin]"
                                        >
                                            <div className="h-4 bg-gray-600 rounded animate-pulse"></div>
                                        </td>
                                    ))}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        );
    }

    // Error
    if (error) {
        let errorMessage = "An error occurred";
        if (error.includes("429")) {
            errorMessage = "Too many requests. Please try again in a few minutes.";
        } else if (error.includes("403")) {
            errorMessage = "Access denied. Please check your API key.";
        }
        return <div className="text-red-500 m-5">{errorMessage}</div>;
    }

    // Invalid input
    if (!sortedData || sortedData.length === 0) {
        return <div className="text-2xl font-bold text-red-500">Invalid input</div>;
    }

    // Standard Output
    return (
        <div className="flex-grow 2xl:w-2/4 flex flex-col items-center border-4 border-[#42484b] rounded-lg pb-4">
            <div className="relative inline-block my-3">
                <input
                    type="text"
                    value={tickerTextInput}
                    onChange={(e) => setTickerTextInput(e.target.value.toUpperCase())}
                    onKeyDown={(e) => {
                        if (e.key === "Enter") {
                            onTickerChange(tickerTextInput);
                        }
                    }}
                    placeholder="Enter stock ticker"
                    className="text-black p-1 rounded pr-8 w-[20vmin]"
                />
                <button
                    onClick={() => onTickerChange(tickerTextInput)}
                    className="absolute right-2 top-1/2 -translate-y-1/2 bg-transparent border-none p-0"
                >
                    <Icon name="arrow-big-right" />
                </button>
            </div>

            <div className="w-full text-[2vmin] px-8">
                <h1 className="font-bold mb-4">{ticker} Income Statement Overview</h1>

                <table className="w-full border-collapse table-fixed">
                    <thead>
                        <tr>
                            {columnConfig.map(({ title, key }) => (
                                <th
                                    key={key}
                                    onClick={() => handleSort(key)}
                                    className="cursor-pointer border border-[#42484b]"
                                >
                                    <div className="flex items-center justify-center gap-2 text-[1.75vmin] p-3">
                                        {title}
                                        {sortConfig.key === key && (
                                            <Icon name={`sort-${sortConfig.direction}`} />
                                        )}
                                    </div>
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {sortedData.map((item, index) => (
                            <tr key={index}>
                                <td className="border border-[#42484b] p-2 text-center text-[1.55vmin]">
                                    {item.date}
                                </td>
                                <td className="border border-[#42484b] p-2 text-center text-[1.55vmin]">
                                    {formatLargeNumbers(item.revenue)}
                                </td>
                                <td className="border border-[#42484b] p-2 text-center text-[1.55vmin]">
                                    {formatLargeNumbers(item.netIncome)}
                                </td>
                                <td className="border border-[#42484b] p-2 text-center text-[1.55vmin]">
                                    {formatLargeNumbers(item.grossProfit)}
                                </td>
                                <td className="border border-[#42484b] p-2 text-center text-[1.55vmin]">
                                    ${item.eps}
                                </td>
                                <td className="border border-[#42484b] p-2 text-center text-[1.55vmin]">
                                    {formatLargeNumbers(item.operatingIncome)}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

export default DataTable;