/** WARNING! WARNING!  WARNING! WARNING!  WARNING! WARNING!  WARNING! WARNING!  WARNING! WARNING!
 *
 * This is only used on a local machine. All services are the same as in FSDF or Elvis and
 * there is proxying in the HTTPD rules that route like services to the elevation server.
 *
 *  WARNING! WARNING!  WARNING! WARNING!  WARNING! WARNING!  WARNING! WARNING!  WARNING! WARNING!
 */

process.env.NO_PROXY = "localhost";

var SERVICES_ROOT = "http://www.ga.gov.au/elvis";


var express = require("express");
var request = require('request');
request.gzip = false;

//var httpProxy = require('http-proxy');
var app = express();

var yargs = require('yargs').options({
    'port': {
        'default': 3000,
        'description': 'Port to listen on.'
    },
    'public': {
        'type': 'boolean',
        'description': 'Run a public server that listens on all interfaces.'
    },
    'help': {
        'alias': 'h',
        'type': 'boolean',
        'description': 'Show this help.'
    }
});
var argv = yargs.argv;
var port = process.env.PORT || argv.port;
var dontProxyHeaderRegex = /^(?:Host|Proxy-Connection|Accept-Encoding|Connection|Keep-Alive|Transfer-Encoding|TE|Trailer|Proxy-Authorization|Proxy-Authenticate|Upgrade)$/i;


// eventually this mime type configuration will need to change
// https://github.com/visionmedia/send/commit/d2cb54658ce65948b0ed6e5fb5de69d022bef941
var mime = express.static.mime;
mime.define({
    'application/json': ['czml', 'json', 'geojson', 'topojson'],
    'model/vnd.gltf+json': ['gltf'],
    'model/vnd.gltf.binary': ['bgltf'],
    'text/plain': ['glsl']
});

// serve static files
app.use(express.static("dist"));
app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});

app.all('/service/*', function (req, res, next) {
    var method, r;

    method = req.method.toLowerCase();

    console.log("URL: " + method + " " + SERVICES_ROOT + req.url);

    switch (method) {
        case "get":
            r = request.get({
                uri: SERVICES_ROOT + req.url,
                json: req.body
            });
            break;
        case "put":
            r = request.put({
                uri: SERVICES_ROOT + req.url,
                json: req.body
            });
            break;
        case "post":
            r = request.post({
                uri: SERVICES_ROOT + req.url,
                json: req.body
            });
            break;
        case "delete":
            r = request.del({
                uri: SERVICES_ROOT + req.url,
                json: req.body
            });
            break;
        default:
            return res.send("invalid method");
    }
    return req.pipe(r).pipe(res);
});

// This works on my local machine for development as I have a Solr instance on a Linux box
// but it is to be expected that it will not be hit in production so doesn't need changing
// as proxying via the apache proxy will intercept and route the request to the local Solr instance.
app.get(['/metadata/select', '/elevation/select'], function(req, res, next) {
    var remoteUrl = req.url;
    // let wholeUrl = "http://web.geospeedster.com" +  remoteUrl;
    let wholeUrl = "http://192.168.0.24:8983/solr" + remoteUrl;
    // let wholeUrl = "http://placenames.geospeedster.com" + remoteUrl;
    console.log(wholeUrl);


    request.get({
        url: wholeUrl,
        headers: filterHeaders(req, req.headers),
        encoding: null
    }, function (error, response, body) {
        var code = 500;

        if (response) {
            code = response.statusCode;
            res.header(filterHeaders(req, response.headers));
        }

        res.status(code).send(body);
    });
});


app.listen(port, function (err) {
    console.log("running server on port " + port);
});

function filterHeaders(req, headers) {
    var result = {};
    // filter out headers that are listed in the regex above
    Object.keys(headers).forEach(function (name) {
        if (!dontProxyHeaderRegex.test(name)) {
            result[name] = headers[name];
        }
    });
    return result;
}