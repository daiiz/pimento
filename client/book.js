const { calcPageTitleHash, texEscape, backSlash } = require('./scrapboxlib/lib')

const createBook = ({ toc }) => {
  const insertChapFunction = chapTitle => {
    const titleHash = calcPageTitleHash(chapTitle)
    const pageFuncName = `page_${titleHash}`
    if (!window.funcs[pageFuncName]) {
      throw new Error(`Not found chapter: ${chapTitle}`)
    }
    bookLines.push(`\$\{window.funcs.${pageFuncName}(1)\}`)
  }

  const { parts, flatChaps } = toc
  const bookLines = [
    '% Built by Pimento 2.0',
    ''
  ]
  // 単独の章を解決する
  for (const chapTitle of flatChaps) {
    insertChapFunction(chapTitle)
  }
  // 部に属する章を解決する
  for (const partTitle of Object.keys(parts)) {
    const chaps = parts[partTitle]
    if (chaps.length === 0) continue
    bookLines.push(backSlash + 'part{' + texEscape(partTitle) + '}')
    for (const chapTitle of chaps) {
      insertChapFunction(chapTitle)
    }
  }
  // 本文を生成する関数を登録
  const funcBody = 'return `' + bookLines.join('\n') + '`'
  window.funcs.bookContent = () => {
    return new Function(funcBody)()
  }
}

module.exports = {
  createBook
}
