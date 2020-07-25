const { addToPageRefs, backSlash } = require('./lib')

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
      return `(${decos}${Texify(node.nodes)})`
    }
    case 'code': {
      return '`' + node.text + '`'
    }
    case 'image': {
      return `[${node.src}]`
    }
    case 'link': {
      const { pathType, href } = node
      if (pathType === 'relative') {
        const hash = addToPageRefs(href)
        return `${backSlash}ref{` + `textBlock-${hash}` + '}' // `[[R:${hash}]]`
      } else if (pathType === 'absolute') {
        return `[[A:${href}]]`
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
