export interface TBlockInfo {
  open: boolean
  order: number
  string: s
  uid: s
}
export interface DownHierarchy extends TBlockInfo {
  parents?: DownHierarchy[]
  children?: DownHierarchy[]
  // useful when reading recursive data
  title?: s
  overrideKey?: s
}
