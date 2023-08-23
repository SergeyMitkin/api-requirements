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
        if (!requestCheck(req_body))
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

function requestCheck(req_body) {
    let data = req_body.data;
    let params_length = Object.keys(data).length;
    let correct_params = true;

    let nec_params = ['merchant_id', 'user_id'];
    let opt_param = 'session_id';

    if ((params_length === 2 || params_length === 3) && utils.isAlphabetSorted(data)) {
        if (params_length === 2) {
            Object.keys(data).forEach((e) => {
                if(!nec_params.includes(e)){
                    correct_params = false;
                }
            })
        }
        if (Object.keys(data).length === 3) {
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
    get_account_details: get_account_details
};