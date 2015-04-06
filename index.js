#!/usr/bin/env node

var fs       = require('fs');
var path     = require('path');
var chalk    = require('chalk');
var rimraf   = require('rimraf');
var tinylr   = require('tiny-lr');
var helpers  = require('broccoli-kitchen-sink-helpers');
var Watcher  = require('broccoli/lib/watcher');
var broccoli = require('broccoli');

function createWatcher(destDir, interval, lrPort) {
  var tree     = broccoli.loadBrocfile();
  var builder  = new broccoli.Builder(tree);
  var watcher  = new Watcher(builder, {interval: interval || 100});
  var lrServer = new tinylr.Server;

  var atExit = function() {
    builder.cleanup()
      .then(function() {
        process.exit(1);
      });
  };

  var liveReload = function() {
    // Chrome LiveReload doesn't seem to care about the specific files as long
    // as we pass something.
    lrServer.changed({body: {files: ['livereload_dummy']}})
  };

  process.on('SIGINT', atExit);
  process.on('SIGTERM', atExit);

  lrServer.listen(lrPort || 35729, function(err) {
    if(err) {
      throw err;
    }
  });

  watcher.on('change', function(results) {
    rimraf.sync(destDir);
    helpers.copyRecursivelySync(results.directory, destDir);
    liveReload();

    console.log(chalk.green("Build successful - " + Math.floor(results.totalTime / 1e6) + 'ms'));
  });

  watcher.on('error', function(err) {
    console.log(chalk.red('\n\nBuild failed.\n'));
  });

  return watcher;
}

createWatcher(process.argv[2], process.argv[3], process.argv[4]);
