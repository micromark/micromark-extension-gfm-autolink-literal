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

test('micromark-extension-gfm-autolink-literal', async function (t) {
  await t.test('should expose the public api', async function () {
    assert.deepEqual(
      Object.keys(
        await import('micromark-extension-gfm-autolink-literal')
      ).sort(),
      ['gfmAutolinkLiteral', 'gfmAutolinkLiteralHtml']
    )
  })

  await t.test(
    'should skip wwwAutolink construct if `disable.null` includes `wwwAutolink`',
    async function () {
      assert.equal(
        micromark('www.a.com', {
          extensions: [
            gfmAutolinkLiteral(),
            {disable: {null: ['wwwAutolink']}}
          ],
          htmlExtensions: [gfmAutolinkLiteralHtml()]
        }),
        '<p>www.a.com</p>'
      )
    }
  )

  await t.test(
    'should skip protocolAutolink construct if `disable.null` includes `protocolAutolink`',
    async function () {
      assert.equal(
        micromark('http://a.com', {
          extensions: [
            gfmAutolinkLiteral(),
            {disable: {null: ['protocolAutolink']}}
          ],
          htmlExtensions: [gfmAutolinkLiteralHtml()]
        }),
        '<p>http://a.com</p>'
      )
    }
  )

  await t.test(
    'should skip emailAutolink construct if `disable.null` includes `emailAutolink`',
    async function () {
      assert.equal(
        micromark('a@b.com', {
          extensions: [
            gfmAutolinkLiteral(),
            {disable: {null: ['emailAutolink']}}
          ],
          htmlExtensions: [gfmAutolinkLiteralHtml()]
        }),
        '<p>a@b.com</p>'
      )
    }
  )


  await t.test('should support a closing paren at TLD', async function () {
    assert.equal(
      micromark('www.a.)', {
        extensions: [gfmAutolinkLiteral()],
        htmlExtensions: [gfmAutolinkLiteralHtml()]
      }),
      '<p><a href="http://www.a">www.a</a>.)</p>'
    )
  })

  await t.test('should support a no TLD', async function () {
    assert.equal(
      micromark('www.a b', {
        extensions: [gfmAutolinkLiteral()],
        htmlExtensions: [gfmAutolinkLiteralHtml()]
      }),
      '<p><a href="http://www.a">www.a</a> b</p>'
    )
  })

  await t.test('should support a path instead of TLD', async function () {
    assert.equal(
      micromark('www.a/b c', {
        extensions: [gfmAutolinkLiteral()],
        htmlExtensions: [gfmAutolinkLiteralHtml()]
      }),
      '<p><a href="http://www.a/b">www.a/b</a> c</p>'
    )
  })

  await t.test(
    'should support a replacement character in a domain',
    async function () {
      assert.equal(
        micromark('www.�a', {
          extensions: [gfmAutolinkLiteral()],
          htmlExtensions: [gfmAutolinkLiteralHtml()]
        }),
        '<p><a href="http://www.%EF%BF%BDa">www.�a</a></p>'
      )
    }
  )

  await t.test(
    'should support non-ascii characters in a domain (http)',
    async function () {
      assert.equal(
        micromark('http://點看.com', {
          extensions: [gfmAutolinkLiteral()],
          htmlExtensions: [gfmAutolinkLiteralHtml()]
        }),
        '<p><a href="http://%E9%BB%9E%E7%9C%8B.com">http://點看.com</a></p>'
      )
    }
  )

  await t.test(
    'should *not* support non-ascii characters in atext (email)',
    async function () {
      assert.equal(
        micromark('點看@example.com', {
          extensions: [gfmAutolinkLiteral()],
          htmlExtensions: [gfmAutolinkLiteralHtml()]
        }),
        '<p>點看@example.com</p>'
      )
    }
  )

  await t.test(
    'should *not* support non-ascii characters in a domain (email)',
    async function () {
      assert.equal(
        micromark('example@點看.com', {
          extensions: [gfmAutolinkLiteral()],
          htmlExtensions: [gfmAutolinkLiteralHtml()]
        }),
        '<p>example@點看.com</p>'
      )
    }
  )

  await t.test(
    'should support non-ascii characters in a domain (www)',
    async function () {
      assert.equal(
        micromark('www.點看.com', {
          extensions: [gfmAutolinkLiteral()],
          htmlExtensions: [gfmAutolinkLiteralHtml()]
        }),
        '<p><a href="http://www.%E9%BB%9E%E7%9C%8B.com">www.點看.com</a></p>'
      )
    }
  )

  await t.test(
    'should support non-ascii characters in a path',
    async function () {
      assert.equal(
        micromark('www.a.com/點看', {
          extensions: [gfmAutolinkLiteral()],
          htmlExtensions: [gfmAutolinkLiteralHtml()]
        }),
        '<p><a href="http://www.a.com/%E9%BB%9E%E7%9C%8B">www.a.com/點看</a></p>'
      )
    }
  )

  await t.test('should support a dash to start a domain', async function () {
    assert.equal(
      micromark('www.-a.b', {
        extensions: [gfmAutolinkLiteral()],
        htmlExtensions: [gfmAutolinkLiteralHtml()]
      }),
      '<p><a href="http://www.-a.b">www.-a.b</a></p>'
    )
  })

  await t.test('should support a dollar as a domain name', async function () {
    assert.equal(
      micromark('www.$', {
        extensions: [gfmAutolinkLiteral()],
        htmlExtensions: [gfmAutolinkLiteralHtml()]
      }),
      '<p><a href="http://www.$">www.$</a></p>'
    )
  })

  await t.test(
    'should support adjacent dots in a domain name',
    async function () {
      assert.equal(
        micromark('www.a..b.c', {
          extensions: [gfmAutolinkLiteral()],
          htmlExtensions: [gfmAutolinkLiteralHtml()]
        }),
        '<p><a href="http://www.a..b.c">www.a..b.c</a></p>'
      )
    }
  )

  await t.test(
    'should support named character references in domains',
    async function () {
      assert.equal(
        micromark('www.a&a;', {
          extensions: [gfmAutolinkLiteral()],
          htmlExtensions: [gfmAutolinkLiteralHtml()]
        }),
        '<p><a href="http://www.a">www.a</a>&amp;a;</p>'
      )
    }
  )

  await t.test(
    'should support a closing paren and period after a path',
    async function () {
      assert.equal(
        micromark('https://a.bc/d/e/).', {
          extensions: [gfmAutolinkLiteral()],
          htmlExtensions: [gfmAutolinkLiteralHtml()]
        }),
        '<p><a href="https://a.bc/d/e/">https://a.bc/d/e/</a>).</p>'
      )
    }
  )

  await t.test(
    'should support a period and closing paren after a path',
    async function () {
      assert.equal(
        micromark('https://a.bc/d/e/.)', {
          extensions: [gfmAutolinkLiteral()],
          htmlExtensions: [gfmAutolinkLiteralHtml()]
        }),
        '<p><a href="https://a.bc/d/e/">https://a.bc/d/e/</a>.)</p>'
      )
    }
  )

  await t.test(
    'should support a closing paren and period after a domain',
    async function () {
      assert.equal(
        micromark('https://a.bc).', {
          extensions: [gfmAutolinkLiteral()],
          htmlExtensions: [gfmAutolinkLiteralHtml()]
        }),
        '<p><a href="https://a.bc">https://a.bc</a>).</p>'
      )
    }
  )

  await t.test(
    'should support a period and closing paren after a domain',
    async function () {
      assert.equal(
        micromark('https://a.bc.)', {
          extensions: [gfmAutolinkLiteral()],
          htmlExtensions: [gfmAutolinkLiteralHtml()]
        }),
        '<p><a href="https://a.bc">https://a.bc</a>.)</p>'
      )
    }
  )

  await t.test(
    'should support a closing paren and period in a path',
    async function () {
      assert.equal(
        micromark('https://a.bc).d', {
          extensions: [gfmAutolinkLiteral()],
          htmlExtensions: [gfmAutolinkLiteralHtml()]
        }),
        '<p><a href="https://a.bc).d">https://a.bc).d</a></p>'
      )
    }
  )

  await t.test(
    'should support a period and closing paren in a path',
    async function () {
      assert.equal(
        micromark('https://a.bc.)d', {
          extensions: [gfmAutolinkLiteral()],
          htmlExtensions: [gfmAutolinkLiteralHtml()]
        }),
        '<p><a href="https://a.bc.)d">https://a.bc.)d</a></p>'
      )
    }
  )

  await t.test(
    'should support two closing parens in a path',
    async function () {
      assert.equal(
        micromark('https://a.bc/))d', {
          extensions: [gfmAutolinkLiteral()],
          htmlExtensions: [gfmAutolinkLiteralHtml()]
        }),
        '<p><a href="https://a.bc/))d">https://a.bc/))d</a></p>'
      )
    }
  )

  await t.test('should not support ftp links', async function () {
    assert.equal(
      micromark('ftp://a/b/c.txt', {
        extensions: [gfmAutolinkLiteral()],
        htmlExtensions: [gfmAutolinkLiteralHtml()]
      }),
      '<p>ftp://a/b/c.txt</p>'
    )
  })

  // Note: GH comments/issues/PRs do not link this, but Gists/readmes do.
  // await t.test(
  //   'should support www links after Unicode punctuation',
  //   async function () {
  //     assert.equal(
  //       micromark('，www.example.com', {
  //         extensions: [gfmAutolinkLiteral()],
  //         htmlExtensions: [gfmAutolinkLiteralHtml()]
  //       }),
  //       '<p>，<a href="http://www.example.com">www.example.com</a></p>'
  //     )
  //   }
  // )

  await t.test(
    'should support http links after Unicode punctuation',
    async function () {
      assert.equal(
        micromark('，https://example.com', {
          extensions: [gfmAutolinkLiteral()],
          htmlExtensions: [gfmAutolinkLiteralHtml()]
        }),
        '<p>，<a href="https://example.com">https://example.com</a></p>'
      )
    }
  )

  await t.test(
    'should support email links after Unicode punctuation',
    async function () {
      assert.equal(
        micromark('，example@example.com', {
          extensions: [gfmAutolinkLiteral()],
          htmlExtensions: [gfmAutolinkLiteralHtml()]
        }),
        '<p>，<a href="mailto:example@example.com">example@example.com</a></p>'
      )
    }
  )

  await t.test(
    'should not link character reference for `:`',
    async function () {
      assert.equal(
        micromark(
          'http&#x3A;//user:password@host:port/path?key=value#fragment',
          {
            extensions: [gfmAutolinkLiteral()],
            htmlExtensions: [gfmAutolinkLiteralHtml()]
          }
        ),
        '<p>http://user:password@host:port/path?key=value#fragment</p>'
      )
    }
  )
})

