const crypto = require('crypto')

const pageRefs = Object.create(null)

const backSlash = '---TEX-BACKSLASH---'
const backSlashExp = new RegExp(backSlash, 'g')
const backQuote = '---TEX-BACKQUOTE---'
const backQuoteExp = new RegExp(backQuote, 'g')
const dollar = '---TEX-DOLLAR---'
const dollarExp = new RegExp(dollar, 'g')

const formatMarks = text => {
  return text
    .replace(backSlashExp, '\\')
    .replace(backQuoteExp, '`')
    .replace(dollarExp, '$')
}

// UserScriptと挙動を揃える
const toTitleLc = title => {
  return title.toLowerCase().replace(/\s/g, '_')
}

const calcPageTitleHash = title => {
  const md5 = crypto.createHash('md5')
  return md5.update(toTitleLc(title), 'binary').digest('hex')
}

const getPageRefs = () => {
  return Object.freeze(pageRefs)
}

// pageTitleHashを計算してpageRefsに保持する
const addToPageRefs = (title) => {
  const hash = calcPageTitleHash(title)
  pageRefs[hash] = title
  return hash
}

const extractGyazoIds = lines => {
  const gayzoIds = []
  // XXX: 本当は再帰的に見ていくべきだが、いまは雑にやる
  for (const line of lines) {
    const { nodes, type } = line
    if (!nodes) continue
    for (const node of nodes) {
      if (node.type === 'image') {
        const gayzoId = getGyazoImageId(node.src)
        if (gayzoId) gayzoIds.push(gayzoId)
      }
    }
  }
  return gayzoIds
}

// アイコンが挿入されているページのpageTitleHashをnodeに保持する
const decorateIconNodes = (lines, title) => {
  if (!title) return
  for (const line of lines) {
    for (const node of line.nodes || []) {
      if (node.type !== 'icon') continue
      node.hostPageTitleHash = calcPageTitleHash(title)
      console.log(">>>>>>>>>>", node)
    }
  }
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

const buildOptions = (info, excludeKeys = []) => {
  const options = []
  for (const key of Object.keys(info)) {
    if (!info[key] || excludeKeys.includes(key)) continue
    options.push(`${key}=${info[key]}`)
  }
  return options
}

const texEscape = str => {
  return str
    .replace(/\\/g, backSlash + 'textbackslash ')
    .replace(/\~/g, backSlash + 'textasciitilde ')
    .replace(/\^/g, backSlash + 'textasciicircum ')
    .replace(/\_/g, backSlash + '_')
    .replace(/\$/g, backSlash + '$')
    .replace(/\&/g, backSlash + '&')
    .replace(/\%/g, backSlash + '%')
    .replace(/\#/g, backSlash + '#')
    .replace(/\{/g, backSlash + '{')
    .replace(/\}/g, backSlash + '}')
    .replace(/\`/g, backQuote)
}

const texEscapeForCodeBlock = str => {
  return str
    .replace(/\\/g, backSlash)
    .replace(/\`/g, backQuote)
    .replace(/\$/g, dollar)
}

const texEscapeForFormula = str => {
  return str.replace(/\\/g, backSlash)
}

const removeAllBackSlash = str => {
  const regexp = new RegExp('(' + backSlash + '|' + '\\\\)', 'g')
  return str.replace(regexp, '')
}

const texEscapeForRef = str => {
  return removeAllBackSlash(str)
}

// すべての行の変換が完了してはじめてできる調整処理
const finalAdjustment = texts => {
  const newTexts = []
  for (let i = 0; i < texts.length; i++) {
    let currentLine = texts[i]
    const prevLine = i > 0 ? texts[i - 1] : null
    const oneAheadLine = texts[i + 1]
    const twoAheadLine = texts[i + 2]
    if (oneAheadLine === undefined || twoAheadLine === undefined) {
      newTexts.push(currentLine)
      continue
    }
    // 以下の場合、0行目の末尾の改行は不要
    // ['...\\', '', '\begin{']
    // ['...\\', '', '${window.textBlockName(']
    // など
    // TODO: 複合条件を関数に切り出す
    if (oneAheadLine === '') {
      if (twoAheadLine.startsWith(`${backSlash}begin{`) ||
        twoAheadLine.startsWith('${window.textBlockName(') ||
        twoAheadLine.startsWith('${window.funcs.page_')) {
        const tailNewLineMark = new RegExp(backSlash + backSlash + '$')
        // 引用と図は例外
        if (!twoAheadLine.startsWith(`${backSlash}begin{pimento-quote}`) &&
          !twoAheadLine.startsWith(`${backSlash}begin{figure}`)) {
          currentLine = currentLine.replace(tailNewLineMark, '')
        }
      }
    }

    // 箇条書きとコードブロックの間の空行を除去
    // ['\end{itemize}', '', '\begin{lstlisting}...']
    if (currentLine === '') {
      if (prevLine.endsWith(`${backSlash}end{itemize}`) && oneAheadLine.startsWith(`${backSlash}begin{lstlisting}`)) {
        newTexts.push('% Omitted blank line (itemize-lstlisting)')
        continue
      }
    }
    newTexts.push(currentLine)
  }

  return newTexts
}

module.exports = {
  extractGyazoIds,
  decorateIconNodes,
  getGyazoImageId,
  calcPageTitleHash,
  addToPageRefs,
  getPageRefs,
  indentStr,
  buildOptions,
  texEscape,
  texEscapeForCodeBlock,
  texEscapeForFormula,
  texEscapeForRef,
  finalAdjustment,
  formatMarks,
  toTitleLc,
  backSlash
}
