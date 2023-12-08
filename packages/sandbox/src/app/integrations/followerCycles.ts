import { preSignal, type PreSignal } from '$lib/pre-signal'
import { signal } from '@preact/signals-core'
// @ts-ignore
import type { resizeMode } from '../Resize.svelte'
import type { FollowerCycle } from '../controller/follower'
import { createDefaultStage } from '../follower/store'

export function aspectRatioFrom(aspectRatio: [number, number]) {
  return {
    toString: () => aspectRatio.join('/'),
    tuple: aspectRatio,
    value: aspectRatio[0] / aspectRatio[1],
  }
}

// https://stackoverflow.com/a/65197024
type Wrapp<T> = { get value(): T }
// FIXME: make it generic, for real
type GenericUnwrap<T, V> = T extends PreSignal<any> ? PreSignal<V> : T
type Unwrap<F> = F extends () => infer V ? V : F
type Shape<O> = O extends { value: infer V }
  ? O extends { decorator: (value: Unwrap<V>) => infer W }
    ? {
        value: V
        // if you could infer the actual typeWrapper instead of the parameter...
        // for example Signal instead of number
        // in Signal<number>
        decorator: (value: Unwrap<V>) => W
        serialize(decorator: W): Unwrap<V>
      }
    : {
        value: V
        serialize: (value: Unwrap<V>) => Unwrap<V>
      }
  : O

type Store<T = {}> = {
  [key in keyof T]: Shape<T[key]>
}

type Key = {
  value: string
  decorator: (value: string) => number
  //serialize: (value: number) => string
}
type Inference = Shape<Key>
//   ^?

const toString = <T>(value: T) => String(value)
const toNumber = <T>(value: T) => Number(value)
const toBoolean = <T>(value: T) => Boolean(value)

type IfEquals<T, U, Y = unknown, N = never> = (<G>() => G extends T ? 1 : 2) extends <
  G
>() => G extends U ? 1 : 2
  ? Y
  : N
declare let exactType: <T, U>(
  draft: T & IfEquals<T, U>,
  expected: U & IfEquals<T, U>
) => IfEquals<T, U>
function Constraint<T extends { [key in keyof T]: Shape<T[key]> }>(shape: T) {
  return <Prettify<Store<typeof shape>>>{}
}
function serialize<T extends { peek(): any }>(decorator: T) {
  return decorator.peek() as ReturnType<T['peek']>
}
const f = serialize(signal(1))
type Rect = {
  x: number
  y: number
  width: number
  height: number
}

const myShape = Constraint({
  width: 350,
  minWidth: 300,
  aspectRatio: createProp({
    value: [16, 9] as [number, number],
    decorator: aspectRatioFrom,
    serialize: value => value.tuple,
  }),
  resizing: createProp({
    value: false,
    decorator: signal<boolean>,
    serialize,
  }),
  // stage: createProp({
  // 	value: <Stage>{ mode: 'host' },
  // 	decorator: signal<Stage>,
  // 	serialize
  // }),
  // resizeMode: createProp({
  // 	value: 'inlineBlock' as resizeMode,
  // 	decorator: signal<resizeMode>,
  // 	serialize
  // }),
  // rect: createProp({
  //   value() {
  //     const aspectRatio = aspectRatioFrom([16, 9])
  //     const width = 300
  //     const height = width / aspectRatio.value
  //     const windowed = typeof window !== 'undefined'
  //     const offset = 200
  //     return <Rect>{
  //       x: (windowed ? window.innerWidth / 2 : offset) - width / 2,
  //       y: (windowed ? window.innerHeight / 2 : offset) - height / 2,
  //       width,
  //       height,
  //     }
  //   },
  //   decorator: signal<Rect>,
  //   serialize,
  // }),
})
/* uncomment me
test: createProp({
	value: 1,
	decorator: toString,
	serialize(decorator) {
		return 0
	},
}),
key1: true,
key2: {
	value: true,
	decorator: toNumber<boolean>,
	serialize(value: number) {
		return toBoolean(value)
	},
},
key3: {
	value: 'value',
	serialize(value: string) {
		return value
	},
},
key4: {
	value: () => 'value',
	decorator(value: string) {
		return Number(value)
	},
	serialize(decorator: number) {
		return 'value' as string
	},
},
key5: {
	value: () => ({ a: '1', b: 2 }),
	decorator(value: { a: string; b: number }) {
		return Number(value)
	},
	serialize(decorator: number) {
		return { a: '1', b: 2 }
	},
},

key6: {
	value: [16, 9] as [number, number],
	decorator: aspectRatioFrom,
	// @ts-ignore
	serialize: value => value.tuple,
},

key6: createProp({
	value: [16, 9] as [number, number],
	decorator: aspectRatioFrom,
	serialize: value => value.tuple,
}),
// */

function F<T extends { value: any }>() {
  return <T>{}
}

const x = {
  y: {
    get value() {
      return 1
    },
    set value(value: number) {
      console.log(value)
    },
  },
}

x.y.value = 2

export type Prettify<T> = { [K in keyof T]: T[K] } & {}

// exactType(myShape, MyShape)

