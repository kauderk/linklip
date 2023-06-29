type v = 'left' | 'right' | null

export type TVisit = typeof visit
export let visit = {
  visited: <v>null,
  set(v: v) {
    this.visited = v
  },
  get() {
    return this.visited
  },
}
