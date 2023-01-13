const { calcPageTitleHash } = require('../lib')
const { removeTrailingEmptyLines, removeCommentLines } = require('./lib')
const { extractProjectNameAndPageTitle } = require('../texify')

// 解析したScrapboxページ本文情報を保持する
const parsedScrapboxPages = Object.create(null)

const addToScrapboxPagesPool = (title, lines) => {
  if (!title) return

  const pageTitleHash = calcPageTitleHash(title)
  if (parsedScrapboxPages[pageTitleHash]) {
    return
  }
  let lineTexts = []
  for (const line of lines) {
    lineTexts.push(line.text || '')
  }
  // 不要な情報を削除する
  lineTexts = removeCommentLines(lineTexts)
  lineTexts = removeTrailingEmptyLines(lineTexts)
  if (lineTexts[lineTexts.length - 1] !== '') {
    lineTexts.push('')
  }
  if (lineTexts[0] !== title) {
    if (lineTexts[0] !== extractProjectNameAndPageTitle(title)[1]) {
      throw new Error(`Invalid lineTexts: ${title}`)
    }
  }
  // https://gyazo.com/3da60ef6ba212bfe7a026ea66c4e7f7d
  parsedScrapboxPages[pageTitleHash] = {
    title,
    lines: lineTexts
  }
  // console.log('addToScrapboxPagesPool:', title)
}

const getParsedScrapboxPages = (pageTitleHashs = [], bookHashTagName = '') => {
  const pages = []
  const formattedBookHashTagName = bookHashTagName.trim().replace(/\s/g, '_')
  const bookHashTag = `[# #${formattedBookHashTagName}]`

  for (const pageTitleHash of pageTitleHashs) {
    const page = parsedScrapboxPages[pageTitleHash]
    if (!page) {
      continue
    }
    if (formattedBookHashTagName && !page.lines.includes(bookHashTag)) {
      page.lines.push(bookHashTag)
    }
    // TODO: 目次を生成する？
    pages.push(page)
  }
  return { pages }
}

module.exports = {
  addToScrapboxPagesPool,
  getParsedScrapboxPages
}
