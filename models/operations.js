const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const bet_data = new Schema({
    bet_id: String,
    nominal: Number,
    content: Schema.Types.Mixed,
    win_amount: Number,
    jp_amount: Number
})

const req_data_schema = new Schema({
    user_id: String,
    transaction_id: {type:Number, required: true, unique: true},
    currency: String,
    amount: Number,
    start_operation_id: String,
    bonus_amount: Number,
    game_type: Number,
    game_id: String,
    game_data: Schema.Types.Mixed,
    merchant_id: Number,
    session_id: String,
    bonus_game: Boolean,
    bet_data: {
        type: [bet_data],
        validate: {
            validator: function(arr) {
                // bet_id unique check
                const ids = arr.map(obj => obj.bet_id);
                return ids.length === new Set(ids).size;
            },
            message: 'Fields "bet_id" must be unique within this JSON object'
        }
    }
})

const req_body_schema = new Schema({
    data: req_data_schema,
    hash: String,
    time: String
})

const res_data_schema = new Schema({
    result: {type:Boolean, required: true},
    err_code: {type:Number, required: true},
    operation_id: {type:Number, required: true, unique: true},
    balance: {type:Number, required: true},
    bonus_balance: {type:Number, required: true}
})

const operationsSchema = new Schema({
    req_body: req_body_schema,
    res_data: res_data_schema,
    is_rolled_back: Boolean
});

const Operations = mongoose.model('Operations', operationsSchema);

module.exports = Operations;