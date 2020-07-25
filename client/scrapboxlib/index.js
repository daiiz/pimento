const { parse } = require('@progfay/scrapbox-parser')
const { getGyazoImageId, addToPageRefs, getPageRefs, backSlash } = require('./lib')
const { addBlockInfo, normalizeTextBlockLevels } = require('./block')
const { Texify } = require('./texify')

const indentStr = (indent, showItemLabel = false) => {
  if (!indent || indent <= 0) return ''
  return '  '.repeat(indent - 1) + (showItemLabel ? `  ${backSlash}item ` : '')
}

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

const handleSpecialLines = (line) => {
  switch (line._type) {
    case 'title': {
      const hash = addToPageRefs(line.text)
      return [
        `\$\{window.textBlockName(level, showNumber)\}${line.text}} % Scrapbox page title line"`,
        `${backSlash}label{textBlock-${hash}}`
      ]
    }
    case 'textBlockHead': {
      return [`\$\{window.textBlockName(level + 1 +  ${line._level}, showNumber)\}${line._text}}`]
      break
    }
    case 'itemizeHead': {
      return [indentStr(line.indent) + `${backSlash}begin{itemize}`]
      break
    }
    case 'itemizeTail': {
      return [indentStr(line.indent) + `${backSlash}end{itemize}`]
      break
    }
    case 'image': {
      let captionText = ''
      let info = Object.create(null)
      const captionNodes = []

      if (!line._gyazoImageId) {
        console.error('This is not a Gyazo image.')
        return []
      }

      switch (line._captionNodes.length) {
        case 0: {
          return []
        }
        case 1: {
          captionText = Texify(line._captionNodes[0])
          break
        }
        case 2: {
          captionText = Texify(line._captionNodes[0])
          const infoNode = line._captionNodes[1]
          infoNode.decos = []
          const infoText = Texify(infoNode)[0]
          // 指定できる画像オプションを制限しておく
          const [, width, ref] = infoText.trim().match(/^width=([\d\.]+),\s*(?:ref|label)=(.+)$/i)
          info.width = width + `${backSlash}linewidth`
          info.ref = ref
          break
        }
      }

      const renderIncludegraphics = () => {
        const options = []
        for (const key of ['width']) {
          if (!info[key]) continue
          options.push(`${key}=${info[key]}`)
        }
        // TODO: 画像ディレクトリを変更可能にする
        // const srcUrl = `./cmyk-gray-gyazo-images/${line._gyazoImageId}.jpg`
        const srcUrl = './cmyk-gray-gyazo-images/retina_pancake.jpg'
        if (options.length > 0) {
          return `${backSlash}includegraphics[${options.join(',')}]{${srcUrl}}`
        } else {
          return `${backSlash}includegraphics{${srcUrl}}`
        }
      }
      const renderLabel = () => {
        if (!info.ref) return ''
        return `${backSlash}label{` + info.ref + '}'
      }
      return [
        `${backSlash}begin{figure}[h]`,
        `  ${backSlash}begin{center}`,
        `     ${renderIncludegraphics()}`,
        `     ${backSlash}caption{${captionText.trim()}}`,
        `     ${renderLabel()}`,
        `  ${backSlash}end{center}`,
        `${backSlash}end{figure}`
      ].filter(line => !!line)
    }
  }
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
      texts.push(...handleSpecialLines(line))
      continue
    }
    if (!line.nodes) {
      texts.push(line.type)
      continue
    }

    let texLine = Texify(line.nodes).join('')
    if (line._nextLineIsEmpty) {
      texLine += backSlash.repeat(2) // 改行
    }
    texts.push(indentStr(line.indent, true) + texLine)
  }

  // 最終生成物
  console.log('&&', texts)
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
  parseScrapboxPage,
  getPageRefs
}
