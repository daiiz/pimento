/* eslint-env browser */

const { parseScrapboxPage } = require('./scrapboxlib/')
const { getPageRefs, calcPageTitleHash, addToPageRefs, finalAdjustment, formatMarks } = require('./scrapboxlib/lib')
const { getParsedScrapboxPages } = require('./scrapboxlib/pool/')
const { applyConfigs, getIndexInfo, getAppendixInfo } = require('./configs')
const { uploadImages, identifyRenderedImages, extractGyazoIcons } = require('./images')
const { createBook, createBookAppendix } = require('./book')
const { uploadTexDocument, createTexDocument } = require('./upload')
const { initPageEmbedCounter, keepChapterHashs, getChapterHashs, getAppendixPages, getGyazoIdsGroup } = require('./page-embed-counter')
const { initPageRenderCounter, getRenderedPages, incrementPageRenderCounter } = require('./render-counter')
const { initDependencies, getTableOfContents } = require('./dependencies')
require('./globals')

const isInFrame = () => {
  const container = document.querySelector('.container')
  return container.dataset.isFrame === 'true' && window.parent !== window
}

const createPage = async ({ texts, pageTitle, pageHash }) => {
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
    includeCover: false
  }
}

const main = async ({ type, body, bookTitle, toc }) => {
  switch (type) {
    // 単一ページのプレビュー
    // 製本 (目次以外のページで起動されたとき)
    case 'page': {
      const { title, lines } = body
      keepChapterHashs({ flatChaps: [title] })
      const res = parseScrapboxPage({ title, lines })
      return createPage({
        pageTitle: title,
        pageHash: addToPageRefs(lines[0].text),
        texts: res.texts
      })
    }
    // 製本 (目次ページで起動されたとき)
    case 'whole-pages': {
      keepChapterHashs(toc)
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
        getAppendixInfo().mode ? format(window.funcs.appendixContent()) : '',
        getIndexInfo().printIndexLine,
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
  for (let { title, lines } of refs) {
    lines = lines.map(text => ({ text }))
    const res = parseScrapboxPage({ title, lines })
    const pageHash = addToPageRefs(title)
    const texts = [
      '%------------------------------',
      ...res.texts
    ]
    // ページ変換関数を登録
    const funcBody = 'return `' + finalAdjustment(texts).join('\n') + '`'
    window.funcs[`page_${pageHash}`] = function (level, showNumber) {
      // 呼び出し実績を利用して表示回数を管理する
      incrementPageRenderCounter(pageHash)
      return new Function('level', 'showNumber', funcBody)(level, showNumber)
    }
  }
}

let received = false
let timerForApiReady = null

window.onmessage = async function ({ origin, data }) {
  const pimentFrontendOrigin = document.body.dataset.frontendOrigin
  console.log('pimentFrontendOrigin:', pimentFrontendOrigin)

  const allowOrigins = [
    'https://scrapbox.io',
    pimentFrontendOrigin
  ]

  if (origin === location.origin) {
    // 自分には応答しない
    return
  }

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
  window.clearInterval(timerForApiReady)

  applyConfigs(template)
  window.gyazoIcons = await extractGyazoIcons(icons)

  // XXX: 引数形式揃えたい
  if (type === 'whole-pages') {
    initPageEmbedCounter(Object.values(body).map(page => page.title))
  } else if (type === 'page' && refs) {
    initPageEmbedCounter(refs.map(page => page.title))
  }
  initPageRenderCounter()
  initDependencies()

  if (refs && refs.length > 0) {
    await buildRefPages(refs)
  }

  const previewElement = document.querySelector('#preview')
  const anchorTex = document.querySelector('#pre-header a.tex')
  const anchorPdf = document.querySelector('#pre-header a.pdf')
  const message = document.querySelector('#pre-header span.message')

  const rand = Math.floor(Math.random() * 100000000)
  const docType = type === 'whole-pages' ? 'books' : 'pages'

  console.log('funcs:', window.funcs)

  if (task !== 'transfer-data') {
    console.error(`Invalid task: ${task}`)
    return
  }

  switch (task) {
    case 'transfer-data': {
      const {
        pageTitle,
        pageTitleHash,
        pageText,
        includeCover
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

      // 描画実績のあるテキストブロックの画像だけを集める
      const renderedPageTitleHashs = getRenderedPages(pageTitleHash)
      bookGyazoIds.push(...identifyRenderedImages(getGyazoIdsGroup('default'), renderedPageTitleHashs))
      bookGyazoIds.push(...identifyRenderedImages(getGyazoIdsGroup('icon'), renderedPageTitleHashs))
      const scrapboxData = getParsedScrapboxPages(renderedPageTitleHashs, bookTitle)

      const mainDeps = getTableOfContents(getChapterHashs())
      const appendixDeps = getTableOfContents(getAppendixPages())

      const uploadGyazoIds = Array.from(new Set(bookGyazoIds))
      const uploadData = createTexDocument(generatedData)
      const payload = {
        data: uploadData,
        scrapboxData,
        gyazoIds: uploadGyazoIds,
        textBlockDeps: {
          main: mainDeps,
          appendix: appendixDeps
        },
        projectName,
        buildOptions: {
          whole: type === 'whole-pages',
          includeIndex: !!getIndexInfo().mode,
          // ビルド前にauxファイルが削除される
          refresh: !!refresh
        },
        // 付随情報
        configs: window.pimentoConfigs || {}
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

window.addEventListener('load', () => {
  if (!isInFrame()) {
    return
  }
  const pimentFrontendOrigin = document.body.dataset.frontendOrigin
  if (!timerForApiReady) {
    const rand = Math.floor(Math.random() * 100)
    const intervalTime = 200 + rand
    let runCounter = 0
    timerForApiReady = setInterval(() => {
      runCounter += 1
      if (runCounter > 200) { // 約1分
        console.log('[ready] timeout')
        window.clearInterval(timerForApiReady)
      } else {
        console.log(`[ready] ${intervalTime}ms`, runCounter)
        window.parent.postMessage({ pimentoApiReady: true }, pimentFrontendOrigin)
      }
    }, intervalTime)
  }
})
