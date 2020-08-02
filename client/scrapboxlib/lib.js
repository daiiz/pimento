const crypto = require('crypto')

const pageRefs = Object.create(null)

const backSlash = '__TEX_BACKSLASH__'
const backSlashExp = new RegExp(backSlash, 'g')

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
    .replace(/_/g, backSlash + '_')
    .replace(/\$/g, backSlash + '$')
}

// すべての行の変換が完了してはじめてできる調整処理
const finalAdjustment = texts => {
  const newTexts = []
  for (let i = 0; i < texts.length; i++) {
    let currentLine = texts[i]
    // console.log('>>>>!',  currentLine)
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
    if (oneAheadLine === '') {
      if (twoAheadLine.startsWith(`${backSlash}begin{`)
        || twoAheadLine.startsWith('${window.textBlockName(')
        || twoAheadLine.startsWith('${window.funcs.page_')) {
        const tailNewLineMark = new RegExp(backSlash + backSlash + '$')
        currentLine = currentLine.replace(tailNewLineMark, '')
        // console.log('###########', currentLine)
      }
    }
    newTexts.push(currentLine)
  }

  return newTexts
}

module.exports = {
  extractGyazoIds,
  getGyazoImageId,
  addToPageRefs,
  getPageRefs,
  indentStr,
  buildOptions,
  texEscape,
  finalAdjustment,
  backSlash,
  backSlashExp
}
