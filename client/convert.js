const headers = {
  'Content-Type': 'application/json; charset=utf-8',
}

const convertImages = async () => {
  const res = await fetch('/api/convert/images', {
    method: 'POST',
    headers,
    body: JSON.stringify({ gyazoIds: [] })
  })
  if (!res.ok) throw new Error('Response is not ok')
  const data = await res.json()
  console.log(data)
}

const convertTexDocument = async () => {
  const res = await fetch('/api/convert/tex', {
    method: 'POST',
    headers,
    body: JSON.stringify({ gyazoIds: [] })
  })
  if (!res.ok) throw new Error('Response is not ok')
  const data = await res.json()
  console.log(data)
}

module.exports = {
  convertImages,
  convertTexDocument
}
