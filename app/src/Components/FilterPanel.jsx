import React, { useState, useEffect } from 'react';
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

function FilterPanel({ data, onFilteredDataChange, Icon }) {
    const [dateInputs, setDateInputs] = useState({ start: null, end: null });
    const [revenueInputs, setRevenueInputs] = useState({ start: "", end: "" });
    const [netIncomeInputs, setNetIncomeInputs] = useState({ start: "", end: "" });
    const [filteredCount, setFilteredCount] = useState(0);
    const [activeFilters, setActiveFilters] = useState({
        date: { start: null, end: null },
        revenue: { start: "", end: "" },
        netIncome: { start: "", end: "" },
    });

    const filterData = (data) => {
        if (!data) return [];

        return data.filter((statement) => {
            // Date filter
            if (activeFilters.date.start &&
                new Date(statement.date) < new Date(activeFilters.date.start)) {
                return false;
            }
            if (activeFilters.date.end &&
                new Date(statement.date) > new Date(activeFilters.date.end)) {
                return false;
            }

            // Revenue filter
            if (activeFilters.revenue.start &&
                Number(statement.revenue) < Number(activeFilters.revenue.start)) {
                return false;
            }
            if (activeFilters.revenue.end &&
                Number(statement.revenue) > Number(activeFilters.revenue.end)) {
                return false;
            }

            // Net Income filter
            if (activeFilters.netIncome.start &&
                Number(statement.netIncome) < Number(activeFilters.netIncome.start)) {
                return false;
            }
            if (activeFilters.netIncome.end &&
                Number(statement.netIncome) > Number(activeFilters.netIncome.end)) {
                return false;
            }

            return true;
        });
    };

    useEffect(() => {
        if (data) {
            const filteredData = filterData(data);
            setFilteredCount(data.length - filteredData.length);
            onFilteredDataChange(filteredData);
        }
    }, [data, activeFilters, onFilteredDataChange]);

    const handleUpdateFilter = () => {
        setActiveFilters({
            date: dateInputs,
            revenue: revenueInputs,
            netIncome: netIncomeInputs
        });
    };

    const handleResetFilters = () => {
        setDateInputs({ start: null, end: null });
        setRevenueInputs({ start: "", end: "" });
        setNetIncomeInputs({ start: "", end: "" });
        setActiveFilters({
            date: { start: null, end: null },
            revenue: { start: "", end: "" },
            netIncome: { start: "", end: "" },
        });
    };

    return (
        <aside className="w-full 2xl:w-1/4 p-5 border-4 border-[#42484b] rounded-lg">
            <div className="flex flex-col items-center justify-center h-full gap-2">
                <div>
                    <p>Filter by Date:</p>
                    <DatePicker
                        className="text-black p-1 rounded w-[20vmin]"
                        showMonthYearPicker
                        selectsRange
                        isClearable
                        placeholderText={dateInputs.start ? dateInputs.start : "All dates"}
                        selected={dateInputs.start}
                        onChange={(dates) => {
                            const [start, end] = dates;
                            setDateInputs({ start, end });
                        }}
                        startDate={dateInputs.start}
                        endDate={dateInputs.end}
                    />
                </div>

                <div>
                    <p>Filter by Revenue:</p>
                    <div className="flex items-center gap-2">
                        <input
                            type="number"
                            value={revenueInputs.start}
                            placeholder="Lower Revenue"
                            className="text-black p-1 rounded w-[15vmin]"
                            onChange={(e) =>
                                setRevenueInputs((prev) => ({
                                    ...prev,
                                    start: e.target.value,
                                }))
                            }
                        />
                        <span>-</span>
                        <input
                            type="number"
                            value={revenueInputs.end}
                            placeholder="Upper Revenue"
                            className="text-black p-1 rounded w-[15vmin]"
                            onChange={(e) =>
                                setRevenueInputs((prev) => ({
                                    ...prev,
                                    end: e.target.value,
                                }))
                            }
                        />
                    </div>
                </div>

                <div>
                    <p>Filter by Net Income:</p>
                    <div className="flex items-center gap-2">
                        <input
                            type="number"
                            value={netIncomeInputs.start}
                            placeholder="Lower Net Income"
                            className="text-black p-1 rounded w-[15vmin]"
                            onChange={(e) =>
                                setNetIncomeInputs((prev) => ({
                                    ...prev,
                                    start: e.target.value,
                                }))
                            }
                        />
                        <span>-</span>
                        <input
                            type="number"
                            value={netIncomeInputs.end}
                            placeholder="Upper Net Income"
                            className="text-black p-1 rounded w-[15vmin]"
                            onChange={(e) =>
                                setNetIncomeInputs((prev) => ({
                                    ...prev,
                                    end: e.target.value,
                                }))
                            }
                        />
                    </div>
                </div>

                <p>
                    Filtering {filteredCount} {filteredCount === 1 ? "statement" : "statements"}
                </p>

                <div className="flex items-center justify-end">
                    <button
                        onClick={handleUpdateFilter}
                        className="flex items-center gap-1 bg-[#162055] hover:bg-blue-600 px-3 py-1 rounded"
                    >
                        <span>Update Filter:</span>
                        <Icon name="filter" />
                    </button>
                </div>

                {filteredCount !== 0 && (
                    <button onClick={handleResetFilters} className="underline">
                        Reset filters?
                    </button>
                )}
            </div>
        </aside>
    );
}

export default FilterPanel;