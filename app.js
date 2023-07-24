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

app.post('/get_balance', (req, res) => {
    let time = getTime();
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
    hash.update(salt + params_json + time);
    const signature = hash.digest('hex');

    const requestData = {
        "time": time,
        "data": params_json,
        "hash": signature
    };

    res.json(req.body);
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