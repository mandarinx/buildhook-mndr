var express     = require('express'),
    fileupload  = require('express-fileupload'),
    bodyparser  = require('body-parser'),
    fs          = require('fs'),
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
            var file = req.files[key];
            console.log('file.name: '+file.name);
            fs.writeFile('/tmp/' + file.name, file.data, function(err) {
                if (err) {
                    return console.log('Could not write file contents to /tmp/' + file.name);
                }
                console.log('File written to /tmp/' + file.name);
            });
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
