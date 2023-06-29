import { getUniqueSelectorSmart, ObjectEntries } from '$lib/utils'
import { CleanAndBrandNewWrapper } from '../../lib/utils'
import { attrInfo } from './paths'

//export const YT = window.YT

export const iframeIDprfx = 'player_'
export let currentFullscreenPlayer: string
export const setCurrentFullscreenPlayer = (id: string) => (currentFullscreenPlayer = id)

/*-----------------------------------*/
export const YT_GIF_OBSERVERS_TEMP = {
  observers: {
    mutation: Array<Tobserver>(),
    intersection: Array<Tobserver>(),
    buffer: Array<Tobserver>(),
  },
  masterIframeBuffer: Array<Tobserver | string>(),

  timestampObserver: null as MutationObserver | null,
  //
  keyupEventHandler: (e: KeyboardEvent): void => {},
  creationCounter: -1, // crucial, because the api won't reload iframes with the same id
  //
  CleanMasterObservers: function () {
    const log = ObjectEntries(this.observers).reduce((crr, [key, value]) => {
      const res = cleanObserverArr(value)
      this.observers[key] = res.observer
      return { ...crr, [key]: res.counter }
    }, <{ [key: s]: n }>{})
    console.log(`YT GIF | cleaned observers`, log)
  },
  CleanLoadedWrappers: function () {
    const wrappers = document.queryAllasArr(`[${attrInfo.target}]`)

    for (let i = wrappers.length - 1; i >= 0; i--) {
      CleanAndBrandNewWrapper(
        document.querySelector(getUniqueSelectorSmart(wrappers[i])) as El,
        attrInfo.creation.name,
        attrInfo.creation.cleaning
      ) //wrapperParent -> nest new span
    }
  },
  dmm_html: null,
}

function cleanObserverArr(observer: Array<Tobserver>) {
  //https://www.codegrepper.com/code-examples/javascript/how+to+do+a+reverse+loop+in+javascript#:~:text=www.techiedelight.com-,how%20to%20reverse%20loop%20in%20javascript,-javascript%20by%20Dark
  let counter = 0
  for (let i = observer.length - 1; i >= 0; i--) {
    observer[i].disconnect()
    observer.splice(i, 1)
    counter++
  }
  return <const>{
    observer,
    counter,
  }
}
