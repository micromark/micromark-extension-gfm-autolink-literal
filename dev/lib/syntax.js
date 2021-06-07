import assert from 'assert'
import {
  asciiAlpha,
  asciiAlphanumeric,
  asciiControl,
  markdownLineEndingOrSpace,
  markdownLineEnding,
  unicodePunctuation,
  unicodeWhitespace
} from 'micromark-util-character'
import {codes} from 'micromark-util-symbol/codes.js'

const www = {tokenize: tokenizeWww, partial: true}
const domain = {tokenize: tokenizeDomain, partial: true}
const path = {tokenize: tokenizePath, partial: true}
const punctuation = {tokenize: tokenizePunctuation, partial: true}
const namedCharacterReference = {
  tokenize: tokenizeNamedCharacterReference,
  partial: true
}

const wwwAutolink = {tokenize: tokenizeWwwAutolink, previous: previousWww}
const httpAutolink = {tokenize: tokenizeHttpAutolink, previous: previousHttp}
const emailAutolink = {tokenize: tokenizeEmailAutolink, previous: previousEmail}

const text = {}

// Export hooked constructs.
export const gfmAutolinkLiteral = {text}

let code = codes.digit0

// Add alphanumerics.
while (code < codes.leftCurlyBrace) {
  text[code] = emailAutolink
  code++
  if (code === codes.colon) code = codes.uppercaseA
  else if (code === codes.leftSquareBracket) code = codes.lowercaseA
}

text[codes.plusSign] = emailAutolink
text[codes.dash] = emailAutolink
text[codes.dot] = emailAutolink
text[codes.underscore] = emailAutolink
text[codes.uppercaseH] = [emailAutolink, httpAutolink]
text[codes.lowercaseH] = [emailAutolink, httpAutolink]
text[codes.uppercaseW] = [emailAutolink, wwwAutolink]
text[codes.lowercaseW] = [emailAutolink, wwwAutolink]

