import './App.css';
import useAPI from './Components/useAPI';

let stockTicker = "AAPL"

const columnTitles = ["Date", "Revenue", "Net Income", "Gross Profit", "EPS", "Operating Income"]
const apiKey = process.env.REACT_APP_FINANCIAL_MODELING_PREP_API_KEY;
function App() {
	const { data, loading, error } = useAPI(`https://financialmodelingprep.com/api/v3/income-statement/${stockTicker}?period=annual&apikey=${apiKey}`);

	if (loading) return <div>Loading...</div>;
	if (error) return <div>Error: {error}</div>;

	return (
		<>
			<div className="App">
				<header className="App-header">
				<h1 className="text-3xl font-semibold underline bg-red-500">
					{stockTicker} Financial Data Overview
				</h1>
				<div>
					<table>
						<thead>
							<tr>
								{columnTitles.map((col, index) => (
									<td key={index} style={{ padding: '10px'}}>{col}</td>
								))}
							</tr>
						</thead>
						<tbody>
							{data.map((item, index) => (
								<tr key={index}>
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
				</header>
			</div>
			
		</>
	);
}

export default App;