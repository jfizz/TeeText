
/**
 * Module dependencies.
 */

var express = require('express');
var http = require('http');
var path = require('path');
var twilio = require('twilio');
var client = require('twilio')('AC8071f4e79c9ec1e28ac712b696634652', 'e13e174fbee885c77d5a039a1d372356');
var Canvas = require('canvas');
var fs = require('fs');
var request = require('request');

var app = express();

// all environments
app.set('port', process.env.PORT || 5000);
app.use(express.cookieParser('S3CRE7'));
app.use(express.cookieSession());
app.use(express.logger('dev'));
app.use(express.urlencoded());
app.use(app.router);
app.use(express.static(path.join(__dirname, 'public')));

// development only
if ('development' == app.get('env')) {

  app.use(express.errorHandler());

}

/**
 * Receives GET request from Twilio with a message.
 * Creates an image with the message text on it.
 * Sends back a Twiml Response with a quote and a link to image.
 *
 * request properties -> https://www.twilio.com/docs/api/rest/message
 */

app.get('/tee-text', function(req, res) {

	var colors = ['Black', 'Blue', 'Red', 'Yellow', 'Purple'];
	var sizes = ['sml', 'med', 'large'];
	var apiKey = '03ae700441d285b1937cda732868b74180d12fbd';

	if(!req.session.message)
		askSize();
	else if(!req.session.size)
		askColor();
	else if(!req.session.color)
		askQuantity();
	else
		sendQuote();

	function askSize() {

		req.session.message = req.query.Body;

		sendMessage('What size tshirt? Options: sml, med, large');

	}

	function askColor() {

		var size = req.query.Body;
		size = size.toLowerCase();

		// Check and see if the size is valid
		if(sizes.indexOf(size) == -1)
			sendMessage('Invalid size. Try again.');
		else
		{
			req.session.size = size;
			sendMessage('What color tshirt? Options: Red, Blue, Yellow, Purple, Green');
		}

	}

	function askQuantity() {

		var color = req.query.Body;
		color = color.toLowerCase();
		color = color.charAt(0).toUpperCase() + color.slice(1);

		// Check and see if the color is valid
		if(colors.indexOf(color) == -1)
			sendMessage('Invalid color. Try again.');
		else
		{
			req.session.color = color;
			sendMessage('How many tshirts do you want?');
		}

	}

	function sendQuote() {

		var quantity = req.query.Body;
		quantity = parseInt(quantity, 10);

		// Check and see if quantity is a number
		if(!isInt(quantity))
			sendMessage('Invalid quantity. Try again.');
		else
		{
			var url = 'https://www.shirts.io/api/v1/quote/' + '?api_key=' + apiKey + '&garment[0][product_id]=1&garment[0][color]=' + req.session.color + '&garment[0][sizes][' + req.session.size + ']=' + req.session.quantity + '&print[front][color_count]=1';
			request(url, function (error, response, body) {

				if (!error && response.statusCode == 200) {
					var imageName = makeImage();
					body = JSON.parse(body);
					req.session.destroy();
					sendMessage('Your total comes to $' + body.result.total + ' at $' + body.result.price_per_shirt + ' per shirt. | Check out the design http://glacial-headland-8432.herokuapp.com/images/' + imageName);
				}
				else
					sendMessage('Sorry. Something blew up.');

			});
		}

	}

	function sendMessage(message) {

		var resp = new twilio.TwimlResponse();
		resp.message(message);
		res.type('text/xml');
		res.send(resp.toString());

	}

	function makeImage() {

		var color = req.session.color;
		var message = req.session.message;

		// Canvas
		var canvas = new Canvas(546, 596);
		var ctx = canvas.getContext('2d');

		// T-shirt image template
		var Image = Canvas.Image;
		var img = new Image();

		img.onload = function(){

			ctx.drawImage(img,0,0);

			// T-shirt text
			ctx.font = '30px Impact';
			var te = ctx.measureText(message);
			ctx.fillStyle = '#ffffff';
			ctx.fillText(message, 273 - 0.5 * te.width, 198);

		};

		img.src = __dirname + '/public/images/' + color + '.png';

		// Convert canvas to .png
		var imageName = req.query.From + '.png';
		var out = fs.createWriteStream(__dirname + '/public/images/' + imageName);
		var stream = canvas.pngStream();

		stream.on('data', function(chunk){

			out.write(chunk);

		});

		stream.on('end', function(){

			return imageName;

		});

	}

	function isInt(n) {

		return typeof n === 'number' && n % 1 === 0;

	}

	/*var colors = ['black', 'blue', 'red', 'yellow', 'purple'];
	var sizes = ['sml', 'med', 'large'];

	var message = req.query.Body;

	if(message.substring(0, 6) == "message")
	{

	}

	// Canvas
	var canvas = new Canvas(546, 596);
	var ctx = canvas.getContext('2d');

	// T-shirt image template
	var Image = Canvas.Image;
	var img = new Image();

	img.onload = function(){

		ctx.drawImage(img,0,0);

		// T-shirt text
		ctx.font = '30px Impact';
		var te = ctx.measureText(req.query.Body);
		ctx.fillStyle = '#ffffff';
		ctx.fillText(req.query.Body, 273 - 0.5 * te.width, 198);

	};

	var templateNumber = Math.floor((Math.random()*5)+1); // 5 different colored tshirt templates
	img.src = __dirname + '/public/images/' + templateNumber + '.png';

	// Convert canvas to .png
	var imageName = req.query.From + '.png';
	var out = fs.createWriteStream(__dirname + '/public/images/' + imageName);
	var stream = canvas.pngStream();

	stream.on('data', function(chunk){

		out.write(chunk);

	});

	stream.on('end', function(){

		var price = Math.floor((Math.random()*30)+1);

		var resp = new twilio.TwimlResponse();
		resp.message('Quote: $' + price + ' | Check out the design http://glacial-headland-8432.herokuapp.com/images/' + imageName);
		res.type('text/xml');
		res.send(resp.toString());

	});*/

});

http.createServer(app).listen(app.get('port'), function(){

  console.log('Express server listening on port ' + app.get('port'));

});