/* eslint-env mocha */
const { runTest } = require('./helper')

const cases = [
  {
    name: 'omit helpfeel lines',
    source: [
      'a',
      '? How to (compose|write) a [book]',
      '? How to read [Spanish]',
      'b',
      'c',
      'def'
    ],
    expect: [
      'a',
      '% Omitted helpfeel line',
      '% Omitted helpfeel line',
      'b',
      'c',
      'def\\\\'
    ]
  }
]

runTest('Parse helpfeel', cases)
