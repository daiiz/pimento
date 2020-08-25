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
    // https://gyazo.com/b1e090896cbab98a6769aeadd4fad6ea
    name: 'do not create bullets with a depth of 5 or more',
    source: [
      'Indent level (itemizeIndentStack size)',
      '\t1 (0)',
      '\t\t2 (1)',
      '\t\t\t3 (2)',
      '\t\t\t\t4 (3)',
      '\t\t\t\t4',
      '\t\t\t3 again',
      '\t\t\t\t4 (3)',
      '\t\t\t\t\t5 (4)',
      '\t\t\t\t\t5',
      '\t\t\t\t\t\t6 (5)',
      '\t\t\t\t4 again',
      '\t\t\t\t\t5 again'
    ],
    expect: [
      'Indent level (itemizeIndentStack size)',
      '\\begin{itemize}', // Open 1
      '  \\item 1 (0)',
      '  \\begin{itemize}', // Open 2
      '    \\item 2 (1)',
      '    \\begin{itemize}', // Open 3
      '      \\item 3 (2)',
      '      \\begin{itemize}', // Open 4
      '        \\item 4 (3)',
      '        \\item 4',
      '      \\end{itemize}', // Close 4
      '      \\item 3 again',
      '      \\begin{itemize}', // Open 4
      '        \\item 4 (3)',
      '          \\item 5 (4)',
      '          \\item 5',
      '            \\item 6 (5)',
      '        \\item 4 again',
      '          \\item 5 again',
      '      \\end{itemize}', // Close4
      '    \\end{itemize}', // Close 3
      '  \\end{itemize}', // Close 2
      '\\end{itemize}' // Close 1
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
    source: ['\tA', '\tB', 'plain', '\tC', '\t\tD', '\t\t\tX', '\t\tE'],
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
      '    \\begin{itemize}',
      '      \\item X',
      '    \\end{itemize}',
      '    \\item E',
      '  \\end{itemize}',
      '\\end{itemize}'
    ]
  }
]

runTest('Convert to itemize', cases)
