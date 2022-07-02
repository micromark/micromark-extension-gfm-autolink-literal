# micromark-extension-gfm-autolink-literal

[![Build][build-badge]][build]
[![Coverage][coverage-badge]][coverage]
[![Downloads][downloads-badge]][downloads]
[![Size][size-badge]][size]
[![Sponsors][sponsors-badge]][collective]
[![Backers][backers-badge]][collective]
[![Chat][chat-badge]][chat]

[micromark][] extension support GFM [literal autolinks][spec].

## Contents

*   [What is this?](#what-is-this)
*   [When to use this](#when-to-use-this)
*   [Install](#install)
*   [Use](#use)
*   [API](#api)
    *   [`gfmAutolinkLiteral`](#gfmautolinkliteral)
    *   [`gfmAutolinkLiteralHtml`](#gfmautolinkliteralhtml)
*   [Authoring](#authoring)
*   [HTML](#html)
*   [CSS](#css)
*   [Syntax](#syntax)
*   [Types](#types)
*   [Compatibility](#compatibility)
*   [Security](#security)
*   [Related](#related)
*   [Contribute](#contribute)
*   [License](#license)

## What is this?

This package contains extensions that add support for the autolink syntax
enabled by GFM to [`micromark`][micromark].

GitHub employs different algorithms to autolink: one at parse time and one at
transform time (similar to how @mentions are done at transform time).
This difference can be observed because character references and escapes are
handled differently.
But also because issues/PRs/comments omit (perhaps by accident?) the second
algorithm for `www.`, `http://`, and `https://` links (but not for email links).

As this is a syntax extension, it focuses on the first algorithm.
The second algorithm is performed by [`mdast-util-gfm-autolink-literal`][util].
The `html` part of this micromark extension does not operate on an AST and hence
can’t perform the second algorithm.

## When to use this

These tools are all low-level.
In many cases, you want to use [`remark-gfm`][plugin] with remark instead.

Even when you want to use `micromark`, you likely want to use
[`micromark-extension-gfm`][micromark-extension-gfm] to support all GFM
features.
That extension includes this extension.

When working with `mdast-util-from-markdown`, you must combine this package with
[`mdast-util-gfm-autolink-literal`][util].

## Install

This package is [ESM only][esm].
In Node.js (version 12.20+, 14.14+, 16.0+, or 18.0+), install with [npm][]:

```sh
npm install micromark-extension-gfm-autolink-literal
```

In Deno with [`esm.sh`][esmsh]:

```js
import {gfmAutolinkLiteral, gfmAutolinkLiteralHtml} from 'https://esm.sh/micromark-extension-gfm-autolink-literal@1'
```

In browsers with [`esm.sh`][esmsh]:

```html
<script type="module">
  import {gfmAutolinkLiteral, gfmAutolinkLiteralHtml} from 'https://esm.sh/micromark-extension-gfm-autolink-literal@1?bundle'
</script>
```

## Use

```js
import {micromark} from 'micromark'
import {
  gfmAutolinkLiteral,
  gfmAutolinkLiteralHtml
} from 'micromark-extension-gfm-autolink-literal'

const output = micromark('Just a URL: www.example.com.', {
  extensions: [gfmAutolinkLiteral],
  htmlExtensions: [gfmAutolinkLiteralHtml]
})

console.log(output)
```

Yields:

```html
<p>Just a URL: <a href="http://www.example.com">www.example.com</a>.</p>
```

## API

This package exports the identifiers `gfmAutolinkLiteral` and
`gfmAutolinkLiteralHtml`.
There is no default export.

The export map supports the endorsed [`development` condition][condition].
Run `node --conditions development module.js` to get instrumented dev code.
Without this condition, production code is loaded.

### `gfmAutolinkLiteral`

Syntax extension for micromark (passed in `extensions`).

### `gfmAutolinkLiteralHtml`

HTML extension for micromark (can be passed in `htmlExtensions`).

## Authoring

When authoring markdown, it’s recommended *not* to use this construct.
It is fragile (easy to get wrong) and not pretty to readers (it’s presented as
just a URL, there is no descriptive text).
Instead, use link (resource) or link (label):

```markdown
Instead of https://example.com (worst), use <https://example.com> (better),
or [link (resource)](https://example.com) or [link (reference)][ref] (best).

[ref]: https://example.com
```

When authoring markdown where the source does not matter (such as comments to
some page), it can be useful to quickly paste URLs, and this will mostly work.

## HTML

GFM autolink literals, similar to normal CommonMark autolinks (such as
`<https://example.com>`), relate to the `<a>` element in HTML.
See [*§ 4.5.1 The `a` element*][html] in the HTML spec for more info.
When an email autolink is used, the string `mailto:` is prepended before the
email, when generating the `href` attribute of the hyperlink.
When a `www` autolink is used, the string `http://` is prepended.

## CSS

As hyperlinks are the fundamental thing that makes the web, you will most
definitely have CSS for `a` elements already.
The same CSS can be used for autolink literals, too.

GitHub itself does not apply interesting CSS to autolink literals.
For any link, it currently (June 2022) [uses][css]:

```css
a {
  background-color: transparent;
  color: #58a6ff;
  text-decoration: none;
}

a:active,
a:hover {
  outline-width: 0;
}

a:hover {
  text-decoration: underline;
}

a:not([href]) {
  color: inherit;
  text-decoration: none;
}
```

## Syntax

Autolink literals are very complex to parse.
They form with, roughly, the following BNF:

```bnf
; Restriction: not allowed to be in unbalanced braces.
autolink ::= www-autolink | http-autolink | email-autolink

; Restriction: the code before must be `www-autolink-before`.
www-autolink ::= 3( "w" | "W" ) "." [ domain [ path ] ]
www-autolink-before ::= eof | eol | space-or-tab | "(" | "*" | "_" | "~"

; Restriction: the code before must be `http-autolink-before`.
; Restriction: the code after the protocol must be `http-autolink-protocol-after`.
http-autolink ::= ( "h" | "H" ) 2( "t" | "T" ) ( "p" | "P" ) [ "s" | "S" ] ":" 2"/" domain [ path ]
http-autolink-before ::= code - ascii-alpha
http-autolink-protocol-after ::= code - eof - eol - ascii-control - unicode-whitespace - unicode-punctuation

; Restriction: the code before must be `email-autolink-before`.
; Restriction: `ascii-digit` may not occur in the last label part of the label.
email-autolink ::= 1*( "+" | "-" | "." | "_" | ascii-alphanumeric ) "@" 1*( 1*label-segment label-dot-cont ) 1*label-segment
email-autolink-before ::= code - ascii-alpha - "/"

; Restriction: `_` may not occur in the last two domain parts.
domain ::= 1*( url-ampt-cont | domain-punct-cont | "-" | code - eof - ascii-control - unicode-whitespace - unicode-punctuation )
; Restriction: must not be followed by `punct`.
domain-punct-cont ::= "." | "_"
; Restriction: must not be followed by `char-ref`.
url-ampt-cont ::= "&"

; Restriction: a counter `balance = 0` is increased for every `(`, and decreased for every `)`.
; Restriction: `)` must not be `paren-at-end`.
path ::= 1*( url-ampt-cont | path-punctuation-cont | "(" | ")" | code - eof - eol - space-or-tab )
; Restriction: must not be followed by `punct`.
path-punctuation-cont ::= trailing-punctuation - "<"
; Restriction: must be followed by `punct` and `balance` must be less than `0`.
paren-at-end ::= ")"

label-segment ::= label-dash-underscore-cont | ascii-alpha | ascii-digit
; Restriction: if followed by `punct`, the whole email autolink is invalid.
label-dash-underscore-cont ::= "-" | "_"
; Restriction: must not be followed by `punct`.
label-dot-cont ::= "."

punct ::= *trailing-punctuation ( code - eof - eol - space-or-tab - "<" )
char-ref ::= *ascii-alpha ";" path-end
trailing-punctuation ::= "!" | "\"" | "'" | ")" | "*" | "," | "." | ":" | ";" | "<" | '?' | '_' | '~'
```

## Types

This package is fully typed with [TypeScript][].
It exports no additional types.

## Compatibility

This package is at least compatible with all maintained versions of Node.js.
As of now, that is Node.js 12.20+, 14.14+, 16.0+, and 18.0+.
It also works in Deno and modern browsers.

## Security

This package is safe.
Unlike other links in CommonMark, which allow arbitrary protocols, this
construct always produces safe links.

## Related

*   [`syntax-tree/mdast-util-gfm-autolink-literal`][util]
    — support GFM autolink literals in mdast
*   [`syntax-tree/mdast-util-gfm`][mdast-util-gfm]
    — support GFM in mdast
*   [`remarkjs/remark-gfm`][plugin]
    — support GFM in remark

## Contribute

See [`contributing.md` in `micromark/.github`][contributing] for ways to get
started.
See [`support.md`][support] for ways to get help.

This project has a [code of conduct][coc].
By interacting with this repository, organization, or community you agree to
abide by its terms.

## License

[MIT][license] © [Titus Wormer][author]

<!-- Definitions -->

[build-badge]: https://github.com/micromark/micromark-extension-gfm-autolink-literal/workflows/main/badge.svg

[build]: https://github.com/micromark/micromark-extension-gfm-autolink-literal/actions

[coverage-badge]: https://img.shields.io/codecov/c/github/micromark/micromark-extension-gfm-autolink-literal.svg

[coverage]: https://codecov.io/github/micromark/micromark-extension-gfm-autolink-literal

[downloads-badge]: https://img.shields.io/npm/dm/micromark-extension-gfm-autolink-literal.svg

[downloads]: https://www.npmjs.com/package/micromark-extension-gfm-autolink-literal

[size-badge]: https://img.shields.io/bundlephobia/minzip/micromark-extension-gfm-autolink-literal.svg

[size]: https://bundlephobia.com/result?p=micromark-extension-gfm-autolink-literal

[sponsors-badge]: https://opencollective.com/unified/sponsors/badge.svg

[backers-badge]: https://opencollective.com/unified/backers/badge.svg

[collective]: https://opencollective.com/unified

[chat-badge]: https://img.shields.io/badge/chat-discussions-success.svg

[chat]: https://github.com/micromark/micromark/discussions

[npm]: https://docs.npmjs.com/cli/install

[esmsh]: https://esm.sh

[license]: license

[author]: https://wooorm.com

[contributing]: https://github.com/micromark/.github/blob/HEAD/contributing.md

[support]: https://github.com/micromark/.github/blob/HEAD/support.md

[coc]: https://github.com/micromark/.github/blob/HEAD/code-of-conduct.md

[esm]: https://gist.github.com/sindresorhus/a39789f98801d908bbc7ff3ecc99d99c

[typescript]: https://www.typescriptlang.org

[condition]: https://nodejs.org/api/packages.html#packages_resolving_user_conditions

[util]: https://github.com/syntax-tree/mdast-util-gfm-autolink-literal

[plugin]: https://github.com/remarkjs/remark-gfm

[spec]: https://github.github.com/gfm/#autolinks-extension-

[html]: https://html.spec.whatwg.org/multipage/text-level-semantics.html#the-a-element

[css]: https://github.com/sindresorhus/github-markdown-css

[micromark]: https://github.com/micromark/micromark

[micromark-extension-gfm]: https://github.com/micromark/micromark-extension-gfm

[mdast-util-gfm]: https://github.com/syntax-tree/mdast-util-gfm
