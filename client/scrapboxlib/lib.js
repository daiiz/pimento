const crypto = require('crypto')

const pageRefs = Object.create(null)

const backSlash = '__TEX_BACKSLASH__'
const backSlashExp = new RegExp(backSlash, 'g')

const calcPageTitleHash = title => {
  const md5 = crypto.createHash('md5')
  return md5.update(title.toLowerCase(), 'binary').digest('hex')
}

const getPageRefs = () => {
  return Object.freeze(pageRefs)
}

const addToPageRefs = (title) => {
  const hash = calcPageTitleHash(title)
  pageRefs[hash] = title
  return hash
}

const getGyazoImageId = srcUrl => {
  const gyazoOrigin = 'https://gyazo.com/'
  if (!srcUrl.startsWith(gyazoOrigin)) return null
  return srcUrl.replace(gyazoOrigin, '').split('/')[0]
}

module.exports = {
  getGyazoImageId,
  addToPageRefs,
  getPageRefs,
  backSlash,
  backSlashExp
}
