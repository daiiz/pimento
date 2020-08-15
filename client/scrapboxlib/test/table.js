/* eslint-env mocha */
const { runTest } = require('./helper')

const cases = [
  {
    name: 'indent level 0 table',
    source: [
      'table:my_table',
      '\t\tDPR',
      '\tMacBook Air 2014\t1.0',
      '\tMacBook Pro 2017 Retina\t2.0',
      '\tPixel Slate\t2.25'
    ],
    expect: [
      '\\begin{table}[htb]',
      '\\begin{center}',
      '  \\caption{my\\_table}',
      '  % no label',
      '  \\begin{tabular}{|l|l|} \\hline',
      '     & DPR \\\\ \\hline',
      '    MacBook Air 2014 & 1.0 \\\\',
      '    MacBook Pro 2017 Retina & 2.0 \\\\',
      '    Pixel Slate & 2.25 \\\\ \\hline',
      '  \\end{tabular}',
      '\\end{center}',
      '\\end{table}'
    ]
  }
]

runTest('Convert to table', cases)
