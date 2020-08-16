const { indentStr, buildOptions, texEscape, texEscapeForCodeBlock, backSlash } = require('./lib')
const { Texify } = require('./texify')

const codeHeadPattern = /^(?:ref|label)=([^\s,]+),\s*([^\s,]+)$/
const tabelHeadPattern = /^(?:ref|label)=([^\s:]+):/
const br = `${backSlash}${backSlash}`
const hr = `${backSlash}hline`

const renderTableRows = cells => {
  const rows = []
  for (let i = 0; i < cells.length; i++) {
    const rowCells = cells[i]
    const rowCellTexts = rowCells.map(node => Texify(node))
    let text = `${rowCellTexts.join(' & ')} ${br}`
    // 先頭と末尾の行に罫線を挿入
    if (i === 0 || i === cells.length - 1) text += ` ${hr}`
    rows.push(text)
  }
  return rows
}

const parseTableHead = text => {
  const info = Object.create(null)
  if (tabelHeadPattern.test(text)) {
    const [, ref] = text.match(tabelHeadPattern)
    info.label = ref.trim()
    info.caption = text.replace(tabelHeadPattern, '').trim()
  } else {
    info.caption = text.trim()
  }
  return info
}

const handleScrapboxBlockNode = (line) => {
  const info = Object.create(null)
  switch (line.type) {
    case 'codeBlock': {
      // line: https://gyazo.com/2e694ee4369d3140ea5c1d73de0a73ac
      const { indent, content } = line
      const prefixBegin = indent > 0 ? indentStr(indent + 1) + `${backSlash}item ` : ''
      const prefixEnd = indent > 0 ? indentStr(indent + 1) : ''
      let { fileName } = line
      fileName = fileName.trim()
      const contentLines = content.split('\n').map(line => indentStr(0) + line)
      info.frame = 'tb'
      if (fileName === 'tex') {
        // ユーザーが書いたTeXドキュメントを直接埋め込む
        return [
          prefixBegin + '%===== <user-tex> =====',
          ...contentLines.map(line => texEscapeForCodeBlock(line)),
          prefixEnd + '%===== </user-tex> ====='
        ]
      }
      if (codeHeadPattern.test(fileName)) {
        const [, ref, caption] = fileName.match(codeHeadPattern)
        info.label = `code:${ref}`
        info.caption = texEscape(caption)
      } else {
        info.caption = texEscape(fileName)
      }
      const style = line.indent > 0 ? 'style=pimento-inline,' : 'style=pimento-block,'
      const options = style + buildOptions(info).join(',')
      return [
        prefixBegin + `${backSlash}begin{lstlisting}[${options}]`,
        ...contentLines.map(line => texEscapeForCodeBlock(line)),
        prefixEnd + `${backSlash}end{lstlisting}`
      ]
    }

    case 'table': {
      // line: https://gyazo.com/ccfa6d8dd2f83f825871d2b15a778483
      // 参考: https://github.com/daiiz/pimento-browser-extension/blob/master/chrome/js/upload-button.js
      const { indent, fileName, cells } = line
      if (cells.length === 0) return []
      const colNum = cells[0].length
      const colDef = `|${'l'.repeat(colNum).split('').join('|')}|`
      const { label, caption } = parseTableHead(fileName.trim())
      if (indent > 0) {
        // inline table
        const prefixBegin = indent > 0 ? indentStr(indent + 1) + `${backSlash}item ` : ''
        const prefixEnd = indent > 0 ? indentStr(indent + 1) : ''
        return [
          prefixBegin + `${backSlash}vspace{2mm}`,
          prefixEnd + `${backSlash}begin{tabular}{${colDef}} ${hr}`,
          ...renderTableRows(cells).map(row => `    ${row}`),
          prefixEnd + `${backSlash}end{tabular}`,
          prefixEnd + `${backSlash}vspace{2mm}`
        ]
      } else {
        // block table
        return [
          `${backSlash}begin{table}[htb]`, // [tbh]
          `${backSlash}begin{center}`,
          `  ${backSlash}caption{${texEscape(caption)}}`,
          label ? `  ${backSlash}label{table:${label}}` : '  % no label',
          `  ${backSlash}begin{tabular}{${colDef}} ${hr}`,
          ...renderTableRows(cells).map(row => `    ${row}`),
          `  ${backSlash}end{tabular}`,
          `${backSlash}end{center}`,
          `${backSlash}end{table}`
        ]
      }
    }
  }
  return []
}

module.exports = {
  handleScrapboxBlockNode
}
