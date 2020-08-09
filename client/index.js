const { parseScrapboxPage } = require('./scrapboxlib/')
const { getPageRefs, calcPageTitleHash, addToPageRefs, finalAdjustment, formatMarks } = require('./scrapboxlib/lib')
const { convertImages } = require('./images')
const { createBook, createBookAppendix } = require('./book')
const { uploadTexDocument } = require('./upload')
require('./globals')

const taskPage = async ({ texts, pageTitle, pageHash, gyazoIds }) => {
  // ページ変換関数を登録
  const funcBody = 'return `' + finalAdjustment(texts).join('\n') + '`'
  window.funcs[`page_${pageHash}`] = function (level, showNumber) {
    return new Function('level', 'showNumber', funcBody)(level, showNumber)
  }
  window.funcs.pageContent = function (level) {
    return new Function('level', 'showNumber', funcBody)(level)
  }
  console.log('pageRefs:', getPageRefs())
  // 未定義の章などをいい感じに仮定義する
  window.makeTentativeDefinitions()

  const texDocument = format(funcs.pageContent(1)) // Chapter level
  await convertImages({ gyazoIds })
  return {
    pageTitle,
    pageTitleHash: pageHash,
    pageText: texDocument,
    includeCover: false
  }
}

const main = async ({ type, body, bookTitle, toc }) => {
  switch (type) {
    // 単一ページのプレビュー
    case 'page': {
      const { title, lines } = body
      const res = parseScrapboxPage({ lines })
      return taskPage({
        pageTitle: title,
        pageHash: addToPageRefs(lines[0].text),
        texts: res.texts,
        gyazoIds: res.gyazoIds
      })
    }
    // 製本
    case 'whole-pages': {
      const pages = body // { pageId: { title, lines } }
      await buildRefPages(Object.values(pages))
      createBook({ toc })
      createBookAppendix({ toc })
      const texDocument = [
        '% Built by Pimento 2.0',
        '',
        ...toc.preface,
        format(window.funcs.bookContent()),
        format(window.funcs.appendixContent()),
        ...toc.postscript
      ].join('\n')
      return {
        pageTitle: bookTitle,
        pageTitleHash: calcPageTitleHash(`whole_${bookTitle}`),
        pageText: texDocument,
        includeCover: true
      }
    }
  }
}

// XXX: たぶんいい感じにmainと共通化できる
// refs: [{ title, lines }]
const buildRefPages = async refs => {
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
  const { task, type, body, template, refs, bookTitle, toc } = data

  if (received) {
    if (task === 'close') this.close()
    return
  }
  received = true

  if (refs && refs.length > 0) {
    await buildRefPages(refs)
  }
  const previewElem = document.getElementById('preview')

  switch (task) {
    // XXX: typeをタスク名にしたほうがいい
    case 'transfer-data': {
      const { pageTitle, pageTitleHash, pageText, includeCover } = await main({ type, body, bookTitle, toc })
      document.getElementById('pre').innerText = pageText
      await uploadTexDocument({
        includeCover,
        pageTitle,
        pageTitleHash,
        pageText,
        pageTemplate: template
      })

      let buildUrl = `/build/pages/${pageTitleHash}?r=${Math.floor(Math.random() * 100000000)}`
      if (type === 'whole-pages') {
        buildUrl += '&whole=1'
      }
      await fetch(buildUrl, { method: 'POST' })

      const docType = type === 'whole-pages' ? 'books' : 'pages'
      const previewUrl = `/${docType}/pdf/${pageTitleHash}?r=${Math.floor(Math.random() * 100000000)}`
      previewElem.setAttribute('data', previewUrl)
      break
    }
  }

  console.log('funcs:', window.funcs)
}

window.format = text => {
  return formatMarks(text)
}
