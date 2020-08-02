const headers = {
  'Content-Type': 'application/json; charset=utf-8',
}

const uploadTexDocument = async ({ pageTitle, pageTitleHash, pageText }) => {
  if (!pageTitle || !pageTitleHash || !pageText) {
    throw new Error('Invalid arguments')
  }
  const apiUrl = '/api/upload/page'
  const res = await fetch(apiUrl, {
    method: 'POST',
    headers,
    body: JSON.stringify({ pageTitle, pageTitleHash, pageText })
  })
  const data = await res.json()
  console.log(">>>>>", data)
}

module.exports = {
  uploadTexDocument
}
