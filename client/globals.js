const { backSlash } = require('./scrapboxlib/lib')

// levelに対応するテキストブロックの名称を返す
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
  return ''
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

console.log('pimento v2')
