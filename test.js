var request = require('request');

var apiKey = '03ae700441d285b1937cda732868b74180d12fbd';

var url = 'https://www.shirts.io/api/v1/quote/?api_key=' + apiKey + '&garment[0][product_id]=1&garment[0][color]=Red&garment[0][sizes][med]=30&print[front][color_count]=1';
request(url, function (error, response, body) {

	if (!error && response.statusCode == 200) {
		body = JSON.parse(body);
		console.log(body.result.total);
	}
});