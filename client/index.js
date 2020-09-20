/* eslint-env browser */

const { parseScrapboxPage } = require('./scrapboxlib/')
const { getPageRefs, calcPageTitleHash, addToPageRefs, finalAdjustment, formatMarks } = require('./scrapboxlib/lib')
const { applyConfigs, getIndexInfo } = require('./configs')
const { uploadImages, uploadGyazoIcons } = require('./images')
const { createBook, createBookAppendix } = require('./book')
const { uploadTexDocument } = require('./upload')
const { initPageEmbedCounter } = require('./page-embed-counter')
require('./globals')

const createPage = async ({ texts, pageTitle, pageHash, gyazoIds }) => {
  // ページ変換関数を登録
  const funcBody = 'return `' + finalAdjustment(texts).join('\n') + '`'
  window.funcs.pageContent = function (level) {
    return new Function('level', 'showNumber', funcBody)(level)
  }
  console.log('REFS:', getPageRefs())
  // 未定義の章などをいい感じに仮定義する
  window.makeTentativeDefinitions()
  createBookAppendix()
  // 章レベルで描画
  const texDocument = [
    format(funcs.pageContent(1)),
    format(funcs.appendixContent())
  ].join('\n')
  await uploadImages({ gyazoIds })
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
      return createPage({
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
      createBook(toc)
      createBookAppendix(toc)
      console.log('REFS:', getPageRefs())
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
  await uploadImages({ gyazoIds })
}

let received = false

window.onmessage = async function ({ origin, data }) {
  if (origin !== 'https://scrapbox.io') return
  const { task, type, refresh, body, icons, template, refs, bookTitle, toc } = data

  if (received) {
    if (task === 'close') this.close()
    return
  }
  received = true

  applyConfigs(template)
  window.gyazoIcons = await uploadGyazoIcons(icons)

  // XXX: 引数形式揃えたい
  if (type === 'whole-pages') {
    initPageEmbedCounter(Object.values(body).map(page => page.title))
  } else if (type === 'page' && refs) {
    initPageEmbedCounter(refs.map(page => page.title))
  }

  if (refs && refs.length > 0) {
    await buildRefPages(refs)
  }

  const previewElement = document.querySelector('#preview')
  const anchorTex = document.querySelector('#pre-header > a.tex')
  const anchorPdf = document.querySelector('#pre-header > a.pdf')
  const message = document.querySelector('#pre-header > span.message')

  const rand = Math.floor(Math.random() * 100000000)
  const docType = type === 'whole-pages' ? 'books' : 'pages'

  switch (task) {
    // XXX: typeをタスク名にしたほうがいい
    case 'transfer-data': {
      const {
        pageTitle,
        pageTitleHash,
        pageText,
        includeCover
      } = await main({ type, body, bookTitle, toc })
      document.getElementById('pre-text').innerText = pageText
      await uploadTexDocument({
        includeCover,
        includeIndex: getIndexInfo().mode,
        pageTitle,
        pageTitleHash,
        pageText,
        pageTemplate: template
      })

      let buildUrl = `/build/pages/${pageTitleHash}?r=${rand}`
      if (type === 'whole-pages') {
        buildUrl += '&whole=1'
      }
      if (refresh) {
        // ビルド前にauxファイルが削除される
        buildUrl += '&refresh=1'
      }
      await fetch(buildUrl, { method: 'POST' })

      const previewUrl = `/${docType}/pdf/${pageTitleHash}?r=${rand}`
      previewElement.setAttribute('data', previewUrl)
      anchorPdf.href = previewUrl
      anchorTex.href = `/${docType}/tex/${pageTitleHash}?r=${rand}`
      message.innerText = ''
      break
    }
  }

  console.log('funcs:', window.funcs)
}

window.format = text => {
  return formatMarks(text)
}
