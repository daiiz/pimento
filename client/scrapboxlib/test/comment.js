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
  }
]

runTest('Ignore comments', cases)
