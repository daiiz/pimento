const { backSlashExp } = require('./scrapboxlib/lib')
const { parseScrapboxPage } = require('./scrapboxlib/')
const { getPageRefs } = require('./scrapboxlib/lib')
const { convertImages, convertTexDocument } = require('./convert')
console.log('pimento v2')

window.funcs = Object.create(null)

const main = ({ type, body }) => {
  let texts = []
  switch (type) {
    case 'page': {
      const { id, lines, title } = body
      texts = parseScrapboxPage({ lines })
      break
    }
  }

  const funcBody = 'return `' + texts.join('\n') + '`'
  window.funcs.entry = function (level) {
    return new Function('level', 'showNumber', funcBody)(level)
  }
  console.log('pageRefs:', getPageRefs())
  const texDocument = format(funcs.entry(1))
  // console.log(format(funcs.entry(1)))
  document.getElementById('pre').innerText = texDocument
}

window.addEventListener('load', async event => {
  await convertImages({ gyazoIds: ['dc220ec3da67354f35d5a30aafcdf2f6', 'ddb8f03e5a404862c866d2b95563cd67'] })
  await convertTexDocument()
}, false)

let received = false

window.onmessage = function ({ origin, data }) {
  if (origin !== 'https://scrapbox.io') return
  const { task, type, body } = data

  if (received) {
    // console.log('Already received:', task)
    if (task === 'close') this.close()
    return
  }
  received = true

  switch (task) {
    case 'transfer-data': {
      main({ type, body })
      break
    }
  }
}

window.format = text => {
  return text.replace(backSlashExp, '\\')
}
