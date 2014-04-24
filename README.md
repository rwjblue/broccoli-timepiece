# Broccoli Timepiece

It's what you use to watch things, you know?

OK, seriously, broccoli-timepiece is a command line utlility that uses the Watcher and Builder that
come with `broccoli` to provide rebuild semantics without running a webserver.

## Usage

Uses the standard `broccoli` watcher to build a tree (from the `Brocfile.js` in your projects root), and output to a directory.

Pass the name of the directory to output to as the first commandline parameter.

```bash
npm install -g broccoli-timepiece
broccoli-timepiece dist/
```

## License

This project is distributed under the MIT license.
