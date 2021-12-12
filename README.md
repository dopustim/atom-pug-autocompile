
# Pug Autocompile for Atom

This plugin makes it easy to compile HTML from Pug with options and notifications.

[![Atom Package](https://img.shields.io/apm/dm/pug-autocompile.svg?style=flat-square)](https://atom.io/packages/pug-autocompile)

## Installation

Via Atom: Settings ➔ Install ➔ Search for "pug-autocompile"

Via command line:

```sh
apm install pug-autocompile
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
