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
  const markOpen = '[#'
  const markClose = ']'

  const parse = line => {
  }

  const newLines = []
  for (const line of lines) {
    if (!line.includes(markOpen)) {
      newLines.push(line)
      continue
    }
    parse(line)
  }
  return newLines
}

module.exports = {
  removeTrailingEmptyLines,
  removeCommentLines
}
