import assert from 'node:assert/strict'
import fs from 'node:fs/promises'
import test from 'node:test'
import {micromark} from 'micromark'
import {rehype} from 'rehype'
import {createGfmFixtures} from 'create-gfm-fixtures'
import {
  gfmAutolinkLiteral,
  gfmAutolinkLiteralHtml
} from 'micromark-extension-gfm-autolink-literal'

test('core', async () => {
  assert.deepEqual(
    Object.keys(
      await import('micromark-extension-gfm-autolink-literal')
    ).sort(),
    ['gfmAutolinkLiteral', 'gfmAutolinkLiteralHtml'],
    'should expose the public api'
  )
})

test('markdown -> html (micromark)', () => {
  assert.deepEqual(
    micromark('www.a.)', {
      extensions: [gfmAutolinkLiteral],
      htmlExtensions: [gfmAutolinkLiteralHtml]
    }),
    '<p><a href="http://www.a">www.a</a>.)</p>',
    'should support a closing paren at TLD'
  )

  assert.deepEqual(
    micromark('www.a b', {
      extensions: [gfmAutolinkLiteral],
      htmlExtensions: [gfmAutolinkLiteralHtml]
    }),
    '<p><a href="http://www.a">www.a</a> b</p>',
    'should support a no TLD'
  )

  assert.deepEqual(
    micromark('www.a/b c', {
      extensions: [gfmAutolinkLiteral],
      htmlExtensions: [gfmAutolinkLiteralHtml]
    }),
    '<p><a href="http://www.a/b">www.a/b</a> c</p>',
    'should support a path instead of TLD'
  )

  assert.deepEqual(
    micromark('www.�a', {
      extensions: [gfmAutolinkLiteral],
      htmlExtensions: [gfmAutolinkLiteralHtml]
    }),
    '<p><a href="http://www.%EF%BF%BDa">www.�a</a></p>',
    'should support a replacement character in a domain'
  )

  assert.deepEqual(
    micromark('http://點看.com', {
      extensions: [gfmAutolinkLiteral],
      htmlExtensions: [gfmAutolinkLiteralHtml]
    }),
    '<p><a href="http://%E9%BB%9E%E7%9C%8B.com">http://點看.com</a></p>',
    'should support non-ascii characters in a domain (http)'
  )

  assert.deepEqual(
    micromark('點看@example.com', {
      extensions: [gfmAutolinkLiteral],
      htmlExtensions: [gfmAutolinkLiteralHtml]
    }),
    '<p>點看@example.com</p>',
    'should *not* support non-ascii characters in atext (email)'
  )

  assert.deepEqual(
    micromark('example@點看.com', {
      extensions: [gfmAutolinkLiteral],
      htmlExtensions: [gfmAutolinkLiteralHtml]
    }),
    '<p>example@點看.com</p>',
    'should *not* support non-ascii characters in a domain (email)'
  )

  assert.deepEqual(
    micromark('www.點看.com', {
      extensions: [gfmAutolinkLiteral],
      htmlExtensions: [gfmAutolinkLiteralHtml]
    }),
    '<p><a href="http://www.%E9%BB%9E%E7%9C%8B.com">www.點看.com</a></p>',
    'should support non-ascii characters in a domain (www)'
  )

  assert.deepEqual(
    micromark('www.a.com/點看', {
      extensions: [gfmAutolinkLiteral],
      htmlExtensions: [gfmAutolinkLiteralHtml]
    }),
    '<p><a href="http://www.a.com/%E9%BB%9E%E7%9C%8B">www.a.com/點看</a></p>',
    'should support non-ascii characters in a path'
  )

  assert.deepEqual(
    micromark('www.-a.b', {
      extensions: [gfmAutolinkLiteral],
      htmlExtensions: [gfmAutolinkLiteralHtml]
    }),
    '<p><a href="http://www.-a.b">www.-a.b</a></p>',
    'should support a dash to start a domain'
  )

  assert.deepEqual(
    micromark('www.$', {
      extensions: [gfmAutolinkLiteral],
      htmlExtensions: [gfmAutolinkLiteralHtml]
    }),
    '<p><a href="http://www.$">www.$</a></p>',
    'should support a dollar as a domain name'
  )

  assert.deepEqual(
    micromark('www.a..b.c', {
      extensions: [gfmAutolinkLiteral],
      htmlExtensions: [gfmAutolinkLiteralHtml]
    }),
    '<p><a href="http://www.a..b.c">www.a..b.c</a></p>',
    'should support adjacent dots in a domain name'
  )

  assert.deepEqual(
    micromark('www.a&a;', {
      extensions: [gfmAutolinkLiteral],
      htmlExtensions: [gfmAutolinkLiteralHtml]
    }),
    '<p><a href="http://www.a">www.a</a>&amp;a;</p>',
    'should support named character references in domains'
  )

  assert.deepEqual(
    micromark('https://a.bc/d/e/).', {
      extensions: [gfmAutolinkLiteral],
      htmlExtensions: [gfmAutolinkLiteralHtml]
    }),
    '<p><a href="https://a.bc/d/e/">https://a.bc/d/e/</a>).</p>',
    'should support a closing paren and period after a path'
  )

  assert.deepEqual(
    micromark('https://a.bc/d/e/.)', {
      extensions: [gfmAutolinkLiteral],
      htmlExtensions: [gfmAutolinkLiteralHtml]
    }),
    '<p><a href="https://a.bc/d/e/">https://a.bc/d/e/</a>.)</p>',
    'should support a period and closing paren after a path'
  )

  assert.deepEqual(
    micromark('https://a.bc).', {
      extensions: [gfmAutolinkLiteral],
      htmlExtensions: [gfmAutolinkLiteralHtml]
    }),
    '<p><a href="https://a.bc">https://a.bc</a>).</p>',
    'should support a closing paren and period after a domain'
  )

  assert.deepEqual(
    micromark('https://a.bc.)', {
      extensions: [gfmAutolinkLiteral],
      htmlExtensions: [gfmAutolinkLiteralHtml]
    }),
    '<p><a href="https://a.bc">https://a.bc</a>.)</p>',
    'should support a period and closing paren after a domain'
  )

  assert.deepEqual(
    micromark('https://a.bc).d', {
      extensions: [gfmAutolinkLiteral],
      htmlExtensions: [gfmAutolinkLiteralHtml]
    }),
    '<p><a href="https://a.bc).d">https://a.bc).d</a></p>',
    'should support a closing paren and period in a path'
  )

  assert.deepEqual(
    micromark('https://a.bc.)d', {
      extensions: [gfmAutolinkLiteral],
      htmlExtensions: [gfmAutolinkLiteralHtml]
    }),
    '<p><a href="https://a.bc.)d">https://a.bc.)d</a></p>',
    'should support a period and closing paren in a path'
  )

  assert.deepEqual(
    micromark('https://a.bc/))d', {
      extensions: [gfmAutolinkLiteral],
      htmlExtensions: [gfmAutolinkLiteralHtml]
    }),
    '<p><a href="https://a.bc/))d">https://a.bc/))d</a></p>',
    'should support two closing parens in a path'
  )

  assert.deepEqual(
    micromark('ftp://a/b/c.txt', {
      extensions: [gfmAutolinkLiteral],
      htmlExtensions: [gfmAutolinkLiteralHtml]
    }),
    '<p>ftp://a/b/c.txt</p>',
    'should not support ftp links'
  )

  // Note: GH comments/issues/PRs do not link this, but Gists/readmes do.
  // To do: Astrals in micromark.
  // assert.deepEqual(
  //   micromark('，www.example.com', {
  //     extensions: [gfmAutolinkLiteral],
  //     htmlExtensions: [gfmAutolinkLiteralHtml]
  //   }),
  //   '<p>，<a href="http://www.example.com">www.example.com</a></p>',
  //   'should support www links after Unicode punctuation'
  // )

  assert.deepEqual(
    micromark('，https://example.com', {
      extensions: [gfmAutolinkLiteral],
      htmlExtensions: [gfmAutolinkLiteralHtml]
    }),
    '<p>，<a href="https://example.com">https://example.com</a></p>',
    'should support http links after Unicode punctuation'
  )

  assert.deepEqual(
    micromark('，example@example.com', {
      extensions: [gfmAutolinkLiteral],
      htmlExtensions: [gfmAutolinkLiteralHtml]
    }),
    '<p>，<a href="mailto:example@example.com">example@example.com</a></p>',
    'should support email links after Unicode punctuation'
  )

  assert.deepEqual(
    micromark('http&#x3A;//user:password@host:port/path?key=value#fragment', {
      extensions: [gfmAutolinkLiteral],
      htmlExtensions: [gfmAutolinkLiteralHtml]
    }),
    '<p>http://user:password@host:port/path?key=value#fragment</p>',
    'should not link character reference for `:`'
  )
})

