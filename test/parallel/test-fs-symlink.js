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

"use strict";
const common = require("../common");
const fixtures = require("../common/fixtures");
if (!common.canCreateSymLink())
 common.skip("insufficient privileges");

const assert = require("assert");
const path = require("path");
const fs = require("fs");

let linkTime;
let fileTime;

const tmpdir = require("../common/tmpdir");
tmpdir.refresh();

// Test creating and reading symbolic link
const linkData = fixtures.path("/cycles/root.js");
const linkPath = path.join(tmpdir.path, "symlink1.js");

fs.symlink(linkData, linkPath, common.mustSucceed(() => {
 fs.lstat(linkPath, common.mustSucceed((stats) => {
  linkTime = stats.mtime.getTime();
 }));

 fs.stat(linkPath, common.mustSucceed((stats) => {
  fileTime = stats.mtime.getTime();
 }));

 fs.readlink(linkPath, common.mustSucceed((destination) => {
  assert.strictEqual(destination, linkData);
 }));
}));

// Test invalid symlink
{
 const linkData = fixtures.path("/not/exists/file");
 const linkPath = path.join(tmpdir.path, "symlink2.js");

 fs.symlink(linkData, linkPath, common.mustSucceed(() => {
  assert(!fs.existsSync(linkPath));
 }));
}

[false, 1, {}, [], null, undefined].forEach((input) => {
 const errObj = {
  code: "ERR_INVALID_ARG_TYPE",
  name: "TypeError",
  message: /target|path/,
 };
 assert.throws(() => fs.symlink(input, "", common.mustNotCall()), errObj);
 assert.throws(() => fs.symlinkSync(input, ""), errObj);

 assert.throws(() => fs.symlink("", input, common.mustNotCall()), errObj);
 assert.throws(() => fs.symlinkSync("", input), errObj);
});

const errObj = {
 code: "ERR_FS_INVALID_SYMLINK_TYPE",
 name: "Error",
 message:
    'Symlink type must be one of "dir", "file", or "junction". Received "🍏"',
};
assert.throws(() => fs.symlink("", "", "🍏", common.mustNotCall()), errObj);
assert.throws(() => fs.symlinkSync("", "", "🍏"), errObj);

process.on("exit", () => {
 assert.notStrictEqual(linkTime, fileTime);
});
