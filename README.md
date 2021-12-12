
# Pug Autocompile plugin for Atom

[![apm](https://img.shields.io/apm/dm/pug-autocompile.svg?style=flat-square)](https://atom.io/packages/pug-autocompile)
[![Deps](https://img.shields.io/david/DopustimVladimir/atom-pug-autocompile.svg?style=flat-square)](https://david-dm.org/DopustimVladimir/atom-pug-autocompile)
[![Travis](https://img.shields.io/travis/DopustimVladimir/atom-pug-autocompile.svg?style=flat-square)](https://travis-ci.org/DopustimVladimir/atom-pug-autocompile)
[![AppVeyor](https://img.shields.io/appveyor/ci/DopustimVladimir/atom-pug-autocompile.svg?style=flat-square)](https://ci.appveyor.com/project/DopustimVladimir/atom-pug-autocompile/branch/master)

[![GitHub tag](https://img.shields.io/github/tag/DopustimVladimir/atom-pug-autocompile.svg?style=flat-square)](https://github.com/DopustimVladimir/atom-pug-autocompile/tags)
[![GitHub stars](https://img.shields.io/github/stars/DopustimVladimir/atom-pug-autocompile.svg?style=flat-square)](https://github.com/DopustimVladimir/atom-pug-autocompile/stargazers)
[![GitHub issues](https://img.shields.io/github/issues/DopustimVladimir/atom-pug-autocompile.svg?style=flat-square)](https://github.com/DopustimVladimir/atom-pug-autocompile/issues)

[![License](https://img.shields.io/github/license/mashape/apistatus.svg?style=flat-square)](/LICENSE.md)

This plugin allows you easy compile Pug files to HTML with options.

Atom Package: https://atom.io/packages/pug-autocompile

## Installation

From Atom: Settings ➔ Install ➔ Search for pug-autocompile

You can also install this plugin via command line:

```
$ apm install pug-autocompile
```

## Keymaps

**Windows / Linux**

- Push `Ctrl+ Shift+ C` then `D` to compile from current selection
- Push `Ctrl+ Shift+ C` then `F` to compile current file

**macOS**

- Push `Cmd+ Shift+ C` then `D` to compile from current selection
- Push `Cmd+ Shift+ C` then `F` to compile current file

## Options

Add the parameters on the first line of your Pug file.
Your output file will be minified (default behaviour).
Always start line with comment `//- ` and separate options by comma `, `.

- `out: path/to/output.html` — path to your rendered HTML-file
- `main: path/to/main.pug` — path to your main / parent Pug-file to be compiled
- `pretty: true` — make your HTML pretty
- `compress: false` — make your HTML pretty

## Examples

**index.pug**

```
//- out: build/index.html, pretty: true
doctype html
html
    include includes/head.pug
    body
        h1 Hello from Pug :)
```

**includes/head.pug**

```
//- main: ../index.pug
head
    title Pug Autocompile plugin for Atom
    link(href='/assets/css/main.css')
```

**build/index.html**

```html
<!DOCTYPE html>
<html>

    <head>
        <title>Pug Autocompile plugin for Atom</title>
        <link href="/assets/css/main.css">
    </head>

    <body>
        <h1>Hello from Pug :)</h1>
    </body>

</html>
```
