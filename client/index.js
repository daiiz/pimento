const { convertImages, convertTexDocument } = require('./convert')
console.log('pimento v2')

window.addEventListener('load', async event => {
  await convertImages({ gyazoIds: ['dc220ec3da67354f35d5a30aafcdf2f6'] })
  await convertTexDocument()
}, false)
