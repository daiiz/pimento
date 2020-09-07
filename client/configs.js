/* eslint-env browser */

// template tailLines:
// "% =====pimento-book-content====="
// "\end{document}"
// "% =====pimento-figure-settings====="
// "% icons=gray // gray, color, text*, ignore"
// "% images=color // gray*, color, ignore"
// "% color-mode=cmyk // cmyk*"
const applyConfigs = ({ tailLines }) => {
  const lines = tailLines.map(line => line.replace(/\s*\/\/.*$/, ''))
  const configLines = lines
    .filter(line => /%\s*/.test(line.trim()))
    .map(line => line.replace(/^%\s*/, ''))

  // TODO: Validator
  const configs = {
    colormode: 'cmyk', // XXX: 未対応
    images: 'gray', // XXX: 未対応
    icons: 'text'
  }
  const acceptKeys = Object.keys(configs)
  for (const line of configLines) {
    const pattern = /^([^=\s]+)\s*=\s*([^=\s]+)$/
    if (!pattern.test(line)) continue
    const [, key, value] = line.match(pattern)
    if (acceptKeys.includes(key)) {
      configs[key] = value
    }
  }
  window.pimentoConfigs = configs
  console.log('pimentoConfigs:', configs)
}

module.exports = {
  applyConfigs
}
