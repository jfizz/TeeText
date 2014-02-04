
/**
 * Module dependencies.
 */

var express = require('express');
var routes = require('./routes');
var user = require('./routes/user');
var http = require('http');
var path = require('path');
var twilio = require('twilio')('AC8071f4e79c9ec1e28ac712b696634652', 'e13e174fbee885c77d5a039a1d372356');

var app = express();

// all environments
app.set('port', process.env.PORT || 5000);
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');
app.use(express.favicon());
app.use(express.logger('dev'));
app.use(express.urlencoded());
app.use(express.methodOverride());
app.use(app.router);
app.use(express.static(path.join(__dirname, 'public')));

// development only
if ('development' == app.get('env')) {
  app.use(express.errorHandler());
}

app.post('/tee-text', function(req, res) {

	var resp = new twilio.TwimlResponse();
	resp.message('This is a test');
	res.type('text/xml');
	res.send(resp.toString());

});

app.get('/', function(req, res) {

	res.send('Home');

});

http.createServer(app).listen(app.get('port'), function(){

  console.log('Express server listening on port ' + app.get('port'));

});