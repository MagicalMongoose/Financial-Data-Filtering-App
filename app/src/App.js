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
		setTicker(tickerTextInput);
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
					<h1>{ticker} Income Statement Overview</h1>
					<div className="error-message" style={{ color: 'red', margin: '20px' }}>
						{errorMessage}
					</div>
				</>
			);
		}

		return (
			<>
				<div
					style = {{
						fontSize: `calc(2vmin)`
					}}>
					<h1>{ticker} Income Statement Overview</h1>
					<table>
						<thead>
							{/* HEADERS */}
							<tr>
								{columnConfig.map(({ title, key }) => (
									<th
										key={key}
										onClick={() => handleSort(key)}
										style={{ cursor: 'pointer' }}
									>
										<div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
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
									{/* DATA FOR EACH COLUMN */}
									<td style={{ border: '1px solid black', padding: '10px' }}>{item.date}</td>
									<td style={{ border: '1px solid black', padding: '10px' }}>${item.revenue}</td>
									<td style={{ border: '1px solid black', padding: '10px' }}>${item.netIncome}</td>
									<td style={{ border: '1px solid black', padding: '10px' }}>${item.grossProfit}</td>
									<td style={{ border: '1px solid black', padding: '10px' }}>${item.eps}</td>
									<td style={{ border: '1px solid black', padding: '10px' }}>${item.operatingIncome}</td>
								</tr>
							))}
						</tbody>
					</table>
					{/* Raw JSON: */}
					{/* <pre>{JSON.stringify(data, null, 2)}</pre> */}
				</div>
			</>
		)
	}

	return (
		<>
			<div className="App">
				<header className="App-header">
					{/* Split page into 3 columns */}
					<div 
						style={{
						display: 'flex',
						justifyContent: 'space-between',
						gap: '20px',
						width: '100%'
					}}>
						{/* Column 1 */}
						<div 
							style= {{
								flex: '1',
								padding: '20px'
							}}>

							<div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
								<div 
									style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end' }}>
									<button
										onClick={handleUpdateFilter}
										style={{ display: 'flex', alignItems: 'center' }}>
										<span style={{ marginLeft: '5px' }}>Update Filter:</span>
										<Icon name="filter" />
									</button>
								</div>

								<p>Filter by Date:</p>
								<DatePicker
									style={{ color: 'black', padding: '5px' }}
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

								<p>Filter by Revenue:</p>
								<div style={{ display: 'flex', alignItems: 'center' }}>
									<input
										type="number"
										value={revenueInputs.start}
										placeholder="Lower Revenue"
										style={{ color: 'black', padding: '5px', marginRight: '5px' }}
										onChange={(e) => setRevenueInputs(prev => ({ ...prev, start: e.target.value }))}
									/>
									<span>-</span>
									<input
										type="number"
										value={revenueInputs.end}
										placeholder="Upper Revenue"
										style={{ color: 'black', padding: '5px', marginLeft: '5px' }}
										onChange={(e) => setRevenueInputs(prev => ({ ...prev, end: e.target.value }))}
									/>
								</div>

								<p>Filter by Net Income:</p>
								<div style={{ display: 'flex', alignItems: 'center' }}>
									<input
										type="number"
										value={netIncomeInputs.start}
										placeholder="Lower Net Income"
										style={{ color: 'black', padding: '5px', marginRight: '5px' }}
										onChange={(e) => setNetIncomeInputs(prev => ({ ...prev, start: e.target.value }))}
									/>
									<span>-</span>
									<input
										type="number"
										value={netIncomeInputs.end}
										placeholder="Upper Net Income"
										style={{ color: 'black', padding: '5px', marginLeft: '5px' }}
										onChange={(e) => setNetIncomeInputs(prev => ({ ...prev, end: e.target.value }))}
									/>
								</div>
								<p>Filtering {filteredCount} {filteredCount === 1 ? "statement" : "statements"}</p>
							</div>
						</div>

						{/* Column 2, main content */}
						<div style={{ 
							flex: '2', 
							display: 'flex', 
							flexDirection: 'column', 
							alignItems: 'center'
							}}>
							<div style={{ 
								position: 'relative', 
								display: 'inline-block', 
								marginBottom: '10px' }}>
								<input
									type="text"
									value={tickerTextInput}
									onChange={(e) => setTickerTextInput(e.target.value)}
									onKeyDown={handleKeyPress}
									placeholder="Enter stock ticker"
									style={{ color: 'black', padding: '5px' }}
								/>
								<button
									onClick={() => setTicker(tickerTextInput)}
									style={{
										position: 'absolute',
										right: '10px',
										top: '50%',
										transform: 'translateY(-50%)',
										background: 'none',
										border: 'none',
										padding: 0
									}}>
									<Icon name="arrow-big-right" />
								</button>
							</div>
							{loading ? (<div>Loading...</div>) : (updateTable(data))}
						</div>

						{/* Column 3 */}
						<div style={{
							flex: '1',
							padding: '20px'
						}}>
							<ResponsiveContainer width="100%" height="100%">
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
										tick={{ fill: 'white', angle: 45, textAnchor: 'start' }}  // Make axis labels white and diagonal
										reversed={true}
									/>
									<YAxis 
										tick={{ fill: 'white' }}  // Make axis labels white
										tickFormatter={formatLargeNumbers}
									/>
									<Tooltip 
										formatter={(value) => formatLargeNumbers(value)}
										labelStyle={{ color: 'black' }}
									/>
									<Line
										type="monotone"
										dataKey="revenue"
										stroke="#8884d8"
										strokeWidth={2}
										dot={{ fill: '#8884d8' }}
									/>
								</LineChart>
							</ResponsiveContainer>
						</div>
					</div>

				</header>
			</div>
		</>
	);
}

export default App;

/*
Bugs:
- Date filter text is white but I can't get CSS to fix it
- 
*/