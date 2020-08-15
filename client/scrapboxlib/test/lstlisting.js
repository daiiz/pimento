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
      '\tmessage',
      '\t\thead-level-2',
      '\t\tcode:tail-level-2.txt',
      '\t\t\tHello,',
      '\t\t\tWorld!',
      '\ttail-level-1'
    ],
    expect: [
      '\\begin{itemize}', // 1
      '  \\item message',
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
  }
]

runTest('Convert to lstlisting', cases)
