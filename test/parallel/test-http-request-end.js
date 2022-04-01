// Copyright Joyent, Inc. and other Node contributors.
//
// Permission is hereby granted, free of charge, to any person obtaining a
// copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to permit
// persons to whom the Software is furnished to do so, subject to the
// following conditions:
//
// The above copyright notice and this permission notice shall be included
// in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
// USE OR OTHER DEALINGS IN THE SOFTWARE.

'use strict';
require('../common');
const assert = require('assert');
const http = require('http');

const expected = 'Post Body For Test';

const server = http.Server(function(req, res) {
	let result = '';

	req.setEncoding('utf8');
	req.on('data', function(chunk) {
		result += chunk;
	});

	req.on('end', function() {
		assert.strictEqual(result, expected);
		server.close();
		res.writeHead(200);
		res.end('hello world\n');
	});

});

server.listen(0, function() {
	const req = http.request({
		port: this.address().port,
		path: '/',
		method: 'POST'
	}, function(res) {
		console.log(res.statusCode);
		res.resume();
	}).on('error', function(e) {
		console.log(e.message);
		process.exit(1);
	});

	const result = req.end(expected);

	assert.strictEqual(req, result);
});
