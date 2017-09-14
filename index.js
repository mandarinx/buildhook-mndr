var express     = require('express'),
    fileupload  = require('express-fileupload'),
    bodyparser  = require('body-parser'),
    fs          = require('fs'),
    s3          = require('s3'),
    env         = require('dotenv');

env.config();

var client = s3.createClient({
    maxAsyncS3: 20, // max number of simultaneous connections
    s3RetryCount: 3, // max number of retries before failing
    s3RetryDelay: 1000, // milliseconds between each retry
    multipartUploadThreshold: 268435456, // If a file is greater than 268 MB (2^28), it will be split up and uploaded via a multipart request
    multipartUploadSize: 33554432, // A multipart request will split the file into parts of 33.5 MB each (2^25)
    s3Options: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_ACCESS_KEY,
        region: 'eu-west-1',
    // endpoint: 's3.yourdomain.com',
    // sslEnabled: false
    // any other options are passed to new AWS.S3()
    // See: http://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/Config.html#constructor-property
    },
});

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
            var file_tmp = '/tmp/' + file.name;

            fs.writeFile(file_tmp, file.data, function(err) {
                if (err) {
                    return console.log('Could not write file to ' + file_tmp);
                }

                console.log('File written to ' + file_tmp);

                var params = {
                    localFile: file_tmp,
                    s3Params: {
                        Bucket: 'mndrassetbundles',
                        Key: file.name,
                    },
                };

                var uploader = client.uploadFile(params);

                uploader.on('error', function(err) {
                    console.error("unable to upload:", err.stack);
                });

                uploader.on('progress', function() {
                    console.log('progress',
                                uploader.progressMd5Amount,
                                uploader.progressAmount,
                                uploader.progressTotal);
                });

                uploader.on('end', function() {
                    console.log('done uploading');
                });

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
