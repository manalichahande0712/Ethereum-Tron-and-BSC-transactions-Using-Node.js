const mongoose = require('mongoose');

const transactionSchema = mongoose.Schema({
    _id : mongoose.Types.ObjectId,
    sender:{
        type : String,
        require : true
    },
     from:{
        type : String,
        require : true
    },
    to:{
        type : String,
        require : true
    },
    value:{
        type : String,
        require : true
    },
    amount:{
        type : String,
        require : true
    },
    gasLimit:{
        type : String,
        require : true
    },
    gasPrice:{
        type : String,
        require : true
    },
    receipt:{
        type : Array,
        require : true
    },
    email:{
        type : String,
        require : true
    },
    token:{
        type : String,
        require : true
    },
    Hash:{
        type : String,
        require : true
    }},
    {
        timestamps:true
    },
);

module.exports = mongoose.model('Transaction', transactionSchema)