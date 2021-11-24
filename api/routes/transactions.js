const express = require('express');
const router = express.Router();
require('dotenv').config(); 
const Web3 = require('web3')
const Tx = require('ethereumjs-tx').Transaction
const web3 = new Web3(process.env.INFURA)
const privateKey = Buffer.from( process.env.privateKey, 'hex');
const mongoose = require('mongoose');
const Transaction = require('../models/transaction');


router.post('/transaction', async (req, res, next) => {
    const { sender,  to , value1 ,email} = req.body;

    try {
        web3.eth.getTransactionCount(sender, (err, txCount) => {
    
            // Build the Transaction
            const txObject = {
                nonce : web3.utils.toHex(txCount),
                to : to,
                value: web3.utils.toHex(web3.utils.toWei(value1, 'ether')),
                gasLimit : web3.utils.toHex(21000),
                gasPrice : web3.utils.toHex(web3.utils.toWei('10', 'gwei'))
            }
        
            //Sign the Transaction
            const tx = new Tx(txObject, { chain: 'ropsten' })
            tx.sign(privateKey)
        
            const serializedTransaction =tx.serialize()
            const raw ='0x'+serializedTransaction.toString('hex')
        
             //Broadcast the Transaction
            web3.eth.sendSignedTransaction(raw, (err,txHash) => {
                console.log('err:', err)
                console.log('txHash:', txHash)
               
                const transaction = new Transaction({
                    _id : new mongoose.Types.ObjectId,
                    sender : req.body.sender,
                    to : req.body.to,
                    value : req.body.value1,
                    email : req.body.email,
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
                        subject: 'Your Ethereum Transaction successfully Done!!!',
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
                        Message : 'Transaction successfully!',
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