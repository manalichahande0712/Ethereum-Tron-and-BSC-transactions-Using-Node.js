const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const nodemailer = require('nodemailer');
const TronWeb = require('tronweb');
const Transaction = require('../models/transaction');
// const privateKey = "4cb5bd26bb2dfd59e57876a8921c1179f1f64f24a3ab9d0193b0694f7d26b151"; 
// const fromAddress = "TWzBEpNEwnSpu139MxXrFXjGA6buiMyYdD"; //address _from
// const toAddress = "TGVkcUyhStAaXJvy9CzcTd63PsrTeyAzrG"; //address _to
// const amount = 100; //amount


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

//Creates an unsigned TRX transfer transaction
router.post('/sending', async (req, res, next) => {
  const {from, to, amount, email} = req.body;
 

  try {
        tradeobj = await tronWeb.transactionBuilder.sendTrx(
        to,
        amount,
        from
    );
    const signedtxn = await tronWeb.trx.sign(
        tradeobj,
    );
    const receipt = await tronWeb.trx.sendRawTransaction(
        signedtxn
    );
     
    // console.log(receipt)

        const trans = new Transaction({
            _id : new mongoose.Types.ObjectId,
            from : req.body.from,
            to : req.body.to,
            amount : req.body.amount,
            email : req.body.email,
           receipt : receipt.txid
        })
    
    try {
    const t1 = trans.save()
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
        subject: 'Your Tron Transaction success!!',
        html: `<p><h2>Transaction Details of Tron!!</h2>
        Transaction_ID : ${trans._id}<br>
        Sender_Address:-${from} <br>
        Receiver_Address:-${to} <br>
        Amount:-${amount} <br>
        Hash : ${trans.receipt}
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
        Message : 'Transaction save & email sent successfully!',
        trans,
    }) 
    } catch (error) {
    res.status(404).json({
        Message :'Transaction Between error!! :',
        error
    })
    } 
  }
  catch (error) {
    res.send(error)
   }
})

module.exports = router