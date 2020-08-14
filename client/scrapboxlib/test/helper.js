/* eslint-env mocha */
const { assert } = require('chai')
const { parseScrapboxPage } = require('../')
const { formatMarks } = require('../lib')

// タイトル行と参照ラベル行以降の塊を返す
const getBody = str => {
  return str.split('\n').slice(2)
}

const runTest = (name, cases) => {
  describe('Parse itemize', function () {
    for (const testCase of cases) {
      const name = testCase.name || 'test'
      it(name, function (done) {
        const lines = [
          { text: 'PageTitle' },
          ...testCase.source.map(text => ({ text }))
        ]
        const out = parseScrapboxPage({ lines })
        const texts = formatMarks(out.texts.join('\n'))
        assert.deepEqual(getBody(texts), testCase.expect)
        done()
      })
    }
  })
}

module.exports = {
  runTest
}
