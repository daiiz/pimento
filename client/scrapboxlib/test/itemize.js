/* eslint-env mocha */
const { runTest } = require('./helper')
const window = global

const cases = [
  {
    name: 'indent level 1',
    source: ['\tA', '\tB', '\tC', ''],
    expect: [
      '\\begin{itemize}',
      '  \\item A',
      '  \\item B',
      '  \\item C',
      '\\end{itemize}'
    ]
  },
  {
    name: 'indent level 1-2',
    source: ['\tA', '\t\ta', '\t\t', '\t\taa', '\tB', '\tC', ''],
    expect: [
      '\\begin{itemize}',
      '  \\item A',
      '  \\begin{itemize}',
      '    \\item a',
      '    \\item ',
      '    \\item aa',
      '  \\end{itemize}',
      '  \\item B',
      '  \\item C',
      '\\end{itemize}'
    ]
  },
  {
    name: 'indent with code, math and bold',
    source: ['\t`A`', '\t[$ a_2 = \\pi]', '\t[* B]', ''],
    expect: [
      '\\begin{itemize}',
      '  \\item {\\tt A}',
      '  \\item $a_2 = \\pi$',
      '  \\item {\\bf B}',
      '\\end{itemize}'
    ]
  },
]

runTest('Parse itemize', cases)
