const { addToPageRefs, texEscape,backSlash } = require('./lib')

const getKindName = kind => {
  switch (kind) {
    case 'table': return '表'
    case 'fig': return '図'
    case 'code': return 'リスト'
  }
}

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
        return `${getKindName(kind)}${backSlash}ref{${kind}:` + label + '}'
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
    case 'code': {
      return `{${backSlash}tt ` + node.text + '}'
    }
    case 'link': {
      const { pathType, href } = node
      if (pathType === 'relative') {
        const hash = addToPageRefs(href)
        return `${backSlash}ref{` + `textBlock-${hash}` + '}'
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
