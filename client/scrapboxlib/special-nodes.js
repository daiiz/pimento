const { incrementPageEmbedCounter, memoPageEmbedGyazoIds } = require('../page-embed-counter')
const { addToTextBlockDependencies } = require('../dependencies')
const { getImageInfo } = require('../configs')
const { Texify } = require('./texify')
const {
  calcPageTitleHash,
  addToPageRefs,
  indentStr,
  buildOptions,
  texEscape,
  texEscapeForRef,
  texEscapeForFormula,
  backSlash
} = require('./lib')

const patternWidthRef = /^width=([\d\.]+),\s*(?:ref|label)=(.+)$/i
const patternWidth = /^width=([\d\.]+),*\s*$/i
const patternRef = /^(?:ref|label)=(.+),*\s*$/i

const handleSpecialLine = (line, title) => {
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
        // 参照グラフを更新 (描画実績は見ないので表示されていることは保証しない)
        // console.log("###", `${title} (${calcPageTitleHash(title)})`, "->", hash)
        addToTextBlockDependencies(calcPageTitleHash(title), hash)
        return [`\$\{window.funcs.page_${hash}(level + 1 + ${line._level})\}`]
      } else {
        return [`\$\{window.textBlockName(level + 1 + ${line._level}, showNumber)\}${texEscape(line._text)}}`]
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

    case 'formula': {
      return [
        `${backSlash}begin{equation*}`,
        `  ${texEscapeForFormula(line._formula)}`,
        `${backSlash}end{equation*}`
      ]
    }

    case 'image': {
      let captionText = ''
      const defaultWidth = line._isStrong ? 0.8 : 0.5
      const info = {
        width: `${defaultWidth}${backSlash}linewidth`,
        ref: `gyazo-id-${line._gyazoImageId}`
      }

      if (!line._gyazoImageId) {
        console.warn('skip: This is not a Gyazo image.', line._srcUrl)
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
          try {
            info.color = infoNode.decos.includes('*-1')
          } catch (err) {
            // XXX: 日報20201005で再現
            console.error(err, line)
          }
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

      const { mode } = getImageInfo()
      const renderIncludegraphics = () => {
        const options = buildOptions(info, ['ref', 'color'])
        let imageDirName = info.color ? 'cmyk-gyazo-images' : 'cmyk-gray-gyazo-images'
        if (mode === 'color') {
          imageDirName = 'cmyk-gyazo-images'
        }

        // const srcUrl = './cmyk-gray-gyazo-images/retina_pancake.jpg'
        // _gyazoImageIdは、`teamName/imageId`、または、`imageId`の形式で与えられる
        const gImageId = line._gyazoImageId.split('/').pop()
        const srcUrl = `./${imageDirName}/${gImageId}.jpg`
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

      if (mode === 'ignore') {
        return ['% Omitted image line']
      }

      const { indent, _hostPageTitleHash, _gyazoImageId } = line
      // 画像が挿入されているページの情報を記録する
      memoPageEmbedGyazoIds(_hostPageTitleHash, [_gyazoImageId], 'default')

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
  console.log('Unsupported special node:', line)
  return []
}

module.exports = {
  handleSpecialLine
}
