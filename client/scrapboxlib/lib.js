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

const indentStr = (indent, showItemLabel = false) => {
  if (!indent || indent <= 0) return ''
  return '  '.repeat(indent - 1) + (showItemLabel ? `  ${backSlash}item ` : '')
}

module.exports = {
  getGyazoImageId,
  addToPageRefs,
  getPageRefs,
  indentStr,
  backSlash,
  backSlashExp
}
