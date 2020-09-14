var normalizeUri = require('micromark/dist/util/normalize-uri')

exports.exit = {
  literalAutolinkEmail: literalAutolinkEmail,
  literalAutolinkHttp: literalAutolinkHttp,
  literalAutolinkWww: literalAutolinkWww
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
  var url = this.sliceSerialize(token)
  var href = this.encode(normalizeUri(url))
  this.tag('<a href="' + (protocol || '') + href + '">')
  this.raw(this.encode(url))
  this.tag('</a>')
}
