const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const operationsSchema = new Schema({
    transaction_id: Number,
    operation_id: Number,
    response_data: String
});

const Operations = mongoose.model('Operations', operationsSchema);

module.exports = Operations;