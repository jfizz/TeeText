
/**
 * Module dependencies.
 */

var express = require('express');
var routes = require('./routes');
var user = require('./routes/user');
var http = require('http');
var path = require('path');
var twilio = require('twilio');
var Canvas = require('canvas');

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

app.get('/tee-text', function(req, res) {

	/*var resp = new twilio.TwimlResponse();
	resp.message('Your message said ' + req.query.Body);
	res.type('text/xml');
	res.send(resp.toString());*/
	var Image = Canvas.Image;
	var canvas = new Canvas(546, 596);
	var ctx = canvas.getContext('2d');

	ctx.font = '35px Impact';
	var te = ctx.measureText('Awesome!Again');
	ctx.fillStyle = '#C90E15';
	ctx.fillText("Awesome!Again", 273 - 0.5 * te.width, 198);

	var img = new Image();

	img.onload = function(){
		ctx.drawImage(img,0,0);
	};

	img.src = __dirname + '/public/images/blank_tshirt.png';

	res.send('<img src="' + canvas.toDataURL() + '" />');

});

app.get('/', function(req, res) {

	res.send('Home');

});

http.createServer(app).listen(app.get('port'), function(){

  console.log('Express server listening on port ' + app.get('port'));

});