/**
 * @author   Adam Sinclair
 * @date     Sat March 9th 2019
 * @purpose  Contains server logic for SpellSlam game.
**/

const express = require('express');
const app = express();
const fs = require('fs');
const server = require('http').Server(app);

app.use(express.static('public/'));

app.get('/', (req, res) => {
    res.sendFile('index.html', { 'root': 'public/src/'});
});

// app.get('/dev/vendor.js', (req, res) => {
//     res.sendFile('/dev/vendor.js');
// });

// app.get('/dev/app.js', (req, res) => {
//     res.sendFile('/dev/app.js');
// });

server.listen(9001, () => {
    console.log(`Listening on ${server.address().port} ...`);
});