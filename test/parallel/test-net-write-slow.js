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
const common = require('../common');
const assert = require('assert');
const net = require('net');

const SIZE = 2E5;
const N = 10;
let flushed = 0;
let received = 0;
const buf = Buffer.alloc(SIZE, 'a');

const server = net.createServer(function(socket) {
 socket.setNoDelay();
 socket.setTimeout(9999);
 socket.on('timeout', function() {
  assert.fail(`flushed: ${flushed}, received: ${received}/${SIZE * N}`);
 });

 for (let i = 0; i < N; ++i) {
  socket.write(buf, function() {
   ++flushed;
   if (flushed === N) {
    socket.setTimeout(0);
   }
  });
 }
 socket.end();

}).listen(0, common.mustCall(function() {
 const conn = net.connect(this.address().port);
 conn.on('data', function(buf) {
  received += buf.length;
  conn.pause();
  setTimeout(function() {
   conn.resume();
  }, 20);
 });
 conn.on('end', common.mustCall(function() {
  server.close();
  assert.strictEqual(received, SIZE * N);
 }));
}));
