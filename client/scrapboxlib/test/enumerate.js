/* eslint-env mocha */
const { runTest } = require('./helper')

const cases = [
  {
    name: 'indent level 1',
    source: [
      '\t1. A', '\t2. B', '\t3. C',
      '',
      '\t1. A', '\tB', '\t3. C'
    ],
    expect: [
      '\\begin{enumerate}',
      '  \\item A',
      '  \\item B',
      '  \\item C',
      '\\end{enumerate}',
      '',
      '\\begin{enumerate}',
      '  \\item A',
      '  \\item B',
      '  \\item C',
      '\\end{enumerate}'
    ]
  },
  {
    name: 'indent level 1, 2',
    source: ['\t1. A', '\t\t1. a', '\t\t2.', '\t\t3. aa', '\t2. B', '\t3. C'],
    expect: [
      '\\begin{enumerate}',
      '  \\item A',
      '  \\begin{enumerate}',
      '    \\item a',
      '    \\item ',
      '    \\item aa',
      '  \\end{enumerate}',
      '  \\item B',
      '  \\item C',
      '\\end{enumerate}'
    ]
  },
  {
    name: 'enumerate in itemize block',
    source: [
      '\tA',
      '\t\t1. a',
      '\t\t2. b',
      '\t\t3. c',
      '\tB',
      '\tC'
    ],
    expect: [
      '\\begin{itemize}',
      '  \\item A',
      '  \\begin{enumerate}',
      '    \\item a',
      '    \\item b',
      '    \\item c',
      '  \\end{enumerate}',
      '  \\item B',
      '  \\item C',
      '\\end{itemize}'
    ]
  },
  {
    name: 'itemize in enumerate block',
    source: [
      '\t1. A',
      '\t\ta',
      '\t\tb',
      '\t\tc',
      '\t2. B',
      '\t\td',
      '\t\te',
      '',
      '\t1. A',
      '\t\ta',
      '\t\tb',
      '\t\tc',
      '\t\t\tx',
      '\t2. B'
    ],
    expect: [
      '\\begin{enumerate}',
      '  \\item A',
      '  \\begin{itemize}',
      '    \\item a',
      '    \\item b',
      '    \\item c',
      '  \\end{itemize}',
      '  \\item B',
      '  \\begin{itemize}',
      '    \\item d',
      '    \\item e',
      '  \\end{itemize}',
      '\\end{enumerate}',
      '',
      '\\begin{enumerate}',
      '  \\item A',
      '  \\begin{itemize}',
      '    \\item a',
      '    \\item b',
      '    \\item c',
      '    \\begin{itemize}',
      '      \\item x',
      '    \\end{itemize}',
      '  \\end{itemize}',
      '  \\item B',
      '\\end{enumerate}'
    ]
  }
]

runTest('Parse enumerate', cases)
