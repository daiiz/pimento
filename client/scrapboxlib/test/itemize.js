/* eslint-env mocha */
const { runTest } = require('./helper')

const cases = [
  {
    name: 'indent level 1',
    source: ['\tA', '\tB', '\tC'],
    expect: [
      '\\begin{itemize}',
      '  \\item A',
      '  \\item B',
      '  \\item C',
      '\\end{itemize}'
    ]
  },
  {
    name: 'indent level 1, 2',
    source: ['\tA', '\t\ta', '\t\t', '\t\taa', '\tB', '\tC'],
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
    name: 'indent level 1, 2, 3',
    source: ['\tA', '\t\ta', '\t\txx', '\t\t\txxx', '\t\taa', '\tB'],
    expect: [
      '\\begin{itemize}',
      '  \\item A',
      '  \\begin{itemize}',
      '    \\item a',
      '    \\item xx',
      '    \\begin{itemize}',
      '      \\item xxx',
      '    \\end{itemize}',
      '    \\item aa',
      '  \\end{itemize}',
      '  \\item B',
      '\\end{itemize}'
    ]
  },
  {
    name: 'indent with URL',
    source: ['\thttps://example.com/'],
    expect: [
      '\\begin{itemize}',
      '  \\item \\url{https://example.com/}',
      '\\end{itemize}'
    ]
  },
  {
    name: 'indent with code, math, bold, italic and underline',
    source: ['\t`A`', '\t[$ a_2 = \\pi]', '\t[* B]', '\t[/ daiiz]', '\tLook at the [_ Car]!'],
    expect: [
      '\\begin{itemize}',
      '  \\item {\\tt A}',
      '  \\item $a_2 = \\pi$',
      '  \\item {\\bf B}',
      '  \\item {\\it daiiz}',
      '  \\item Look at the \\underline{Car}!',
      '\\end{itemize}'
    ]
  },
  {
    name: 'multiple bullet blocks',
    source: ['\tA', '\tB', 'plain', '\tC', '\t\tD'],
    expect: [
      '\\begin{itemize}',
      '  \\item A',
      '  \\item B',
      '\\end{itemize}',
      'plain',
      '\\begin{itemize}',
      '  \\item C',
      '  \\begin{itemize}',
      '    \\item D',
      '  \\end{itemize}',
      '\\end{itemize}'
    ]
  }
]

runTest('Parse itemize', cases)
