const { calcPageTitleHash } = require('./lib')

// 解析したScrapboxページ本文情報を保持する
const parsedScrapboxPages = Object.create(null)

const addToScrapboxPagesPool = (title, lines) => {
  const pageTitleHash = calcPageTitleHash(title)
  if (!title) {
    throw new Error('title is required.')
  }
  if (parsedScrapboxPages[pageTitleHash]) {
    return
  }
  const lineTexts = []
  for (const line of lines) {
    lineTexts.push(line.text || '')
  }
  if (lineTexts[lineTexts.length - 1] !== '') {
    lineTexts.push('')
  }
  if (lineTexts[0] !== title) {
    throw new Error(`Invalid lineTexts: ${title}`)
  }
  // https://gyazo.com/3da60ef6ba212bfe7a026ea66c4e7f7d
  parsedScrapboxPages[pageTitleHash] = {
    title,
    lines: lineTexts
  }
  console.log('addToScrapboxPagesPool:', title)
}

const getParsedScrapboxPages = (pageTitleHashs = [], bookHashTag = '') => {
  for (const pageTitleHash of pageTitleHashs) {
    //
  }
}

module.exports = {
  addToScrapboxPagesPool
}
