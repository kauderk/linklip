export interface PlayerStoreObj {
  entry?: Readonly<F>
  update?: { tickOffset: number }
  canBeCleanedByBuffer: b
  playerID: s
}
interface F {
  mapID: string
  mapID_prefix: string
  mapID_suffix: string
  accIndex: string
  canBeCleanedByBuffer: boolean
  playerID: string
}
