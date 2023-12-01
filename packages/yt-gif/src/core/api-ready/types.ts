import type { CreateParams } from '$v3/init/observer/system/types'

function Omit<T extends { [key in K]: any }, K extends PropertyKey>(object: T, BKeys: K[]) {
  const newObject = <T>{}
  const AKeys = Object.keys(object) as K[]
  for (const key of AKeys.filter(n => !BKeys.includes(n))) {
    newObject[key] = object[key]
  }
  return newObject as Omit<T, K>
}

type PlayerParams = CreateParams & {
  dataCreation: string
}

export type StaticPlayerParams = ReturnType<typeof staticPlayerParams>
export function staticPlayerParams(params: PlayerParams) {
  return <const>{ ...Omit(params, ['target']) }
}
