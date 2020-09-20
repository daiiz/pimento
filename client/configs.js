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

  const acceptKeys = Object.keys(window.pimentoConfigs)
  for (const line of configLines) {
    const pattern = /^([^=\s]+)\s*=\s*([^=\s]+)$/
    if (!pattern.test(line)) continue
    const [, key, value] = line.match(pattern)
    if (acceptKeys.includes(key)) {
      let v = Number(value) || value
      if (v === 'true') {
        v = true
      } else if (v === 'false') {
        v = false
      }
      window.pimentoConfigs[key] = v
    }
  }
  console.log('pimentoConfigs:', window.pimentoConfigs)
}

module.exports = {
  applyConfigs
}
