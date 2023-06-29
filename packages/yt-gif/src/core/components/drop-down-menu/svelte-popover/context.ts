import type { TAction } from '$v3/stores/ddm-actions'
import { derived, writable } from 'svelte/store'
import { Flow } from '../Sub/Flow'

const props = writable({
  action: 'click' as TAction,
  open: false,
  //
  persist: false,
  anyFocus: false,
  forceOpen: false,
})
export const DropDownMenuConfig = {
  props,
  layout: {
    zIndex: 1000,
    hidden: derived(props, o => !o.open && o.persist),
  },
  control: Flow({ detail: props }),
  wrapperCtx: {
    props: writable({
      overlay: false,
      body: true,
    }),
    contentCtx: {
      props: writable({
        offset: {
          bottom: {
            center: {
              x: 2,
            },
          },
        },
        arrow: true,
        placement: 'bottom-center',
      }),
      targetRef: <QrySearch>undefined,
    },
    overlayCtx: {},
  },
}
