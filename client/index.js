const { convertImages, convertTexDocument } = require('./convert')
console.log('pimento v2')

window.addEventListener('load', async event => {
  await convertImages({ gyazoIds: ['dc220ec3da67354f35d5a30aafcdf2f6', 'ddb8f03e5a404862c866d2b95563cd67'] })
  await convertTexDocument()
}, false)

window.onmessage = function ({ origin, data }) {
  if (origin !== 'https://scrapbox.io') return
  const { task, type, body } = data
  switch (task) {
    case 'transfer-data': {
      console.log('>>>>!', type, body)
      break
    }
    case 'close': {
      this.close()
      break
    }
  }
}
