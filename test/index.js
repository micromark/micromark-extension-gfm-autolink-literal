var fs = require('fs')
var path = require('path')
var test = require('tape')
var micromark = require('micromark')
var syntax = require('../syntax')
var html = require('../html')

var input = fs.readFileSync(path.join(__dirname, 'input.md'))
var output = fs.readFileSync(path.join(__dirname, 'output.html'), 'utf8')

var email = fs.readFileSync(path.join(__dirname, 'previous.md'))
var emailOutput = fs.readFileSync(path.join(__dirname, 'previous.html'), 'utf8')

test('markdown -> html (micromark)', function (t) {
  t.deepEqual(
    micromark(input, {extensions: [syntax], htmlExtensions: [html]}),
    output,
    'should support autolink literals just like how GH does it'
  )

  t.deepEqual(
    micromark(email, {
      extensions: [syntax],
      htmlExtensions: [html]
    }),
    emailOutput,
    'should support email autolink literals'
  )

  t.end()
})
