#!/usr/bin/env node

var fs       = require('fs');
var path     = require('path');
var chalk    = require('chalk');
var rimraf   = require('rimraf');
var helpers  = require('broccoli-kitchen-sink-helpers');
var Watcher  = require('broccoli/lib/watcher');
var broccoli = require('broccoli');
var argv     = require('minimist')(process.argv.slice(2), { boolean: 'v' });

function createWatcher(destDir, interval) {
  var tree    = broccoli.loadBrocfile();
  var builder = new broccoli.Builder(tree);
  var watcher = new Watcher(builder, {interval: interval || 100});

  var atExit = function() { builder.cleanup(); };
  process.on('SIGINT', atExit);
  process.on('SIGTERM', atExit);

  watcher.on('change', function(results) {
    rimraf.sync(destDir);
    helpers.copyRecursivelySync(results.directory, destDir);

    console.log(chalk.green("Build successful - " + Math.floor(results.totalTime / 1e6) + 'ms'));
  });

  watcher.on('error', function(err) {
    console.log(chalk.red('\n\nBuild failed.\n'));
    argv.v && console.log(err.toString());
  });

  return watcher;
}

createWatcher(argv._[0], argv.i);
