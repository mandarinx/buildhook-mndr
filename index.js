var express     = require('express'),
    fileupload  = require('express-fileupload'),
    bodyparser  = require('body-parser'),
    env         = require('dotenv');

env.config();

var app = express()
    .set('port', process.env.PORT)
    .use(bodyparser.json())
    .use(fileupload());

if (process.env.NODE_ENV === 'development') {
    app.use('showStackError', true);
}

app.route('/buildcallback')
    .post(function (req, res) {

        console.log(req.body);
        res
            .status(200)
            .json({'oki':'doki'});

    });

app.route('/upload')
    .post(function (req, res) {

        if (!req.files) {
            return res.status(400).send('No files were uploaded');
        }

        Object.keys(req.files).forEach(function(key) {
            console.log('file.name: '+req.files[key].name);
        });

        res.status(200).send('OK');

    });

// process.on('SIGTERM', function() {
//     console.log('Shutting down');
//     app.close(function() {
//         console.log('Exiting');
//         process.exit();
//     });
// });

app.listen(process.env.PORT, function() {
    console.log('Listening on '+process.env.PORT);
});
