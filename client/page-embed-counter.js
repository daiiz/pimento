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

const incrementPageEmbedCounter = pageTitleHash => {
  if (!existsPage(pageTitleHash)) {
    throw new Error(`Page does not exist: ${pageTitleHash}`)
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

module.exports = {
  initPageEmbedCounter,
  incrementPageEmbedCounter,
  existsPage,
  getAppendixPages
}
