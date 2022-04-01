"use strict";
const common = require("../common");
const fixtures = require("../common/fixtures");
const assert = require("assert");
const fs = require("fs");

// Test that concurrent file read streams don’t interfere with each other’s
// contents, and that the chunks generated by the reads only retain a
// 'reasonable' amount of memory.

// Refs: https://github.com/nodejs/node/issues/21967

const filename = fixtures.path("loop.js");  // Some small non-homogeneous file.
const content = fs.readFileSync(filename);

const N = 2000;
let started = 0;
let done = 0;

const arrayBuffers = new Set();

function startRead() {
 ++started;
 const chunks = [];
 fs.createReadStream(filename)
    .on("data", (chunk) => {
    	chunks.push(chunk);
    	arrayBuffers.add(chunk.buffer);
    })
    .on("end", common.mustCall(() => {
    	if (started < N)
    		startRead();
    	assert.deepStrictEqual(Buffer.concat(chunks), content);
    	if (++done === N) {
    		const retainedMemory =
          [...arrayBuffers].map((ab) => ab.byteLength).reduce((a, b) => a + b);
    		assert(retainedMemory / (N * content.length) <= 3,
    									`Retaining ${retainedMemory} bytes in ABs for ${N} ` +
               `chunks of size ${content.length}`);
    	}
    }));
}

// Don’t start the reads all at once – that way we would have to allocate
// a large amount of memory upfront.
for (let i = 0; i < 6; ++i)
 startRead();
