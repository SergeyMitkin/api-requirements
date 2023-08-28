const utils = require("./utils");
const {text} = require("express");

function deposit(salt, merchant_id, new_operation_id, req_body, user_data) {
    let result = Boolean(user_data);
    let err_code = 0;

    let bet_amount = req_body.data.amount;

    // User check
    if (result) {
        let req_data = req_body.data;
        let time = req_body.time;
        let req_hash = req_body.hash;
        let hash = utils.sha256(time, JSON.stringify(req_data), salt).digest('hex');

        // Request structure and parameters check
        if (bet_amount < 0 || !requestCheck(req_body))
        {
            err_code = 2;
        }
        // Hash check
        else if (hash !== req_hash) {
            err_code = 1;
        }
    } else {
        err_code = 3;
    }

    if (err_code === 0) {
        let user_balance = user_data.amount + bet_amount;
        let user_bonus_balance = user_data.bonus_amount;

        return {
            "result": true,
            "err_code": err_code,
            "operation_id": new_operation_id,
            "balance": user_balance.toFixed(2),
            "bonus_balance": user_bonus_balance.toFixed(2),
        }
    }
    return {
        "result": false,
        "err_code": err_code
    }
}

function requestCheck(req_body) {
    let data = req_body.data;
    let params_length = Object.keys(data).length;
    let correct_params = true;

    let nec_params = [
        'amount',
        'bet_data',
        'bonus_game',
        'currency',
        'game_data',
        'game_id',
        'game_type',
        'merchant_id',
        'start_operation_id',
        'user_id',
        'transaction_id',
    ];
    let opt_param = 'session_id';

    if ((params_length === 11 || params_length === 12) && utils.isAlphabetSorted(data)) {
        if (params_length === 11) {
            Object.keys(data).forEach((e) => {
                if(!nec_params.includes(e)){
                    correct_params = false;
                }
            })
        }
        if (correct_params && Object.keys(data).length === 12) {
            nec_params.push(opt_param);
            Object.keys(data).forEach((e) => {
                if(!nec_params.includes(e)){
                    correct_params = false;
                }
            })
        }
    }

    if (!correct_params){
        return false
    }

    return (Object.keys(req_body).length === 3
        && 'time' in req_body
        && 'data' in req_body
        && 'hash' in req_body
    );
}

module.exports = {
    deposit: deposit
};