function Field<T, E extends Shape<T>>(spec: Shape<T>) {
  return spec
}

type Value = unknown
type Decorator<V extends Value> = (value: V) => unknown

function createProps<V extends Value, D extends Decorator<V>>(props: {
  value: V
  decorator: D
  serialize?: (decorator: ReturnType<D>) => V
}) {
  // set up logic
  //
  // ... throw error if decorator is missing the peek method

  return {
    value: props.decorator(props.value) as ReturnType<D>,
    serialize(): V {
      return (
        props.serialize?.(this.value) ??
        // FIXME: type check this
        // @ts-ignore
        this.value.peek()
      )
    },
  }
}

function createPropCb<Value, Decorator extends (value: Value) => any>(
  cb: (d: any) => {
    value: Value
    decorator: Decorator
    serialize: (decorator: ReturnType<Decorator>) => Value
  }
) {
  return cb(<Decorator>{})
}

const testCb = createPropCb(() => ({
  value: 1,
  decorator: toString<number>,
  serialize(decorator) {
    return 0
  },
}))

function createProp<Value, Decorator extends (value: Value) => any>(props: {
  value: Value
  decorator: Decorator
  serialize: (decorator: ReturnType<Decorator>) => Value
}) {
  return props
}

const test = createProp({
  value: 1,
  decorator: toString,
  serialize(decorator) {
    return 0
  },
})

const prop = createProps({
  value: false,
  decorator: preSignal,
})

function createSignalProp<Value>(value: Value) {
  return {
    value: preSignal(value),
    serialize() {
      return this.value.peek()
    },
  }
}
function createPrimitiveProp<Value>(value: Value) {
  return {
    value: value,
    serialize() {
      return this.value
    },
  }
}
type Stage = {
  mode: 'host' | 'free' | 'theater' | 'panic'
  selector?: string
}

const ___Config = {
  width: createPrimitiveProp(350),
  minWidth: createPrimitiveProp(300),
  aspectRatio: createProps({
    value: [16, 9] as [number, number],
    decorator: aspectRatioFrom,
    serialize: value => value.tuple,
  }),
  resizing: createSignalProp(false),
  stage: createProps({
    value: <Stage>{ mode: 'host' },
    decorator: createDefaultStage,
  }),
  resizeMode: createSignalProp('inlineBlock' as resizeMode),
  rect: createProps({
    value: {
      x: 20,
      y: 20,
      width: 350,
      height: 350 / (16 / 9),
    },
    decorator: preSignal,
  }),
}
const __Config = {
  width: 350,
  minWidth: 300,
  aspectRatio: [16, 9] as [number, number],
  resizing: false,
  stage: createDefaultStage({ mode: 'host' }).peek(),
  resizeMode: 'inlineBlock' as resizeMode,
  rect() {
    const aspectRatio = aspectRatioFrom(this.aspectRatio)
    const width = this.width
    const height = width / aspectRatio.value
    const windowed = typeof window !== 'undefined'
    const offset = 200
    return {
      x: (windowed ? window.innerWidth / 2 : offset) - width / 2,
      y: (windowed ? window.innerHeight / 2 : offset) - height / 2,
      width,
      height,
    }
  },
}

function resolveMethods<Obj>(config: Partial<Obj>) {
  // execute all functions if any
  for (const key in config) {
    const value = config[key]
    if (typeof value == 'function') {
      config[key] = value.bind(config)()
    }
  }

  return config as {
    [key in keyof Obj]: Obj[key] extends (...args: any[]) => infer R ? R : Obj[key]
  }
}

function create__Config(config = <Partial<typeof __Config>>{}) {
  const _config = { ...resolveMethods(__Config), ...resolveMethods(config) }

  for (const key in config) {
    // @ts-expect-error
    config[key] = preSignal(config[key])
  }
}

const ____Config = {
  width: 350,

  minWidth: 300,

  aspectRatio: {
    value: [16, 9] as [number, number],
    decorator: aspectRatioFrom,
    serialize: (value: ReturnType<typeof aspectRatioFrom>) => value.tuple,
  },

  resizing: {
    value: false,
    decorator: preSignal,
  },

  stage: {
    value: createDefaultStage({ mode: 'host' }).peek(),
    decorator: createDefaultStage,
  },

  resizeMode: {
    value: 'inlineBlock' as resizeMode,
    decorator: preSignal,
  },

  rect() {
    const aspectRatio = aspectRatioFrom(this.aspectRatio.value)
    const width = this.width
    const height = width / aspectRatio.value
    const windowed = typeof window !== 'undefined'
    const offset = 200
    return {
      value: {
        x: (windowed ? window.innerWidth / 2 : offset) - width / 2,
        y: (windowed ? window.innerHeight / 2 : offset) - height / 2,
        width,
        height,
      },
      decorator: preSignal,
    }
  },
}
type FlattenValues____Config = {
  [key in keyof typeof ____Config]: Unwrap<(typeof ____Config)[key]> extends { value: infer V }
    ? V
    : Unwrap<(typeof ____Config)[key]>
}
type FlattenDecorators___Config = {
  [key in keyof typeof ____Config]: Unwrap<(typeof ____Config)[key]> extends { value: infer V }
    ? Unwrap<(typeof ____Config)[key]> extends { decorator: (value: Unwrap<V>) => infer W }
      ? // oh my god
        GenericUnwrap<W, Unwrap<V>> & { serialize(): Unwrap<V> }
      : V & { serialize(): Unwrap<V> }
    : Unwrap<(typeof ____Config)[key]>
}

