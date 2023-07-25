const crypto = require("crypto");

function getTime() {
    let currentDate = new Date();
    let day = ("0" + currentDate.getDate()).slice(-2);
    let month = ("0" + (currentDate.getMonth() + 1)).slice(-2);
    let year = currentDate.getFullYear();
    let hours = ("0" + currentDate.getHours()).slice(-2);
    let minutes = ("0" + currentDate.getMinutes()).slice(-2);
    let seconds = ("0" + currentDate.getSeconds()).slice(-2);

    return day + "-" + month + "-" + year + " " + hours + ":" + minutes + ":" + seconds;
}

function paramsSort (obj) {
    let sortedArray = [...obj].sort((a, b) => a[0].localeCompare(b[0]));
    let sortedMap = new Map(sortedArray);
    let sortedObject = Object.fromEntries(sortedMap);

    return JSON.stringify(sortedObject);
}

function sha256(time, sorted_user_params, salt){
    let hash = crypto.createHash('sha256');
    hash.update(time + sorted_user_params + salt);

    return hash;
}

module.exports = {
    getTime: getTime,
    paramsSort: paramsSort,
    sha256: sha256
};