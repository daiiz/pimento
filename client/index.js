const { convertImages, convertTexDocument } = require('./convert')
console.log('pimento v2')

window.addEventListener('load', async event => {
  await convertImages()
  await convertTexDocument()
}, false)
