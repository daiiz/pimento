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

const incrementPageEmbedCounter = title => {
  const pageTitleHash = calcPageTitleHash(title)
  if (!existsPage(pageTitleHash)) {
    throw new Error(`Page does not exist: ${title}`)
  }
  const currentCount = window.rawData.pageEmbedCounter[pageTitleHash]
  if (currentCount >= 1) {
    throw new Error(`Cannot embed the same chapter/section multiple times: "${title}"`)
  }
  window.rawData.pageEmbedCounter[pageTitleHash] += 1
}

const existsPage = pageTitleHash => {
  return pageTitleHash in window.rawData.pageEmbedCounter
}

module.exports = {
  initPageEmbedCounter,
  incrementPageEmbedCounter,
  existsPage
}
