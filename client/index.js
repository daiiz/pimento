const { backSlashExp } = require('./scrapboxlib/lib')
const { parseScrapboxPage } = require('./scrapboxlib/')
const { getPageRefs, addToPageRefs } = require('./scrapboxlib/lib')
const { convertImages, convertTexDocument } = require('./convert')
require('./globals')

const main = async ({ type, body }) => {
  let texts = []
  let gyazoIds = []
  let pageHash = null
  switch (type) {
    // 単一ページのプレビュー
    case 'page': {
      const { id, lines, title } = body
      const res = parseScrapboxPage({ lines })
      pageHash = addToPageRefs(lines[0].text)
      texts = res.texts
      gyazoIds = res.gyazoIds
      break
    }
    // 製本
    case 'whole-pages': {
      const pages = body // { pageId: { title, lines } }
      console.log('###', pages)
      return
    }
  }

  // ページ変換関数を登録
  const funcBody = 'return `' + texts.join('\n') + '`'
  window.funcs[`page_${pageHash}`] = function (level) {
    return new Function('level', 'showNumber', funcBody)(level)
  }
  window.funcs.entry = function (level) {
    return new Function('level', 'showNumber', funcBody)(level)
  }
  console.log('pageRefs:', getPageRefs())
  // 未定義の章などをいい感じに仮定義する
  window.makeTentativeDefinitions()

  // console.log('gyazoIds:', gyazoIds)
  const texDocument = format(funcs.entry(1))

  await convertImages({ gyazoIds })
  document.getElementById('pre').innerText = texDocument
}

let received = false

window.onmessage = async function ({ origin, data }) {
  if (origin !== 'https://scrapbox.io') return
  const { task, type, body } = data

  if (received) {
    // console.log('Already received:', task)
    if (task === 'close') this.close()
    return
  }
  received = true

  switch (task) {
    case 'transfer-data': {
      await main({ type, body })
      break
    }
  }
}

window.format = text => {
  return text.replace(backSlashExp, '\\')
}
