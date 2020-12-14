var asciiAlpha = require('micromark/dist/character/ascii-alpha')
var asciiAlphanumeric = require('micromark/dist/character/ascii-alphanumeric')
var asciiControl = require('micromark/dist/character/ascii-control')
var markdownLineEnding = require('micromark/dist/character/markdown-line-ending')
var unicodePunctuation = require('micromark/dist/character/unicode-punctuation')
var unicodeWhitespace = require('micromark/dist/character/unicode-whitespace')

var www = {tokenize: tokenizeWww}
var http = {tokenize: tokenizeHttp}
var domain = {tokenize: tokenizeDomain}
var path = {tokenize: tokenizePath}
var punctuation = {tokenize: tokenizePunctuation}
var domainPunctuation = {tokenize: tokenizeDomainPunctuation}
var paren = {tokenize: tokenizeParen}
var namedCharacterReference = {tokenize: tokenizeNamedCharacterReference}

var wwwAutolink = {tokenize: tokenizeWwwAutolink, previous: previous}
var httpAutolink = {tokenize: tokenizeHttpAutolink, previous: previous}
var emailAutolink = {tokenize: tokenizeEmailAutolink, previous: previous}

var text = {}

// Export hooked constructs.
exports.text = text

// `0`
var code = 48

// While the code is smaller than `{`.
while (code < 123) {
  text[code] = emailAutolink
  code++
  // Jump from `:` -> `A`
  if (code === 58) code = 65
  // Jump from `[` -> `a`
  else if (code === 91) code = 97
}

// `+`
text[43] = emailAutolink
// `-`
text[45] = emailAutolink
// `.`
text[46] = emailAutolink
// `_`
text[95] = emailAutolink
// `h`.
text[72] = [emailAutolink, httpAutolink]
text[104] = [emailAutolink, httpAutolink]
// `w`.
text[87] = [emailAutolink, wwwAutolink]
text[119] = [emailAutolink, wwwAutolink]

function tokenizeEmailAutolink(effects, ok, nok) {
  var self = this
  var hasDot

  return start

  function start(code) {
    /* istanbul ignore next - hooks. */
    if (!gfmAtext(code) || !previous(self.previous)) {
      return nok(code)
    }

    effects.enter('literalAutolink')
    effects.enter('literalAutolinkEmail')
    return atext(code)
  }

  function atext(code) {
    if (gfmAtext(code)) {
      effects.consume(code)
      return atext
    }

    // `@`
    if (code === 64) {
      effects.consume(code)
      return label
    }

    return nok(code)
  }

  function label(code) {
    // `.`
    if (code === 46) {
      return effects.check(punctuation, done, dotContinuation)(code)
    }

    if (
      // `-`
      code === 45 ||
      // `_`
      code === 95
    ) {
      return effects.check(punctuation, nok, dashOrUnderscoreContinuation)(code)
    }

    if (asciiAlphanumeric(code)) {
      effects.consume(code)
      return label
    }

    return done(code)
  }

  function dotContinuation(code) {
    effects.consume(code)
    hasDot = true
    return label
  }

  function dashOrUnderscoreContinuation(code) {
    effects.consume(code)
    return afterDashOrUnderscore
  }

  function afterDashOrUnderscore(code) {
    // `.`
    if (code === 46) {
      return effects.check(punctuation, nok, dotContinuation)(code)
    }

    return label(code)
  }

  function done(code) {
    if (hasDot) {
      effects.exit('literalAutolinkEmail')
      effects.exit('literalAutolink')
      return ok(code)
    }

    return nok(code)
  }
}

function tokenizeWwwAutolink(effects, ok, nok) {
  var self = this

  return start

  function start(code) {
    /* istanbul ignore next - hooks. */
    if ((code !== 87 && code - 32 !== 87) || !previous(self.previous)) {
      return nok(code)
    }

    effects.enter('literalAutolink')
    effects.enter('literalAutolinkWww')
    return effects.check(
      www,
      effects.attempt(domain, effects.attempt(path, done), nok),
      nok
    )(code)
  }

  function done(code) {
    effects.exit('literalAutolinkWww')
    effects.exit('literalAutolink')
    return ok(code)
  }
}

