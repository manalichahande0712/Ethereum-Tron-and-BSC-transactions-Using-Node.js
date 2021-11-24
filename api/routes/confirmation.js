const express = require('express');
const router = express.Router();
require('dotenv').config();
const nodemailer = require('nodemailer');
const mongoose = require('mongoose');
const Transaction = require('../models/transaction');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const config = process.env
const Web3 = require('web3')
const Tx = require('ethereumjs-tx').Transaction
const web3 = new Web3(process.env.INFURA)
const privateKey = Buffer.from( process.env.privateKey, 'hex');

let link, link1, mailOptions, token;
const mail = nodemailer.createTransport({
  service: "Gmail",
  auth: {
    user: process.env.USER,
    pass: process.env.PASSWORD
  }
});

router.post('/confirmation', async(req, res) => {
 
  const { sender,  to , value ,email} = req.body;

  const transaction = new Transaction({
    _id : new mongoose.Types.ObjectId,
    sender :sender,
    to : to,
    value : value,
    email : email,
  })
  host=req.get('host');
   token = jwt.sign(
    {
      transaction
    },
    process.env.Token_KEY,
    {
      expiresIn: "2h",
    }
  );

  
  link="http://"+req.get('host')+"/api/verify?token="+token;
  link1="http://"+req.get('host')+"/api/decline?token="+token;

    mailOptions = {
    to: email,
    subject: "Please confirm your Ethereum Transaction",
    html:"<h4><a href=" + link + " style='background:#EC8B10; padding:10px 10px;'>Click here to confirm Your Transaction</a> <a href=" + link1 +  " style='background:#E32320; padding:10px 10px;'>Decline Transaction</a></h4>"
  }
  
  mail.sendMail(mailOptions, function (error, response) {
    if (error) {
      console.log(error);
      res.end("error");
    } else {
      console.log("Message sent: " + response.message);
      res.end("sent");
    }
  });  
})

router.get('/verify', async(req, res) => {
    console.log(req.protocol + ":/" + req.get('host'));
  if ((req.protocol+"://"+req.get('host'))==("http://"+host)) {
   
    const decode = jwt.verify(token, config.Token_KEY);
    if(req.query.token==token)
    {
      web3.eth.getTransactionCount(decode.transaction.sender, (err, txCount) => {
    
        // Build the Transaction
        const txObject = {
            nonce : web3.utils.toHex(txCount),
            to : decode.transaction.to,
            value: web3.utils.toHex(web3.utils.toWei(decode.transaction.value, 'ether')),
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
              _id : decode.transaction._id,
                sender :decode.transaction.sender,
                to : decode.transaction.to,
                value : decode.transaction.value,
                email :decode.transaction.email,
                gasLimit : txObject.gasLimit,
                gasPrice : txObject.gasPrice,
                Hash : txHash
            })
            try {
                const t1 = transaction.save()
               
                mailOptions = {
                    from: process.env.USER,
                     to: transaction.email,
                    subject: 'Ethereum Transaction!!!',
                    html: `<h2>Your Ethereum Transaction successfully Done!!!</h2>
                    <p> <h2>Transaction Details of Ethereum!!</h2>
                    TxID : ${transaction._id}<br>
                    Status :Successful<br>
                    Sender:- ${transaction.sender} <br>
                    Receiver:- ${transaction.to} <br>
                    Amount:- ${transaction.value}<br>
                    gasLimit:- ${transaction.gasLimit}<br>
                    gasPrice:- ${transaction.gasPrice}<br>
                    Hash:- ${transaction.Hash}
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
    else
    {
        console.log("email is not verified");
        res.end("<h1>Bad Request</h1>");
    }
    
  }
  else {
    res.end("<h1>Request is from unknown source");
  }

})
router.get('/d', async(req, res) => {

})



router.get('/decline', async(req, res) => {
  console.log(req.protocol + ":/" + req.get('host'));
if ((req.protocol+"://"+req.get('host'))==("http://"+host)) {
 
  const decode = jwt.verify(token, config.Token_KEY);
  if(req.query.token==token)
  {
    web3.eth.getTransactionCount(decode.transaction.sender, (err, txCount) => {
  
      // Build the Transaction
      const txObject = {
        nonce : web3.utils.toHex(txCount),
        to : decode.transaction.to,
        value: web3.utils.toHex(web3.utils.toWei(decode.transaction.value, 'ether')),
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
            _id : decode.transaction._id,
            sender :decode.transaction.sender,
            to : decode.transaction.to,
            value : decode.transaction.value,
            email :decode.transaction.email,
            Hash : txHash
              
          })
          try {
              const t1 = transaction.save()
              mailOptions = {
                from: process.env.USER,
                 to: transaction.email,
                subject: 'Ethereum Transaction!!!',
                html: `<p> <h2>your Ethereum transaction is decline!!</h2>
                TxID : ${transaction._id}<br>
                Status :failed<br>
                Sender:- ${transaction.sender} <br>
                Receiver:- ${transaction.to} <br>
                Amount:- ${transaction.value}<br>
                
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
                  Message : 'Ethereum Decline Transaction!',
                  transaction,
              }) 
          } catch (error) {
              res.status(404).json({
                  Message :'Transaction error!! :',
                  error
              })
          }
      })
  }) 
     
  }
  else
  {
      console.log("email is not verified");
      res.end("<h1>Bad Request</h1>");
  }
  
}
else {
  res.end("<h1>Request is from unknown source");
}

})
router.get('/d', async(req, res) => {

})