test('fixtures', async function (t) {
  const base = new URL('fixtures/', import.meta.url)

  await createGfmFixtures(base)

  const files = await fs.readdir(base)
  const extname = '.md'

  for (const d of files) {
    if (!d.endsWith(extname)) {
      continue
    }

    const name = d.slice(0, -extname.length)

    await t.test(name, async function () {
      const input = await fs.readFile(new URL(name + '.md', base))
      let expected = String(await fs.readFile(new URL(name + '.html', base)))
      let actual = micromark(input, {
        extensions: [gfmAutolinkLiteral()],
        htmlExtensions: [gfmAutolinkLiteralHtml()]
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

      // GitHub’s own algorithm to parse autolink literals contains bugs.
      // See: GFM autolink extension (`www.`, `https?://` parts): links don’t work when after bracket
      // <https://github.com/github/cmark-gfm/issues/278)>
      if (name === 'brackets.comment') {
        expected = expected
          .replace(
            /\[]www\.a\.com©b/,
            '[]<a href="http://www.a.com&#x26;copy;b">www.a.com&#x26;copy;b</a>'
          )
          .replace(
            /\[\[]]www\.a\.com©b/,
            '[[]]<a href="http://www.a.com&#x26;copy;b">www.a.com&#x26;copy;b</a>'
          )
      }

      if (name === 'combined-with-links.comment') {
        expected = expected
          .replace(/%5D">/g, '">')
          .replace(/a\.com]<\/a><\/p>/g, 'a.com</a>]</p>')
      }

      if (name === 'domain-character-reference-like-named') {
        expected = expected
          .replace(/%5D">/g, '">')
          .replace(/a&#x26;b]<\/a><\/p>/g, 'a&#x26;b</a>]</p>')
      }

      if (name === 'domain-character-reference-like-numerical') {
        expected = expected
          .replace(/%5D">/g, '">')
          .replace(/a&#x26;#35]<\/a><\/p>/g, 'a&#x26;#35</a>]</p>')
      }

      if (name === 'http-domain-continue') {
        expected = expected
          .replace(/%5D">/g, '">')
          .replace(/a]<\/a><\/p>/g, 'a</a>]</p>')
      }

      if (name === 'http-path-continue') {
        expected = expected
          .replace(/%5D">/g, '">')
          .replace(/a\/b]<\/a><\/p>/g, 'a/b</a>]</p>')
      }

      if (name === 'http-path-start') {
        expected = expected
          .replace(/%5D">/g, '">')
          .replace(/a\/]<\/a><\/p>/g, 'a/</a>]</p>')
      }

      if (name === 'path-character-reference-like-named') {
        expected = expected
          .replace(/%5D">/g, '">')
          .replace(/b&#x26;c]<\/a><\/p>/g, 'b&#x26;c</a>]</p>')
      }

      if (name === 'path-character-reference-like-numerical') {
        expected = expected
          .replace(/%5D">/g, '">')
          .replace(/b&#x26;#35]<\/a><\/p>/g, 'b&#x26;#35</a>]</p>')
      }

      if (name === 'path-or-link-end') {
        expected = expected
          .replace(/%5D\(\)">/g, '">')
          .replace(/d]\(\)<\/a><\/p>/g, 'd</a>]()</p>')
      }

      if (name === 'www-domain-continue') {
        expected = expected
          .replace(/%5D">/g, '">')
          .replace(/a]<\/a><\/p>/g, 'a</a>]</p>')
      }

      if (name === 'www-domain-dot') {
        expected = expected
          .replace(/\.%5D">/g, '">')
          .replace(/a\.]<\/a><\/p>/g, 'a</a>.]</p>')
      }

      if (name === 'www-domain-start.comment') {
        expected = expected
          .replace(/\.%5D">/g, '">')
          .replace(/\.]<\/a><\/p>/g, '</a>.]</p>')
      }

      if (name === 'www-path-continue.comment') {
        expected = expected
          .replace(/%5D">/g, '">')
          .replace(/b]<\/a><\/p>/g, 'b</a>]</p>')
      }

      if (name === 'www-path-start.comment') {
        expected = expected
          .replace(/%5D">/g, '">')
          .replace(/\/]<\/a><\/p>/g, '/</a>]</p>')
      }

      assert.equal(actual, expected)
    })
  }
})
