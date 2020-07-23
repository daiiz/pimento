const crypto = require('crypto')

const calcPageTitleHash = title => {
  const md5 = crypto.createHash('md5')
  return md5.update(title.toLowerCase(), 'binary').digest('hex')
}

const pageRefs = Object.create(null)

const Texify = node => {
  if (typeof node === 'string') return node
  if (node instanceof Array) {
    return node.map(n => Texify(n))
  }
  if (!node) return null
  switch (node.type) {
    case 'decoration': {
      const decos = node.decos.join('') // XXXX: いいのかこれで
      return `(${decos}${Texify(node.nodes)})`
      break
    }
    case 'code': {
      return '`' + node.text + '`'
      break
    }
    case 'image': {
      return `[${node.src}]`
      break
    }
    case 'link': {
      const { pathType, href } = node
      if (pathType === 'relative') {
        const hash = calcPageTitleHash(href)
        pageRefs[hash] = href
        return`[[R:${hash}]]`
      } else if (pathType === 'absolute') {
        return`[[A:${href}]]`
      }
      break
    }
  }
  // plain
  return Texify(node.text)
}

const getPageRefs = () => {
  return Object.freeze(pageRefs)
}

module.exports = {
  Texify,
  getPageRefs
}
