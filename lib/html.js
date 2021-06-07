import {sanitizeUri} from 'micromark-util-sanitize-uri'

export const gfmAutolinkLiteralHtml = {
  exit: {literalAutolinkEmail, literalAutolinkHttp, literalAutolinkWww}
}

function literalAutolinkWww(token) {
  return anchorFromToken.call(this, token, 'http://')
}

function literalAutolinkEmail(token) {
  return anchorFromToken.call(this, token, 'mailto:')
}

function literalAutolinkHttp(token) {
  return anchorFromToken.call(this, token)
}

function anchorFromToken(token, protocol) {
  const url = this.sliceSerialize(token)
  this.tag('<a href="' + sanitizeUri((protocol || '') + url) + '">')
  this.raw(this.encode(url))
  this.tag('</a>')
}
