#!/usr/bin/env node

var fs       = require('fs');
var path     = require('path');
var chalk    = require('chalk');
var rimraf   = require('rimraf');
var helpers  = require('broccoli-kitchen-sink-helpers');
var sane     = require('broccoli-sane-watcher');
var minimist = require('minimist');
var broccoli = require('broccoli');

function createWatcher(destDir, argv) {
  var tree    = broccoli.loadBrocfile();
  var builder = new broccoli.Builder(tree);
  var watcher = new sane(builder, {verbose: argv.verbose, watchman: argv.watchman});

  var atExit = function() {
    builder.cleanup()
      .then(function() {
        rimraf.sync("./broccoli-timepiece-failure.json");
        process.exit(1);
      });
  };

  process.on('SIGINT', atExit);
  process.on('SIGTERM', atExit);

  watcher.on('change', function(results) {
    rimraf.sync(destDir);
    rimraf.sync("./broccoli-timepiece-failure.json");

    helpers.copyRecursivelySync(results.directory, destDir);

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

var opts = {
  default: {verbose: false, watchman: false},
  boolean: ['verbose', 'watchman'],
  alias: {verbose: ['v'], watchman: ['w']}
};

var argv = minimist(process.argv.slice(2), opts);

if(argv._.length === 0) {
  var msg = 'Usage: broccoli-timepiece <directory> [--verbose] [--watchman]';
  console.error(msg);
  process.exit();
}

createWatcher(argv._[0], argv);
