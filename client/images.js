/* eslint-env browser */
const { getGyazoImageId } = require('./scrapboxlib/lib')

const uploadImages = async gyazoIds => {
  if (!gyazoIds || gyazoIds.length === 0) {
    return {}
  }
  const res = await fetch('/api/convert/images', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json; charset=utf-8'
    },
    body: JSON.stringify({ gyazoIds })
  })
  if (!res.ok) {
    throw new Error('Response is not ok')
  }
  const data = await res.json()
  console.log('imageData:', data)
  return data
}

const extractGyazoIcons = async pageGyazoIconUrls => {
  const dict = Object.create(null)
  for (const titleLc of Object.keys(pageGyazoIconUrls)) {
    const gyazoId = getGyazoImageId(pageGyazoIconUrls[titleLc])
    if (gyazoId) {
      dict[titleLc] = gyazoId
    }
  }
  return dict // gyazoIds: Object.values(dict)
}

// アップロードすべき画像を特定する
const identifyRenderedImages = (gyazoIdsGroup, renderedPageTitleHashs) => {
  const res = []
  for (const pageTitleHash of renderedPageTitleHashs) {
    const gyazoIds = gyazoIdsGroup[pageTitleHash] || []
    for (const gyazoId of gyazoIds) {
      if (!res.includes(gyazoId)) res.push(gyazoId)
    }
  }
  return res
}

module.exports = {
  uploadImages,
  identifyRenderedImages,
  extractGyazoIcons
}
