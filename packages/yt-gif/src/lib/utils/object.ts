import type { DeepPartial } from '$lib/types/utilities'

export function recursiveAssign<T extends object>(a: T, b: DeepPartial<T>) {
  if (Object(b) !== b) return b
  if (Object(a) !== a) a = <T>{}
  for (let key in b) {
    // @ts-ignore
    a[key] = recursiveAssign(a[key], b[key])
  }
  return a
}

export function deepMerge<A extends object, B extends object>(object: A, ...toassign: any) {
  if (typeof object === 'object') {
    toassign.forEach(data => {
      if (isPlainObject(data)) {
        mergeInObject(object, data)
      }
    })
  }
  return object as A & B
}

function assign(ref, key, value) {
  if (isPlainObject(value)) {
    if (!isPlainObject(ref[key])) {
      ref[key] = {}
    }
    mergeInObject(ref[key], value)
  } else {
    ref[key] = value
  }
}

function mergeInObject(dest, data) {
  Object.keys(data).forEach(key => {
    assign(dest, key, data[key])
  })
}

function isPlainObject(o) {
  return (
    o !== undefined && o.constructor !== undefined && o.constructor.prototype === Object.prototype
  )
}

export function deleteProperties(object: object | undefined | unknown) {
  if (!object) return
  try {
    // JSON.stringify(object) // check if it is recursive
    for (let key of Object.keys(object)) {
      if (object.hasOwnProperty(key)) {
        // @ts-expect-error
        delete object[key]
      }
    }
  } catch (error) {
    console.error(error)
  }
}

export function deleteByValue(obj: object, val: any) {
  //store list of properties to remove
  let propsToRemove = []

  try {
    for (const prop in obj) {
      //@ts-expect-error
      if (val?.id && obj[prop]?.id == val?.id) {
        //save the property name here, deleting while enumerating is a bad idea.
        propsToRemove.push(prop)
      }
    }

    //remove all the items stored.
    while (propsToRemove.length) {
      //@ts-expect-error
      delete obj[propsToRemove.pop()]
    }
  } catch (error) {
    console.error(error)
  }
}
