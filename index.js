#!/usr/bin/env node

var fs       = require('fs');
var path     = require('path');
var chalk    = require('chalk');
var rimraf   = require('rimraf');
var helpers  = require('broccoli-kitchen-sink-helpers');
var Watcher  = require('broccoli/lib/watcher');
var broccoli = require('broccoli');

function createWatcher(destDir, interval) {
  var tree    = broccoli.loadBrocfile();
  var builder = new broccoli.Builder(tree);
  var watcher = new Watcher(builder, {interval: interval || 100});

  var atExit = function() { 
    builder.cleanup()
      .then(function() {
        rimraf.sync("./broccoli-timepiece-building.json");
        rimraf.sync("./broccoli-timepiece-failure.json");
        process.exit(1);
      });
  };
  
  process.on('SIGINT', atExit);
  process.on('SIGTERM', atExit);

  watcher.on('start', function(changedDirs) {
    fs.appendFile("./broccoli-timepiece-building.json", JSON.stringify(changedDirs ? changedDirs : [], null, 2));
  });

  watcher.on('change', function(results) {
    rimraf.sync("./broccoli-timepiece-building.json");
    rimraf.sync("./broccoli-timepiece-failure.json");
    rimraf.sync(destDir);

    helpers.copyRecursivelySync(results.directory, destDir);

    console.log(chalk.green("Build successful - " + Math.floor(results.totalTime / 1e6) + 'ms'));
  });

  watcher.on('error', function(error) {
    rimraf.sync("./broccoli-timepiece-building.json");
    rimraf.sync("./broccoli-timepiece-failure.json");

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

createWatcher(process.argv[2], process.argv[3]);
