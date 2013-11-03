var config = require('../appinfo');
var https = require('https');
var OAuth = require('oauth');
var util = require('util');
var Worker = require('webworker-threads').Worker;
var forEach = require('async-foreach').forEach;
var oauth = new OAuth.OAuth(
    'https://api.twitter.com/oauth/request_token',
    'https://api.twitter.com/oauth/access_token',
    config.keys['appId'],
    config.keys['appSecret'],
    '1.0A',
    null,
    'HMAC-SHA1');

var url = require('url');

function grabInstagram(obj, token, res) {
    var retResult = [];
    var returned = {};
    var needed = obj.length;
    var gotten = 0;
    for (var i = 0; i < obj.length; i++) {
        https.get("https://api.instagram.com/v1/locations/" + obj[i].id + "/media/recent?access_token=" + token, function(result) {
            result.setEncoding('utf8');
            var buffer = [];
            result.on('data', function(chunk) {
                buffer.push(chunk);
            });
            result.on('end', function() {
                var text = buffer.join('');
                try {
                    var obj = JSON.parse(text);
                    retResult[gotten] = {
                        location: obj.data[0].location,
                        img_url: obj.data[0].images.thumbnail,
                        url: obj.data[0].link,
                        caption: obj.data[0].caption.text
                    };
                } catch (ee) {
                    retResult[gotten] = null;
                }
                gotten++;
                if (gotten == needed) {
                    res.send(retResult);
                }

            });

        });
    }
}

exports.searchInstagram = function(req, res) {
    var queryData = url.parse(req.url, true).query;
    var buffer = [];

    https.get("https://api.instagram.com/v1/locations/search?lat=" + queryData.lat + "&lng=" + queryData["long"] + "&access_token=" + req.cookies.instagram, function(result) {
        result.setEncoding('utf8');
        result.on('data', function(chunk) {
            buffer.push(chunk);
        });
        result.on('end', function() {
            var text = buffer.join('');
            try {
                var obj = JSON.parse(text);
                grabInstagram(obj.data, req.cookies.instagram, res);
            } catch (ex) {
                console.log("T2");
                console.log(text);
            }
        });
    });
}


exports.search = function(req, res) {
    var queryData = url.parse(req.url, true).query;
    //res.send(queryData);

    oauth.get('https://api.twitter.com/1.1/search/tweets.json?count=100&geocode=' + queryData.lat + ',' + queryData["long"] + ',1mi',
        config.keys['accessToken'],
        config.keys['accessSecret'],
        function(e, data, resp) {
            var ret = new Array();
            var obj = JSON.parse(data).statuses;
            var process = new Worker(function() {
                function process(obj) {
                    var ret = new Array();
                    var counter = 0;
                    for (var i = 0; i < obj.length; i++) {
                        var item = obj[i];
                        if (item.geo) {
                            ret[counter] = {
                                geo: {
                                    coordinates: item.geo.coordinates
                                },
                                text: item.text,
                                user: {
                                    profile_image_url: item.user.profile_image_url
                                },
                                url: "https://twitter.com/" + item.user.screen_name + "/status/" + item.id_str
                            };
                            counter++;
                        }
                    }
                    return (ret);
                }
                onmessage = function(event) {
                    postMessage(process(event.data));
                }
            });
            process.onmessage = function(event) {
                var dx = {
                    statuses: event.data
                };
                res.send(dx);
            };
            process.postMessage(obj);
            //res.send(data);
        });
};

exports.tweet = function(req, res) {
    var idx = req.cookies.idx;
    var token = req.cookies.token;
    var secret = req.cookies.tokenSecret;
    console.log(req.body);
    console.log("Ewee");
    oauth.post("https://api.twitter.com/1.1/statuses/update.json", token, secret, {
            status: req.body.tweet,
            "lat": req.body.latitude,
            "long": req.body.longitude,
            display_coordinates: true
        },
        function() {
            res.send("Hello world");
        });
}


exports.search2 = function(req, res) {
    var queryData = url.parse(req.url, true).query;
    //res.send(queryData);

    oauth.get('https://api.twitter.com/1.1/search/tweets.json?count=100&geocode=' + queryData.lat + ',' + queryData["long"] + ',1mi',
        config.keys['accessToken'],
        config.keys['accessSecret'],
        function(e, data, resp) {
            res.send(data)
        });
}
