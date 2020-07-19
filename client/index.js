console.log('pimento v2')

window.addEventListener('load', async event => {
  // demo
  const res = await fetch('/api/convert/images', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
    },
    body: JSON.stringify({ gyazoIds: [] })
  })
  const data = await res.json()
  console.log('>', data)

}, false)
