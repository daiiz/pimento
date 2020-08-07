const { parseScrapboxPage } = require('./scrapboxlib/')
const { getPageRefs, addToPageRefs, finalAdjustment, formatMarks } = require('./scrapboxlib/lib')
const { convertImages, convertTexDocument } = require('./convert')
const { uploadTexDocument } = require('./upload')
require('./globals')

const taskPage = async ({ texts, pageTitle, pageHash, gyazoIds }) => {
  // ページ変換関数を登録
  console.log("#####", texts)
  const funcBody = 'return `' + finalAdjustment(texts).join('\n') + '`'
  window.funcs[`page_${pageHash}`] = function (level, showNumber) {
    return new Function('level', 'showNumber', funcBody)(level, showNumber)
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
    includeCover: false
  }
}

const main = async ({ type, body }) => {
  switch (type) {
    // 単一ページのプレビュー
    case 'page': {
      const { lines, title } = body
      const res = parseScrapboxPage({ lines })
      return taskPage({
        texts: res.texts,
        pageTitle: title,
        pageHash: addToPageRefs(lines[0].text),
        gyazoIds: res.gyazoIds
      })
    }
    // 製本
    case 'whole-pages': {
      const pages = body // { pageId: { title, lines } }
      console.log('###', pages)
      // includeCover = true
      return
    }
  }
}

// XXX: たぶんいい感じにmainと共通化できる
// refs: [{ title, lines }]
const buidRefPages = async refs => {
  console.log("REFS:", refs)
  const gyazoIds = []
  for (let { title, lines } of refs) {
    lines = lines.map(text => ({ text }))
    const res = parseScrapboxPage({ lines })
    const pageHash = addToPageRefs(title)
    const texts = ['%------------------------------', ...res.texts]
    gyazoIds.push(...(res.gyazoIds || []))
    // ページ変換関数を登録
    const funcBody = 'return `' + finalAdjustment(texts).join('\n') + '`'
    window.funcs[`page_${pageHash}`] = function (level, showNumber) {
      return new Function('level', 'showNumber', funcBody)(level, showNumber)
    }
  }
  await convertImages({ gyazoIds })
}

let received = false

window.onmessage = async function ({ origin, data }) {
  if (origin !== 'https://scrapbox.io') return
  const { task, type, body, template, refs } = data

  if (received) {
    if (task === 'close') this.close()
    return
  }
  received = true

  if (refs && refs.length > 0) {
    await buidRefPages(refs)
  }
  const previewElem = document.getElementById('preview')

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
  return formatMarks(text)
}
