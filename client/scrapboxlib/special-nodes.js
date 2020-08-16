const { incrementPageEmbedCounter } = require('../page-embed-counter')
const { Texify } = require('./texify')
const {
  addToPageRefs,
  indentStr,
  buildOptions,
  texEscape,
  texEscapeForRef,
  backSlash
} = require('./lib')

const patternWidthRef = /^width=([\d\.]+),\s*(?:ref|label)=(.+)$/i
const patternWidth = /^width=([\d\.]+),*\s*$/i
const patternRef = /^(?:ref|label)=(.+),*\s*$/i

const handleSpecialLine = (line) => {
  switch (line._type) {
    case 'title': {
      const hash = addToPageRefs(line.text)
      return [
        `\$\{window.textBlockName(level, showNumber)\}${texEscape(line.text)}} % Scrapbox page title line`,
        `${backSlash}label{textBlock-${hash}}`
      ]
    }

    case 'textBlockHead': {
      if (line._embed) {
        // https://scrapbox.io/teamj/pimento_v2:_節の埋め込み記法
        const hash = addToPageRefs(line._text)
        incrementPageEmbedCounter(hash)
        return [`\$\{window.funcs.page_${hash}(level + 1 + ${line._level})\}`]
      } else {
        return [`\$\{window.textBlockName(level + 1 + ${line._level}, showNumber)\}${line._text}}`]
      }
    }

    case 'itemizeHead': {
      const itemizeType = line._enumerate ? 'enumerate' : 'itemize'
      return [indentStr(line.indent) + `${backSlash}begin{${itemizeType}}`]
    }

    case 'itemizeTail': {
      const itemizeType = line._enumerate ? 'enumerate' : 'itemize'
      return [indentStr(line.indent) + `${backSlash}end{${itemizeType}}`]
    }

    case 'quote': {
      const texts = Texify(line._quoteNodes)
      const vspace = `${backSlash}vspace{1truemm}`
      const prefixBegin = line.indent > 0 ? indentStr(line.indent + 1) + `${backSlash}item ${vspace} ` : ''
      const prefix = line.indent > 0 ? indentStr(line.indent + 1) : ''
      return [
        prefixBegin + `${backSlash}begin{pimento-quote}`,
        ...texts.map(text => `${prefix}  ${text}`),
        prefix + `${backSlash}end{pimento-quote}`
      ]
    }

    case 'image': {
      let captionText = ''
      const info = {
        width: `0.5${backSlash}linewidth`,
        ref: `gyazo-id-${line._gyazoImageId}`
      }

      if (!line._gyazoImageId) {
        console.error('This is not a Gyazo image.')
        return []
      }

      switch (line._captionNodes.length) {
        case 0: {
          break
        }
        case 1: {
          captionText = Texify(line._captionNodes[0])
          break
        }
        case 2: {
          captionText = Texify(line._captionNodes[0])
          const infoNode = line._captionNodes[1]
          infoNode.decos = []
          const infoText = Texify(infoNode)[0].trim()
          // 指定できる画像オプションを制限しておく
          if (patternWidthRef.test(infoText)) {
            const [, width, ref] = infoText.match(patternWidthRef)
            info.width = width + `${backSlash}linewidth`
            info.ref = texEscapeForRef(ref)
          } else if (patternWidth.test(infoText)) {
            const [, width] = infoText.match(patternWidth)
            info.width = width + `${backSlash}linewidth`
          } else if (patternRef.test(infoText)) {
            const [, ref] = infoText.match(patternRef)
            info.ref = texEscapeForRef(ref)
          }
          break
        }
      }

      const renderIncludegraphics = () => {
        const options = buildOptions(info, ['ref'])
        // TODO: 画像ディレクトリを変更可能にする
        const srcUrl = `./cmyk-gray-gyazo-images/${line._gyazoImageId}.jpg`
        // const srcUrl = './cmyk-gray-gyazo-images/retina_pancake.jpg'
        if (options.length > 0) {
          return `${backSlash}includegraphics[${options.join(',')}]{${srcUrl}}`
        } else {
          return `${backSlash}includegraphics{${srcUrl}}`
        }
      }
      const renderLabel = () => {
        if (!info.ref) return ''
        return `${backSlash}label{fig:` + info.ref + '}'
      }

      const { indent } = line
      if (indent > 0) {
        // inline image
        const prefixBegin = line.indent > 0 ? indentStr(line.indent + 1) + `${backSlash}item ` : ''
        const prefix = line.indent > 0 ? indentStr(line.indent + 1) : ''
        captionText = captionText.trim()
        return [
          prefixBegin + `${backSlash}begin{minipage}[t]{${backSlash}linewidth}`,
          prefix + `  ${backSlash}vspace{0.5truemm}`,
          prefix + `  ${backSlash}begin{center}`,
          // prefix + `    ${backSlash}captionsetup{width=.85${backSlash}linewidth}`,
          prefix + `    ${renderIncludegraphics()}`,
          prefix + '    ' + (captionText ? `${backSlash}vspace{1truemm}` : ''),
          prefix + '    ' + (captionText ? `${backSlash}captionof{figure}{${captionText}}` : '% no caption'),
          prefix + `    ${backSlash}vspace{3truemm}`,
          prefix + `    ${renderLabel()}`,
          prefix + `  ${backSlash}end{center}`,
          prefix + `${backSlash}end{minipage}`
        ].filter(line => !!line.trim())
      } else {
        // block image
        return [
          `${backSlash}begin{figure}[h]`, // [tbh]
          `  ${backSlash}begin{center}`,
          // `     ${backSlash}captionsetup{width=.85${backSlash}linewidth}`,
          `     ${renderIncludegraphics()}`,
          `     ${backSlash}caption{${captionText.trim()}}`,
          `     ${renderLabel()}`,
          `  ${backSlash}end{center}`,
          `${backSlash}end{figure}`
        ].filter(line => !!line)
      }
    }
  }
}

module.exports = {
  handleSpecialLine
}
