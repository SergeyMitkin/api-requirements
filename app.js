const express = require('express');
const https = require('https');
const fs = require('fs');

const mongoose = require('mongoose');
const Users = require('./models/users');

const app = express();
const PORT = 443;

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


