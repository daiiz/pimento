const initDependencies = () => {
  // 参照グラフ (描画実績は見ないので表示されていることは保証しない)
  window.rawData.textBlockDeps = Object.create(null)
}

// const existsTextBlock = pageTitleHash => {
//   return pageTitleHash in window.rawData.textBlockDeps
// }

// 参照元と参照先を登録する
const addToTextBlockDependencies = (pageTitleHashFrom, pageTitleHashTo) => {
  if (pageTitleHashFrom && pageTitleHashTo) {
    window.rawData.textBlockDeps[pageTitleHashFrom] = pageTitleHashTo
  }
}

module.exports = {
  initDependencies,
  addToTextBlockDependencies
}
