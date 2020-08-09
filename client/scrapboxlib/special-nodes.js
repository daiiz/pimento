const { addToPageRefs, indentStr, buildOptions, backSlash } = require('./lib')
const { Texify} = require('./texify')

const handleSpecialLine = (line) => {
  switch (line._type) {
    case 'title': {
      const hash = addToPageRefs(line.text)
      return [
        `\$\{window.textBlockName(level, showNumber)\}${line.text}} % Scrapbox page title line`,
        `${backSlash}label{textBlock-${hash}}`
      ]
    }
    case 'textBlockHead': {
      if (line._embed) {
        // https://scrapbox.io/teamj/pimento_v2:_節の埋め込み記法
        const hash = addToPageRefs(line._text)
        return [`\$\{window.funcs.page_${hash}(level + 1 + ${line._level})\}`]
      } else {
        return [`\$\{window.textBlockName(level + 1 + ${line._level}, showNumber)\}${line._text}}`]
      }
      break
    }
    case 'itemizeHead': {
      return [indentStr(line.indent) + `${backSlash}begin{itemize}`]
      break
    }
    case 'itemizeTail': {
      return [indentStr(line.indent) + `${backSlash}end{itemize}`]
      break
    }
    case 'image': {
      let captionText = ''
      let info = Object.create(null)
      const captionNodes = []

      if (!line._gyazoImageId) {
        console.error('This is not a Gyazo image.')
        return []
      }

      switch (line._captionNodes.length) {
        case 0: {
          return []
        }
        case 1: {
          captionText = Texify(line._captionNodes[0])
          info.width = `0.5${backSlash}linewidth`
          info.ref = `gyazo-id-${line._gyazoImageId}`
          break
        }
        case 2: {
          captionText = Texify(line._captionNodes[0])
          const infoNode = line._captionNodes[1]
          infoNode.decos = []
          const infoText = Texify(infoNode)[0]
          // 指定できる画像オプションを制限しておく
          const [, width, ref] = infoText.trim().match(/^width=([\d\.]+),\s*(?:ref|label)=(.+)$/i)
          info.width = width + `${backSlash}linewidth`
          info.ref = ref
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
      return [
        `${backSlash}begin{figure}[h]`,
        `  ${backSlash}begin{center}`,
        `     ${renderIncludegraphics()}`,
        `     ${backSlash}caption{${captionText.trim()}}`,
        `     ${renderLabel()}`,
        `  ${backSlash}end{center}`,
        `${backSlash}end{figure}`
      ].filter(line => !!line)
    }
  }
}

module.exports = {
  handleSpecialLine
}
