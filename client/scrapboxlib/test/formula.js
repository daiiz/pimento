/* eslint-env mocha */
const { runTest } = require('./helper')

const cases = [
  {
    name: 'block equation',
    source: [
      'Test for block formula',
      '[$ \\sin\\theta = \\frac{B}{C}]',
      'Test for inline formula',
      '\t[$ \\sin\\theta = \\frac{B}{C}]'
    ],
    expect: [
      'Test for block formula\\\\',
      '\\begin{equation*}',
      '  \\sin\\theta = \\frac{B}{C}',
      '\\end{equation*}',
      'Test for inline formula',
      '\\begin{itemize}',
      '  \\item $\\sin\\theta = \\frac{B}{C}$',
      '\\end{itemize}'
    ]
  }
]

runTest('Parse formula', cases)
