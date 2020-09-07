/* eslint-env browser */
const { getGyazoImageId } = require('./scrapboxlib/lib')

const headers = {
  'Content-Type': 'application/json; charset=utf-8'
}

const uploadImages = async ({ gyazoIds }) => {
  if (!gyazoIds || gyazoIds.length === 0) return {}
  const res = await fetch('/api/convert/images', {
    method: 'POST',
    headers,
    body: JSON.stringify({ gyazoIds })
  })
  if (!res.ok) throw new Error('Response is not ok')
  const data = await res.json()
  console.log('imageData:', data)
}

const uploadGyazoIcons = async pageGyazoIconUrls => {
  const dict = Object.create(null)
  for (const titleLc of Object.keys(pageGyazoIconUrls)) {
    const gyazoId = getGyazoImageId(pageGyazoIconUrls[titleLc])
    if (gyazoId) {
      dict[titleLc] = gyazoId
    }
  }
  console.log("#>>>", Object.values(dict))
  return dict
}

module.exports = {
  uploadImages,
  uploadGyazoIcons
}
