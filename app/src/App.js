import './App.css';
import useAPI from './Components/useAPI';
import { useState, useEffect } from 'react';
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

let stockTicker = "AAPL"

// Dynamically fetch icons just by calling filename
const Icons = require.context('./Assets', false, /\.svg$/);
const Icon = ({ name }) => {
	try {
		const iconPath = Icons(`./${name}.svg`);
		return <img src={iconPath} alt={name} style={{ width: '24px', height: '24px' }} />;
	} catch (error) {
		console.error(`Icon ${name} not found`);
		return null;
	}
};

const columnConfig = [
	{ title: "Date", key: "date" },
	{ title: "Revenue", key: "revenue" },
	{ title: "Net Income", key: "netIncome" },
	{ title: "Gross Profit", key: "grossProfit" },
	{ title: "EPS", key: "eps" },
	{ title: "Operating Income", key: "operatingIncome" }
];

const apiKey = process.env.REACT_APP_FINANCIAL_MODELING_PREP_API_KEY;

const formatLargeNumbers = (number) => {
	if (number >= 1e9) {
		return `$${(number / 1e9).toFixed(1)}B`;
	}
	if (number >= 1e6) {
		return `$${(number / 1e6).toFixed(1)}M`;
	}
	return `$${number}`;
};

function App() {

	const [sortConfig, setSortConfig] = useState({
		key: null,
		direction: 'ascending'
	});
	const [ticker, setTicker] = useState(`${stockTicker}`);
	const [tickerTextInput, setTickerTextInput] = useState(`${ticker}`); // separate so it doesn't refresh each keystroke

	// holds data for filtering (updated live)
	const [dateInputs, setDateInputs] = useState({ start: null, end: null });
	const [revenueInputs, setRevenueInputs] = useState({ start: '', end: '' });
	const [netIncomeInputs, setNetIncomeInputs] = useState({ start: '', end: '' });

	const [filteredCount, setFilteredCount] = useState(0);

	// State for active filters (updates only when "Update Filter" is clicked)
	const [activeFilters, setActiveFilters] = useState({
		date: { start: null, end: null },
		revenue: { start: '', end: '' },
		netIncome: { start: '', end: '' }
	});

	let { data, loading, error } = useAPI(`https://financialmodelingprep.com/api/v3/income-statement/${ticker}?period=annual&apikey=${apiKey}`);

	const filterData = (data) => {
		if (!data) return [];

		return data.filter(statement => {
			// Date filter
			if (activeFilters.date.start && new Date(statement.date) < new Date(activeFilters.date.start)) {
				return false;
			}
			if (activeFilters.date.end && new Date(statement.date) > new Date(activeFilters.date.end)) {
				return false;
			}

			// Revenue filter
			if (activeFilters.revenue.start && Number(statement.revenue) < Number(activeFilters.revenue.start)) {
				return false;
			}
			if (activeFilters.revenue.end && Number(statement.revenue) > Number(activeFilters.revenue.end)) {
				return false;
			}

			// Net Income filter
			if (activeFilters.netIncome.start && Number(statement.netIncome) < Number(activeFilters.netIncome.start)) {
				return false;
			}
			if (activeFilters.netIncome.end && Number(statement.netIncome) > Number(activeFilters.netIncome.end)) {
				return false;
			}

			return true;
		});
	};

	useEffect(() => {
		if (data) {
			const filtered = filterData(data);
			const count = data.length - filtered.length;
			setFilteredCount(count);
		}
	}, [data, activeFilters]); // Only update when data or active filters change

	const sortData = (data) => {
		if (!sortConfig.key) return data;

		return [...data].sort((a, b) => {
			// Parse numeric values for financial columns
			let aValue = a[sortConfig.key];
			let bValue = b[sortConfig.key];

			// If the values start with $, remove it and convert to number
			if (typeof aValue === 'string' && aValue.startsWith('$')) {
				aValue = parseFloat(aValue.replace('$', ''));
				bValue = parseFloat(bValue.replace('$', ''));
			}

			if (aValue < bValue)
				return sortConfig.direction === 'ascending' ? -1 : 1;
			if (aValue > bValue)
				return sortConfig.direction === 'ascending' ? 1 : -1;
			return 0;
		});
	};

	const handleSearch = () => {
		setTicker(tickerTextInput.toUpperCase());
	};

	const handleKeyPress = (e) => {
		if (e.key === 'Enter') {
			handleSearch();
		}
	}

	const handleSort = (key) => {
		setSortConfig(prevSort => ({
			key,
			direction: prevSort.key === key && prevSort.direction === 'ascending' //toggle direction
				? 'descending'
				: 'ascending'
		}));
	};

	const handleUpdateFilter = () => {
		setActiveFilters({
			date: dateInputs,
			revenue: revenueInputs,
			netIncome: netIncomeInputs
		});
	};

	const filteredData = data ? filterData(data) : [];
	const sortedData = sortData(filteredData);
	const chartData = [...filteredData].sort((a, b) => new Date(b.date) - new Date(a.date));

	function updateTable(data) {
		if (error) {
			let errorMessage = "An error occurred";
			if (error.includes("429")) {
				errorMessage = "Too many requests. Please try again in a few minutes.";
			} else if (error.includes("403")) {
				errorMessage = "Access denied. Please check your API key.";
			}
			return (
				<>
					<div className="text-red-500 m-5">
						{errorMessage}
					</div>
				</>
			);
		}

		if (loading) {
			return (
				<div className="text-[2vmin]">
					<h1 className="text-2xl font-bold mb-4">Loading...</h1>
					<table className="w-full border-collapse">
						<thead>
							<tr>
								{columnConfig.map(({ title, key }) => (
									<th key={key} className="p-2 border border-gray-600">
										<div className="flex items-center gap-1">
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
										<td key={key} className="border border-gray-600 p-2">
											<div className="h-4 bg-gray-600 rounded animate-pulse"></div>
										</td>
									))}
								</tr>
							))}
						</tbody>
					</table>
				</div>
			);
		}

		// Handle cases if there isn't any financial reports from the API
		if (!data || data.length === 0) {
			return (
				<div className="text-2xl font-bold text-red-500">
					Invalid input
				</div>
			);
		}

		return (
			<>
				<div className="text-[2vmin]">
					<h1 className="text-2xl font-bold mb-4">{ticker} Income Statement Overview</h1>
					<table className="w-full border-collapse">
						<thead>
							<tr>
								{columnConfig.map(({ title, key }) => (
									<th
										key={key}
										onClick={() => handleSort(key)}
										className="cursor-pointer p-2 border border-gray-600"
									>
										<div className="flex items-center gap-1">
											{title}
											<Icon name={sortConfig.key === key
												? `sort-${sortConfig.direction}`
												: "sort-descending"
											}
											/>
										</div>
									</th>
								))}
							</tr>
						</thead>
						<tbody>
							{sortedData.map((item, index) => (
								<tr key={index}>
									<td className="border border-gray-600 p-2">{item.date}</td>
									<td className="border border-gray-600 p-2">${item.revenue}</td>
									<td className="border border-gray-600 p-2">${item.netIncome}</td>
									<td className="border border-gray-600 p-2">${item.grossProfit}</td>
									<td className="border border-gray-600 p-2">${item.eps}</td>
									<td className="border border-gray-600 p-2">${item.operatingIncome}</td>
								</tr>
							))}
						</tbody>
					</table>
				</div>
			</>
		)
	}

	return (
		<div className="App">
			<header className="min-h-screen bg-[#323232] text-white flex flex-col items-center justify-center text-[calc(5px+1vmin)]">
				<div className="flex justify-between gap-5 w-full">
					<div className="w-1/4 min-w-[250px] p-5">
						<div className="flex flex-col items-center justify-center h-full gap-2">

							<div>
								<p>Filter by Date:</p>
								<DatePicker
									className="text-black p-1 rounded"
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
										className="text-black p-1 rounded"
										onChange={(e) => setRevenueInputs(prev => ({ ...prev, start: e.target.value }))}
									/>
									<span>-</span>
									<input
										type="number"
										value={revenueInputs.end}
										placeholder="Upper Revenue"
										className="text-black p-1 rounded"
										onChange={(e) => setRevenueInputs(prev => ({ ...prev, end: e.target.value }))}
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
										className="text-black p-1 rounded"
										onChange={(e) => setNetIncomeInputs(prev => ({ ...prev, start: e.target.value }))}
									/>
									<span>-</span>
									<input
										type="number"
										value={netIncomeInputs.end}
										placeholder="Upper Net Income"
										className="text-black p-1 rounded"
										onChange={(e) => setNetIncomeInputs(prev => ({ ...prev, end: e.target.value }))}
									/>
								</div>
							</div>

							<p>Filtering {filteredCount} {filteredCount === 1 ? "statement" : "statements"}</p>

							<div className="flex items-center justify-end">
								<button
									onClick={handleUpdateFilter}
									className="flex items-center gap-1 bg-[#162055] hover:bg-blue-600 px-3 py-1 rounded"
								>
									<span>Update Filter:</span>
									<Icon name="filter" />
								</button>
							</div>
						</div>
					</div>

					<div className="w-2/4 min-w-[500px] flex flex-col items-center">
						<div className="relative inline-block mb-2">
							<input
								type="text"
								value={tickerTextInput}
								onChange={(e) => setTickerTextInput(e.target.value.toUpperCase())}
								onKeyDown={handleKeyPress}
								placeholder="Enter stock ticker"
								className="text-black p-1 rounded pr-8"
							/>
							<button
								onClick={() => setTicker(tickerTextInput.toUpperCase())}
								className="absolute right-2 top-1/2 -translate-y-1/2 bg-transparent border-none p-0"
							>
								<Icon name="arrow-big-right" />
							</button>
						</div>
						{loading ? <div>Loading...</div> : updateTable(data)}
					</div>

					<div className="w-1/4 min-w-[250px] p-5">
						{loading ? (
							<div className="w-full h-[400px] bg-gray-600/30 rounded animate-pulse" />
						) : (
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
										tick={{ fill: 'white', angle: 90, textAnchor: 'start' }}
										reversed={true}
										allowDataOverflow={true}
										interval={0}
										ticks={chartData.map(data => data.date)} // Include all x points
									/>
									<YAxis
										tick={{ fill: 'white' }}
										tickFormatter={formatLargeNumbers}
										domain={['dataMin', 'dataMax']}
										type="number"
									/>
									<Tooltip
										formatter={(value) => formatLargeNumbers(value)}
										labelStyle={{ color: 'black' }}
									/>
									<Line
										type="monotone"
										dataKey="revenue"
										stroke="#09809e"
										strokeWidth={2}
										dot={{ fill: '#8884d8' }}
									/>
								</LineChart>
							</ResponsiveContainer>
						)}
					</div>
				</div>
			</header>
		</div>
	);
}

export default App;

/*
Required to add:
- Responsive design for PC/Mobile displays

Potential additions:
- Buttons to display chart for other columns
*/