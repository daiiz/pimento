const { parse } = require('@progfay/scrapbox-parser')
const { decorateImageNodes, decorateIconNodes, indentStr, backSlash } = require('./lib')
const { separateAbstractFromTexts } = require('./abstract')
const { addBlockInfo, normalizeTextBlockLevels } = require('./blockify')
const { retypeAbsLinksToGyazoTeamsImages, retypeStrongImagesToImages } = require('./retype')
const { Texify } = require('./texify')
const { handleScrapboxBlockNode } = require('./block-nodes')
const { handleSpecialLine } = require('./special-nodes')
const { addToScrapboxPagesPool } = require('./pool/')

const removeEmptyLinesBothEnds = lines => {
  if (lines.length <= 2) return lines
  // 記事先頭の空白行を除去
  // [
  //    "${window.textBlockName(level, showNumber)}Foo} % Scrapbox page title line",
  //    "---TEX-BACKSLASH---label{textBlock-09b4d0c6beea8d7c14c3b86ffcd06bff}",
  //    ...
  // ]
  // という構造なので、2行目から検査する
  for (let l = 2; l < lines.length; l++) {
    if (lines[l].length === 0) continue
    lines = [lines[0], lines[1], ...lines.slice(l)]
    break
  }
  // 記事末尾の空白行を除去
  for (let l = lines.length - 1; l >= 0; l--) {
    if (lines[l].length === 0) continue
    return lines.slice(0, l + 1)
  }
  return []
}

const removeLineComments = texts => {
  const newTexts = []
  const commentPattern = /^\[[^\s]*#[^\s]*\s+(.*)\]\s*$/
  for (const text of texts) {
    if (commentPattern.test(text)) continue
    newTexts.push(text)
  }
  return newTexts
}

const parseScrapboxPage = ({ title, lines }) => {
  addToScrapboxPagesPool(title, lines)
  const rawTexts = lines.map(line => line.text)
  let { abstractFuncCall, lineTexts } = separateAbstractFromTexts(rawTexts)
  // 最終行が空行になるよう調整する
  if (lineTexts[lineTexts.length - 1] !== '') {
    lineTexts.push('')
  }
  lineTexts = removeLineComments(lineTexts)
  let lineObjects = parse(lineTexts.join('\n'))

  retypeStrongImagesToImages(lineObjects)
  retypeAbsLinksToGyazoTeamsImages(lineObjects)
  decorateImageNodes(lineObjects, title)
  decorateIconNodes(lineObjects, title)
  normalizeTextBlockLevels(lineObjects)
  lineObjects = addBlockInfo(lineObjects)
  console.log("[[[[lineObjects]]]]", lineObjects)

  const texts = []
  for (const line of lineObjects) {
    // 独自に追加した特殊なタイプを処理
    if (line._type) {
      texts.push(...handleSpecialLine(line, title))
      continue
    }
    // ブロックノードを処理
    if (!line.nodes) {
      texts.push(...handleScrapboxBlockNode(line))
      continue
    }

    let texLine = Texify(line.nodes).join('')

    // 改行を処理
    if (texLine.length > 0) {
      if (line._requireNewParagraph) {
        texLine += `${backSlash}par`
      } else if (line._requireNewLine) {
        texLine += `${backSlash}${backSlash}`
      }
    }
    texts.push(indentStr(line.indent, true) + texLine)
  }

  let pageTexts = texts
  if (abstractFuncCall && texts.length >= 2) {
    pageTexts = [
      texts[0], // title
      texts[1], // reference label
      abstractFuncCall,
      ...texts.slice(2)
    ]
  }

  // 最終生成物
  return {
    texts: removeEmptyLinesBothEnds(pageTexts)
  }
}

module.exports = {
  parseScrapboxPage
}