test('fixtures', async () => {
  const base = new URL('fixtures/', import.meta.url)

  await createGfmFixtures(base)

  const files = await fs.readdir(base)
  const extname = '.md'

  let index = -1

  while (++index < files.length) {
    const d = files[index]

    if (!d.endsWith(extname)) {
      continue
    }

    const name = d.slice(0, -extname.length)
    const input = await fs.readFile(new URL(name + '.md', base))
    let expected = String(await fs.readFile(new URL(name + '.html', base)))
    let actual = micromark(input, {
      extensions: [gfmAutolinkLiteral],
      htmlExtensions: [gfmAutolinkLiteralHtml]
    })

    // Format the character references.
    actual = String(
      await rehype()
        .use({settings: {fragment: true}})
        .process(actual)
    )

    // GH replaces some control codes.
    // eslint-disable-next-line no-control-regex
    actual = actual.replace(/[\u001F\u0085]/g, '�')

    // GH strips images that point to just a search or hash.
    actual = actual.replace(/src="[?#][^"]*"/g, 'src=""')

    // GH doesn’t “fix” the percent-encoding of percentages.
    expected = expected.replace(/%">/g, '%25">')

    // We’re using GHs algo on comments to compare, but we don’t want hard
    // breaks.
    expected = expected.replace(/<br>\n/g, '\n')

    // GH, on comments, does not support algo 2 for www, http, and https links.
    // But it *does* support them for mailto links.
    // We can’t do algo 2 because that requires an AST, so revert the mailto.
    if (
      name === 'combined-with-images.comment' ||
      name === 'combined-with-links.comment'
    ) {
      expected = expected.replace(
        /\[<a href="mailto:a@b\.c">a@b\.c<\/a>/g,
        '[a@b.c'
      )
    }

    assert.deepEqual(actual, expected, name)
  }
})
