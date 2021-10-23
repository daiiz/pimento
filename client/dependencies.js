const { getRenderedPages } = require('./render-counter')
const { getPageRefs } = require('./scrapboxlib/lib')

const initDependencies = () => {
  // 参照グラフ (描画実績は見ないので表示されていることは保証しない)
  window.rawData.textBlockDeps = Object.create(null)
}

// XXX: 現時点ではテキストブロックの依存関係を表しているだけで、完全な目次ではない
const getTableOfContents = (rootPageTitleHashs = []) => {
  const res = []
  const deps = window.rawData.textBlockDeps
  const renderedPages = new Set([...rootPageTitleHashs, ...getRenderedPages()])
  const pageRefs = getPageRefs()
  // console.log('---->', rootPageTitleHashs, pageRefs, renderedPages)

  // 深さ優先で探索する
  const visited = new Set()
  const printDependencies = (pageTitleHash, level = 0) => {
    visited.add(pageTitleHash)
    if (renderedPages.has(pageTitleHash)) {
      res.push({ pageTitleHash, pageTitle: pageRefs[pageTitleHash], level })
    }
    for (const depPageTitleHash of deps[pageTitleHash] || []) {
      if (visited.has(depPageTitleHash)) {
        continue
      }
      printDependencies(depPageTitleHash, level + 1)
    }
  }

  for (const pageTitleHash of rootPageTitleHashs) {
    printDependencies(pageTitleHash, 0)
  }

  return res
}

// 参照元と参照先を登録する
const addToTextBlockDependencies = (pageTitleHashFrom, pageTitleHashTo) => {
  if (!pageTitleHashFrom || !pageTitleHashTo) return
  const deps = window.rawData.textBlockDeps
  if (!deps[pageTitleHashFrom]) {
    deps[pageTitleHashFrom] = []
  }
  if (!deps[pageTitleHashFrom].includes(pageTitleHashTo)) {
    deps[pageTitleHashFrom].push(pageTitleHashTo)
  }
}

module.exports = {
  initDependencies,
  addToTextBlockDependencies,
  getTableOfContents
}
