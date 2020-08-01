const { addToPageRefs, texEscape, backSlash } = require('./lib')

const Texify = node => {
  if (typeof node === 'string') return node
  if (node instanceof Array) {
    return node.map(n => Texify(n))
  }
  if (!node) return null
  switch (node.type) {
    case 'decoration': {
      if (node.decos.length === 0) return Texify(node.nodes)
      const decos = node.decos.join('') // XXXX: いいのかこれで
      // 参照記法「.」
      if (decos.includes('.') && node.nodes.length === 1) {
        const [kind, label] = Texify(node.nodes[0]).split(':')
        return `${backSlash}autoref{${kind}:` + label + '}'
      }
      // 脚注記法「!」
      if (decos.includes('!')) {
        const texts = Texify(node.nodes)
        return `${backSlash}footnote{` + texts.join('').trim() + '}'
      }
      return `(${decos}${Texify(node.nodes)})`
    }
    case 'blank': {
      return ''
    }
    case 'formula': {
      if (!node.formula) return ''
      return '$' + node.formula + '$'
    }
    case 'code': {
      return `{${backSlash}tt ` + node.text + '}'
    }
    case 'link': {
      const { pathType, href } = node
      if (pathType === 'relative') {
        // TODO:『xxxx (第N章)』『xxxx (付録X)』の形式を出し分ける必要がある
        // 括弧内の表現は\autorefを使うといい感じに解決される
        const hash = addToPageRefs(href)
        return `${backSlash}autoref{` + `textBlock-${hash}` + '}'
      } else if (pathType === 'absolute') {
        if (node.content) {
          return `${node.content}${backSlash}footnote{${backSlash}url{` + texEscape(href) + '}}'
        } else {
          return `${backSlash}url{` + texEscape(href) + '}'
        }
      }
      break
    }
  }
  // plain
  return Texify(node.text)
}

module.exports = {
  Texify
}
