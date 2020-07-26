const { backSlash, backSlashExp } = require('./scrapboxlib/lib')
const { parseScrapboxPage } = require('./scrapboxlib/')
const { getPageRefs, addToPageRefs } = require('./scrapboxlib/lib')
const { convertImages, convertTexDocument } = require('./convert')
console.log('pimento v2')

window.funcs = Object.create(null)

window.funcs.a = (m) => {
  const texts = [
    `${backSlash}daiiz-a`,
    `\$\{window.funcs.b(N)\}`
  ]
  const funcBody = 'return `' + texts.join('\n') + '`'
  return new Function('N', funcBody)(m * 3)
}

window.funcs.b = (n) => {
  const texts = [
    backSlash + 'b'.repeat(n)
  ]
  const funcBody = 'return `' + texts.join('\n') + '`'
  return new Function(funcBody)()
}

const main = async ({ type, body }) => {
  let texts = []
  let gyazoIds = []
  let pageHash = null
  switch (type) {
    case 'page': {
      const { id, lines, title } = body
      const res = parseScrapboxPage({ lines })
      pageHash = addToPageRefs(lines[0].text)
      texts = res.texts
      gyazoIds = res.gyazoIds
      break
    }
  }

  // ページ変換関数を登録
  const funcBody = 'return `' + texts.join('\n') + '`'
  window.funcs[`page_${pageHash}`] = function (level) {
    return new Function('level', 'showNumber', funcBody)(level)
  }
  window.funcs.entry = function (level) {
    return new Function('level', 'showNumber', funcBody)(level)
  }
  console.log('pageRefs:', getPageRefs())
  // console.log('gyazoIds:', gyazoIds)
  const texDocument = format(funcs.entry(1))

  await convertImages({ gyazoIds })
  document.getElementById('pre').innerText = texDocument
}

let received = false

window.onmessage = async function ({ origin, data }) {
  if (origin !== 'https://scrapbox.io') return
  const { task, type, body } = data

  if (received) {
    // console.log('Already received:', task)
    if (task === 'close') this.close()
    return
  }
  received = true

  switch (task) {
    case 'transfer-data': {
      await main({ type, body })
      break
    }
  }
}

window.format = text => {
  return text.replace(backSlashExp, '\\')
}
