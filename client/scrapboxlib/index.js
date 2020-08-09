const { parse } = require('@progfay/scrapbox-parser')
const { extractGyazoIds, getGyazoImageId, indentStr, backSlash } = require('./lib')
const { addBlockInfo, normalizeTextBlockLevels } = require('./blockify')
const { Texify } = require('./texify')
const { handleScrapboxBlockNode } = require('./block-nodes')
const { handleSpecialLine } = require('./special-nodes')

const parseScrapboxPage = ({ lines }) => {
  const lineTexts = lines.map(line => line.text)
  let lineObjects = parse(lineTexts.join('\n'))

  const gyazoIds = extractGyazoIds(lineObjects)
  normalizeTextBlockLevels(lineObjects)
  lineObjects = addBlockInfo(lineObjects)

  const texts = []
  for (const line of lineObjects) {
    // 独自に追加した特殊なタイプを処理
    if (line._type) {
      texts.push(...handleSpecialLine(line))
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

  // 最終生成物
  return { texts, gyazoIds }
}

module.exports = {
  parseScrapboxPage
}
