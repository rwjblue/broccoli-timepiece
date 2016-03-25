# Broccoli Timepiece

It's what you use to watch things, you know?

OK, seriously, broccoli-timepiece is a command line utility that uses the `broccoli-sane-watcher` and Builder that come with `broccoli` to provide rebuild semantics without running a webserver.

## Usage

Uses the standard `broccoli` watcher to build a tree (from the `Brocfile.js` in your projects root), and output to a directory.

Pass the name of the directory to output to as the first command line parameter.

```bash
npm install -g broccoli-timepiece
broccoli-timepiece dist/
```

### Options

#### Verbose

When passing `--verbose` (or `-v`) you will also see which file triggered the rebuild action, accompanied with the `Slowest Trees` output. Useful for tracking down where bottle necks are present.

```bash
broccoli-timepiece dist/ --verbose

file changed css/style.scss
Build successful - 1967ms

Slowest Trees                                 | Total
----------------------------------------------+---------------------
AutoprefixerFilter                            | 748ms
CoreObject                                    | 429ms
SassCompiler                                  | 418ms
SassCompiler                                  | 372ms

Slowest Trees (cumulative)                    | Total (avg)
----------------------------------------------+---------------------
SassCompiler (2)                              | 790ms (395 ms)
AutoprefixerFilter (1)                        | 748ms
CoreObject (1)                                | 429ms
```

#### Watchman

Considered a more reliable alternative when it comes to watching file changes. Requires `watchman` to be installed prior (`brew install watchman` if you are on OS X). Activated by passing either `--watchman` or `-w`. [More information about `watchman`](https://facebook.github.io/watchman/).

```bash
broccoli-timepiece dist/ --watchman
```

## License

This project is distributed under the MIT license.