// router.get('/send', function (req, res) {

//   mailOptions = {
//     to: req.body.email,
//     subject: "Please confirm your Email Transaction",
//     html: "Hello,<br> Please Click on the link to verify your email.<br><a href=" + link + ">Click here to verify</a>"
//   }
//   console.log(mailOptions);
//   mail.sendMail(mailOptions, function (error, response) {
//     if (error) {
//       console.log(error);
//       res.end("error");
//     } else {
//       console.log("Message sent: " + response.message);
//       res.end("sent");
//     }
//   });
// });

// router.get('/verify', function (req, res) {
//   console.log(req.protocol + ":/" + req.get('host'));
//   if ((req.protocol + "://" + req.get('host')) == ("http://" + host)) {
//     console.log("Domain is matched. Information is from Authentic email");
//     if (req.body.email) {
//       console.log("email is verified");
//       res.end("<h1>email " + mailOptions.email + " is been Successfully verified");
//     }
//     else {
//       console.log("email is not verified");
//       res.end("<h1>Bad Request</h1>");
//     }
//   }
//   else {
//     res.end("<h1>Request is from unknown source");
//   }
// });


// router.post('/send', async (req, res, next) => {
//   try {
//     const { email } = req.body;
//     const transaction = await Transaction.findOne({ email }); {

//       if (transaction && (await bcrypt.compare(email, transaction.email))) {
//         // create jwt token
//         const token = jwt.sign(
//           {
//             transaction_id: transaction._id, email
//           },
//           process.env.TOKEN_KEY,
//           {
//             expiresIn: "2h",
//           }
//         );
//         transaction.token = token;

//         //loging success message
//         res.status(200).send({
//           message: `transaction Verified!!  Please check your Email-ID!`,
//           email,
//           token
//         });
//       }
//       else {
//         res.status(400).send("Invalid Credentials")
//       }
//     }
//     const mail = nodemailer.createTransport({
//       service: 'gmail',
//       auth: {
//         user: process.env.USER,
//         pass: process.env.PASSWORD
//       }
//     });

//     const mailOptions = {
//       from: process.env.USER,
//       to: req.body.email,
//       subject: 'Please confirm your Transaction',
//       html: '<h1>Email Confirmation</h1><p>Please confirm your transaction by clicking on the following link</p><p><a href=https://mail.google.com/mail/u/0/#inbox/FMfcgzGlksGwdnBtglmkbffTDWKHbtsw> Click here</a></p>'
//     };

//     mail.sendMail(mailOptions, function (error, info) {
//       if (error) {
//         console.log(error);
//       }
//       else {
//         console.log('Email sent: ' + info.response);
//       }
//     });
//   }

//   catch (err) {
//     console.log(err)
//   }
// });

module.exports = router;