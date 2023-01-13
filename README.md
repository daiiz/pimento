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

```js
// script.js
import "https://scrapbox.io/api/code/daiiz-pimento/build/script.js";
setPimentoOrigin("http://localhost:5001"); // これ今はもう不要？
```

## Settings

See https://scrapbox.io/daiiz-pimento/_pimento (template.tex)

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
