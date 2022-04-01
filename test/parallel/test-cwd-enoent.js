"use strict";
const common = require("../common");
// Fails with EINVAL on SmartOS, EBUSY on Windows, EBUSY on AIX.
if (common.isSunOS || common.isWindows || common.isAIX)
 common.skip("cannot rmdir current working directory");
if (!common.isMainThread)
 common.skip("process.chdir is not available in Workers");

const assert = require("assert");
const fs = require("fs");
const spawn = require("child_process").spawn;

const tmpdir = require("../common/tmpdir");

const dirname = `${tmpdir.path}/cwd-does-not-exist-${process.pid}`;
tmpdir.refresh();
fs.mkdirSync(dirname);
process.chdir(dirname);
fs.rmdirSync(dirname);

const proc = spawn(process.execPath, ["-e", "0"]);
proc.stdout.pipe(process.stdout);
proc.stderr.pipe(process.stderr);

proc.once("exit", common.mustCall(function(exitCode, signalCode) {
 assert.strictEqual(exitCode, 0);
 assert.strictEqual(signalCode, null);
}));
