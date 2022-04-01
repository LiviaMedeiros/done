'use strict';
const common = require('../common');

if (!common.hasCrypto)
    common.skip('missing crypto');

const tls = require('tls');
const net = require('net');
const assert = require('assert');

const bonkers = Buffer.alloc(1024, 42);


const server = tls.createServer({})
  .listen(0, function() {
      const c = net.connect({ port: this.address().port }, function() {
          c.write(bonkers);
      });

  }).on('tlsClientError', common.mustCall(function(e) {
      assert.ok(e instanceof Error,
                'Instance of Error should be passed to error handler');
      // OpenSSL 1.0.x and 1.1.x use different error codes for junk inputs.
      assert.ok(
          /SSL routines:[^:]*:(unknown protocol|wrong version number)/.test(
              e.message),
          'Expecting SSL unknown protocol');

      server.close();
  }));
