let renderCounter

const initPageRenderCounter = () => {
  renderCounter = Object.create(null)
}

// 本文中で表示実績のあるテキストブロックのpageTitleHashリストを返す
// TODO: page-embed-counterとの使い分けを明文化する
const getRenderedPages = () => {
  const res = []
  for (const pageTitleHash in renderCounter) {
    if (renderCounter[pageTitleHash] >= 1) {
      res.push(pageTitleHash)
    }
  }
  return res
}

const incrementPageRenderCounter = pageTitleHash => {
  // XXX: 埋め込み先も分かるといいな
  if (!renderCounter[pageTitleHash]) {
    renderCounter[pageTitleHash] = 0
  }
  renderCounter[pageTitleHash] += 1
}

module.exports = {
  initPageRenderCounter,
  getRenderedPages,
  incrementPageRenderCounter
}
