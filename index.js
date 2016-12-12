#!/usr/bin/env node

var fs       = require('fs');
var path     = require('path');
var chalk    = require('chalk');
var rimraf   = require('rimraf');
var copyDereferenceSync = require('copy-dereference').sync;
var broccoli = require('broccoli');
var printSlowNodes = require('broccoli-slow-trees');
var program = require('commander');

function createWatcher(destDir, options) {
  var tree    = broccoli.loadBrocfile();
  var builder = new broccoli.Builder(tree);
  var saneOptions = {
      watchman: options.watchman === true,
      poll: options.poll !== undefined,
      interval: options.poll
  };
  var watcher = new broccoli.Watcher(builder, {saneOptions: saneOptions});

  var atExit = function() {
    watcher.quit();
    rimraf.sync("./broccoli-timepiece-failure.json");
  };

  process.on('SIGINT', atExit);
  process.on('SIGTERM', atExit);

  watcher.on('buildSuccess', function(results) {
    rimraf.sync(destDir);
    rimraf.sync("./broccoli-timepiece-failure.json");

    copyDereferenceSync(builder.outputPath, destDir);

    if (options.verbose) {
        printSlowNodes(builder.outputNodeWrapper);
    }
    console.log(chalk.green("Build successful - " + builder.outputNodeWrapper.buildState.totalTime + 'ms'));
  });

  watcher.on('buildFailure', function(error) {
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
    fs.appendFileSync("./broccoli-timepiece-failure.json", JSON.stringify({
      message: error.message,
      file: error.file,
      treeDir: error.treeDir,
      line: error.line,
      column: error.column,
      stack: error.stack
    }, null, 2));
  });

  watcher.start()
    .catch(function(err) {
      console.log(err && err.stack || err)
    })
    .finally(function() {
      builder.cleanup()
    })
    .catch(function(err) {
      console.log('Cleanup error:')
      console.log(err && err.stack || err)
    })
    .finally(function() {
      process.exit(1)
    });

  return watcher;
}

program
  .version(JSON.parse(fs.readFileSync(__dirname + '/package.json', 'utf8')).version)
  .usage('[options] <destination>')
  .option('-v, --verbose', 'Enable verbose output')
  .option('-w, --watchman', 'Use the Watchman watcher')
  .option('-p, --poll <interval>', 'Use the polling watcher at the specified interval in milliseconds', parseInt)
  .parse(process.argv);

if (!program.args.length) {
  program.help();
  process.exit(1);
}

createWatcher(program.args[0], program);
