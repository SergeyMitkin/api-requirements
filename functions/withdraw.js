const utils = require("./utils");
const Operations = require('../models/operations');

function withdraw(salt, merchant_id, req_body, user_data) {
    let result = Boolean(user_data);
    let err_code = 0;

    let bet_amount = req_body.data.amount;
    let bet_bonus_amount = req_body.data.bonus_amount;
    let bet_data = req_body.data.bet_data;
    let bonus_game = req_body.data.bonus_game;
    let currency = req_body.data.currency;
    let game_id = req_body.data.game_id;
    let game_type = req_body.data.game_type;
    let transaction_id = req_body.data.transaction_id;

    // User check
    if (result) {
        let user_id = user_data.user_id;
        let user_params = {
            amount: bet_amount,
            bonus_amount: bet_bonus_amount,
            bet_data: bet_data,
            bonus_game: bonus_game,
            currency: currency,
            game_id: game_id,
            game_type: game_type,
            merchant_id: String(merchant_id),
            transaction_id: transaction_id,
            user_id: user_id,
        };
        let time = utils.getDateStr();
        let req_hash = req_body.hash;
        let user_params_sort = utils.sortObject(user_params);
        let hash = utils.sha256(time, JSON.stringify(user_params_sort), salt);

        // Request structure and parameters check
        if (!utils.requestCheck(req_body))
        {
            err_code = 2;
        }
        // Hash check
        else if (hash.digest('hex') !== req_hash) {
            err_code = 1;
        }
    } else {
        err_code = 3;
    }

    if (err_code === 0) {
        let user_amount = user_data.amount - bet_amount;
        let user_bonus_amount = user_data.bonus_amount - bet_bonus_amount;

        // Checking if current transaction_id exists
        Operations
            .findOne({transaction_id:transaction_id})
            .then((operation_data) => {

                if (operation_data) {
                    return operation_data.response_data;
                    // res.send(operation_data.response_data);
                }
                else {
                    Operations
                        .findOne().sort('-operation_id')
                        .then((max_o_d) => {
                            let max_operation_id = max_o_d.operation_id;

                            // Amount update
                            if (user_data && (bet_amount > 0 || bet_bonus_amount > 0)) {
                                if (bet_amount > 0) {
                                    user_data.amount = user_amount;
                                }
                                if (bet_bonus_amount > 0) {
                                    user_data.bonus_amount = user_bonus_amount;
                                }
                                user_data.save()
                                    .then((result) => {
                                        console.log('user_data');
                                    })
                                    .catch((err) => {
                                        console.log(err);
                                    })
                            }

                            // If amount updated
                            if (user_data.isModified('amount') || user_data.isModified('bonus_amount')) {

                                // Save operation
                                let new_operation = new Operations({
                                    transaction_id: transaction_id,
                                    operation_id: max_operation_id + 1
                                });
                                new_operation.save()
                                    .then((operation_result) => {
                                        console.log('operation_result')
                                    })
                                    .catch((err) => {
                                        console.log(err);
                                    })
                            }
                        })
                        .catch((error) => {
                            console.log(error);
                            return JSON.stringify({
                                "result": false,
                                "err_code": 4
                            });
                        })
                }
            })
            .catch((error) => {
                console.log(error);
                return JSON.stringify({
                    "result": false,
                    "err_code": 4
                });
            })
        console.log('resturn');
        return {
            "result": true,
            "err_code": err_code,
            "balance": user_amount.toFixed(2),
            "bonus_balance": user_bonus_amount.toFixed(2),
        }
    } else {
        return {
            "result": false,
            "err_code": err_code
        }
    }
}

module.exports = {
    withdraw: withdraw
};