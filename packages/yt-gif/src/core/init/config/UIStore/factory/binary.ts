import type { DeepWritable } from '$lib/types/utilities'
import { isTrue } from '$lib/utils'
import { TryUpdateSettingsBlockValue, tryGetDirectSetting } from '$v3/init/dom/ui/update'
import { settingsTask } from '$v3/settings-page/task'
import { writable } from 'svelte/store'
import type { ExcludeStoreKeys, IChange } from './types'

interface Inputs {
  id: s
  value: boolean
}

export function createBinaryStore<L extends ExcludeStoreKeys<Inputs>>(lookup: L) {
  var unsubscribeInternalStore: () => void
  const store = writable({ value: lookup.value }, () => {
    return () => unsubscribeInternalStore?.()
  })
  settingsTask.promise
    .then(() => {
      // READ
      const sessionValue = tryGetDirectSetting(lookup.id)?.sessionValue as s
      change({ value: isTrue(sessionValue) })

      // WRITE
      unsubscribeInternalStore = store.subscribe(async payload => {
        const replaceWith = payload.value.toString()
        await TryUpdateSettingsBlockValue(lookup.id, replaceWith)
      })
    })
    .catch(console.error)

  function change(payload: IChange<b>) {
    lookup.value = payload.value
    store.set(payload)
  }

  return {
    ...(lookup as DeepWritable<L>),
    change,
    subscribe: store.subscribe,
    get value() {
      return lookup.value
    },
  }
}
