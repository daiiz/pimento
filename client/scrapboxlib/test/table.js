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
  },
  {
    name: 'indent level 0 table with label',
    source: [
      'table:ref=my_dpr:my_table',
      '\t\tDPR',
      '\tMacBook Air 2014\t1.0',
      '\tMacBook Pro 2017 Retina\t2.0'
    ],
    expect: [
      '\\begin{table}[htb]',
      '\\begin{center}',
      '  \\caption{my\\_table}',
      '  \\label{table:my_dpr}',
      '  \\begin{tabular}{|l|l|} \\hline',
      '     & DPR \\\\ \\hline',
      '    MacBook Air 2014 & 1.0 \\\\',
      '    MacBook Pro 2017 Retina & 2.0 \\\\ \\hline',
      '  \\end{tabular}',
      '\\end{center}',
      '\\end{table}'
    ]
  },
  {
    name: 'table in itemize (inline table)',
    source: [
      '\thead-level-1',
      '\ttable:ref=dpr:DPR',
      '\t\t\tDPR',
      '\t\tMacBook Air 2014\t1.0',
      '\t\tMacBook Pro 2017 Retina\t2.0',
      '\ttail-level-1'
    ],
    expect: [
      '\\begin{itemize}',
      '  \\item head-level-1',
      '  \\item \\vspace{2mm}',
      '  \\begin{tabular}{|l|l|} \\hline',
      '     & DPR \\\\ \\hline',
      '    MacBook Air 2014 & 1.0 \\\\',
      '    MacBook Pro 2017 Retina & 2.0 \\\\ \\hline',
      '  \\end{tabular}',
      '  \\vspace{2mm}',
      '  \\item tail-level-1',
      '\\end{itemize}'
    ]
  },
  {
    name: 'table at the end line of the itemize block',
    source: [
      'Example of placing tables inside bullets',
      '\thead-level-1',
      '\ttable:ref=dpr:DPR',
      '\t\t\tDPR',
      '\t\tMacBook Air 2014\t1.0',
      '\t\tMacBook Pro 2017 Retina\t2.0',
      '\ttail-level-1',
      '\t\thead-level-2',
      '\t\ttable:tail-level-2',
      '\t\t\t\tDPR',
      '\t\t\tMacBook Air 2014\t1.0',
      '\t\t\tMacBook Pro 2017 Retina\t2.0'
    ],
    expect: [
      'Example of placing tables inside bullets',
      '\\begin{itemize}', // 1
      '  \\item head-level-1',
      '  \\item \\vspace{2mm}',
      '  \\begin{tabular}{|l|l|} \\hline',
      '     & DPR \\\\ \\hline',
      '    MacBook Air 2014 & 1.0 \\\\',
      '    MacBook Pro 2017 Retina & 2.0 \\\\ \\hline',
      '  \\end{tabular}',
      '  \\vspace{2mm}',
      '  \\item tail-level-1',
      '  \\begin{itemize}', // 2
      '    \\item head-level-2',
      '    \\item \\vspace{2mm}',
      '    \\begin{tabular}{|l|l|} \\hline',
      '     & DPR \\\\ \\hline',
      '    MacBook Air 2014 & 1.0 \\\\',
      '    MacBook Pro 2017 Retina & 2.0 \\\\ \\hline',
      '    \\end{tabular}',
      '    \\vspace{2mm}',
      '  \\end{itemize}', // 2
      '\\end{itemize}' // 1
    ]
  }
]

runTest('Convert to table', cases)
