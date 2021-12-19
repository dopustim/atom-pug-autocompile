
# Pug Autocompile for Atom

This plugin makes it easy to compile HTML from Pug with options and notifications.

[![Atom Package](https://img.shields.io/apm/dm/pug-autocompile.svg?style=flat-square)](https://atom.io/packages/pug-autocompile)

## Installation

Via Atom: Settings ➔ Install ➔ Search for "pug-autocompile"

Via command line:

```sh
apm install pug-autocompile
```

## Usage

Via menu: Packages ➔ Pug Autocompile ➔ Compile ...

Via context menu: Right Click ➔ Compile ...

## Keymaps

Works only with ".pug" files!

**Windows / Linux**

| Command | Description |
| --- | --- |
| `Ctrl+ Shift+ C` then `D` | compile selection |
| `Ctrl+ Shift+ C` then `F` | compile file |

**macOS**

| Command | Description |
| --- | --- |
| `Cmd+ Shift+ C` then `D` | compile selection |
| `Cmd+ Shift+ C` then `F` | compile file |

## Options Line

The options line should be the first. The output file will be minified (default behaviour). Always start the options line with comment `//-` and separate options by comma `, `.

| Parameter | Description |
| --- | --- |
| `out: path/to/output.html` | path to output (target) HTML file |
| `main: path/to/main.pug` | path to main (parent) Pug file |
| `pretty: true` | makes HTML pretty (`false` to vice versa) |

## Example

**index.pug**

```pug
//- out: build/index.html, pretty: true
extends layout.pug

block content
    h1 Hello from Pug :)
```

**layout.pug**

```pug
//- main: index.pug
doctype html
html(lang="en")
    include includes/head.pug
    body
        block content
```

**includes/head.pug**

```pug
//- main: ../index.pug
head
    title Demo
    link(href="/assets/css/main.css")
```

**build/index.html**

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <title>Demo</title>
    <link href="/assets/css/main.css">
</head>
<body>
    <h1>Hello from Pug :)</h1>
</body>
</html>
```
