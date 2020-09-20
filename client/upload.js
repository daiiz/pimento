/* eslint-env browser */

const { texEscape, formatMarks } = require('./scrapboxlib/lib')

const headers = {
  'Content-Type': 'application/json; charset=utf-8'
}

const trimTexLine = line => {
  return line.replace(/%.+$/, '').trim()
}

const uploadTexDocument = async (
  { pageTitle, pageTitleHash, pageText, pageTemplate, includeCover }) => {
  // maketitle
  if (!pageTitle || !pageTitleHash || !pageText) {
    throw new Error('Invalid arguments')
  }
  let pageHead = [
    '\\begin{filecontents*}{\\jobname.xmpdata}',
    `  \\Title{${formatMarks(texEscape(pageTitle))}}`,
    '\\end{filecontents*}',
    '',
    ...(pageTemplate.headLines || [])
  ]
  const pageTail = pageTemplate.tailLines || []
  if (!includeCover) {
    const ignoreLines = [
      '\\maketitle',
      '\\tableofcontents'
    ]
    pageHead = pageHead
      .filter(line => !ignoreLines.includes(trimTexLine(line)))
  }

  for (let i = 0; i < pageHead.length; i++) {
    const line = trimTexLine(pageHead[i])
    if (/\\title\{[^{}\\]+\}/.test(line)) {
      // 「\title{}」行にpageTitleを挿入する
      pageHead[i] = '\\title{' + formatMarks(texEscape(pageTitle)) + '}'
    }
  }

  let apiUrl = '/api/upload/page'
  if (includeCover) {
    apiUrl += '?whole=1'
  }
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
  return page_title_hash
}

module.exports = {
  uploadTexDocument
}
