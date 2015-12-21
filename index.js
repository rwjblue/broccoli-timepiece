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
        rimraf.sync("./broccoli-timepiece-failure.json");
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
    rimraf.sync("./broccoli-timepiece-failure.json");

    helpers.copyRecursivelySync(results.directory, destDir);
    liveReload();

    console.log(chalk.green("Build successful - " + Math.floor(results.totalTime / 1e6) + 'ms'));
  });

  watcher.on('error', function(error) {
    // Output to the console
    console.log(chalk.red('\n\nBuild failed.'));

    if (error.file) {
      if (error.line && error.column){
        console.log('File: ' + error.treeDir + '/' + error.file + ':' + error.line + ':' + error.column);
      } else {
        console.log('File: ' + error.treeDir + '/' + error.file);
      }
    }

    if (error.message) {
      console.log('Error: ' + error.message);
    }

    if (error.stack) {
      console.log('Stack trace:\n' + error.stack.replace(/(^.)/mg, "  $1"));
    }

    // Write a JSON dump file
    rimraf.sync("./broccoli-timepiece-failure.json");
    fs.appendFile("./broccoli-timepiece-failure.json", JSON.stringify({
      message: error.message,
      file: error.file,
      treeDir: error.treeDir,
      line: error.line,
      column: error.column,
      stack: error.stack
    }, null, 2));
  });

  return watcher;
}

createWatcher(process.argv[2], process.argv[3], process.argv[4]);
