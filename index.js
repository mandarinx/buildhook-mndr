var express = require('express'),
    bodyparser = require('body-parser'),
    env = require('dotenv');

env.config();

var app = express()
    .set('port', process.env.PORT)
    .use(bodyparser.json());

if (process.env.NODE_ENV === 'development') {
    app.use('showStackError', true);
}

app.route('/buildcallback')
    .post(function(req, res) {

    console.log(res.body);

    });
