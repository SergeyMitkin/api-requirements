const utils = require("./utils");

function rollback(salt, merchant_id, req_body, withdraw, is_rolled_back, user_data) {
    let err_code = 0;
    let bonus_game = req_body.data.bonus_game;
    let transaction_id = req_body.data.transaction_id;

    // User check
    if (user_data) {
        let req_data = req_body.data;
        let time = req_body.time;
        let req_hash = req_body.hash;
        let hash = utils.sha256(time, JSON.stringify(req_data), salt);

        // Request structure and parameters check
        if (!requestCheck(req_body))
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
        let user_balance = user_data.amount;
        let user_bonus_balance = user_data.bonus_amount;

        if(is_rolled_back === false) {
            let bet_amount = withdraw.req_body.data.amount;
            let bet_bonus_amount = withdraw.req_body.data.bonus_amount;

            user_balance += bet_amount;
            user_bonus_balance += bet_bonus_amount;
        }

        return {
            "result": true,
            "err_code": err_code,
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
        'user_id',
        'transaction_id',
        'merchant_id',
        'bonus_game'
    ];
    let opt_param = 'session_id';

    if ((params_length === 4 || params_length === 5) && utils.isAlphabetSorted(data)) {
        if (params_length === 4) {
            Object.keys(data).forEach((e) => {
                if(!nec_params.includes(e)){
                    correct_params = false;
                }
            })
        }
        if (Object.keys(data).length === 5) {
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
    rollback: rollback
};