const headers = {
  'Content-Type': 'application/json; charset=utf-8',
}

const uploadTexDocument = async ({ pageTitle, pageTitleHash, pageText, pageTemplate, includeCover }) => {
  // maketitle
  if (!pageTitle || !pageTitleHash || !pageText) {
    throw new Error('Invalid arguments')
  }
  let pageHead = [
    '\\begin{filecontents*}{\\jobname.xmpdata}',
    `  \\Title{${pageTitle}}`,
    '\\end{filecontents*}',
    '',
    ...(pageTemplate.headLines || [])
  ]
  const pageTail = pageTemplate.tailLines || []
  if (!includeCover) {
    pageHead = pageHead.filter(line => line.trim() !== '\\maketitle')
  }
  const apiUrl = '/api/upload/page'
  const res = await fetch(apiUrl, {
    method: 'POST',
    headers,
    body: JSON.stringify({
      pageTitle,
      pageTitleHash,
      pageText,
      pageHead: pageHead.join('\n'),
      pageTail: pageTail.join('\n')
    })
  })
  const { page_title_hash } = await res.json()
  // const previewUrl = `/build/pages/${page_title_hash}`
  // console.log(">>>>>", data)
  return page_title_hash
}

module.exports = {
  uploadTexDocument
}
