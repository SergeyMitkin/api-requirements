const utils = require("./utils");
const {text} = require("express");

function deposit(salt, merchant_id, new_operation_id, req_body, user_data) {
    let result = Boolean(user_data);
    let err_code = 0;

    let bet_amount = req_body.data.amount;
    let bet_data = req_body.data.bet_data;
    let bonus_game = req_body.data.bonus_game;
    let currency = req_body.data.currency;
    let game_id = req_body.data.game_id;
    let game_type = req_body.data.game_type;
    let game_data = req_body.data.game_data;
    let transaction_id = req_body.data.transaction_id;
    let start_operation_id = req_body.data.start_operation_id;

    // User check
    if (result) {
        let user_id = user_data.user_id;
        let user_params = {
            amount: bet_amount,
            bet_data: bet_data,
            bonus_game: bonus_game,
            currency: currency,
            game_id: game_id,
            game_type: game_type,
            game_data: game_data,
            merchant_id: String(merchant_id),
            transaction_id: transaction_id,
            start_operation_id: start_operation_id,
            user_id: user_id,
        };
        let time = utils.getDateStr();
        let req_hash = req_body.hash;
        let user_params_sort = utils.sortObject(user_params);
        let hash = utils.sha256(time, JSON.stringify(user_params_sort), salt).digest('hex');

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