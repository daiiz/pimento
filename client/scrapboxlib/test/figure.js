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
  }
]

runTest('Convert to figure', cases)
