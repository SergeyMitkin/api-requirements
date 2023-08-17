const utils = require("./utils");

function get_account_details(salt, merchant_id, req_body, user_data) {
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
        return {
            "result": true,
            "err_code": err_code,
            "user_name": user_data.name,
        }
    } else {
        return {
            "result": false,
            "err_code": err_code
        }
    }
}

module.exports = {
    get_account_details: get_account_details
};