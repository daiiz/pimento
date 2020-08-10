const { addToPageRefs, texEscape, texEscapeForFormula, backSlash } = require('./lib')
const { existsPage } = require('../page-embed-counter')

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
      return '$' + texEscapeForFormula(node.formula) + '$'
    }
    case 'code': {
      if (/https?:\/\//.test(node.text)) {
        return `${backSlash}url{` + texEscape(node.text) + '}'
      }
      return `{${backSlash}tt ` + texEscape(node.text) + '}'
    }
    case 'link': {
      const { pathType, href } = node
      if (pathType === 'relative') {
        // xxxx (第N章)、xxxx (付録X) の形式を出し分ける
        // 括弧内の表現は\autorefを使うといい感じに解決される
        const hash = addToPageRefs(href)
        // 参照実績を記録
        if (!window.funcs.refPageHashs.includes(hash)) {
          window.funcs.refPageHashs.push(hash)
        }
        // pageEmbedCounterを用いて参照可能性を判定する
        if (existsPage(hash)) {
          // TODO: テキスト省略オプション
          const refStr = `(${backSlash}autoref{` + `textBlock-${hash}` + '})'
          return `${texEscape(href)} {${backSlash}scriptsize ${refStr}}`
        } else {
          // EmptyLinkやInterLinkへの参照はプレーンテキスト扱いする
          return texEscape(href)
        }
      } else if (pathType === 'absolute') {
        if (node.content) {
          return `${texEscape(node.content)}${backSlash}footnote{${backSlash}url{` + href + '}}'
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
      const { link, src } = node
      if (node.link) {
        return `${texEscape(link)}${backSlash}footnote{${backSlash}url{` + src + '}}'
      }
      return `${backSlash}url{` + texEscape(src) + '}'
    }
  }
  return Texify(node.text)
}

module.exports = {
  Texify
}
