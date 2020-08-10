const { calcPageTitleHash, texEscape, backSlash } = require('./scrapboxlib/lib')
const { incrementPageEmbedCounter, getAppendixPages } = require('./page-embed-counter')

const createBookAppendix = (toc = { parts: {} }) => {
  const appendixHashs = getAppendixPages()
  console.log('APPENDIXS:', appendixHashs)
  if (appendixHashs.length === 0) {
    window.funcs.appendixContent = () => {
      return new Function('return ""')()
    }
    return
  }

  const lines = ['', backSlash + 'appendix']
  if (Object.keys(toc.parts).length > 0) {
    lines.push(backSlash + 'part{付録}')
  }
  for (const appendixHash of appendixHashs) {
    insertChapFunction(lines, appendixHash)
  }
  // 付録を生成する関数を登録
  const funcBody = 'return `' + lines.join('\n') + '`'
  window.funcs.appendixContent = () => {
    return new Function(funcBody)()
  }
}

const insertChapFunction = (lines, titleHash) => {
  const pageFuncName = `page_${titleHash}`
  if (!window.funcs[pageFuncName]) {
    throw new Error(`Not found chapter: ${titleHash}`)
  }
  incrementPageEmbedCounter(titleHash)
  lines.push(`\$\{window.funcs.${pageFuncName}(1)\}`)
}

const createBook = (toc) => {
  const { parts, flatChaps } = toc
  const bookLines = []
  // 単独の章を解決する
  for (const chapTitle of flatChaps) {
    insertChapFunction(bookLines, calcPageTitleHash(chapTitle))
  }
  // 部に属する章を解決する
  for (const partTitle of Object.keys(parts)) {
    const chaps = parts[partTitle]
    if (chaps.length === 0) continue
    bookLines.push(backSlash + 'part{' + texEscape(partTitle) + '}')
    for (const chapTitle of chaps) {
      insertChapFunction(bookLines, calcPageTitleHash(chapTitle))
    }
  }
  // 本文を生成する関数を登録
  const funcBody = 'return `' + bookLines.join('\n') + '`'
  window.funcs.bookContent = () => {
    return new Function(funcBody)()
  }
}

module.exports = {
  createBook,
  createBookAppendix
}
