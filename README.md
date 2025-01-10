# Financial-Data-Filtering-App
Internship Project for [ValueGlance](https://valueglance.com/)

Developed by Drew Lickman

This app fetches annual income statements for stocks, such as Apple, and allows users to filter and analyze key metrics.
---

# [Deployed online with Vercel](https://financial-data-filtering-app-magicalmongoose.vercel.app/)

# How to run the app locally:
1. Sign up for [Financial Modeling Prep](https://site.financialmodelingprep.com/developer/docs).
2. Copy your API key from the developer docs page.
3. Rename the local file `.env.example` to `.env`
4. Paste your API key after `REACT_APP_FINANCIAL_MODELING_PREP_API_KEY=`
5. In the terminal, run the command `cd app`
6. Make sure you have all the required dependencies with `npm install`
7. Then run the command `npm start` (to end the app, press CTRL+C in the terminal)
    <br>(Optional: to properly keep the TailwindCSS updated, open another terminal to the app and use `npm run watch:css`)
8. Open [http://localhost:3000/](http://localhost:3000/) (it should automatically open)

# Interactivity:
1. You can change the stock ticker by typing into the input box at the top of the Table section and either clicking the arrow or pressing Enter.
2. You can filter the data by inputting parameters in the Filter section.
3. You can sort the data by clicking the title of any of the table columns.
4. You can visualize the data in the Chart section.

[Source code](https://github.com/MagicalMongoose/Financial-Data-Filtering-App#financial-data-filtering-app)