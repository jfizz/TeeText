
/**
 * Module dependencies.
 */

var express = require('express');
var routes = require('./routes');
var user = require('./routes/user');
var http = require('http');
var path = require('path');
var client = require('twilio')('AC8071f4e79c9ec1e28ac712b696634652', 'e13e174fbee885c77d5a039a1d372356');
var Canvas = require('canvas');
var fs = require('fs');

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

	var imageName = req.query.From + '.png';
	var out = fs.createWriteStream(__dirname + '/public/images/' + imageName);
	var Image = Canvas.Image;
	var canvas = new Canvas(546, 596);
	var ctx = canvas.getContext('2d');
	var te = ctx.measureText(req.query.Body);

	// T-shirt text
	ctx.font = '30px Impact';
	ctx.fillStyle = '#C90E15';
	ctx.fillText(req.query.Body, 273 - 0.5 * te.width, 198);

	// T-shirt image template
	var img = new Image();
	img.onload = function(){
		ctx.drawImage(img,0,0);
	};
	img.src = __dirname + '/public/images/blank_tshirt.png';

	// Convert canvas to .png
	var stream = canvas.pngStream();

	stream.on('data', function(chunk){
		out.write(chunk);
	});

	stream.on('end', function(){
		client.messages.create({

			body: "Quote: $15 | Check out the design http://glacial-headland-8432.herokuapp.com/images/" + imageName,
			to: req.query.From,
			from: req.query.To

		},
		function(err, message) {

			if(err)
				console.log(err);
			else
			{
				res.type('text/xml');
				res.send(message);
			}

		});
	});

});

app.get('/', function(req, res) {

	res.send('Home');

});

http.createServer(app).listen(app.get('port'), function(){

	console.log('Express server listening on port ' + app.get('port'));

});