function tokenizeEmailAutolink(effects, ok, nok) {
  const self = this
  let hasDot

  return start

  function start(code) {
    if (
      !gfmAtext(code) ||
      !previousEmail(self.previous) ||
      previous(self.events)
    ) {
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

    if (code === codes.atSign) {
      effects.consume(code)
      return label
    }

    return nok(code)
  }

  function label(code) {
    if (code === codes.dot) {
      return effects.check(punctuation, done, dotContinuation)(code)
    }

    if (code === codes.dash || code === codes.underscore) {
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
    if (code === codes.dot) {
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
  const self = this

  return start

  function start(code) {
    if (
      (code !== codes.uppercaseW && code !== codes.lowercaseW) ||
      !previousWww(self.previous) ||
      previous(self.events)
    ) {
      return nok(code)
    }

    effects.enter('literalAutolink')
    effects.enter('literalAutolinkWww')
    // For `www.` we check instead of attempt, because when it matches, GH
    // treats it as part of a domain (yes, it says a valid domain must come
    // after `www.`, but that’s not how it’s implemented by them).
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
  const self = this

  return start

  function start(code) {
    if (
      (code !== codes.uppercaseH && code !== codes.lowercaseH) ||
      !previousHttp(self.previous) ||
      previous(self.events)
    ) {
      return nok(code)
    }

    effects.enter('literalAutolink')
    effects.enter('literalAutolinkHttp')
    effects.consume(code)
    return t1
  }

  function t1(code) {
    if (code === codes.uppercaseT || code === codes.lowercaseT) {
      effects.consume(code)
      return t2
    }

    return nok(code)
  }

  function t2(code) {
    if (code === codes.uppercaseT || code === codes.lowercaseT) {
      effects.consume(code)
      return p
    }

    return nok(code)
  }

  function p(code) {
    if (code === codes.uppercaseP || code === codes.lowercaseP) {
      effects.consume(code)
      return s
    }

    return nok(code)
  }

  function s(code) {
    if (code === codes.uppercaseS || code === codes.lowercaseS) {
      effects.consume(code)
      return colon
    }

    return colon(code)
  }

  function colon(code) {
    if (code === codes.colon) {
      effects.consume(code)
      return slash1
    }

    return nok(code)
  }

  function slash1(code) {
    if (code === codes.slash) {
      effects.consume(code)
      return slash2
    }

    return nok(code)
  }

  function slash2(code) {
    if (code === codes.slash) {
      effects.consume(code)
      return after
    }

    return nok(code)
  }

  function after(code) {
    return code === codes.eof ||
      asciiControl(code) ||
      unicodeWhitespace(code) ||
      unicodePunctuation(code)
      ? nok(code)
      : effects.attempt(domain, effects.attempt(path, done), nok)(code)
  }

  function done(code) {
    effects.exit('literalAutolinkHttp')
    effects.exit('literalAutolink')
    return ok(code)
  }
}

function tokenizeWww(effects, ok, nok) {
  return start

  function start(code) {
    assert(
      code === codes.uppercaseW || code === codes.lowercaseW,
      'expected `w`'
    )
    effects.consume(code)
    return w2
  }

  function w2(code) {
    if (code === codes.uppercaseW || code === codes.lowercaseW) {
      effects.consume(code)
      return w3
    }

    return nok(code)
  }

  function w3(code) {
    if (code === codes.uppercaseW || code === codes.lowercaseW) {
      effects.consume(code)
      return dot
    }

    return nok(code)
  }

  function dot(code) {
    if (code === codes.dot) {
      effects.consume(code)
      return after
    }

    return nok(code)
  }

  function after(code) {
    return code === codes.eof || markdownLineEnding(code) ? nok(code) : ok(code)
  }
}

function tokenizeDomain(effects, ok, nok) {
  let hasUnderscoreInLastSegment
  let hasUnderscoreInLastLastSegment

  return domain

  function domain(code) {
    if (code === codes.ampersand) {
      return effects.check(
        namedCharacterReference,
        done,
        punctuationContinuation
      )(code)
    }

    if (code === codes.dot || code === codes.underscore) {
      return effects.check(punctuation, done, punctuationContinuation)(code)
    }

    // GH documents that only alphanumerics (other than `-`, `.`, and `_`) can
    // occur, which sounds like ASCII only, but they also support `www.點看.com`,
    // so that’s Unicode.
    // Instead of some new production for Unicode alphanumerics, markdown
    // already has that for Unicode punctuation and whitespace, so use those.
    if (
      code === codes.eof ||
      asciiControl(code) ||
      unicodeWhitespace(code) ||
      (code !== codes.dash && unicodePunctuation(code))
    ) {
      return done(code)
    }

    effects.consume(code)
    return domain
  }

  function punctuationContinuation(code) {
    if (code === codes.dot) {
      hasUnderscoreInLastLastSegment = hasUnderscoreInLastSegment
      hasUnderscoreInLastSegment = undefined
      effects.consume(code)
      return domain
    }

    if (code === codes.underscore) hasUnderscoreInLastSegment = true

    effects.consume(code)
    return domain
  }

  function done(code) {
    if (!hasUnderscoreInLastLastSegment && !hasUnderscoreInLastSegment) {
      return ok(code)
    }

    return nok(code)
  }
}

function tokenizePath(effects, ok) {
  let balance = 0

  return inPath

  function inPath(code) {
    if (code === codes.ampersand) {
      return effects.check(
        namedCharacterReference,
        ok,
        continuedPunctuation
      )(code)
    }

    if (code === codes.leftParenthesis) {
      balance++
    }

    if (code === codes.rightParenthesis) {
      return effects.check(
        punctuation,
        parenAtPathEnd,
        continuedPunctuation
      )(code)
    }

    if (pathEnd(code)) {
      return ok(code)
    }

    if (trailingPunctuation(code)) {
      return effects.check(punctuation, ok, continuedPunctuation)(code)
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
    return balance < 0 ? ok(code) : continuedPunctuation(code)
  }
}

function tokenizeNamedCharacterReference(effects, ok, nok) {
  return start

  function start(code) {
    assert(code === codes.ampersand, 'expected `&`')
    effects.consume(code)
    return inside
  }

  function inside(code) {
    if (asciiAlpha(code)) {
      effects.consume(code)
      return inside
    }

    if (code === codes.semicolon) {
      effects.consume(code)
      return after
    }

    return nok(code)
  }

  function after(code) {
    // If the named character reference is followed by the end of the path, it’s
    // not continued punctuation.
    return pathEnd(code) ? ok(code) : nok(code)
  }
}

function tokenizePunctuation(effects, ok, nok) {
  return start

  function start(code) {
    assert(trailingPunctuation(code), 'expected punctuation')
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
    return pathEnd(code) ? ok(code) : nok(code)
  }
}

function trailingPunctuation(code) {
  return (
    code === codes.exclamationMark ||
    code === codes.quotationMark ||
    code === codes.apostrophe ||
    code === codes.rightParenthesis ||
    code === codes.asterisk ||
    code === codes.comma ||
    code === codes.dot ||
    code === codes.colon ||
    code === codes.semicolon ||
    code === codes.lessThan ||
    code === codes.questionMark ||
    code === codes.underscore ||
    code === codes.tilde
  )
}

function pathEnd(code) {
  return (
    code === codes.eof ||
    code === codes.lessThan ||
    markdownLineEndingOrSpace(code)
  )
}

function gfmAtext(code) {
  return (
    code === codes.plusSign ||
    code === codes.dash ||
    code === codes.dot ||
    code === codes.underscore ||
    asciiAlphanumeric(code)
  )
}

function previousWww(code) {
  return (
    code === codes.eof ||
    code === codes.leftParenthesis ||
    code === codes.asterisk ||
    code === codes.underscore ||
    code === codes.tilde ||
    markdownLineEndingOrSpace(code)
  )
}

function previousHttp(code) {
  return code === codes.eof || !asciiAlpha(code)
}

function previousEmail(code) {
  return code !== codes.slash && previousHttp(code)
}

function previous(events) {
  let index = events.length

  while (index--) {
    if (
      (events[index][1].type === 'labelLink' ||
        events[index][1].type === 'labelImage') &&
      !events[index][1]._balanced
    ) {
      return true
    }
  }
}
