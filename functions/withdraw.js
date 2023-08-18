const utils = require("./utils");

function withdraw(salt, merchant_id, transaction_id, req_body, user_data) {
    let result = Boolean(user_data);
    let err_code = 0;

    let bet_amount = req_body.data.amount;
    let bet_bonus_amount = req_body.data.bonus_amount;
    let bet_data = req_body.data.bet_data;
    let bonus_game = req_body.data.bonus_game;
    let currency = req_body.data.currency;
    let game_id = req_body.data.game_id;
    let game_type = req_body.data.game_type;

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
            transaction_id: req_body.data.transaction_id,
            user_id: user_id,
        };
        let time = utils.getDateStr();
        let req_hash = req_body.hash;
        let user_params_sort = utils.sortObject(user_params);
        let hash = utils.sha256(time, JSON.stringify(user_params_sort), salt);

        // Request structure and parameters check
        if (!utils.requestCheck(req_body))
        {
            err_code = 2
        }
        // Hash check
        else if (hash.digest('hex') !== req_hash) {
            err_code = 1;
        }
    } else {
        err_code = 3;
    }

    if (err_code === 0) {
        let amount = user_data.amount - bet_amount;
        let bonus_amount = user_data.bonus_amount - bet_bonus_amount;
        let currency = user_data.currency;

        return {
            "result": true,
            "err_code": err_code,
            "amount": amount.toFixed(2),
            "bonus_amount": bonus_amount.toFixed(2),
            "currency": currency
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