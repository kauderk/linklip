// https://github.com/phenax/typed-regex
type ReError<T extends string> = { type: T }

// Ref: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/RegExp/RegExp
type Flag = 'd' | 'g' | 'i' | 'm' | 's' | 'u' | 'y'

type FlagChecker<Fl extends string> = Fl extends ''
  ? string
  : Fl extends `${Flag}${infer rest}`
  ? FlagChecker<rest>
  : ReError<`Invalid flag used: ${Fl}`>

type RegExCaptureResult<Re extends string> = Re extends ''
  ? {}
  : Re extends `(?<${infer key}>${infer rest}`
  ? rest extends `${infer _})${infer rest}`
    ? rest extends `?${infer rest}` | `*${infer rest}`
      ? { [k in key]?: string } & RegExCaptureResult<rest>
      : { [k in key]: string } & RegExCaptureResult<rest>
    : never
  : Re extends `${infer _}(?<${infer rest}`
  ? RegExCaptureResult<`(?<${rest}`>
  : {}

type RegExMatchResult<Re extends string> = {
  matched: boolean
  groups?: RegExCaptureResult<Re>
  raw?: RegExpExecArray
}

type RegExMatchAllResult<Re extends string> = Array<{
  groups?: RegExCaptureResult<Re>
  raw: RegExpMatchArray
}>

class TypedRegExT<Re extends string> {
  private _regexString: Re
  private _flags: string

  private getRegex(): RegExp {
    return new RegExp(this._regexString, this._flags)
  }

  constructor(re: Re, flags: string = '') {
    this._regexString = re
    this._flags = flags
  }

  isMatch = (str: string): boolean => this.getRegex().test(str)

  match = (str: string): RegExMatchResult<Re> => {
    const raw = this.getRegex().exec(str)
    return {
      matched: !!raw,
      groups: raw?.groups as any,
      raw: raw || undefined,
    }
  }

  matchAll = (str: string): RegExMatchAllResult<Re> => {
    const re = this.getRegex()
    return Array.from(str.matchAll(re)).map((raw: RegExpMatchArray) => ({
      groups: raw.groups as any,
      raw,
    }))
  }

  captures = (str: string): RegExCaptureResult<Re> | undefined => this.match(str).groups

  captureAll = (str: string): Array<RegExCaptureResult<Re> | undefined> =>
    (this.matchAll(str) as any).map((r: any) => r.groups)
}

export const TypedRegEx = <Re extends string, Fl extends string>(
  re: Re,
  flags?: FlagChecker<Fl> & Fl
) => new TypedRegExT(re, flags)

// TypedRegEx('(?<name>\\w+)').match('hello').groups?.name; // string | undefined
