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
};

function sha256(time, sorted_user_params, salt){
    let hash = crypto.createHash('sha256');
    hash.update(time + sorted_user_params + salt);

    return hash;
}

module.exports = {
    getDateStr: getDateStr,
    sha256: sha256,
    sortObject: sortObject
};