import type { TOptions } from '$v3/components/drop-down-menu/Select/Options'
import type { createBinaryStore } from './factory/binary'
import type { createRangeStore } from './factory/range'
import type { createSelectStore } from './factory/select'
import type { createCustomSelectStore } from './proxy'

type SelectProxy<S extends Lookup> = ReturnType<typeof createSelectStore<S>>
type CustomSelectProxy<S extends Lookup> = ReturnType<typeof createCustomSelectStore<S>>
export type SelectOptionsProxy = SelectProxy<Lookup>

export type RangeProxy = ReturnType<typeof createRangeStore>
export type BinaryProxy = ReturnType<typeof createBinaryStore>
export type CustomSelectOptionsProxy = CustomSelectProxy<Lookup>
export type Lookup = { options: TOptions }
