interface TArgs<T = number> {
  value?: T
  alias?: string[]
}
type Initializer<T> = T extends Function ? never : T | ((crr: T) => T)
function set<T>(this: Param<T>, arg: Initializer<T>) {
  if (typeof arg === 'function') {
    this.value = arg(this.value)
  } else {
    this.value = arg as T
  }
}
function setDefault(this: TNumParam, arg?: number) {
  arg ??= this.value
  this.value = arg
  this.default = arg
}
class Param<T> {
  value
  readonly alias
  readonly set = set
  constructor(_value: T, args?: TArgs<T>) {
    this.value = args?.value ?? _value
    this.alias = args?.alias ?? []
  }
}
class NumHistory extends Param<number> {
  constructor(args?: TArgs) {
    super(0, args)
  }
  update = this.value
  readonly history: number[] = []
}
class TNumParam extends Param<number> {
  constructor(args?: TArgs) {
    super(0, args)
  }
  default = this.value
  readonly setDefault = setDefault
}
class StrParam extends Param<string> {
  constructor(args?: TArgs<string>) {
    super('', args)
  }
}
class BolParam extends Param<boolean> {
  constructor(args?: TArgs<boolean>) {
    super(false, args)
  }
}
const getPlayerVol = () => 40
export class TVideoParams {
  readonly id = new StrParam({ value: '---------' })
  readonly src = new StrParam({
    value: 'https://www.youtube.com/embed/---------?',
  })
  readonly speed = {
    ...new TNumParam({ value: 1, alias: ['s'] }),
    tick: 1000 / 1,
  }
  readonly start = new TNumParam({ alias: ['t'] })
  readonly end = new TNumParam()

  readonly updateTime = new TNumParam()
  readonly timestamps = new NumHistory()
  readonly volume = new NumHistory({ value: getPlayerVol(), alias: ['vl'] })
}
export class IExtendedVideoParams extends TVideoParams {
  readonly hl = new StrParam()
  readonly cc = new StrParam()
  readonly sp = new StrParam()
  readonly mute = new BolParam()
  readonly playRightAway = new BolParam()
}
