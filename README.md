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

## Environment variables

### Local tools mode
```env
# .env
PIMENTO_API_ORIGIN=http://localhost:5001
LOCAL_TOOLS_MODE=true
```

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

### Options (WIP)

```tex
% =====pimento-options=====
% icons=gray // gray, color, text*, ignore
% images=gray // gray*, color, ignore
% heading-number-omit-level=3
% appendix=true // true, false*
% index=true // true, false*
```

## For developers

### Build TeX documents manually

```
$ make run-bash
# cd /var/apps/docs
# lualatex tex/sample.tex
```

### Build client JavaScript code

Note: Run outside a Docker container.

```
$ npm run dev
```
