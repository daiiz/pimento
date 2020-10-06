const { texEscape, backSlash } = require('./scrapboxlib/lib')

// levelに対応するテキストブロックの名称を返す
const { getPageRefs } = require('./scrapboxlib/lib')

window.textBlockName = (level, showNumber = true) => {
  level = parseInt(level)
  let brace = showNumber ? '{' : '*{'
  if (level >= global.pimentoConfigs['heading-number-omit-level']) {
    brace = '*{'
  }
  switch (level) {
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

// postMessageで受信したデータに基づく情報
window.rawData = Object.create(null)
window.rawData.pageEmbedCounter = Object.create(null)
window.rawData.chapterHashs = []

// See: configs.js
window.pimentoConfigs = {
  'heading-number-omit-level': 3, // textBlockの見出し番号を省略するレベル
  colormode: 'cmyk', // XXX: 未対応
  images: 'gray', // XXX: 部分対応
  icons: 'text',
  appendix: false, // 章立てに含まれない参照先ページを付録として追加する
  index: false // 巻末に索引ページを追加する
}

// 欠損しているpage関数を仮定義する
window.makeTentativeDefinitions = () => {
  const pageHashs = getPageRefs()
  for (const hash of Object.keys(pageHashs)) {
    const fName = `page_${hash}`
    if (window.funcs[fName]) continue
    // 仮定義
    window.funcs[fName] = function (level, showNumber, tentative = true) {
      const pageTitle = texEscape(pageHashs[hash])
      const texts = [
        `\$\{window.textBlockName(level, showNumber)\}${pageTitle}} % tentative definitions by Pimento`,
        `${backSlash}label{textBlock-${hash}}`,
        `{${backSlash}tt Tentative definitions by Pimento}${backSlash}${backSlash}`
      ]
      const funcBody = 'return `' + texts.join('\n') + '`'
      return new Function('level', 'showNumber', funcBody)(level, showNumber)
    }
  }
}

console.log('pimento v2')
