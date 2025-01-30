import "./App.css";
import { useState } from "react";
import useAPI from "./Components/useAPI";
import FilterPanel from './Components/FilterPanel.jsx';
import DataTable from './Components/DataTable.jsx';
import RevenueChart from './Components/RevenueChart.jsx';

// Initial stock ticker upon loading the page
let stockTicker = "AAPL";

// Dynamically fetch icons just by calling filename
const Icons = require.context("./Assets", false, /\.svg$/);
const Icon = ({ name }) => {
  try {
    const iconPath = Icons(`./${name}.svg`);
    return (
      <img
        src={iconPath}
        alt={name}
        style={{ width: "24px", height: "24px" }}
      />
    );
  } catch (error) {
    console.error(`Icon ${name} not found`);
    return null;
  }
};

const apiKey = process.env.REACT_APP_FINANCIAL_MODELING_PREP_API_KEY;

const formatLargeNumbers = (number) => {
  if (number >= 1e12) {
    return `$${(number / 1e12).toFixed(1)}T`; // Trillions
  }
  if (number >= 1e9) {
    return `$${(number / 1e9).toFixed(1)}B`; // Billions
  }
  if (number >= 1e6) {
    return `$${(number / 1e6).toFixed(1)}M`; // Millions
  }
  return `$${number}`;
};

function App() {
  const [ticker, setTicker] = useState(stockTicker);
  const [filteredData, setFilteredData] = useState([]);
  
  // Fetch data using custom hook
  const { data, loading, error } = useAPI(
    `https://financialmodelingprep.com/api/v3/income-statement/${ticker}?period=annual&apikey=${apiKey}`
  );

  const handleTickerChange = (newTicker) => {
    setTicker(newTicker.toUpperCase());
  };

  const handleFilteredDataChange = (newFilteredData) => {
    setFilteredData(newFilteredData);
  };

  return (
    <div className="App">
      <header className="min-h-screen bg-[#181a1b] text-white flex flex-col items-center justify-center text-[calc(5px+1vmin)]">
        <div className="w-full mx-auto flex flex-col 2xl:flex-row 2xl:flex-nowrap justify-between gap-4 max-w-[1920px] p-4">

          <FilterPanel
            data={data}
            onFilteredDataChange={handleFilteredDataChange}
            Icon={Icon}
          />

          <DataTable
            data={filteredData}
            loading={loading}
            error={error}
            ticker={ticker}
            onTickerChange={handleTickerChange}
            formatLargeNumbers={formatLargeNumbers}
            Icon={Icon}
          />

          <RevenueChart
            data={filteredData}
            loading={loading}
            formatLargeNumbers={formatLargeNumbers}
          />

        </div>
      </header>
    </div>
  );
}

export default App;