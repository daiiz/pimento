# Pimento

## Build docker image
```
$ make build
```

## Run local server on docker
```
$ make run-server
```

## Scrapbox UserScript
```js
// script.js
import "https://scrapbox.io/api/code/daiiz-pimento/build/script.js"
```

## Tips: Build TeX documents
```
$ make run-bash
# cd /var/apps/docs
# lualatex tex/sample.tex
```

## Tips: Develop client app
```
$ npm run watch
```
