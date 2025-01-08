# Financial-Data-Filtering-App
Internship Project for ValueGlance

Developed by Drew Lickman

This app fetches annual income statements for AAPL (Apple) and allows users to filter and analyze key metrics.
---

# How to run the app:
1. Sign up for [Financial Modeling Prep](https://site.financialmodelingprep.com/developer/docs).
2. Copy your API key from the developer docs page.
3. Rename the local file `.env.example` to `.env`
4. Paste your API key after `REACT_APP_FINANCIAL_MODELING_PREP_API_KEY=`
5. In the terminal run the command `npm start` (to end it press CTRL+C)
6. Open [http://localhost:3000/](http://localhost:3000/)
7. You can change the stock ticker by typing into the input box and either clicking the arrow or pressing Enter

## [Link to deployed app](https://valueglance.com/)

# How it works:
1. Fetches financial data from API and displays in a table.
2. Data can be filtered by each column.
3. Data can be sorted by each column.

(Note: many fetching attemps may result in temporary loss of access to API data)