var request = require('request');


var url = 'https://www.shirts.io/api/v1/quote/?api_key=03ae700441d285b1937cda732868b74180d12fbd&garment[0][product_id]=1&garment[0][color]=Red&garment[0][sizes][med]=10&print[front][color_count]=1';
request(url, function (error, response, body) {

	if (!error && response.statusCode == 200) {
		body = JSON.parse(body);
		console.log(body.result.total);
	}
});