const http = require('http');

http.createServer(function (req, res) {
	res.write('We are rolling!');
	res.end();
}
).listen(3000);

console.log('Server started on port 3000');
