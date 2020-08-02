const { texEscape, backSlash } = require('./scrapboxlib/lib')

// levelに対応するテキストブロックの名称を返す
const { getPageRefs } = require('./scrapboxlib/lib')

window.textBlockName = (level, showNumber = true) => {
  const brace = showNumber ? '{' : '*{'
  // TODO: level === 0かつ目次に存在しない場合は付録
  switch (parseInt(level)) {
    case 0: return backSlash + 'part' + brace // 部
    case 1: return backSlash + 'chapter' + brace // 章
    case 2: return backSlash + 'section' + brace // 節
    case 3: return backSlash + 'subsection' + brace // 小節
    case 4: return backSlash + 'subsubsection' + brace // 小々節
  }
  console.error('Invalid level:', level)
  // とりあえず小々節を返しておく
  return backSlash + 'subsubsection' + brace
}

// 動的に生成されるページ変換関数などを生やす場所
window.funcs = Object.create(null)

window.funcs.a = (m) => {
  const texts = [
    `${backSlash}daiiz-a`,
    `\$\{window.funcs.b(N)\}`
  ]
  const funcBody = 'return `' + texts.join('\n') + '`'
  return new Function('N', funcBody)(m * 3)
}

window.funcs.b = (n) => {
  const texts = [
    backSlash + 'b'.repeat(n)
  ]
  const funcBody = 'return `' + texts.join('\n') + '`'
  return new Function(funcBody)()
}

// 欠損しているpage関数を仮定義する
window.makeTentativeDefinitions = () => {
  const pageHashs = getPageRefs()
  for (const hash of Object.keys(pageHashs)) {
    const fName = `page_${hash}`
    if (window.funcs[fName]) continue
    // 仮定義
    window.funcs[fName] = (level, showNumber) => {
      const pageTitle = texEscape(pageHashs[hash])
      const texts = [
        `\$\{window.textBlockName(level, showNumber)\}${pageTitle}} % tentative definitions by Pimento`,
        `${backSlash}label{textBlock-${hash}}`,
        'Work in progress!'
      ]
      const funcBody = 'return `' + texts.join('\n') + '`'
      return new Function('level', 'showNumber', funcBody)(level, showNumber)
    }
  }
}

console.log('pimento v2')
