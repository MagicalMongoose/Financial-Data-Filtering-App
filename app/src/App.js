import './App.css';
import useAPI from './Components/useAPI';
import { useState } from 'react';

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

const columnTitles = ["Date", "Revenue", "Net Income", "Gross Profit", "EPS", "Operating Income"];
const apiKey = process.env.REACT_APP_FINANCIAL_MODELING_PREP_API_KEY;

function App() {

	const [sortConfig, setSortConfig] = useState({
		key: null,
		direction: 'ascending'
	});
	const [ticker, setTicker] = useState(`${stockTicker}`);
	const [textInput, setTextInput] = useState(`${ticker}`);

	let { data, loading, error } = useAPI(`https://financialmodelingprep.com/api/v3/income-statement/${ticker}?period=annual&apikey=${apiKey}`);

	const sortData = (data) => {
		if (!sortConfig.key) return data; //default if no sort set

		return [...data].sort((a, b) => {
			if (a[sortConfig.key] < b[sortConfig.key])
				return sortConfig.direction === 'ascending' ? -1 : 1;
			if (a[sortConfig.key] > b[sortConfig.key])
				return sortConfig.direction === 'ascending' ? -1 : 1;
			return 0;
		});
	};

	const handleSearch = () => {
		setTicker(textInput);
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

		const sortedData = sortData(data)
		return (
			<>
				<h1>{ticker} Income Statement Overview</h1>
				<div>
					<table>
						<thead>
							<tr>
								{/* HEADERS */}
								{columnTitles.map((col) => {
									const key = col.toLocaleLowerCase().replace(/\s+/g, '');
									return (
										<th
											key={key}
											onClick={() => handleSort(key)}
											style={{ cursor: 'pointer' }}
										>
											<div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
												{col}
												<Icon name={sortConfig.key === key
													? `sort-${sortConfig.direction}`
													: "sort-descending"
												}
												/>
											</div>
										</th>
									);
								})}
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
							value={textInput}
							onChange={(e) => setTextInput(e.target.value)}
							onKeyDown={handleKeyPress}
							placeholder="Enter stock ticker"
							style={{ color: 'black', paddingRight: '30px' }}
						/>
						<button
							onClick={() => setTicker(textInput)}
							style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', padding: 0 }}>
							<Icon name="arrow-big-right" />
						</button>
					</div>

					{loading ? (<div>Loading...</div>) : (updateTable(data))}

					<Icon name="filter" />
					<Icon name="sort-ascending" />
				</header>
			</div>
		</>
	);
}

export default App;