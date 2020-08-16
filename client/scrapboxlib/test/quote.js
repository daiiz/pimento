/* eslint-env mocha */
const { runTest } = require('./helper')

const cases = [
  {
    name: 'indent level 0',
    source: [
      'Hello',
      '>quoted sentence',
      '>quoted sentence with link: https://example.com .',
      '>quoted sentence with [Example page https://example.com].',
      'Good'
    ],
    expect: [
      'Hello\\\\',
      '\\begin{pimento-quote}',
      '  quoted sentence',
      '\\end{pimento-quote}',
      '\\begin{pimento-quote}',
      '  quoted sentence with link: ',
      '  \\url{https://example.com}',
      '   .',
      '\\end{pimento-quote}',
      '\\begin{pimento-quote}',
      '  quoted sentence with ',
      '  Example page\\footnote{\\url{https://example.com}}',
      '  .',
      '\\end{pimento-quote}',
      'Good\\\\'
    ]
  },
  {
    name: 'indent level 1, 2',
    source: [
      'Hello',
      '>quoted sentence',
      '\t>quoted sentence 1',
      '\tlevel-1',
      '\t\t>quoted sentence 2',
      '\tlevel-1 again',
      'Great',
      '',
      '>quoted sentence',
      '',
      'Good'
    ],
    expect: [
      'Hello\\\\',
      '\\begin{pimento-quote}',
      '  quoted sentence',
      '\\end{pimento-quote}',
      '\\begin{itemize}', // 1
      '  \\item \\vspace{1truemm} \\begin{pimento-quote}',
      '    quoted sentence 1',
      '  \\end{pimento-quote}',
      '  \\item level-1',
      '  \\begin{itemize}', // 2
      '    \\item \\vspace{1truemm} \\begin{pimento-quote}',
      '      quoted sentence 2',
      '    \\end{pimento-quote}',
      '  \\end{itemize}', // 2
      '  \\item level-1 again',
      '\\end{itemize}', // 1
      'Great\\\\',
      '',
      '\\begin{pimento-quote}',
      '  quoted sentence',
      '\\end{pimento-quote}',
      '',
      'Good\\\\'
    ]
  }
]

runTest('Convert to quote', cases)
