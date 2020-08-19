const { addToPageRefs, texEscape, texEscapeForFormula, texEscapeForRef, backSlash } = require('./lib')
const { existsPage } = require('../page-embed-counter')

const Texify = node => {
  if (typeof node === 'string') return node
  if (node instanceof Array) {
    return node.map(n => Texify(n))
  }
  if (!node) return null
  switch (node.type) {
    // 装飾を翻訳
    case 'decoration': {
      if (node.decos.length === 0) return Texify(node.nodes)
      const decos = node.decos.join('')
      // 参照記法「.」
      if (decos.includes('.') && node.nodes.length === 1) {
        const [kind, label] = Texify(node.nodes[0]).split(':')
        return `${backSlash}autoref{${kind}:` + texEscapeForRef(label) + '}'
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
      // 太文字
      if (decos.includes('*')) {
        return `{${backSlash}bf ${Texify(node.nodes)}}`
      }
      // 斜体
      if (decos.includes('/')) {
        return `{${backSlash}it ${Texify(node.nodes)}}`
      }
      // 下線
      if (decos.includes('_')) {
        return `${backSlash}underline{${Texify(node.nodes)}}`
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
    case 'icon': {
      if (node.pathType === 'root') {
        // 外部プロジェクトの画像は表示しない
        const path = node.path.split('/').pop()
        return `{${backSlash}tt (${texEscape(path)})}`
      }
      // TODO: 小さい画像として描画したい
      return `{${backSlash}tt (${texEscape(node.path)})}`
    }
    case 'hashTag': {
      const hash = addToPageRefs(node.href)
      let text = `{${backSlash}tt ${texEscape('#' + node.href)}}`
      if (existsPage(hash)) {
        const refStr = `(${backSlash}autoref{textBlock-${hash}})`
        text += ` {${backSlash}scriptsize ${refStr}}`
      }
      return text
    }
    case 'link': {
      const { pathType, href } = node
      if (pathType === 'relative') {
        // xxxx (第N章)、xxxx (付録X) の形式を出し分ける
        // 括弧内の表現は\autorefを使うといい感じに解決される
        const hash = addToPageRefs(href)
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
          return `${texEscape(node.content)}${backSlash}footnote{${backSlash}url{` + texEscape(href) + '}}'
        } else {
          return `${backSlash}url{` + texEscape(href) + '}'
        }
      } else if (pathType === 'root') {
        // 外部プロジェクトへの参照
        const url = texEscape('https://scrapbox.io' + href)
        return `${backSlash}url{` + texEscape(href) + '}' + `${backSlash}footnote{${backSlash}url{` + url + '}}'
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
    case 'helpfeel': {
      // XXX: 索引を生成してもいいかも？
      return '% Omitted helpfeel line'
    }
  }
  console.log('Unsupported node:', node)
  return Texify(node.text)
}

module.exports = {
  Texify
}
