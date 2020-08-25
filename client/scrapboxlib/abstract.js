const { parse } = require('@progfay/scrapbox-parser')
const { calcPageTitleHash, backSlash } = require('./lib')
const { Texify } = require('./texify')

const separateAbstractFromTexts = texts => {
  const abstractTexts = []
  const lineTexts = []
  let abstractFuncCall = ''

  let isInAbstract = false
  const title = texts[0]
  for (const [idx, text] of texts.entries()) {
    if (idx === 1 && text === '概要') {
      isInAbstract = true
      continue
    }
    if (isInAbstract && text.length === 0) {
      isInAbstract = false
      abstractFuncCall = defineAbstractFunction({ title, texts: abstractTexts })
      continue
    }

    if (isInAbstract) {
      abstractTexts.push(text.trim())
    } else {
      lineTexts.push(text)
    }
  }

  return {
    abstractFuncCall,
    lineTexts
  }
}

const defineAbstractFunction = ({ title, texts }) => {
  const hash = calcPageTitleHash(title)
  const fName = `page_abstract_${hash}`
  // XXX: ダミーのタイトル行を追加してからパースする
  const lineObjects = parse(['Dummy title', ...texts].join('\n'))
  lineObjects.shift()
  const texLines = []
  for (const line of lineObjects) {
    const texLine = Texify(line.nodes).join('')
    texLines.push(texLine)
  }

  window.funcs[fName] = function (level) {
    // 章レベル以外では描画しない
    if (level !== 1) return '% Omitted abstract'
    return [
      `${backSlash}begin{abstract}`,
      ...texLines.map(text => '  ' + text),
      `${backSlash}end{abstract}`,
      ''
    ].join('\n')
  }
  return `\$\{window.funcs.${fName}(level)\}`
}

module.exports = {
  separateAbstractFromTexts
}
