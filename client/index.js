/* eslint-env browser */

const { parseScrapboxPage } = require('./scrapboxlib/')
const { getPageRefs, calcPageTitleHash, addToPageRefs, finalAdjustment, formatMarks } = require('./scrapboxlib/lib')
const { applyConfigs, getIndexInfo, getAppendixInfo } = require('./configs')
const { uploadImages, extractGyazoIcons } = require('./images')
const { createBook, createBookAppendix } = require('./book')
const { uploadTexDocument, createTexDocument } = require('./upload')
const { initPageEmbedCounter, keepChapterHashs } = require('./page-embed-counter')
require('./globals')

const isInFrame = () => {
  const container = document.querySelector('.container')
  return container.dataset.isFrame === 'true' && window.parent !== window
}

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
    getAppendixInfo().mode ? format(funcs.appendixContent()) : '',
    getIndexInfo().printIndexLine
  ].join('\n')

  return {
    pageTitle,
    pageTitleHash: pageHash,
    pageText: texDocument,
    includeCover: false,
    gyazoIds
  }
}

const main = async ({ type, body, bookTitle, toc }) => {
  keepChapterHashs(toc)
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
      const refsData = await buildRefPages(Object.values(pages))
      createBook(toc)
      createBookAppendix(toc)
      console.log('REFS:', getPageRefs())
      const texDocument = [
        '% Built by Pimento 2.0',
        '',
        ...toc.preface,
        format(window.funcs.bookContent()),
        getAppendixInfo().mode ? format(window.funcs.appendixContent()) : '',
        getIndexInfo().printIndexLine,
        ...toc.postscript
      ].join('\n')
      return {
        pageTitle: bookTitle,
        pageTitleHash: calcPageTitleHash(`whole_${bookTitle}`),
        pageText: texDocument,
        includeCover: true,
        gyazoIds: refsData.gyazoIds
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
  return { gyazoIds }
}

let received = false

window.onmessage = async function ({ origin, data }) {
  const pimentFrontendOrigin = document.body.dataset.frontendOrigin
  console.log('pimentFrontendOrigin:', pimentFrontendOrigin)

  const allowOrigins = [
    'https://scrapbox.io',
    pimentFrontendOrigin
  ]

  if (!allowOrigins.includes(origin)) {
    console.error('Invalid origin:', origin)
    return
  }
  const { task, type, projectName, refresh, body, icons, template, refs, bookTitle, toc } = data
  const bookGyazoIds = []

  if (received) {
    if (task === 'close') this.close()
    return
  }
  received = true

  applyConfigs(template)
  window.gyazoIcons = await extractGyazoIcons(icons)
  bookGyazoIds.push(...Object.values(window.gyazoIcons))

  // XXX: 引数形式揃えたい
  if (type === 'whole-pages') {
    initPageEmbedCounter(Object.values(body).map(page => page.title))
  } else if (type === 'page' && refs) {
    initPageEmbedCounter(refs.map(page => page.title))
  }

  if (refs && refs.length > 0) {
    const refsData = await buildRefPages(refs)
    bookGyazoIds.push(...refsData.gyazoIds)
  }

  const previewElement = document.querySelector('#preview')
  const anchorTex = document.querySelector('#pre-header a.tex')
  const anchorPdf = document.querySelector('#pre-header a.pdf')
  const message = document.querySelector('#pre-header span.message')

  const rand = Math.floor(Math.random() * 100000000)
  const docType = type === 'whole-pages' ? 'books' : 'pages'

  console.log('funcs:', window.funcs)
  switch (task) {
    // XXX: typeをタスク名にしたほうがいい
    case 'transfer-data': {
      const {
        pageTitle,
        pageTitleHash,
        pageText,
        includeCover,
        gyazoIds
      } = await main({ type, body, bookTitle, toc })
      document.getElementById('pre-text').innerText = pageText

      const generatedData = {
        pageTitle,
        pageTitleHash,
        pageText,
        pageTemplate: template,
        // 付随情報
        docType,
        includeCover
      }

      const uploadData = createTexDocument(generatedData)
      const uploadGyazoIds = Array.from(new Set([...bookGyazoIds, ...gyazoIds]))
      const payload = {
        data: uploadData,
        gyazoIds: uploadGyazoIds,
        projectName,
        buildOptions: {
          whole: type === 'whole-pages',
          includeIndex: !!getIndexInfo().mode,
          // ビルド前にauxファイルが削除される
          refresh: !!refresh
        }
      }

      if (isInFrame()) {
        // upload, buildともに向こうに任せる
        console.log('I am in frames.')
        window.parent.postMessage(payload, pimentFrontendOrigin)
      } else {
        // ローカルツール向け
        console.log('uploadGyazoIds:', uploadGyazoIds)
        console.log('uploadData:', uploadData)

        await uploadImages(uploadGyazoIds)
        await uploadTexDocument(uploadData)

        const buildRes = await fetch(`/api/build/pages?r=${rand}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(payload)
        })
        const buildResData = await buildRes.json()
        console.log('buildRes:', buildResData)
        const { preview_pdf_path, preview_tex_path } = buildResData

        const previewUrl = `${preview_pdf_path}?r=${rand}`
        previewElement.setAttribute('data', previewUrl)
        anchorPdf.href = previewUrl
        anchorTex.href = `${preview_tex_path}?r=${rand}`
        message.innerText = ''
      }
      break
    }
  }
}

window.format = text => {
  return formatMarks(text)
}
