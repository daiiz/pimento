const { parse } = require('@progfay/scrapbox-parser')
const { Texify, getPageRefs } = require('./texify')

const parseScrapboxPage = ({ lines }) => {
  const lineTexts = lines.map(line => line.text)
  const lineObjects = parse(lineTexts.join('\n'))

  const gyazoIds = extractGyazoIds(lineObjects)
  console.log("!!", gyazoIds)
  console.log("##", lineObjects)

  for (const line of lineObjects) {
    if (!line.nodes) {
      console.log(line.type)
      continue
    }
    console.log(Texify(line.nodes))
  }
  console.log(getPageRefs())

  return lineObjects
}

const getGyazoImageId = srcUrl => {
  const gyazoOrigin = 'https://gyazo.com/'
  if (!srcUrl.startsWith(gyazoOrigin)) return null
  return srcUrl.replace(gyazoOrigin, '').split('/')[0]
}

const extractGyazoIds = lines => {
  const gayzoIds = []
  // XXX: 本当は再帰的に見ていくべきだが、いまは雑にやる
  for (const line of lines) {
    const { nodes, type } = line
    if (!nodes) continue
    for (const node of nodes) {
      if (node.type === 'image') {
        const gayzoId = getGyazoImageId(node.src)
        if (gayzoId) gayzoIds.push(gayzoId)
      }
    }
  }
  return gayzoIds
}

module.exports = {
  parseScrapboxPage
}
