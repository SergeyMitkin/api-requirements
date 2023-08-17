const crypto = require("crypto");

function getDateStr(){
    let date = new Date();
    return date.getDate() + '.' + (date.getMonth() + 1) + '.' + date.getFullYear();
}

function sortObject(unordered, sortArrays = false) {
    if (!unordered || typeof unordered !== 'object') {
        return unordered;
    }

    if (Array.isArray(unordered)) {
        const newArr = unordered.map((item) => sortObject(item, sortArrays));
        if (sortArrays) {
            newArr.sort();
        }
        return newArr;
    }

    const ordered = {};
    Object.keys(unordered)
        .sort()
        .forEach((key) => {
            ordered[key] = sortObject(unordered[key], sortArrays);
        });
    return ordered;
}

function sha256(time, sorted_user_params, salt){
    let hash = crypto.createHash('sha256');
    hash.update(time + sorted_user_params + salt);

    return hash;
}

function isAlphabetSorted(data) {
    let dataKeys = Object.keys(data);
    let sortedKeys = Object.keys(data).sort();

    for (let i = 0; i < dataKeys.length; i++) {
        if (dataKeys[i] !== sortedKeys[i]) {
            return false
        }
    }
    return true;
}

function requestCheck(req_body) {
    let data = req_body.data;

    return (Object.keys(req_body).length === 3
        && 'time' in req_body
        && 'data' in req_body
        && 'hash' in req_body
        && 'merchant_id' in data
        && 'user_id' in data
        && isAlphabetSorted(data));
}

module.exports = {
    getDateStr: getDateStr,
    sha256: sha256,
    sortObject: sortObject,
    requestCheck: requestCheck
}