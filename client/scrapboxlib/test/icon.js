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
  }
]

runTest('Parse icon', cases)
