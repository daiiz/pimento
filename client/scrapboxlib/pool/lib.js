const removeTrailingEmptyLines = lines => {
  // 末尾の空行の塊を取り除く
  let stopFlag = false
  for (let i = 0; i < lines.length; i++) {
    const idx = lines.length - i - 1
    const line = lines[idx]
    if (stopFlag) {
      continue
    }
    if (line.trim().length === 0) {
      lines[idx] = undefined
    } else {
      stopFlag = true
    }
  }
  return lines.filter(line => line !== undefined)
}

const removeCommentLines = lines => {
  const markCommentOpen = '[#'

  const removeComments = line => {
    const commentRanges = []
    const range = []
    let unclosedBracketsCounter = 0
    for (let charIdx = 0; charIdx < line.length; charIdx++) {
      const char = line[charIdx]
      const seq = char + (line[charIdx + 1] || '')
      if (range.length === 0 && seq === markCommentOpen) {
        range.push(charIdx)
      } else if (char === ']') {
        if (unclosedBracketsCounter === 0) {
          range.push(charIdx)
          commentRanges.push([range[0], range[1]])
          range.length = 0
        } else {
          unclosedBracketsCounter -= 1
        }
      } else if (char === '[') {
        unclosedBracketsCounter += 1
      }
    }

    const newLine = []
    let startPosition = 0
    for (const commentRange of commentRanges) {
      const subStr = line.substring(startPosition, commentRange[0])
      newLine.push(subStr)
      startPosition = commentRange[1] + 1
    }
    newLine.push(line.substring(startPosition, line.length))
    return newLine.join('')
  }

  const newLines = []
  for (const line of lines) {
    if (!line.includes(markCommentOpen)) {
      newLines.push(line)
      continue
    }
    newLines.push(removeComments(line))
  }
  return newLines
}

module.exports = {
  removeTrailingEmptyLines,
  removeCommentLines
}
