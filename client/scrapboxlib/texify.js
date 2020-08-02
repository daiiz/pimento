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
      const decos = node.decos.join('')
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
      // コメント記法「#」は無視
      if (decos.includes('#')) {
        return ''
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
      return `{${backSlash}tt ` + texEscape(node.text) + '}'
    }
    case 'link': {
      const { pathType, href } = node
      if (pathType === 'relative') {
        // xxxx (第N章)、xxxx (付録X) の形式を出し分ける
        // 括弧内の表現は\autorefを使うといい感じに解決される
        // TODO: テキスト省略オプション
        const hash = addToPageRefs(href)
        const refStr = `(${backSlash}autoref{` + `textBlock-${hash}` + '})'
        return `${texEscape(href)} {${backSlash}scriptsize ${refStr}}`
      } else if (pathType === 'absolute') {
        if (node.content) {
          return `${node.content}${backSlash}footnote{${backSlash}url{` + texEscape(href) + '}}'
        } else {
          return `${backSlash}url{` + texEscape(href) + '}'
        }
      }
      break
    }
    case 'plain': {
      // OK?
      return Texify(texEscape(node.text))
    }
    case 'image': {
      return `${backSlash}url{` + texEscape(node.src) + '}'
    }
  }
  return Texify(node.text)
}

module.exports = {
  Texify
}
