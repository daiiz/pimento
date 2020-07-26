const { indentStr,buildOptions, texEscape, backSlash } = require('./lib')

const codeHeadRegExp = /^(?:ref|label)=([^\s,]+),\s*([^\s,]+)$/

const handleScrapboxBlockNode = (line) => {
  const info = Object.create(null)
  // line: https://gyazo.com/2e694ee4369d3140ea5c1d73de0a73ac
  console.log(line)
  switch (line.type) {
    case 'codeBlock': {
      let { fileName, content } = line
      fileName = fileName.trim()
      const contentLines = content.split('\n').map(line => indentStr(0) + line)
      console.log('codeBlock:', fileName)
      info.frame = 'tb'
      if (codeHeadRegExp.test(fileName)) {
        const [, ref, caption] = fileName.trim().match(codeHeadRegExp)
        info.label = ref
        info.caption = texEscape(caption)
      }
      return [
        `${backSlash}begin{lstlisting}[${buildOptions(info).join(',')}]`,
        ...contentLines,
        `${backSlash}end{lstlisting}`
      ]
    }
  }
  return []
}

module.exports = {
  handleScrapboxBlockNode
}
