const express = require('express');
const router = express.Router();
const nodemailer = require('nodemailer');
require('dotenv').config(); 
const Web3 = require('web3')
const Tx = require('ethereumjs-tx').Transaction 
const web3 = new Web3(process.env.INFURA_bsc)
const privateKey = Buffer.from( '48a7e7d1ea33fb36b9ff5c80de8467f2620ab1a6211a62d77cbaacdfa64e8d66', 'hex');
const mongoose = require('mongoose');
const Transaction = require('../models/transaction');


router.post('/send', async (req, res, next) => {
    const { sender,  to , value , email } = req.body;

    try {
        web3.eth.getTransactionCount(sender, (err, txCount) => {
    
            // Build the Transaction
            const txObject = {
                nonce : web3.utils.toHex(txCount),
                to : to,
                value: web3.utils.toHex(web3.utils.toWei(value, 'ether')),
                gasLimit : web3.utils.toHex(21000),
                gasPrice : web3.utils.toHex(web3.utils.toWei('10', 'gwei'))
            }
            
            
            const common = Common.forCustomChain(
                'mainnet',
                {
                    name: 'bnb',
                    networkId: 97,
                    chainId: 97,
                },
                'istanbul',
            );

            //Sign the Transaction
            const tx = new Tx(txObject, { common })
            tx.sign(privateKey)
        
            const serializedTransaction =tx.serialize()
            const raw ='0x'+serializedTransaction.toString('hex')
        
             //Broadcast the Transaction
             web3.eth.sendSignedTransaction(raw, (err,txHash) => {
                console.log('err:', err)
                console.log('txHash:', txHash)
                const transaction = new Transaction({
                    _id : new mongoose.Types.ObjectId,
                    email : email,
                    sender : sender,
                    to : to,
                    value : value,
                    gasLimit : txObject.gasLimit,
                    gasPrice : txObject.gasPrice,
                    Hash : txHash
                })
                try {
                    const t1 = transaction.save()
                   const mail = nodemailer.createTransport({
                       service: 'gmail',
                       auth:{
                           user:process.env.USER,
                           pass:process.env.PASSWORD    
                        }
                    });
                    
                    const mailOptions = {
                       from: process.env.USER,
                       to: req.body.email,
                       subject: 'Your Ethereum Transaction success!',
                       html: `<p> <h2>Transaction Details of Ethereum!!</h2>
                       TxID : ${transaction._id}<br>
                       Sender:- ${sender} <br>
                       Receiver:- ${to} <br>
                       Amount:- ${value}<br>
                       gasLimit:- ${transaction.gasLimit}<br>
                       gasPrice:- ${transaction.gasPrice}<br>
                       Hash:- ${txHash}
                       </p>`
                        
                    };
                    
                    mail.sendMail(mailOptions, function(error, info){
                       if (error) {
                           console.log(error);
                        }
                        else{
                           console.log('Email sent: ' + info.response);
                        }
                    })
                    res.status(200).json({
                        Message : 'Transaction save and Email sent suceessfully!',
                        transaction,
                    }) 
                } catch (error) {
                    res.status(404).json({
                        Message :'Transaction error :',
                        error
                    })
                }
            })
        })
    } 
    catch (error) {
        res.send(error)
    }
})

module.exports = router;