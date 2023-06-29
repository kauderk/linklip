import type { ExamineResObj } from './filter'

export type Tpage = 'start' | 'end' | 'speed' | 'format'
export const btnNames: Array<Tpage> = ['speed', 'start', 'end']
export type TRes = Awaited<ReturnType<typeof ExamineResObj>>
