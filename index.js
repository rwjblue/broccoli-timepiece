#!/usr/bin/env node

var fs       = require('fs');
var path     = require('path');
var chalk    = require('chalk');
var rimraf   = require('rimraf');
var helpers  = require('broccoli-kitchen-sink-helpers');
var Watcher  = require('broccoli/lib/watcher');
var broccoli = require('broccoli');

function createWatcher(destDir) {
  var tree    = broccoli.loadBrocfile();
  var builder = new broccoli.Builder(tree);
  var watcher = new Watcher(builder);

  watcher.on('change', function(srcDir) {
    rimraf.sync(destDir);
    helpers.copyRecursivelySync(srcDir, destDir);

    var message = "Build successful";

    if (builder.buildTime) {
      message += ' - ' + builder.buildTime + 'ms.\n';
    }
    console.log(chalk.green(message));
  });

  watcher.on('error', function(err) {
    console.log(chalk.red('\n\nBuild failed.\n'));
  });

  return watcher;
}

createWatcher(process.argv[2]);
