var fs = require('fs')
var path = require('path')
var test = require('tape')
var micromark = require('micromark/lib')
var syntax = require('../syntax')
var html = require('../html')

test('markdown -> html (micromark)', function (t) {
  fs.readdirSync(__dirname)
    .filter((d) => path.extname(d) === '.md')
    .forEach((d) => {
      var stem = path.basename(d, '.md')

      t.deepEqual(
        micromark(fs.readFileSync(path.join(__dirname, d)), {
          extensions: [syntax],
          htmlExtensions: [html]
        }),
        fs.readFileSync(path.join(__dirname, stem + '.html'), 'utf8'),
        stem
      )
    })

  t.deepEqual(
    micromark('www.a.)', {extensions: [syntax], htmlExtensions: [html]}),
    '<p><a href="http://www.a">www.a</a>.)</p>',
    'should support a closing paren at TLD'
  )

  t.deepEqual(
    micromark('www.a b', {extensions: [syntax], htmlExtensions: [html]}),
    '<p><a href="http://www.a">www.a</a> b</p>',
    'should support a no TLD'
  )

  t.deepEqual(
    micromark('www.a/b c', {extensions: [syntax], htmlExtensions: [html]}),
    '<p><a href="http://www.a/b">www.a/b</a> c</p>',
    'should support a path instead of TLD'
  )

  t.deepEqual(
    micromark('www.�a', {extensions: [syntax], htmlExtensions: [html]}),
    '<p><a href="http://www.%EF%BF%BDa">www.�a</a></p>',
    'should support a replacement character in a domain'
  )

  t.deepEqual(
    micromark('http://點看.com', {
      extensions: [syntax],
      htmlExtensions: [html]
    }),
    '<p><a href="http://%E9%BB%9E%E7%9C%8B.com">http://點看.com</a></p>',
    'should support non-ascii characters in a domain (http)'
  )

  t.deepEqual(
    micromark('點看@example.com', {
      extensions: [syntax],
      htmlExtensions: [html]
    }),
    '<p>點看@example.com</p>',
    'should *not* support non-ascii characters in atext (email)'
  )

  t.deepEqual(
    micromark('example@點看.com', {
      extensions: [syntax],
      htmlExtensions: [html]
    }),
    '<p>example@點看.com</p>',
    'should *not* support non-ascii characters in a domain (email)'
  )

  t.deepEqual(
    micromark('www.點看.com', {extensions: [syntax], htmlExtensions: [html]}),
    '<p><a href="http://www.%E9%BB%9E%E7%9C%8B.com">www.點看.com</a></p>',
    'should support non-ascii characters in a domain (www)'
  )

  t.deepEqual(
    micromark('www.a.com/點看', {extensions: [syntax], htmlExtensions: [html]}),
    '<p><a href="http://www.a.com/%E9%BB%9E%E7%9C%8B">www.a.com/點看</a></p>',
    'should support non-ascii characters in a path'
  )

  t.deepEqual(
    micromark('www.-a.b', {extensions: [syntax], htmlExtensions: [html]}),
    '<p><a href="http://www.-a.b">www.-a.b</a></p>',
    'should support a dash to start a domain'
  )

  t.deepEqual(
    micromark('www.$', {extensions: [syntax], htmlExtensions: [html]}),
    '<p><a href="http://www.$">www.$</a></p>',
    'should support a dollar as a domain name'
  )

  t.deepEqual(
    micromark('www.a..b.c', {extensions: [syntax], htmlExtensions: [html]}),
    '<p><a href="http://www.a..b.c">www.a..b.c</a></p>',
    'should support adjacent dots in a domain name'
  )

  t.deepEqual(
    micromark('www.a&a;', {extensions: [syntax], htmlExtensions: [html]}),
    '<p><a href="http://www.a">www.a</a>&amp;a;</p>',
    'should support named character references in domains'
  )

  t.end()
})
