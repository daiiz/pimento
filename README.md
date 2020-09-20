# Pimento

![Converter](https://github.com/daiiz/pimento/workflows/Converter/badge.svg)

## Build docker image
```
$ make build
```

## Run local server on docker
```
$ make run-server
```
Start the local server on port 5000.

## Scrapbox UserScript
```js
// script.js
import "https://scrapbox.io/api/code/daiiz-pimento/build/script.js"
setPimentoOrigin("http://localhost:5000")
```

## Settings
See https://scrapbox.io/daiiz-pimento/_pimento (template.tex)

### Options
```tex
% icons=gray // text*, gray, color, ignore
% images=gray // gray*, color
% heading-number-omit-level=3 // 3
% index=true
```

## DevTips: Build TeX documents
```
$ make run-bash
# cd /var/apps/docs
# lualatex tex/sample.tex
```

## DevTips: Develop client app
```
$ npm run watch
```