function tokenizeHttpAutolink(effects, ok, nok) {
  var self = this

  return start

  function start(code) {
    /* istanbul ignore next - hooks. */
    if ((code !== 72 && code - 32 !== 72) || !previous(self.previous)) {
      return nok(code)
    }

    effects.enter('literalAutolink')
    effects.enter('literalAutolinkHttp')
    return effects.check(
      http,
      effects.attempt(domain, effects.attempt(path, done), nok),
      nok
    )(code)
  }

  function done(code) {
    effects.exit('literalAutolinkHttp')
    effects.exit('literalAutolink')
    return ok(code)
  }
}

function tokenizeHttp(effects, ok, nok) {
  return start

  function start(code) {
    // Assume a `h`.
    effects.consume(code)
    return t1
  }

  function t1(code) {
    // `t`
    if (code === 84 || code - 32 === 84) {
      effects.consume(code)
      return t2
    }

    return nok(code)
  }

  function t2(code) {
    // `t`
    if (code === 84 || code - 32 === 84) {
      effects.consume(code)
      return p
    }

    return nok(code)
  }

  function p(code) {
    // `p`
    if (code === 80 || code - 32 === 80) {
      effects.consume(code)
      return s
    }

    return nok(code)
  }

  function s(code) {
    // `s`
    if (code === 83 || code - 32 === 83) {
      effects.consume(code)
      return colon
    }

    return colon(code)
  }

  function colon(code) {
    // `:`
    if (code === 58) {
      effects.consume(code)
      return slash1
    }

    return nok(code)
  }

  function slash1(code) {
    // `/`
    if (code === 47) {
      effects.consume(code)
      return slash2
    }

    return nok(code)
  }

  function slash2(code) {
    // `/`
    if (code === 47) {
      effects.consume(code)
      return after
    }

    return nok(code)
  }

  function after(code) {
    return asciiControl(code) ||
      unicodeWhitespace(code) ||
      unicodePunctuation(code)
      ? nok(code)
      : ok(code)
  }
}

function tokenizeWww(effects, ok, nok) {
  return start

  function start(code) {
    // Assume a `w`.
    effects.consume(code)
    return w2
  }

  function w2(code) {
    // `w`
    if (code === 87 || code - 32 === 87) {
      effects.consume(code)
      return w3
    }

    return nok(code)
  }

  function w3(code) {
    // `w`
    if (code === 87 || code - 32 === 87) {
      effects.consume(code)
      return dot
    }

    return nok(code)
  }

  function dot(code) {
    // `.`
    if (code === 46) {
      effects.consume(code)
      return after
    }

    return nok(code)
  }

  function after(code) {
    return code === null || markdownLineEnding(code) ? nok(code) : ok(code)
  }
}

function tokenizeDomain(effects, ok, nok) {
  var opened
  var hasUnderscoreInLastSegment
  var hasUnderscoreInLastLastSegment

  return domain

  function domain(code) {
    if (
      // `/`
      code === 47 ||
      asciiControl(code) ||
      unicodeWhitespace(code)
    ) {
      return done(code)
    }

    // `&`
    if (code === 38) {
      return effects.check(
        namedCharacterReference,
        done,
        punctuationContinuation
      )(code)
    }

    if (
      // `.`
      code === 46 ||
      trailingPunctuation(code)
    ) {
      return effects.check(
        domainPunctuation,
        done,
        punctuationContinuation
      )(code)
    }

    open()
    effects.consume(code)
    return domain
  }

  function punctuationContinuation(code) {
    // `.`
    if (code === 46) {
      hasUnderscoreInLastLastSegment = hasUnderscoreInLastSegment
      hasUnderscoreInLastSegment = undefined
      open()
      effects.consume(code)
      return domain
    }

    // `_`
    if (code === 95) hasUnderscoreInLastSegment = true

    open()
    effects.consume(code)
    return domain
  }

  function open() {
    if (!opened) {
      effects.enter('literalAutolinkDomain')
      opened = true
    }
  }

  function done(code) {
    if (
      opened &&
      !hasUnderscoreInLastLastSegment &&
      !hasUnderscoreInLastSegment
    ) {
      effects.exit('literalAutolinkDomain')
      return ok(code)
    }

    return nok(code)
  }
}