// TODO: test me, it think it works
function create___Config(_overrides = <Partial<FlattenValues____Config>>{}) {
  const _base = resolveMethods(____Config)

  debugger
  for (const key of Object.keys(_base) as Array<keyof typeof _base>) {
    const scheme = _base[key]
    const override = _overrides[key]

    if (typeof scheme != 'object') {
      // @ts-ignore
      _base[key] = override ?? scheme
      continue
    }

    if ('decorator' in scheme) {
      // @ts-ignore
      const newType = scheme.decorator(override ?? scheme.value)
      if ('serialize' in scheme) {
        const serialize = scheme.serialize
        // @ts-ignore
        newType.serialize = () => serialize(newType)
      } else if ('peek' in newType) {
        // @ts-ignore
        newType.serialize = () => newType.peek()
      }

      // @ts-ignore
      _base[key] = newType
    } else if ('serialize' in scheme) {
      // @ts-ignore
      const newType = override ?? scheme.value
      // @ts-ignore
      const serialize = scheme.serialize

      newType.serialize = () => serialize(newType)

      _base[key] = newType
    }
  }
  debugger
  return _base as any as FlattenDecorators___Config
}
const serializeConfig = function (self: ReturnType<typeof create___Config>) {
  return Object.entries(self).reduce((acc, [key, value]) => {
    // @ts-ignore
    if ('serialize' in value) {
      // @ts-ignore
      acc[key] = value.serialize()
    } else {
      // @ts-ignore
      acc[key] = value
    }
    return acc
  }, {} as FlattenValues____Config)
}
const testConfig = create___Config()
serializeConfig(testConfig).aspectRatio

testConfig.width
testConfig.aspectRatio.serialize()
testConfig.rect.serialize()
testConfig.stage.serialize()
// @ts-ignore package types bug?
// prettier-ignore
testConfig.stage.mode;
testConfig.stage.peek()
testConfig.stage.value
testConfig.resizeMode.serialize()
testConfig.resizeMode.peek()

const _Config = {
  width: 350,
  minWidth: 300,
  aspectRatio: [16, 9] as [number, number],
  resizing: false,
  stage: createDefaultStage({ mode: 'host' }).peek(),
  resizeMode: 'inlineBlock' as resizeMode,
  rect: {
    x: 20,
    y: 20,
    width: 350,
    height: 350 / (16 / 9),
  },
}
export function createConfig(config?: Partial<typeof _Config>) {
  const _config = { ..._Config, ...config }
  const aspectRatio = aspectRatioFrom([..._config.aspectRatio])

  const width = _config.width
  const height = width / aspectRatio.value

  const windowed = typeof window !== 'undefined'
  const offset = 200
  return {
    ..._config,
    aspectRatio,
    // prettier-ignore
    rect: preSignal(_config.rect || {
			x: (windowed ? window.innerWidth  / 2 : offset) - width / 2,
			y: (windowed ? window.innerHeight / 2 : offset) - height / 2,
			width,
			height,
		}),
    constraint: {},
    resizing: preSignal(_config.resizing),
    stage: createDefaultStage(_config.stage),
    resizeMode: preSignal(_config.resizeMode),
  }
}
createConfig.serialize = function (self: ReturnType<typeof createConfig>) {
  const { constraint, ...this_ } = self
  return {
    ...this_,
    aspectRatio: self.aspectRatio.tuple as [number, number],
    resizing: self.resizing.peek(),
    rect: self.rect.peek(),
    stage: self.stage.peek(),
    resizeMode: self.resizeMode.peek(),
  } satisfies typeof _Config
}

export const followerCycle = {
  update(hostRef, initRect) {
    return () => {
      // https://stackoverflow.com/q/39417566
      const rect = hostRef.getBoundingClientRect()
      return {
        x: rect.x,
        y: rect.y,
        width: rect.width,
        height: rect.height,
      }
    }
  },
  clean(followerRef) {
    // console.log('styleHost remove offset')

    followerRef?.style.removeProperty('--topOffset')
    followerRef?.style.removeProperty('--leftOffset')
  },
  resize(followerRef, entry, initRect, isFull) {
    if (isFull) {
      this.clean!(followerRef)
      return
    }
    const topOffset = entry.boundingClientRect.top - entry.intersectionRect.top
    const leftOffset = entry.boundingClientRect.left - entry.intersectionRect.left
    // console.log('styleHost add   offset')
    followerRef?.style.setProperty('--topOffset', topOffset + 'px')
    followerRef?.style.setProperty('--leftOffset', leftOffset + 'px')

    return {
      x: entry.intersectionRect.x,
      y: entry.intersectionRect.y,
      width: entry.intersectionRect.width,
      height: entry.intersectionRect.height,
    }
  },
} satisfies FollowerCycle
