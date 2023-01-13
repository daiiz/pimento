const { addToPageRefs, texEscape, texEscapeForFormula, texEscapeForRef, toTitleLc, backSlash } = require('./lib')
const { isChapter, existsPage, memoPageEmbedGyazoIds } = require('../page-embed-counter')
const { getIconInfo, getAppendixInfo } = require('../configs')

const getHeadingNumberInfo = () => {
  return { omitLevel: global.pimentoConfigs['heading-number-omit-level'] }
}

// /daiiz/foo/bar -> foo/bar
const extractProjectNameAndPageTitle = (rootPath) => {
  const toks = rootPath.replace(/^\//, '').split('/')
  const projectName = toks.shift()
  const pageTitle = toks.join('/')
  return [projectName, pageTitle]
}

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
      if (/^https?:\/\//.test(node.text)) {
        return `${backSlash}url{` + texEscape(node.text) + '}'
      }
      return `{${backSlash}tt ` + texEscape(node.text) + '}'
    }
    case 'strong': {
      return `{${backSlash}bf ${Texify(node.nodes)}}`
    }
    case 'icon': {
      if (node.pathType === 'root') {
        // 外部プロジェクトの画像は表示しない
        const path = node.path.split('/').pop()
        return `{${backSlash}tt (${texEscape(path)})}`
      }
      const title = node.path
      const { mode, gyazoId } = getIconInfo(toTitleLc(title))
      // アイコンが挿入されているページの情報を記録する
      memoPageEmbedGyazoIds(node.hostPageTitleHash, [gyazoId], 'icon')
      switch (mode) {
        case 'gray': {
          return `${backSlash}scrapboxicon{./cmyk-gray-gyazo-images/${gyazoId}.jpg}`
        }
        case 'color': {
          return `${backSlash}scrapboxicon{./cmyk-gyazo-images/${gyazoId}.jpg}`
        }
        case 'ignore': {
          return ''
        }
      }
      return `{${backSlash}tt (${texEscape(title)})}`
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
      const pathType = node.pathType
      let isPage = true
      let href = node.href
      if (pathType === 'root') {
        const [, pageTitle] = extractProjectNameAndPageTitle(node.href)
        if (pageTitle) {
          href = pageTitle
        } else {
          // [/daiiz/] のようなpageLinkだったとき
          isPage = false
        }
      }
      if (pathType === 'relative' || (pathType === 'root' && isPage)) {
        // xxxx (第N章)、xxxx (付録X) の形式を出し分ける
        // 括弧内の表現は\autorefを使うといい感じに解決される
        const hash = addToPageRefs(href)
        // XXX: すべてのページリンクに対してインデックスをはってみる
        const index = `${backSlash}index{${texEscape(href)}}`
        // pageEmbedCounterを用いて参照可能性を判定する
        const shouldInsertReference = getAppendixInfo().mode ? true : isChapter(hash)
        if (existsPage(hash) && shouldInsertReference) {
          // TODO: テキスト省略オプション
          if (getHeadingNumberInfo().omitLevel <= 1) {
            // ページ番号で参照する
            const refStr = `(p.${backSlash}pageref{` + `textBlock-${hash}` + '})'
            return `{${backSlash}tt ${texEscape(href)}}${index} {${backSlash}scriptsize ${refStr}}`
          } else {
            const refStr = `(${backSlash}autoref{` + `textBlock-${hash}` + '})'
            // XXX: こちらのケースもttフォントでよいかも？
            return `${texEscape(href)}${index} {${backSlash}scriptsize ${refStr}}`
          }
        } else {
          // EmptyLinkやInterLinkへの参照はプレーンテキスト扱いする
          return `${texEscape(href)}${index}`
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
  Texify,
  extractProjectNameAndPageTitle
}
