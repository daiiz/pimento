/* eslint-env mocha */
const { runTest } = require('./helper')

const cases = [
  {
    name: 'icon',
    source: [
      'Hello! [dai_iz.icon]',
      '',
      'Hello! [dai_iz.icon*2]'
    ],
    expect: [
      'Hello! {\\tt (dai\\_iz)}\\\\',
      '',
      'Hello! {\\tt (dai\\_iz)}{\\tt (dai\\_iz)}\\\\'
    ]
  },
  {
    name: 'external project icon',
    source: ['Hello [/daiiz/dai_iz.icon]'],
    expect: ['Hello {\\tt (dai\\_iz)}\\\\']
  },
  {
    name: 'lines ending with icon notation are newlines',
    source: [
      'Scrapbox friendly [daiiz.icon]',
      'Hello. This [daiiz.icon] is my icon.',
      'Hi! [daiiz.icon]',
      '',
      'Text',
      'level 0 [daiiz.icon]',
      '\tlevel 1 [daiiz.icon]',
      '\t\tlevel 2',
      '\tlevel 1',
      '',
      'level 0 [daiiz.icon]',
      '[https://gyazo.com/54f4b18d87b2b6aff8a40fb9615ee26d]'
    ],
    expect: [
      'Scrapbox friendly {\\tt (daiiz)}\\\\',
      'Hello. This {\\tt (daiiz)} is my icon.',
      'Hi! {\\tt (daiiz)}\\\\',
      '',
      'Text',
      'level 0 {\\tt (daiiz)}',
      '\\begin{itemize}',
      '  \\item level 1 {\\tt (daiiz)}',
      '  \\begin{itemize}',
      '    \\item level 2',
      '  \\end{itemize}',
      '  \\item level 1',
      '\\end{itemize}',
      '',
      'level 0 {\\tt (daiiz)}\\\\',
      '\\begin{figure}[h]',
      '  \\begin{center}',
      '     \\includegraphics[width=0.5\\linewidth]{./cmyk-gray-gyazo-images/54f4b18d87b2b6aff8a40fb9615ee26d.jpg}',
      '     \\caption{}',
      '     \\label{fig:gyazo-id-54f4b18d87b2b6aff8a40fb9615ee26d}',
      '  \\end{center}',
      '\\end{figure}'
    ]
  }
]

runTest('Parse icon', cases)
