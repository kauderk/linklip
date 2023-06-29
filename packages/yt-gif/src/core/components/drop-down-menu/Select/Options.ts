type BaseOptions = {
  name: s
  'data-tooltip'?: s
  selected?: b
  disabled?: b
}
export type TOptions = {
  [key: string]: BaseOptions
}

export type TLabel = {
  id: s
  'data-tooltip'?: s
  name: s
}
