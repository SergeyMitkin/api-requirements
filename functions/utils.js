const crypto = require("crypto");

function sha256(time, req_data, salt){
    let hash = crypto.createHash('sha256');
    hash.update(time + req_data + salt);

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

module.exports = {
    sha256: sha256,
    isAlphabetSorted: isAlphabetSorted
}