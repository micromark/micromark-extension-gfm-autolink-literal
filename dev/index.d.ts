export {gfmAutolinkLiteral} from './lib/syntax.js'
export {gfmAutolinkLiteralHtml} from './lib/html.js'

/**
 * Augment types.
 */
declare module 'micromark-util-types' {
  /**
   * Augment token with fields to improve performance.
   */
  interface Token {
    _gfmAutolinkLiteralWalkedInto?: boolean
    _gfmAutolinkLiteralSkipTo?: {
      index: number
      token: Token
    }
  }

  /**
   * Token types.
   */
  interface TokenTypeMap {
    literalAutolink: 'literalAutolink'
    literalAutolinkEmail: 'literalAutolinkEmail'
    literalAutolinkHttp: 'literalAutolinkHttp'
    literalAutolinkWww: 'literalAutolinkWww'
  }
}
