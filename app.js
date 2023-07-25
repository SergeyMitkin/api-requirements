const express = require('express');
const https = require('https');
const fs = require('fs');
const mongoose = require('mongoose');
const crypto = require('crypto');

const Users = require('./models/users');

const app = express();
const PORT = 443;

const salt = 'get_balance';

app.set('view engine', 'ejs');
app.use(express.urlencoded({extended: true}));

// DB connection
const dbURI = 'mongodb+srv://new-user:test12345@cluster0.wodilhl.mongodb.net/node-tuts?retryWrites=true&w=majority';
mongoose
    .connect(dbURI)
    .then((result) => console.log('connected to db'))
    .catch((err) => console.log(err));

app.get('/', (req, res) => {
    // Данные для передачи в шаблон
    Users
        .find()
        .then((users_data) => res.render('users', { title: 'Users', users_data}))
        .catch((error) => {
            console.log(error);
        })
})

app.get('/users', (req, res) => {
    res.redirect('/');
});

function get_balance(time, signature, user_data) {
    let result = Boolean(user_data);
    let err_code = 0;

    // User check
    if (!result) {
        err_code = 3;
    }

    // Data check
    let user_params = new Map([
        ['user_id', user_data.id],
        ['merchant_id', 0],
    ]);

    if (user_params.size !== 2
        || !user_params.has("user_id")
        || !user_params.has("merchant_id"))
    {
        let err_code = 2
    }

    // Hash check
    let sortedArray = [...user_params].sort((a, b) => a[0].localeCompare(b[0]));
    let sortedMap = new Map(sortedArray);
    let sortedObject = Object.fromEntries(sortedMap);
    let params_json = JSON.stringify(sortedObject);

    let hash = crypto.createHash('sha256');
    hash.update(time + params_json + salt);

    if (hash.digest('hex') !== signature) {
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
            "currency": currency
        }
    } else {
        let amount = "";
        let bonus_amount = "";
        let currency = "";

        return {
            "result": false,
            "err_code": err_code
        }
    }
}

app.post('/get_balance', (req, res) => {
    const time = getTime();
    let user_id = req.body.user_id;

    let params = new Map([
        ['user_id', user_id],
        ['merchant_id', 0],
    ]);
    let sortedArray = [...params].sort((a, b) => a[0].localeCompare(b[0]));
    let sortedMap = new Map(sortedArray);
    let sortedObject = Object.fromEntries(sortedMap);
    let params_json = JSON.stringify(sortedObject);

    // Создание хэша SHA256
    let hash = crypto.createHash('sha256');
    hash.update(time + params_json + salt);
    const signature = hash.digest('hex');

    const requestData = {
        "time": time,
        "data": params_json,
        "hash": signature
    };

    Users
        .findById(user_id)
        .then((user_data) => {
            let balanse = get_balance(time, signature, user_data);
            res.send(JSON.stringify(balanse));
        })
        .catch((error) => {
            console.log(error);
        })

    // get_balance(user_id);
    // res.json(req.body);
})

app.use((req, res) => {
    res.status(404).render('404', { title: '404'});
})

const sslServer = https.createServer({
    key: fs.readFileSync(__dirname + '/certificates/key.pem'),
    cert: fs.readFileSync(__dirname + '/certificates/cart.pem')
}, app);

sslServer.listen(PORT, () => console.log('Secure server on port 443'));


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