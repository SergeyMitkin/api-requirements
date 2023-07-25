const crypto = require("crypto");
const utils = require("./utils");

function get_balance(salt, time, signature, user_data) {
    let result = Boolean(user_data);
    let err_code = 0;
    let user_params = new Map([
        ['user_id', user_data.id],
        ['merchant_id', 0],
    ]);
    let sorted_user_params = utils.paramsSort(user_params);
    let hash = utils.sha256(time, sorted_user_params, salt);

    // User check
    if (!result) {
        err_code = 3;
    }
    // Data check
    else if (user_params.size !== 2
        || !user_params.has("user_id")
        || !user_params.has("merchant_id"))
    {
        let err_code = 2
    }
    // Hash check
    else if (hash.digest('hex') !== signature) {
        err_code = 1;
    }

    if (err_code === 0) {
        let amount = user_data.amount.toFixed(2);
        let bonus_amount = user_data.bonus_amount.toFixed(2);
        let currency = user_data.currency;

        return {
            "result": true,
            "err_code": err_code,
            "amount": amount,
            "bonus_amount": bonus_amount,
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
    get_balance: get_balance
};