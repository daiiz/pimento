/* eslint-env mocha */
const { runTest } = require('./helper')

const cases = [
  {
    name: 'remove line comments',
    source: [
      'Comment lines between bullets are removed.',
      '\ta',
      '[# b]',
      '[# https://gyazo.com/54f4b18d87b2b6aff8a40fb9615ee26d]',
      '\td',
      '[/#_  ]',
      '\tg'
    ],
    expect: [
      'Comment lines between bullets are removed.',
      '\\begin{itemize}',
      '  \\item a',
      '  \\item d',
      '  \\item g',
      '\\end{itemize}'
    ]
  },
  {
    name: 'inline comments',
    source: [
      'Hello [# Wow!]world!',
      '\tI am[# are] here',
      '\t[# Your]My name is[# are] daiiz[# ?]!'
    ],
    expect: [
      'Hello world!',
      '\\begin{itemize}',
      '  \\item I am here',
      '  \\item My name is daiiz!',
      '\\end{itemize}'
    ]
  },
  {
    name: 'keep comment notations in codeblocks',
    source: [
      'code:test',
      '\ta',
      '\tb[# I am here]c',
      '\td',
      '\t[# I am here too][# Nice#^^#]'
    ],
    expect: [
      '\\begin{lstlisting}[style=pimento-block,frame=tb,caption=test]',
      'a',
      'b[# I am here]c',
      'd',
      '[# I am here too][# Nice#^^#]',
      '\\end{lstlisting}'
    ]
  }
]

runTest('Ignore comments', cases)
