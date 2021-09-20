/* eslint-env browser */

const { texEscape, formatMarks } = require('./scrapboxlib/lib')

const trimTexLine = line => {
  return line.replace(/%.+$/, '').trim()
}

const formatPageTitle = pageTitle => {
  return formatMarks(texEscape(pageTitle))
}

const createTexDocument = ({ pageTitle, pageTitleHash, pageText, pageTemplate, includeCover, docType }) => {
  const formattedPageTitle = formatPageTitle(pageTitle)
  // maketitle
  if (!pageTitle || !pageTitleHash || !pageText) {
    throw new Error('Invalid arguments')
  }
  let pageHead = [
    '\\begin{filecontents*}{\\jobname.xmpdata}',
    `  \\Title{${formattedPageTitle}}`,
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
      pageHead[i] = '\\title{' + formattedPageTitle + '}'
    }
  }

  const texDocument = {
    pageTitle,
    pageTitleHash,
    pageText,
    pageHead: pageHead.join('\n'),
    pageTail: pageTail.join('\n'),
    // 付随情報
    // pageTemplate,
    includeCover,
    docType
  }

  return texDocument
}

const uploadTexDocument = async uploadData => {
  console.log('[uploadTexDocument]', uploadData)
  const apiUrl = '/api/upload/page'
  // TODO: あとで修正
  // if (uploadData.includeCover) {
  //   apiUrl += '?whole=1'
  // }
  const res = await fetch(apiUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json; charset=utf-8'
    },
    body: JSON.stringify(uploadData)
  })
  const { page_title_hash } = await res.json()
  return page_title_hash
}

module.exports = {
  createTexDocument,
  uploadTexDocument
}
