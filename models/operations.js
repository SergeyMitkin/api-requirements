const mongoose = require('mongoose');
const Schema = mongoose.Schema;


const response_data_schema = new Schema({
    result: {type:Boolean, required: true},
    err_code: {type:Number, required: true},
    operation_id: {type:Number, required: true, unique: true},
    balance: {type:Number, required: true},
    bonus_balance: {type:Number, required: true}
})

const operationsSchema = new Schema({
    transaction_id: {type:Number, required: true, unique: true},
    response_data: response_data_schema
});

const Operations = mongoose.model('Operations', operationsSchema);

module.exports = Operations;