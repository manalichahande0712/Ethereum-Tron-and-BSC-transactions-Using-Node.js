const express = require('express');
const router = express.Router();
// const TronGrid = require('trongrid');
const TronWeb = require('tronweb');
const Web3 = require('web3')
const mongoose = require('mongoose');
// const HttpProvider = TronWeb.providers.HttpProvider;
// const fullNode = new HttpProvider('https://api.shasta.trongrid.io');
// const solidityNode = new HttpProvider('https://api.shasta.trongrid.io');
// const eventServer = 'https://api.shasta.trongrid.io';
// const privateKey = "43f27cbf6bae72f056beb09c34f082e0b6f1178e411265e5c3e60898b66d5395"; 
// const address = "TGx5z3H6DPbZiL6Cy2yut5QDLQdLdBP6Zt"; 


const HttpProvider = TronWeb.providers.HttpProvider;
const fullNode = new HttpProvider('https://api.shasta.trongrid.io');
const solidityNode = new HttpProvider('https://api.shasta.trongrid.io');
const eventServer = 'https://api.shasta.trongrid.io';
const privateKey = '4cb5bd26bb2dfd59e57876a8921c1179f1f64f24a3ab9d0193b0694f7d26b151';


// Create tronWeb object defining Node addresses
const tronWeb = new TronWeb(
    fullNode,
    solidityNode,
    eventServer,
    privateKey,
);

router.post('/balanced', async (req, res, next) => {
    const { address } = req.body;
    try {
        const balance = await tronWeb.trx.getBalance(address);
        console.log(balance);
        res.status(200).json({balance})
    } catch (Error) {
        res.status(404).json({ Message : 'Account Address not found!!' })
        console.log(Error) 
    }
})

module.exports = router;
