const { parse } = require('@progfay/scrapbox-parser')
const { getGyazoImageId, indentStr, backSlash } = require('./lib')
const { addBlockInfo, normalizeTextBlockLevels } = require('./blockify')
const { Texify } = require('./texify')
const { handleScrapboxBlockNode } = require('./block-nodes')
const { handleSpecialLine } = require('./special-nodes')

// XXX: 別途どこかに適宜
// levelに対応するテキストブロックの名称を返す
window.textBlockName = (level, showNumber = true) => {
  const brace = showNumber ? '{' : '*{'
  switch (parseInt(level)) {
    case 0: return backSlash + 'part' + brace // 部
    case 1: return backSlash + 'chapter' + brace // 章
    case 2: return backSlash + 'section' + brace // 節
    case 3: return backSlash + 'subsection' + brace // 小節
    case 4: return backSlash + 'subsubsection' + brace // 小々節
  }
  console.error('Invalid level:', level)
  return ''
}

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
    if (line._nextLineIsEmpty) {
      texLine += backSlash.repeat(2) // 改行
    }
    texts.push(indentStr(line.indent, true) + texLine)
  }

  // 最終生成物
  // console.log('&&', texts)
  texts.push(`\$\{window.a(2)\}`)
  return texts
}

window.a = (m) => {
  const texts = [
    `${backSlash}daiiz-a`,
    `\$\{window.b(N)\}`
  ]
  const funcBody = 'return `' + texts.join('\n') + '`'
  return new Function('N', funcBody)(m * 3)
}

window.b = (n) => {
  const texts = [
    backSlash + 'b'.repeat(n)
  ]
  const funcBody = 'return `' + texts.join('\n') + '`'
  return new Function(funcBody)()
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

module.exports = {
  parseScrapboxPage
}
