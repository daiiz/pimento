const headers = {
  'Content-Type': 'application/json; charset=utf-8',
}

const convertImages = async ({ gyazoIds }) => {
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

const convertTexDocument = async () => {
  const res = await fetch('/api/convert/tex', {
    method: 'POST',
    headers,
    body: JSON.stringify({ gyazoIds: [] })
  })
  if (!res.ok) throw new Error('Response is not ok')
  const data = await res.json()
  console.log('pdfData:', data)
}

module.exports = {
  convertImages,
  convertTexDocument
}
