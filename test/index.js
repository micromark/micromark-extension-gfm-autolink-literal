var fs = require('fs')
var path = require('path')
var test = require('tape')
var micromark = require('micromark/lib')
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
    micromark(email, {extensions: [syntax], htmlExtensions: [html]}),
    emailOutput,
    'should support email autolink literals'
  )

  t.deepEqual(
    micromark(fs.readFileSync(path.join(__dirname, 'www-domain-start.md')), {
      extensions: [syntax],
      htmlExtensions: [html]
    }),
    fs.readFileSync(path.join(__dirname, 'www-domain-start.html'), 'utf8'),
    'should support certain punctuation markers at the start of a domain (www)'
  )

  t.deepEqual(
    micromark(fs.readFileSync(path.join(__dirname, 'www-domain-continue.md')), {
      extensions: [syntax],
      htmlExtensions: [html]
    }),
    fs.readFileSync(path.join(__dirname, 'www-domain-continue.html'), 'utf8'),
    'should support certain punctuation markers in a domain (www)'
  )

  t.deepEqual(
    micromark(fs.readFileSync(path.join(__dirname, 'www-path-start.md')), {
      extensions: [syntax],
      htmlExtensions: [html]
    }),
    fs.readFileSync(path.join(__dirname, 'www-path-start.html'), 'utf8'),
    'should support certain punctuation markers at the start of a path (www)'
  )

  t.deepEqual(
    micromark(fs.readFileSync(path.join(__dirname, 'www-path-continue.md')), {
      extensions: [syntax],
      htmlExtensions: [html]
    }),
    fs.readFileSync(path.join(__dirname, 'www-path-continue.html'), 'utf8'),
    'should support certain punctuation markers in a path (www)'
  )

  t.deepEqual(
    micromark(fs.readFileSync(path.join(__dirname, 'www-domain-dot.md')), {
      extensions: [syntax],
      htmlExtensions: [html]
    }),
    fs.readFileSync(path.join(__dirname, 'www-domain-dot.html'), 'utf8'),
    'should support certain punctuation markers in a domain after a dot (www)'
  )

  t.deepEqual(
    micromark(fs.readFileSync(path.join(__dirname, 'http-domain-start.md')), {
      extensions: [syntax],
      htmlExtensions: [html]
    }),
    fs.readFileSync(path.join(__dirname, 'http-domain-start.html'), 'utf8'),
    'should support certain punctuation markers at the start of a domain (http)'
  )

  t.deepEqual(
    micromark(
      fs.readFileSync(path.join(__dirname, 'http-domain-continue.md')),
      {extensions: [syntax], htmlExtensions: [html]}
    ),
    fs.readFileSync(path.join(__dirname, 'http-domain-continue.html'), 'utf8'),
    'should support certain punctuation markers in a domain (http)'
  )

  t.deepEqual(
    micromark(fs.readFileSync(path.join(__dirname, 'http-path-start.md')), {
      extensions: [syntax],
      htmlExtensions: [html]
    }),
    fs.readFileSync(path.join(__dirname, 'http-path-start.html'), 'utf8'),
    'should support certain punctuation markers at the start of a path (http)'
  )

  t.deepEqual(
    micromark(fs.readFileSync(path.join(__dirname, 'http-path-continue.md')), {
      extensions: [syntax],
      htmlExtensions: [html]
    }),
    fs.readFileSync(path.join(__dirname, 'http-path-continue.html'), 'utf8'),
    'should support certain punctuation markers in a path (http)'
  )

  t.deepEqual(
    micromark(
      fs.readFileSync(
        path.join(__dirname, 'domain-character-reference-like-named.md')
      ),
      {extensions: [syntax], htmlExtensions: [html]}
    ),
    fs.readFileSync(
      path.join(__dirname, 'domain-character-reference-like-named.html'),
      'utf8'
    ),
    'should support named “character references” in domains'
  )

  t.deepEqual(
    micromark(
      fs.readFileSync(
        path.join(__dirname, 'domain-character-reference-like-numerical.md')
      ),
      {extensions: [syntax], htmlExtensions: [html]}
    ),
    fs.readFileSync(
      path.join(__dirname, 'domain-character-reference-like-numerical.html'),
      'utf8'
    ),
    'should support numerical “character references” in domains'
  )

  t.deepEqual(
    micromark(
      fs.readFileSync(
        path.join(__dirname, 'path-character-reference-like-named.md')
      ),
      {extensions: [syntax], htmlExtensions: [html]}
    ),
    fs.readFileSync(
      path.join(__dirname, 'path-character-reference-like-named.html'),
      'utf8'
    ),
    'should support named “character references” in paths'
  )

  t.deepEqual(
    micromark(
      fs.readFileSync(
        path.join(__dirname, 'path-character-reference-like-numerical.md')
      ),
      {extensions: [syntax], htmlExtensions: [html]}
    ),
    fs.readFileSync(
      path.join(__dirname, 'path-character-reference-like-numerical.html'),
      'utf8'
    ),
    'should support numerical “character references” in paths'
  )

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
