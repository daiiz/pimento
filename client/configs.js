/* eslint-env browser */

// template tailLines:
// "% =====pimento-book-content====="
// "\end{document}"
// "% =====pimento-options====="
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

const getIconInfo = titleLc => {
  if (!global.gyazoIcons || !global.gyazoIcons[titleLc]) {
    return { mode: 'text' }
  }
  return {
    mode: global.pimentoConfigs.icons || 'text',
    colorType: global.pimentoConfigs['color-mode'] || 'cmyk',
    gyazoId: global.gyazoIcons[titleLc]
  }
}

const getImageInfo = () => {
  if (!global.pimentoConfigs) return { mode: 'gray' }
  return {
    mode: global.pimentoConfigs.images || 'gray'
  }
}

const getIndexInfo = () => {
  if (!global.pimentoConfigs) {
    return {
      mode: false,
      printIndexLine: ''
    }
  }
  const mode = global.pimentoConfigs.index
  return {
    mode,
    printIndexLine: mode ? '\\printindex' : ''
  }
}

// https://scrapbox.io/daiiz-pimento-dev/自動付録添付をオフにするオプション
const getAppendixInfo = () => {
  if (!global.pimentoConfigs) {
    return { mode: false }
  }
  const mode = global.pimentoConfigs.appendix
  return { mode }
}

module.exports = {
  applyConfigs,
  getIconInfo,
  getImageInfo,
  getIndexInfo,
  getAppendixInfo
}
