import './App.css';
import useAPI from './Components/useAPI';
import { useState } from 'react';
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css"

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

function App() {

	const [sortConfig, setSortConfig] = useState({
		key: null,
		direction: 'ascending'
	});
	const [ticker, setTicker] = useState(`${stockTicker}`);
	const [tickerTextInput, setTickerTextInput] = useState(`${ticker}`); // separate so it doesn't refresh each keystroke

	// for date filtering
	const [startDate, setStartDate] = useState();
	const [endDate, setEndDate] = useState();

	let { data, loading, error } = useAPI(`https://financialmodelingprep.com/api/v3/income-statement/${ticker}?period=annual&apikey=${apiKey}`);

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

	const handleDateFilter = (range) => {
		const [startDate, endDate] = range;
		setStartDate(startDate);
		setEndDate(endDate);
		updateTable(data);
	}


	function updateTable(data) {
		console.log("updateTable")
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
		// If there isn't an error:
		const sortedData = sortData(data)
		return (
			<>
				<div>
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
					<div style={{ position: 'relative', display: 'inline-block' }}>
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

					{/* Split page into 3 columns */}
					<div style={{
						display: 'flex',
						justifyContent: 'space-between',
						gap: '20px',
						width: '100%'
					}}>
						{/* Column 1 */}
						<div style=
						{{
							flex: '1',
							border: '1px solid #ccc',
							padding: '20px'
						}}>
							<div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end' }}>
								<button onClick={() => (updateTable(data))} style={{ display: 'flex', alignItems: 'center' }}>
									<span style={{ marginLeft: '5px' }}>Update Filter:</span>
									<Icon name="filter" />
								</button>
							</div>
							<p>Filter by Date:</p>
							<DatePicker 
								showMonthYearPicker
								placeholderText={startDate ? startDate : "placeholder"}
								selected={startDate}
								onChange={handleDateFilter}
								startDate={startDate}
								endDate={endDate}
								selectsRange
								style={{ color: 'black', padding: '5px', backgroundColor: 'black', border: '1px solid #ccc', borderRadius: '4px' }}
							/>

							<p>Filter by Revenue:</p>
							<input
								type="number"
								value={0}
								placeholderText="Lower Revenue"
							/>
							-
							<input
								type="number"
								value={0}
								placeholderText="Upper Revenue"
							/>

							<p>Filter by Net Income:</p>
							<input
								type="number"
								value={0}
								placeholderText="Lower Net Income"
							/>
							-
							<input
								type="number"
								value={0}
								placeholderText="Upper Net Income"
							/>
						</div>

						{/* Column 2, main content */}
						{loading ? (<div>Loading...</div>) : (updateTable(data))}

						{/* Column 3 */}
						<div style=
						{{
							flex: '1',
							border: '1px solid #ccc',
							padding: '0px'
						}}>
						<div style={{ backgroundImage: `url(${require('./Assets/Chart.png')})`, backgroundSize: 'cover', height: '100%', width: '100%' }} alt={"Stock chart going up"} />
						</div>
					</div>

				</header>
			</div>
		</>
	);
}

export default App;