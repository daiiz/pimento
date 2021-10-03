// 埋め込まれた章節の管理
// 複数回展開されたり展開参照の無限ループを防ぐ
// 参照先ページの存在判定にも用いる

const { calcPageTitleHash } = require('./scrapboxlib/lib')

// postMessageで受信したページ情報に基づいて初期化される
const initPageEmbedCounter = titles => {
  for (const title of titles) {
    window.rawData.pageEmbedCounter[calcPageTitleHash(title)] = 0
  }
}

// 参照回数を管理する
const incrementPageEmbedCounter = pageTitleHash => {
  if (!existsPage(pageTitleHash)) {
    // XXX: 仮定義付き単ページプレビュー機能時に確実にエラーになるのでログ出力に留める
    console.error(`Page does not exist: ${pageTitleHash}`)
    return
  }
  const currentCount = window.rawData.pageEmbedCounter[pageTitleHash]
  if (currentCount >= 1) {
    throw new Error(`Cannot embed the same chapter/section multiple times: ${pageTitleHash}`)
  }
  window.rawData.pageEmbedCounter[pageTitleHash] += 1
}

const existsPage = pageTitleHash => {
  return pageTitleHash in window.rawData.pageEmbedCounter
}

const isPageEmbedded = pageTitleHash => {
  return existsPage(pageTitleHash) && window.rawData.pageEmbedCounter[pageTitleHash] >= 1
}

// 本文中で埋め込まれていないページは付録として扱う
const getAppendixPages = () => {
  const pageTitleHashs = Object.keys(window.rawData.pageEmbedCounter) // Order?
  const res = []
  for (const hash of pageTitleHashs) {
    if (window.rawData.pageEmbedCounter[hash] === 0) {
      res.push(hash)
    }
  }
  return res
}

// 章立て情報を保持する
const keepChapterHashs = (toc = {}) => {
  const chapterHashs = new Set()
  for (const title of (toc.flatChaps || [])) {
    chapterHashs.add(calcPageTitleHash(title))
  }
  const parts = Object.keys(toc.parts || {})
  for (const part of parts) {
    const titles = toc.parts[part]
    for (const title of titles) {
      chapterHashs.add(calcPageTitleHash(title))
    }
  }
  window.rawData.chapterHashs = Array.from(chapterHashs)
}

const isChapter = titleHash => {
  return window.rawData.chapterHashs.includes(titleHash)
}

module.exports = {
  initPageEmbedCounter,
  incrementPageEmbedCounter,
  existsPage,
  isPageEmbedded,
  getAppendixPages,
  keepChapterHashs,
  isChapter
}
