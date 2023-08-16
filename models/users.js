const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const usersSchema = new Schema({
    name: String,
    amount: Number,
    bonus_amount: Number,
    currency: String,
    user_id: String
});

const Users = mongoose.model('Users', usersSchema);

module.exports = Users;