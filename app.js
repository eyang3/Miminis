
/**
 * Module dependencies.
 */
/* test */
var express = require('express');
var routes = require('./routes');
var user = require('./routes/user');
var search = require('./routes/points');
var http = require('http');
var path = require('path');
var swig = require('swig');
var passport = require('passport');
var config = require('./appinfo');
var app = express();
var TwitterStrategy = require('passport-twitter').Strategy;
var InstagramStrategy = require('passport-instagram').Strategy;
var users = [];


// all environments
app.set('port', process.env.PORT || 3000);
//app.set('port', 3000);
app.set('views', __dirname + '/views');
app.engine('html', swig.renderFile);
app.set('view engine', 'html');
app.use(express.favicon());
app.use(express.logger('dev'));
app.use(express.bodyParser());
app.use(express.methodOverride());
app.use(express.cookieParser('your secret here'));
app.use(express.session());
app.use(express.compress());
app.use(passport.initialize());
app.use(passport.session());
app.use(app.router);
app.use(express.static(path.join(__dirname, 'public')));

// development only
if ('development' == app.get('env')) {
	app.use(express.errorHandler());
}

//need to refactor and put the callback into the config file
passport.use(new TwitterStrategy({
	consumerKey: config.keys['appId'],
	consumerSecret: config.keys['appSecret'],
	callbackURL: "http://173.49.104.120/geotweet/auth/twitter/callback" },
	function(token, tokenSecret, profile, done) {
		process.nextTick(function () {
		var user = users[profile.id] || 
				(users[profile.id] = { id: profile.id, name: profile.username, token:token, tokenSecret: tokenSecret });
			return done(null, user);
		});

	}
));
passport.use(new InstagramStrategy({
	clientID: config.keys['instClientId'],
	clientSecret: config.keys['instClientSec'],
	callbackURL: "http://173.49.104.120/geotweet/auth/instagram/callback" },
	function(token, tokenSecret, profile, done) {
		process.nextTick(function () {
		var user = users[profile.id] || 
				(users[profile.id] = { id: profile.id, name: profile.username, token:token, tokenSecret: tokenSecret });
			return done(null, user);
		});

	}
));

passport.serializeUser(function(user, done) {
	done(null, user);
});

passport.deserializeUser(function(id, done) {
	app.user = users[id];
	done(null, user); 
}); 

app.get('/', routes.index);
app.post('/sendTweet', search.tweet);
app.get('/search', search.search);
app.get('/search2', search.search2);
app.get('/users', user.list);
app.get('/auth/twitter', passport.authenticate('twitter'));
app.get('/auth/instagram/callback', passport.authenticate('instagram', { failureRedirect: '/fail'}),   
	function(req, res) {
		req.session.instagram = req.user.token;
		res.redirect('/geotweet');
	});
app.get('/auth/instagram', passport.authenticate('instagram'));
app.get('/auth/twitter/callback', passport.authenticate('twitter', { failureRedirect: '/fail'}),   

function(req, res) {
	var t = req.user.id;
	req.session.idx = t;
	req.session.token = req.user.token;
	req.session.tokenSecret = req.user.tokenSecret;
	res.redirect('/geotweet');
});
	

app.get('/logout', function(req, res){
	req.logout();
 	res.redirect('/');
});

app.get('/searchInstagram', search.searchInstagram);


http.createServer(app).listen(app.get('port'), function(){
 	console.log('Express server listening on port ' + app.get('port'));
});





