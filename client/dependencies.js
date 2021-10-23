const initDependencies = () => {
  // 参照グラフ (描画実績は見ないので表示されていることは保証しない)
  window.rawData.textBlockDeps = Object.create(null)
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
  addToTextBlockDependencies
}
