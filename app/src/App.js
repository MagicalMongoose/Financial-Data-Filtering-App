import './App.css';
import useAPI from './Components/useAPI';

const apiKey = process.env.REACT_APP_FINANCIAL_MODELING_PREP_API_KEY;
function App() {
	const { data, loading, error } = useAPI(`https://financialmodelingprep.com/api/v3/income-statement/AAPL?period=annual&apikey=${apiKey}`);

	if (loading) return <div>Loading...</div>;
	if (error) return <div>Error: {error}</div>;

	return (
		<div className="App">
		<header className="App-header">
		</header>

		<body>
			<h1>I GOT THE FINANCIAL DATA FROM API!!!</h1>
			<pre>{JSON.stringify(data, null, 2)}</pre>
		</body>
		</div>
	);
}

export default App;
