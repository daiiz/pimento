const { getGyazoImageId } = require('./lib')
const { extractProjectNameAndPageTitle } = require('./texify')

const isCommentLine = line => {
  return line.indent === 0 && line.nodes.length === 1 &&
    line.nodes[0].decos && line.nodes[0].decos.includes('#')
}

const isEmptyLine = line => {
  return !line._type && line.indent === 0 && line.nodes.length === 0
}

const headNumberPattern = /^\d+\.\s*/

const isEnumerateLine = line => {
  if (!line.nodes || line.indent === 0 || line.nodes.length === 0) return false
  const node = line.nodes[0]
  if (node.type !== 'plain') return false
  return headNumberPattern.test(node.text)
}

const removeBulletNumber = line => {
  if (!isEnumerateLine(line)) return
  const node = line.nodes[0]
  node.text = node.text.replace(headNumberPattern, '')
}

// ブロック情報を付け足す
const addBlockInfo = lines => {
  if (lines.length === 0) return []
  const res = []
  // TODO: 一つのStackにまとめたい
  const itemizeIndentStack = []
  const itemizeEnumerateStack = []

  // 閉じていない箇条書きを閉じる
  const closePrevItemizes = currentIndent => {
    // 複数のジャンプがあるときに一気に閉じる
    while (itemizeIndentStack.length > 0) {
      const lastLineIndent = res[res.length - 1].indent
      if (lastLineIndent - currentIndent > 1) {
        const _enumerate = itemizeEnumerateStack.pop()
        res.push({ indent: itemizeIndentStack.pop(), _type: 'itemizeTail', _enumerate, nodes: [] })
      } else {
        break
      }
    }
  }

  const getRecentIndent = () => {
    return itemizeIndentStack[itemizeIndentStack.length - 1] || 0
  }

  for (let i = 0; i < lines.length; i++) {
    const currentLine = lines[i]
    const currentIndent = currentLine.indent

    if (i === 0) {
      // skip
      currentLine.nodes = []
      // ページタイトル行の処理
      currentLine._type = 'title'
      res.push(currentLine)
      continue
    }

    const prevLine = lines[i - 1]

    // 引用記法を特殊ノード扱いする
    if (currentLine.type === 'line' && currentLine.nodes.length === 1 && currentLine.nodes[0].type === 'quote') {
      const quoteNode = currentLine.nodes[0]
      currentLine._type = 'quote'
      currentLine._quoteNodes = [...quoteNode.nodes]
      currentLine.nodes = []
    }

    // 単一の数式記法からなる行を特殊ノード扱いする
    if (currentLine.type === 'line' && currentIndent === 0 &&
      currentLine.nodes.length === 1 && currentLine.nodes[0].type === 'formula') {
      currentLine._type = 'formula'
      currentLine._formula = currentLine.nodes[0].formula
      currentLine.nodes = []
    }

    // 連続した空行やコメント行
    if (currentIndent === 0 && prevLine.indent === 0 && currentLine.type === 'line' && prevLine.type === 'line') {
      if (isEmptyLine(currentLine) || isCommentLine(currentLine)) {
        if (isEmptyLine(prevLine) || isCommentLine(prevLine)) continue
      }
    }

    // 改行のための空行を挿入するための目印をつける
    if (currentLine.type === 'line' && currentIndent === 0 && prevLine.indent === 0) {
      if (!currentLine.nodes || currentLine.nodes.length === 0) {
        // 強制的な改行
        prevLine._requireNewLine = true
      } else if (currentLine.nodes[0].type === 'blank') {
        // 新規の段落
        prevLine._requireNewParagraph = true
      }
    }

    // アイコン記法で終わる行も改行する
    if (currentLine.type === 'line' && prevLine.type === 'line' && currentIndent === 0 && prevLine.indent === 0) {
      const prevNodes = prevLine.nodes || []
      const prevLineEndsWithIcon = prevNodes.length > 0 && prevNodes[prevNodes.length - 1].type === 'icon'
      if (prevLineEndsWithIcon && !prevLine._requireNewParagraph) {
        prevLine._requireNewLine = true
      }
    }

    // 画像のキャプションをimage nodeに取り込む
    if (prevLine.nodes && prevLine.nodes.length === 1 && prevLine.nodes[0].type === 'image') {
      prevLine._srcUrl = prevLine.nodes[0].src
      prevLine._gyazoImageId = getGyazoImageId(prevLine._srcUrl)
      prevLine._type = 'image'
      prevLine._isStrong = prevLine.nodes[0].originalType === 'strongImage'

      // 画像行のindent=0の場合に限り、indent=0のキャプション行があり得る
      // その他のケースでは、画像行のindentよりもキャプション行の方が深い
      // また、キャプションは無かプレーンテキストであるべき
      const deeper = (prevLine.indent === 0 && currentIndent === 0) || currentIndent > prevLine.indent
      if (deeper && currentLine.nodes && (currentLine.nodes.length === 0 || currentLine.nodes[0].type === 'plain')) {
        prevLine._captionNodes = currentLine.nodes
        continue
      } else {
        prevLine._captionNodes = []
      }
    }

    // 箇条書きブロックの終始情報の行を追加する
    // これ以前でres.pushしてはいけない
    // Close
    let prevIndent = getRecentIndent()
    if (currentIndent < prevIndent) {
      itemizeIndentStack.pop()
      const _enumerate = itemizeEnumerateStack.pop()
      res.push({ indent: prevIndent, _type: 'itemizeTail', _enumerate, nodes: [] })
      closePrevItemizes(currentIndent)
    }
    // Open
    prevIndent = getRecentIndent()
    if (currentIndent > prevIndent) {
      if (itemizeIndentStack.length < 4) {
        // 一段深くなった
        itemizeIndentStack.push(currentIndent)
        // 番号付きリストの判定
        const _enumerate = isEnumerateLine(currentLine)
        itemizeEnumerateStack.push(_enumerate)
        res.push({ indent: currentIndent, _type: 'itemizeHead', _enumerate, nodes: [] })
      } else {
        // LaTeX Error: Too deeply nested: 深さレベル5以上の箇条書きができない
        // これ以上深くできないのこのままいく
      }
    }

    removeBulletNumber(currentLine)
    res.push(currentLine)
  }
  // console.log("$$$", res)
  if (itemizeIndentStack.length > 0) {
    console.error('itemizeIndentStack is not empty.')
  }
  return res
}

