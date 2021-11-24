const express = require('express');
const router = express.Router();
const Web3 = require('web3')
const web3 = new Web3('https://data-seed-prebsc-1-s1.binance.org:8545')
require('dotenv').config(); 
const Common = require('ethereumjs-common').default;
// const web3 = new Web3(process.env.INFURA_BSC)

        const common = Common.forCustomChain(
            'mainnet',
            {
                name: 'Smart Chain - Testnet',
                networkId: 97,
                chainId: 97,
                url: 'https://testnet.bscscan.com'
            },
            'istanbul',
        );

router.post('/check', async (req, res, next) => {
    const { account } = req.body;
    try {
        const balance = web3.utils.fromWei(
            await web3.eth.getBalance(account)
        );
        res.status(200).json({
            Message : 'Your Balance is!!',
            Account_Address : account,
            Balance : balance
        })
    } catch (Error) {
        res.status(404).json({ Message : 'Account Address not found!!' })
        console.log(Error) 
    }
})

module.exports = router;