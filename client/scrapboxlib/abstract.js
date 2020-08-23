const separateAbstractFromTexts = texts => {
  const abstractTexts = []
  const lineTexts = []

  let isInAbstract = false
  for (const [idx, text] of texts.entries()) {
    // 注意: 0行目はタイトル行
    if (idx === 1 && text === '概要') {
      isInAbstract = true
      continue
    }
    if (isInAbstract && text.length === 0) {
      isInAbstract = false
      continue
    }

    if (isInAbstract) {
      abstractTexts.push(text.trim())
    } else {
      lineTexts.push(text)
    }
  }
  return {
    abstractTexts,
    lineTexts
  }
}

module.exports = {
  separateAbstractFromTexts
}
