/* eslint-env mocha */
const { runTest } = require('./helper')

const cases = [
  {
    name: 'indent level 0 codeblock',
    source: [
      'code:hello.js',
      '\tconsole.log("Hello,");',
      '\tconsole.log("World!");'
    ],
    expect: [
      '\\begin{lstlisting}[frame=tb,caption=hello.js]',
      'console.log("Hello,");',
      'console.log("World!");',
      '\\end{lstlisting}'
    ]
  },
  {
    name: 'indent level 0 codeblock with label',
    source: [
      'Look at [. code:my-svg].',
      'code:ref=my-svg, image.svg',
      '\t<svg xmlns="http://www.w3.org/2000/svg">',
      '\t</svg>'
    ],
    expect: [
      'Look at \\autoref{code:my-svg}.',
      '\\begin{lstlisting}[frame=tb,label=code:my-svg,caption=image.svg]',
      '<svg xmlns="http://www.w3.org/2000/svg">',
      '</svg>',
      '\\end{lstlisting}'
    ]
  },
  {
    name: 'user-tex block',
    source: [
      'code:tex',
      '\t% Comments',
      '\t\\begin{displaymath}',
      '\t  \\int^{b}_{a} f(x) dx = \\lim_{n \\to \\infty} \\sum^{n-1}_{i=0} f(x_{i}) \\Delta x',
      '\t\\end{displaymath}'
    ],
    expect: [
      '%===== <user-tex> =====',
      '% Comments',
      '\\begin{displaymath}',
      '  \\int^{b}_{a} f(x) dx = \\lim_{n \\to \\infty} \\sum^{n-1}_{i=0} f(x_{i}) \\Delta x',
      '\\end{displaymath}',
      '%===== </user-tex> ====='
    ]
  },
  {
    name: 'keep blank lines',
    source: [
      'code:blank.html',
      '\t<blank>',
      '\t', '\t', '\t',
      '\t<!-- Hello -->',
      '\t', '\t',
      '\t</blank>'
    ],
    expect: [
      '\\begin{lstlisting}[frame=tb,caption=blank.html]',
      '<blank>',
      '', '', '',
      '<!-- Hello -->',
      '', '',
      '</blank>',
      '\\end{lstlisting}'
    ]
  },
  {
    name: 'lstlisting in itemize',
    source: [
      '\tmessage',
      '\t\tcode:hello.txt',
      '\t\t\tHello,',
      '\t\t\tWorld!',
      '\t\ttail-level-2',
      '\ttail-level-1'
    ],
    expect: [
      '\\begin{itemize}',
      '  \\item message',
      '  \\begin{itemize}',
      '    \\item \\begin{lstlisting}[frame=tb,caption=hello.txt]',
      'Hello,',
      'World!',
      '    \\end{lstlisting}',
      '    \\item tail-level-2',
      '  \\end{itemize}',
      '  \\item tail-level-1',
      '\\end{itemize}'
    ]
  },
  {
    name: 'lstlisting at the end line of the itemize block',
    source: [
      '\thead-level-1',
      '\t\thead-level-2',
      '\t\tcode:tail-level-2.txt',
      '\t\t\tHello,',
      '\t\t\tWorld!',
      '\ttail-level-1'
    ],
    expect: [
      '\\begin{itemize}', // 1
      '  \\item head-level-1',
      '  \\begin{itemize}', // 2
      '    \\item head-level-2',
      '    \\item \\begin{lstlisting}[frame=tb,caption=tail-level-2.txt]',
      'Hello,',
      'World!',
      '    \\end{lstlisting}',
      '  \\end{itemize}', // 2
      '  \\item tail-level-1',
      '\\end{itemize}' // 1
    ]
  },
  {
    name: 'only lstlisting exists in itemize block',
    source: [
      'Example of placing code blocks inside bullets',
      '\tlevel-1',
      '\t\tlevel-2',
      '\t\t\tcode:level-3.txt',
      '\t\t\t\tHello,',
      '\t\t\t\tWorld!',
      '',
      'code:level-0.txt',
      '\t Have a nice day!',
      '',
      '\tlevel-1',
      '\t\tlevel-2',
      '\t\t\tcode:level-3.txt',
      '\t\t\t\tHello,',
      '\t\t\t\tWorld!',
      '\t\tlevel-2 again',
      '',
      'Good!'
    ],
    expect: [
      'Example of placing code blocks inside bullets',
      '\\begin{itemize}', // 1
      '  \\item level-1',
      '  \\begin{itemize}', // 2
      '    \\item level-2',
      '    \\begin{itemize}', // 3
      '      \\item \\begin{lstlisting}[frame=tb,caption=level-3.txt]',
      'Hello,',
      'World!',
      '      \\end{lstlisting}',
      '    \\end{itemize}', // 3
      '  \\end{itemize}', // 2
      '\\end{itemize}', // 1
      '',
      '\\begin{lstlisting}[frame=tb,caption=level-0.txt]',
      ' Have a nice day!',
      '\\end{lstlisting}',
      '',
      '\\begin{itemize}', // 1
      '  \\item level-1',
      '  \\begin{itemize}', // 2
      '    \\item level-2',
      '    \\begin{itemize}', // 3
      '      \\item \\begin{lstlisting}[frame=tb,caption=level-3.txt]',
      'Hello,',
      'World!',
      '      \\end{lstlisting}',
      '    \\end{itemize}', // 3
      '    \\item level-2 again',
      '  \\end{itemize}', // 2
      '\\end{itemize}', // 1
      '',
      'Good!\\\\'
    ]
  },
  {
    name: 'user-tex in itemize',
    source: [
      'Example of placing code blocks inside bullets',
      '\tlevel-1',
      '\t\tlevel-2',
      '\t\t\tcode:level-3.txt',
      '\t\t\t\tHello,',
      '\t\t\t\tWorld!',
      '\t\t\tcode:tex',
      '\t\t\t\t\\begin{eqnarray*}',
      '\t\t\t\t  2x_1 + x_2 & = & 10 \\\\',
      '\t\t\t\t  3x_2 & = & 6',
      '\t\t\t\t\\end{eqnarray*}'
    ],
    expect: [
      'Example of placing code blocks inside bullets',
      '\\begin{itemize}', // 1
      '  \\item level-1',
      '  \\begin{itemize}', // 2
      '    \\item level-2',
      '    \\begin{itemize}', // 3
      '      \\item \\begin{lstlisting}[frame=tb,caption=level-3.txt]',
      'Hello,',
      'World!',
      '      \\end{lstlisting}',
      '      \\item %===== <user-tex> =====',
      '\\begin{eqnarray*}',
      '  2x_1 + x_2 & = & 10 \\\\',
      '  3x_2 & = & 6',
      '\\end{eqnarray*}',
      '      %===== </user-tex> =====',
      '    \\end{itemize}', // 3
      '  \\end{itemize}', // 2
      '\\end{itemize}' // 1
    ]
  }
]

runTest('Convert to lstlisting', cases)
