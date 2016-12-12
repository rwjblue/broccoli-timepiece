# Broccoli Timepiece

It's what you use to watch things, you know?

OK, seriously, broccoli-timepiece is a command line utility that uses the Watcher and Builder that
come with `broccoli` to provide rebuild semantics without running a webserver.

## Usage

Uses the standard `broccoli` watcher to build a tree (from the `Brocfile.js` in your projects root), and output to a directory.

Pass the name of the directory to output to as the first command line parameter.

```bash
npm install -g broccoli-timepiece
broccoli-timepiece dist/
```

### Options

Options can be specified before the destination directory.

* `-v`, `--verbose`: Outputs the Slowest Trees information after successful builds.
* `-w`, `--watchman`: Uses Facebook Watchman. Requires `watchman` to be installed.
* `-p`, `--poll <milliseconds>`: Uses sane's polling mode at the specified interval.

## License

This project is distributed under the MIT license.