// 全体の装飾「*」の様子を見て、塊のレベルを正規化する
const normalizeTextBlockLevels = lines => {
  // 装飾記号「*」の最大レベル
  let maxNum = 0
  for (const line of lines) {
    // インデントレベル0な行だけ確認すればよい
    if (line.indent > 0 || line.type !== 'line') continue
    if (!line.nodes || line.nodes.length === 0) continue
    // e.g. `[* [foo]]について`
    if (line.nodes.length > 1) continue
    // 最外側がdecorationでない行は無視
    const { nodes } = line
    if (nodes[0].type !== 'decoration') continue

    // e.g. `[* [foo]について]`
    if (nodes[0].nodes && nodes[0].nodes.length > 1) {
      const nodeTypes = nodes[0].nodes.map(node => node.pathType ? `${node.type}.${node.pathType}` : node.type)
      if (!nodeTypes.every(type => ['plain', 'link.relative'].includes(type))) {
        continue
      }
      // この場合は`[* fooについて]`と解釈して見出しとして扱う
      const newText = nodes[0].nodes.map(node => node.href || node.text).join('')
      nodes[0].nodes = [{ type: 'plain', text: newText }]
      console.warn('[normalizeTextBlockLevels] Interpreted as textBlockHead:', newText)
    }

    // 無関係な装飾行は無視
    const decos = nodes[0].decos.filter(deco => deco.match(/^\*-\d+$/))
    if (decos.length === 0) continue
    let [, num] = decos[0].match(/^\*-(\d+)$/)
    num = parseInt(num)
    if (num > maxNum) {
      maxNum = num
    }
    line._type = 'textBlockHead'
    line._num = num
  }
  for (const line of lines) {
    if (line._type !== 'textBlockHead') continue
    // レベルが小さいほど大きいセクション
    line._level = maxNum - line._num
    // XXX: deco記法内部のfirstChildNode.typeに応じて宣言方法が変わる
    // https://scrapbox.io/teamj/pimento_v2:_節の埋め込み記法
    const firstChildNode = line.nodes[0].nodes[0]
    switch (firstChildNode.type) {
      // https://gyazo.com/5e4d0dbdc74a911477841b71572567e2
      case 'plain': {
        line._text = firstChildNode.text
        break
      }
      case 'link': {
        if (firstChildNode.pathType === 'relative') {
          line._text = firstChildNode.href
          line._embed = true
        } else if (firstChildNode.pathType === 'root') {
          const [, pageTitle] = extractProjectNameAndPageTitle(firstChildNode.href)
          if (pageTitle) {
            line._text = pageTitle
            line._embed = true
          }
        }
        break
      }
    }
    delete line._num
  }
}

module.exports = {
  addBlockInfo,
  normalizeTextBlockLevels
}
