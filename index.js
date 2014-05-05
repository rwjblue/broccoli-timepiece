#!/usr/bin/env node

var fs       = require('fs');
var path     = require('path');
var RSVP     = require('rsvp');
var chalk    = require('chalk');
var helpers  = require('broccoli-kitchen-sink-helpers');
var Watcher  = require('broccoli/lib/watcher');
var lockfile = require('lockfile');
var broccoli = require('broccoli');

var RSVP      = require('rsvp');
var denodeify = RSVP.denodeify;
var rimraf    = denodeify(require('rimraf'));
var lock      = denodeify(lockfile.lock);
var unlock    = denodeify(lockfile.unlock);

var destDir      = process.argv[2];
var interval     = process.argv[3];
var lockFilename = '.broccoli-timepiece';

function willBuild() {
  return lock(lockFilename);
};

function didBuild(results) {
  rimraf(destDir)
    .then(function() {
      return helpers.copyRecursivelySync(results.directory, destDir);
    })
    .finally(function() {
      return unlock(lockFilename);
    })
    .finally(function() {
      console.log(chalk.green("Build successful - " + Math.floor(results.totalTime / 1e6) + 'ms'));
    });
}

function didError(error) {
  console.log(chalk.red('\n\nBuild failed.\n'));
  console.error(err.stack);

  return unlock(lockFilename);
}

var tree    = broccoli.loadBrocfile();
var builder = new broccoli.Builder(tree);
var watcher = new Watcher(builder, {
  interval: interval || 100,
  willBuild: willBuild,
  didBuild: didBuild,
  didError: didError,
});

process.addListener('exit', function () {
  builder.cleanup();
  unlock(lockFilename);
});

// We register these so the 'exit' handler removing temp dirs is called
process.on('SIGINT', function () {
  process.exit(1);
});

process.on('SIGTERM', function () {
  process.exit(1);
});