function tokenizePath(effects, ok) {
  var balance = 0

  return start

  function start(code) {
    // `/`
    return code === 47 ? atPathStart(code) : ok(code)
  }

  function atPathStart(code) {
    effects.enter('literalAutolinkPath')
    return inPath(code)
  }

  function inPath(code) {
    // `&`
    if (code === 38) {
      return effects.check(
        namedCharacterReference,
        atPathEnd,
        continuedPunctuation
      )(code)
    }

    // `(`
    if (code === 40) {
      balance++
    }

    // `)`
    if (code === 41) {
      return effects.check(paren, parenAtPathEnd, continuedPunctuation)(code)
    }

    if (pathEnd(code)) {
      return atPathEnd(code)
    }

    if (trailingPunctuation(code)) {
      return effects.check(punctuation, atPathEnd, continuedPunctuation)(code)
    }

    effects.consume(code)
    return inPath
  }

  function continuedPunctuation(code) {
    effects.consume(code)
    return inPath
  }

  function parenAtPathEnd(code) {
    balance--
    return balance < 0 ? atPathEnd(code) : continuedPunctuation(code)
  }

  function atPathEnd(code) {
    effects.exit('literalAutolinkPath')
    return ok(code)
  }
}

function tokenizeNamedCharacterReference(effects, ok, nok) {
  return start

  function start(code) {
    // Assume an ampersand.
    effects.enter('literalAutolinkCharacterReferenceNamed')
    effects.consume(code)
    return inside
  }

  function inside(code) {
    if (asciiAlpha(code)) {
      effects.consume(code)
      return inside
    }

    // `;`
    if (code === 59) {
      effects.consume(code)
      return after
    }

    return nok(code)
  }

  function after(code) {
    // If the named character reference is followed by the end of the path, it’s
    // not continued punctuation.
    effects.exit('literalAutolinkCharacterReferenceNamed')
    return pathEnd(code) ? ok(code) : nok(code)
  }
}

function tokenizeParen(effects, ok, nok) {
  return start

  function start(code) {
    // Assume a right paren.
    effects.enter('literalAutolinkParen')
    effects.consume(code)
    return after
  }

  function after(code) {
    // If the punctuation marker is followed by the end of the path, it’s not
    // continued punctuation.
    effects.exit('literalAutolinkParen')
    return pathEnd(code) ||
      // `)`
      code === 41
      ? ok(code)
      : nok(code)
  }
}

function tokenizePunctuation(effects, ok, nok) {
  return start

  function start(code) {
    effects.enter('literalAutolinkPunctuation')
    // Always a valid trailing punctuation marker.
    effects.consume(code)
    return after
  }

  function after(code) {
    // If the punctuation marker is followed by the end of the path, it’s not
    // continued punctuation.
    effects.exit('literalAutolinkPunctuation')
    return pathEnd(code) ? ok(code) : nok(code)
  }
}

function tokenizeDomainPunctuation(effects, ok, nok) {
  return start

  function start(code) {
    effects.enter('literalAutolinkPunctuation')
    // Always a valid trailing punctuation marker.
    effects.consume(code)
    return after
  }

  function after(code) {
    // Check the next.
    if (trailingPunctuation(code)) {
      effects.consume(code)
      return after
    }

    // If the punctuation marker is followed by the end of the path, it’s not
    // continued punctuation.
    effects.exit('literalAutolinkPunctuation')
    return pathEnd(code) ? ok(code) : nok(code)
  }
}

function trailingPunctuation(code) {
  return (
    // `!`
    code === 33 ||
    // `"`
    code === 34 ||
    // `'`
    code === 39 ||
    // `)`
    code === 41 ||
    // `*`
    code === 42 ||
    // `,`
    code === 44 ||
    // `.`
    code === 46 ||
    // `:`
    code === 58 ||
    // `;`
    code === 59 ||
    // `<`
    code === 60 ||
    // `?`
    code === 63 ||
    // `_`.
    code === 95 ||
    // `~`
    code === 126
  )
}

function pathEnd(code) {
  return (
    // EOF.
    code === null ||
    // CR, LF, CRLF, HT, VS.
    code < 0 ||
    // Space.
    code === 32 ||
    // `<`
    code === 60
  )
}

function gfmAtext(code) {
  return (
    // `+`
    code === 43 ||
    // `-`
    code === 45 ||
    // `.`
    code === 46 ||
    // `_`
    code === 95 ||
    asciiAlphanumeric(code)
  )
}

function previous(code) {
  return (
    // EOF.
    code === null ||
    // CR, LF, CRLF, HT, VS.
    code < 0 ||
    // Space.
    code === 32 ||
    // `(`
    code === 40 ||
    // `*`
    code === 42 ||
    // `_`.
    code === 95 ||
    // `~`
    code === 126
  )
}
