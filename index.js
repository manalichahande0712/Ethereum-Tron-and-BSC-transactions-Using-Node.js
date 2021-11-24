const express = require('express')
const app = express()
const PORT = 5000
const TransactionRouter = require('./api/routes/transactions')
const BalanceRouter = require('./api/routes/balances');
const TronRouter = require('./api/routes/tron');
const tbalance = require('./api/routes/tbalance');
const binance = require('./api/routes/binance');
const bscbalance = require('./api/routes/bscbalance');
const confirmation = require('./api/routes/confirmation');


require('dotenv').config();
require('./config/database').connect() 

app.use(express.json())

app.use('/api', TransactionRouter);
app.use('/api', BalanceRouter);
app.use('/api',TronRouter);
app.use('/api', tbalance);
app.use('/api/binance',binance);
app.use('/api/bscbalance',bscbalance);
app.use('/api',confirmation);

app.listen(PORT, () => {
    console.log(`Server running on PORT : ${PORT}`);
});