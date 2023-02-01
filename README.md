# Pimento

![Converter](https://github.com/daiiz/pimento/workflows/Converter/badge.svg)

## Build docker image

```
$ make build
```

## Run local server on docker

```
$ make run-server
# or
$ make run-server-dev
```

Start the local server on port 5001.

## Scrapbox UserScript

### Local tools mode

```js
// script.js
import { initPimento } from "/api/code/daiiz-codes/pimento-build/script.js";
initPimento([], "http://localhost:5001");
```

## Bookbinding global settings

1. Create a page `_pimento` in your Scrapbox project.
2. Copy a sample code https://scrapbox.io/pimento/B5_標準 (template.tex) to the page `_pimento`.

### Options

```tex
% =====pimento-options=====
% icons=gray // gray, color, text*, ignore
% images=gray // gray*, color, ignore
% heading-number-omit-level=3
% appendix=true // true, false*
% index=true // true, false*
```

## DevTips: Build TeX documents

```
$ make run-bash
# cd /var/apps/docs
# lualatex tex/sample.tex
```

## DevTips: Develop client app

Dockerコンテナ外で実行する。

```
$ npm run dev
```
