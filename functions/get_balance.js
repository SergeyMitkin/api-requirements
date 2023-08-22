const utils = require("./utils");

function get_balance(salt, merchant_id, req_body, user_data) {
    let result = Boolean(user_data);
    let err_code = 0;

    // User check
    if (result) {
        let user_id = user_data.user_id;
        let user_params = {
            user_id: user_id,
            merchant_id: String(merchant_id),
        };
        let time = utils.getDateStr();
        let req_hash = req_body.hash;

        let user_params_sort = utils.sortObject(user_params);
        let hash = utils.sha256(time, JSON.stringify(user_params_sort), salt);

        // Request structure and parameters check
        if (!requestCheck(req_body, ['merchant_id', 'user_id']))
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

function requestCheck(req_body) {
    let data = req_body.data;
    let params_length = Object.keys(data).length;

    let nec_params = ['merchant_id', 'user_id'];
    let opt_param = 'session_id';

    if ((params_length === 2 || params_length === 3) && utils.isAlphabetSorted(data)) {
        if (params_length === 2) {
            nec_params.forEach((e) => {
                if (!e in data){
                    return false;
                }
            })
        }
        if (Object.keys(data).length === 3) {
            nec_params.push(opt_param);
            nec_params.forEach((e) => {
                if (!e in data) {
                    return false;
                }
            })
        }
    } else {
        return false;
    }

    return (Object.keys(req_body).length === 3
        && 'time' in req_body
        && 'data' in req_body
        && 'hash' in req_body
    );
}

module.exports = {
    get_balance: get_balance
};