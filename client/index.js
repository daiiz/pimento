const { backSlashExp } = require('./scrapboxlib/lib')
const { parseScrapboxPage } = require('./scrapboxlib/')
const { getPageRefs, addToPageRefs } = require('./scrapboxlib/lib')
const { convertImages, convertTexDocument } = require('./convert')
const { uploadTexDocument } = require('./upload')
require('./globals')

const main = async ({ type, body }) => {
  let texts = []
  let gyazoIds = []
  let pageHash = null
  let pageTitle = null
  let includeCover = false

  switch (type) {
    // 単一ページのプレビュー
    case 'page': {
      const { id, lines, title } = body
      pageTitle = title
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
      includeCover = true
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

  const texDocument = format(funcs.entry(1))
  await convertImages({ gyazoIds })
  document.getElementById('pre').innerText = texDocument
  return {
    pageTitle,
    pageTitleHash: pageHash,
    pageText: texDocument,
    includeCover
  }
}

let received = false

window.onmessage = async function ({ origin, data }) {
  if (origin !== 'https://scrapbox.io') return
  const { task, type, body, template } = data

  if (received) {
    if (task === 'close') this.close()
    return
  }
  const previewElem = document.getElementById('preview')

  received = true
  switch (task) {
    case 'transfer-data': {
      const { pageTitle, pageTitleHash, pageText, includeCover } = await main({ type, body })
      await uploadTexDocument({
        includeCover,
        pageTitle,
        pageTitleHash,
        pageText,
        pageTemplate: template
      })
      previewElem.setAttribute('data', `/build/pages/${pageTitleHash}?r=${Math.floor(Math.random() * 100000000)}`)
      break
    }
  }
}

window.format = text => {
  return text.replace(backSlashExp, '\\')
}
