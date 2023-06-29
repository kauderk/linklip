import { settingsTask } from '$v3/settings-page/task'
import { tryGetDirectSetting, TryUpdateSettingsBlockValue } from '$v3/init/dom/ui/update'
import { writable } from 'svelte/store'
import type { ExcludeStoreKeys, IChange } from './types'
import type { DeepWritable } from '$lib/types/utilities'
import { debounce } from '$lib/utils'

interface Range {
  range: {
    attr: {
      id: s
      value: number
    }
  }
}
export function createRangeStore<L extends ExcludeStoreKeys<Range>>(lookup: L) {
  const input = lookup.range.attr
  var unsubscribeInternalStore: () => void
  const store = writable({ value: input.value }, () => {
    return () => unsubscribeInternalStore?.()
  })
  settingsTask.promise
    .then(() => {
      // READ
      const sessionValue = tryGetDirectSetting(input.id)?.sessionValue as s
      change({ value: Number(sessionValue) || 0 })

      // WRITE
      unsubscribeInternalStore = store.subscribe(async payload => {
        const replaceWith = payload.value.toString()
        await TryUpdateSettingsBlockValue(input.id, replaceWith)
      })
    })
    .catch(console.error)

  const async = debounce(store.set, 500)
  function change(payload: IChange<n> & { debounce?: b }) {
    input.value = payload.value
    if (payload.invalidate !== false) {
      if (payload.debounce) {
        async(payload)
      } else {
        store.set(payload)
      }
    }
  }
  return {
    ...(lookup as DeepWritable<L>),
    change,
    subscribe: store.subscribe,
    get value() {
      return input.value
    },
  }
}
