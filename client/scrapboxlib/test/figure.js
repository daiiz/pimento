/* eslint-env mocha */
const { runTest } = require('./helper')

const cases = [
  {
    name: 'image',
    source: ['[https://gyazo.com/54f4b18d87b2b6aff8a40fb9615ee26d]'],
    expect: [
      '\\begin{figure}[h]',
      '  \\begin{center}',
      '     \\includegraphics[width=0.5\\linewidth]{./cmyk-gray-gyazo-images/54f4b18d87b2b6aff8a40fb9615ee26d.jpg}',
      '     \\caption{}',
      '     \\label{fig:gyazo-id-54f4b18d87b2b6aff8a40fb9615ee26d}',
      '  \\end{center}',
      '\\end{figure}'
    ]
  },
  {
    name: 'image embedded in text',
    source: [
      'Look at the photo.',
      '[https://gyazo.com/54f4b18d87b2b6aff8a40fb9615ee26d]',
      '',
      'Great!'
    ],
    expect: [
      'Look at the photo.',
      '\\begin{figure}[h]',
      '  \\begin{center}',
      '     \\includegraphics[width=0.5\\linewidth]{./cmyk-gray-gyazo-images/54f4b18d87b2b6aff8a40fb9615ee26d.jpg}',
      '     \\caption{}',
      '     \\label{fig:gyazo-id-54f4b18d87b2b6aff8a40fb9615ee26d}',
      '  \\end{center}',
      '\\end{figure}',
      'Great!\\\\'
    ]
  },
  {
    name: 'image embedded in text with newline',
    source: [
      'Look at the photo.',
      '',
      '[https://gyazo.com/54f4b18d87b2b6aff8a40fb9615ee26d]',
      '',
      'Great!'
    ],
    expect: [
      'Look at the photo.\\\\',
      '',
      '\\begin{figure}[h]',
      '  \\begin{center}',
      '     \\includegraphics[width=0.5\\linewidth]{./cmyk-gray-gyazo-images/54f4b18d87b2b6aff8a40fb9615ee26d.jpg}',
      '     \\caption{}',
      '     \\label{fig:gyazo-id-54f4b18d87b2b6aff8a40fb9615ee26d}',
      '  \\end{center}',
      '\\end{figure}',
      'Great!\\\\'
    ]
  },
  {
    name: 'image with caption',
    source: [
      '[https://gyazo.com/54f4b18d87b2b6aff8a40fb9615ee26d]',
      'Cafe morning set'
    ],
    expect: [
      '\\begin{figure}[h]',
      '  \\begin{center}',
      '     \\includegraphics[width=0.5\\linewidth]{./cmyk-gray-gyazo-images/54f4b18d87b2b6aff8a40fb9615ee26d.jpg}',
      '     \\caption{Cafe morning set}',
      '     \\label{fig:gyazo-id-54f4b18d87b2b6aff8a40fb9615ee26d}',
      '  \\end{center}',
      '\\end{figure}'
    ]
  },
  {
    name: 'image with caption and width',
    source: [
      '[https://gyazo.com/54f4b18d87b2b6aff8a40fb9615ee26d]',
      'Cafe morning set [/ width=0.6]'
    ],
    expect: [
      '\\begin{figure}[h]',
      '  \\begin{center}',
      '     \\includegraphics[width=0.6\\linewidth]{./cmyk-gray-gyazo-images/54f4b18d87b2b6aff8a40fb9615ee26d.jpg}',
      '     \\caption{Cafe morning set}',
      '     \\label{fig:gyazo-id-54f4b18d87b2b6aff8a40fb9615ee26d}',
      '  \\end{center}',
      '\\end{figure}'
    ]
  },
  {
    name: 'CMYK color image with caption and width',
    source: [
      '[https://gyazo.com/54f4b18d87b2b6aff8a40fb9615ee26d]',
      'Cafe morning set [/* width=0.6]'
    ],
    expect: [
      '\\begin{figure}[h]',
      '  \\begin{center}',
      '     \\includegraphics[width=0.6\\linewidth]{./cmyk-gyazo-images/54f4b18d87b2b6aff8a40fb9615ee26d.jpg}',
      '     \\caption{Cafe morning set}',
      '     \\label{fig:gyazo-id-54f4b18d87b2b6aff8a40fb9615ee26d}',
      '  \\end{center}',
      '\\end{figure}'
    ]
  },
  {
    name: 'image with caption and label',
    source: [
      '[https://gyazo.com/54f4b18d87b2b6aff8a40fb9615ee26d]',
      'Cafe morning set [/ ref=cafe_morning]'
    ],
    expect: [
      '\\begin{figure}[h]',
      '  \\begin{center}',
      '     \\includegraphics[width=0.5\\linewidth]{./cmyk-gray-gyazo-images/54f4b18d87b2b6aff8a40fb9615ee26d.jpg}',
      '     \\caption{Cafe morning set}',
      '     \\label{fig:cafe_morning}',
      '  \\end{center}',
      '\\end{figure}'
    ]
  },
  {
    name: 'image with caption, width and label',
    source: [
      'Look at the [. fig:cafe_morning].',
      '[https://gyazo.com/54f4b18d87b2b6aff8a40fb9615ee26d]',
      'Cafe morning set [/ width=0.6, ref=cafe_morning]'
    ],
    expect: [
      'Look at the \\autoref{fig:cafe_morning}.',
      '\\begin{figure}[h]',
      '  \\begin{center}',
      '     \\includegraphics[width=0.6\\linewidth]{./cmyk-gray-gyazo-images/54f4b18d87b2b6aff8a40fb9615ee26d.jpg}',
      '     \\caption{Cafe morning set}',
      '     \\label{fig:cafe_morning}',
      '  \\end{center}',
      '\\end{figure}'
    ]
  },
  {
    name: 'image with indented caption, width and label',
    source: [
      'Look at the [. fig:cafe_morning].',
      '',
      '[https://gyazo.com/54f4b18d87b2b6aff8a40fb9615ee26d]',
      '\tCafe morning set [/ width=0.6, ref=cafe_morning]',
      '\tButter toast',
      '\tBoiled egg',
      '\tBlended iced coffee',
      'Great!'
    ],
    expect: [
      'Look at the \\autoref{fig:cafe_morning}.\\\\',
      '',
      '\\begin{figure}[h]',
      '  \\begin{center}',
      '     \\includegraphics[width=0.6\\linewidth]{./cmyk-gray-gyazo-images/54f4b18d87b2b6aff8a40fb9615ee26d.jpg}',
      '     \\caption{Cafe morning set}',
      '     \\label{fig:cafe_morning}',
      '  \\end{center}',
      '\\end{figure}',
      '\\begin{itemize}',
      '  \\item Butter toast',
      '  \\item Boiled egg',
      '  \\item Blended iced coffee',
      '\\end{itemize}',
      'Great!\\\\'
    ]
  },
  {
    name: 'series of images',
    source: [
      '[https://gyazo.com/33e0b9111e81fe75db1964cdcb27c345]',
      '',
      '[https://gyazo.com/54f4b18d87b2b6aff8a40fb9615ee26d]',
      '[https://gyazo.com/76fd0f709df77170b1ffb123f05c6690]'
    ],
    expect: [
      '\\begin{figure}[h]',
      '  \\begin{center}',
      '     \\includegraphics[width=0.5\\linewidth]{./cmyk-gray-gyazo-images/33e0b9111e81fe75db1964cdcb27c345.jpg}',
      '     \\caption{}',
      '     \\label{fig:gyazo-id-33e0b9111e81fe75db1964cdcb27c345}',
      '  \\end{center}',
      '\\end{figure}',
      '\\begin{figure}[h]',
      '  \\begin{center}',
      '     \\includegraphics[width=0.5\\linewidth]{./cmyk-gray-gyazo-images/54f4b18d87b2b6aff8a40fb9615ee26d.jpg}',
      '     \\caption{}',
      '     \\label{fig:gyazo-id-54f4b18d87b2b6aff8a40fb9615ee26d}',
      '  \\end{center}',
      '\\end{figure}',
      '\\begin{figure}[h]',
      '  \\begin{center}',
      '     \\includegraphics[width=0.5\\linewidth]{./cmyk-gray-gyazo-images/76fd0f709df77170b1ffb123f05c6690.jpg}',
      '     \\caption{}',
      '     \\label{fig:gyazo-id-76fd0f709df77170b1ffb123f05c6690}',
      '  \\end{center}',
      '\\end{figure}'
    ]
  },
  {
    name: 'image in itemize',
    source: [
      '\thead-level-1',
      '\t[https://gyazo.com/a94a9b7c49846aa996a26fd08503dc96]',
      '\tRust crab',
      '\ttail-level-1'
    ],
    expect: [
      '\\begin{itemize}',
      '  \\item head-level-1',
      '  \\item \\begin{minipage}[t]{\\linewidth}',
      '    \\vspace{0.5truemm}',
      '    \\begin{center}',
      '      \\includegraphics[width=0.5\\linewidth]{./cmyk-gray-gyazo-images/a94a9b7c49846aa996a26fd08503dc96.jpg}',
      '      % no caption',
      '      \\vspace{3truemm}',
      '      \\label{fig:gyazo-id-a94a9b7c49846aa996a26fd08503dc96}',
      '    \\end{center}',
      '  \\end{minipage}',
      '  \\item Rust crab',
      '  \\item tail-level-1',
      '\\end{itemize}'
    ]
  },
  {
    name: 'image in itemize with caption, width and label',
    source: [
      'Example of placing figure inside bullets',
      '\thead-level-1',
      '\t[https://gyazo.com/a94a9b7c49846aa996a26fd08503dc96]',
      '\t\tRust crab [/ width=0.3, ref=crab]',
      '\ttail-level-1'
    ],
    expect: [
      'Example of placing figure inside bullets',
      '\\begin{itemize}',
      '  \\item head-level-1',
      '  \\item \\begin{minipage}[t]{\\linewidth}',
      '    \\vspace{0.5truemm}',
      '    \\begin{center}',
      '      \\includegraphics[width=0.3\\linewidth]{./cmyk-gray-gyazo-images/a94a9b7c49846aa996a26fd08503dc96.jpg}',
      '      \\vspace{1truemm}',
      '      \\captionof{figure}{Rust crab}',
      '      \\vspace{3truemm}',
      '      \\label{fig:crab}',
      '    \\end{center}',
      '  \\end{minipage}',
      '  \\item tail-level-1',
      '\\end{itemize}'
    ]
  },
  {
    name: 'image in itemize level 1, 2',
    source: [
      '\tlevel-1',
      '\t\tlevel-2',
      '\t[https://gyazo.com/465aba5a060921d0dddde8a0963e73cd]',
      '\t\tlevel-1 image',
      '\t\tlevel-2'
    ],
    expect: [
      '\\begin{itemize}',
      '  \\item level-1',
      '  \\begin{itemize}',
      '    \\item level-2',
      '  \\end{itemize}',
      '  \\item \\begin{minipage}[t]{\\linewidth}',
      '    \\vspace{0.5truemm}',
      '    \\begin{center}',
      '      \\includegraphics[width=0.5\\linewidth]{./cmyk-gray-gyazo-images/465aba5a060921d0dddde8a0963e73cd.jpg}',
      '      \\vspace{1truemm}',
      '      \\captionof{figure}{level-1 image}',
      '      \\vspace{3truemm}',
      '      \\label{fig:gyazo-id-465aba5a060921d0dddde8a0963e73cd}',
      '    \\end{center}',
      '  \\end{minipage}',
      '  \\begin{itemize}',
      '    \\item level-2',
      '  \\end{itemize}',
      '\\end{itemize}'
    ]
  },
  {
    name: 'return to plain line with indent level 0 from image located in deep indent with no caption',
    source: [
      'Test',
      '\tlevel-1',
      '\t\tlevel-2',
      '\t\t\t[https://gyazo.com/3d30566b55e2f511f07b7826a7af77f6]',
      'level-0 plain line'
    ],
    expect: [
      'Test',
      '\\begin{itemize}', // 1
      '  \\item level-1',
      '  \\begin{itemize}', // 2
      '    \\item level-2',
      '    \\begin{itemize}', // 3
      '      \\item \\begin{minipage}[t]{\\linewidth}',
      '        \\vspace{0.5truemm}',
      '        \\begin{center}',
      '          \\includegraphics[width=0.5\\linewidth]{./cmyk-gray-gyazo-images/3d30566b55e2f511f07b7826a7af77f6.jpg}',
      '          % no caption',
      '          \\vspace{3truemm}',
      '          \\label{fig:gyazo-id-3d30566b55e2f511f07b7826a7af77f6}',
      '        \\end{center}',
      '      \\end{minipage}',
      '    \\end{itemize}', // 3
      '  \\end{itemize}', // 2
      '\\end{itemize}', // 1
      'level-0 plain line\\\\'
    ]
  },
  {
    name: 'image without a caption deep inside the itemize',
    source: [
      'Test successful return from deep indentation',
      '\tlevel-1',
      '\t\tlevel-2',
      '\t\t\t[https://gyazo.com/3d30566b55e2f511f07b7826a7af77f6]',
      '\tlevel-1 again'
    ],
    expect: [
      'Test successful return from deep indentation',
      '\\begin{itemize}', // 1
      '  \\item level-1',
      '  \\begin{itemize}', // 2
      '    \\item level-2',
      '    \\begin{itemize}', // 3
      '      \\item \\begin{minipage}[t]{\\linewidth}',
      '        \\vspace{0.5truemm}',
      '        \\begin{center}',
      '          \\includegraphics[width=0.5\\linewidth]{./cmyk-gray-gyazo-images/3d30566b55e2f511f07b7826a7af77f6.jpg}',
      '          % no caption',
      '          \\vspace{3truemm}',
      '          \\label{fig:gyazo-id-3d30566b55e2f511f07b7826a7af77f6}',
      '        \\end{center}',
      '      \\end{minipage}',
      '    \\end{itemize}', // 3
      '  \\end{itemize}', // 2
      '  \\item level-1 again',
      '\\end{itemize}' // 1
    ]
  },
  {
    name: 'series of images in itemize',
    source: [
      '\t[https://gyazo.com/465aba5a060921d0dddde8a0963e73cd]',
      '\t[https://gyazo.com/a94a9b7c49846aa996a26fd08503dc96]',
      '\t\tRust Crab level-1 [/ width=0.1, ref=crab1]',
      '\t\t[https://gyazo.com/a94a9b7c49846aa996a26fd08503dc96]',
      '\t\t\tRust Crab level-2 [/ width=0.2, ref=crab2]',
      '\t\t\tlevel-3',
      '\t\tlevel-2',
      '\t\t\tlevel-3 again'
    ],
    expect: [
      '\\begin{itemize}', // 1
      '  \\item \\begin{minipage}[t]{\\linewidth}',
      '    \\vspace{0.5truemm}',
      '    \\begin{center}',
      '      \\includegraphics[width=0.5\\linewidth]{./cmyk-gray-gyazo-images/465aba5a060921d0dddde8a0963e73cd.jpg}',
      '      % no caption',
      '      \\vspace{3truemm}',
      '      \\label{fig:gyazo-id-465aba5a060921d0dddde8a0963e73cd}',
      '    \\end{center}',
      '  \\end{minipage}',
      '  \\item \\begin{minipage}[t]{\\linewidth}',
      '    \\vspace{0.5truemm}',
      '    \\begin{center}',
      '      \\includegraphics[width=0.1\\linewidth]{./cmyk-gray-gyazo-images/a94a9b7c49846aa996a26fd08503dc96.jpg}',
      '      \\vspace{1truemm}',
      '      \\captionof{figure}{Rust Crab level-1}',
      '      \\vspace{3truemm}',
      '      \\label{fig:crab1}',
      '    \\end{center}',
      '  \\end{minipage}',
      '  \\begin{itemize}', // 2
      '    \\item \\begin{minipage}[t]{\\linewidth}',
      '      \\vspace{0.5truemm}',
      '      \\begin{center}',
      '        \\includegraphics[width=0.2\\linewidth]{./cmyk-gray-gyazo-images/a94a9b7c49846aa996a26fd08503dc96.jpg}',
      '        \\vspace{1truemm}',
      '        \\captionof{figure}{Rust Crab level-2}',
      '        \\vspace{3truemm}',
      '        \\label{fig:crab2}',
      '      \\end{center}',
      '    \\end{minipage}',
      '    \\begin{itemize}', // 3
      '      \\item level-3',
      '    \\end{itemize}', // 3
      '    \\item level-2',
      '    \\begin{itemize}', // 3'
      '      \\item level-3 again',
      '    \\end{itemize}', // 3'
      '  \\end{itemize}', // 2
      '\\end{itemize}' // 1
    ]
  }
]

runTest('Convert to figure', cases)
