<script lang="ts" context="module">
  import { preSignal } from '$lib/pre-signal'
  import { createMouseTrack } from './controller/mouse-track'

  type El = HTMLElement & { direction: string; parentElement: HTMLElement }

  const config = {
    aspectRatio: aspectRatioFrom([16, 9]),
    resizeMode: 'inlineBlock' as
      | 'inlineBlock'
      | 'inlineBlockReversed'
      | 'pictureInPicture'
      | 'right'
      | 'left'
      | 'bottom'
      | 'top'
      | 'center',
    bounds: 'mouse' as 'mouse' | 'rect' | 'none',
    hide: false,
    minWidth: 300,
    resizing: preSignal(false),
    padding: 5,
    rect: preSignal({
      x: 200,
      y: 200,
      width: 600,
      height: 300,
    }),
  }
  export type ResizeConfig = Partial<typeof config> & {
    rect?: typeof config.rect
  }

  export function resize(element: HTMLElement, Config?: ResizeConfig) {
    const _config = { ...config, ...Config }
    const { rect } = _config
    let grabbers = createGrabbers()
    let initialRect: DOMRect, initialPos: { x: number; y: number }

    const tracker = createMouseTrack({
      mousedown(event, original) {
        const domRect = element.getBoundingClientRect()
        const parent = document.body.getBoundingClientRect()

        // @ts-expect-error
        initialRect = {
          width: domRect.width,
          height: domRect.height,
          left: domRect.left - parent.left,
          right: parent.right - domRect.right,
          top: domRect.top - parent.top,
          bottom: parent.bottom - domRect.bottom,
        }
        initialPos = { x: event.pageX, y: event.pageY }
        original.classList.add('selected')
        _config.resizing.value = true
      },

      mouseup(event, original) {
        original.classList.remove('selected')
        _config.resizing.value = false
      },

      // resize on the eight directions, but respect the aspect ratio of 16 / 9
      mousemove(event, original) {
        // @ts-expect-error
        const direction = original.direction as string

        const deltaX = event.pageX - initialPos.x
        const deltaY = event.pageY - initialPos.y
        const [wR, hR] = _config.aspectRatio.tuple

        // exit if the size is too small
        const xDir = direction.match('left') ? -1 : 1
        const widthDir = initialRect.width + deltaX * xDir
        if (_config.minWidth >= widthDir) {
          return
        }
        let outOfBounds = false
        const domRect = element.getBoundingClientRect()
        const padding = _config.padding
        if (_config.bounds == 'mouse') {
          // if the domRect is out of the screen, exit
          if (
            domRect.left - padding < 0 ||
            domRect.right + padding > window.innerWidth ||
            domRect.top - padding < 0 ||
            domRect.bottom + padding > window.innerHeight
          ) {
            // if the next move is trying to move it back to the screen, then allow it
            // prettier-ignore
            if (
								direction.match('left') && event.pageX < padding
							|| direction.match('right') && event.pageX > window.innerWidth - padding
							|| direction.match('top') && event.pageY < padding
							|| direction.match('bottom') && event.pageY > window.innerHeight - padding
						) {
							return
						}
          }
        } else if (_config.bounds == 'rect') {
          const parent = document.body.getBoundingClientRect()
          if (
            domRect.left - padding < parent.left ||
            domRect.right + padding > parent.right ||
            domRect.top - padding < parent.top ||
            domRect.bottom + padding > parent.bottom
          ) {
            outOfBounds = true
          }
        }

        const _rect = { ...rect.value }
        const aspectRatio = _config.aspectRatio.value

        if (_config.resizeMode == 'pictureInPicture') {
          /**
           * imitate the browser's picture-in-picture mode
           */
          let delta: number
          if (direction.match('right')) {
            _rect.width = initialRect.width + deltaX
          }
          const _deltaX = initialPos.x - event.pageX
          if (direction.match(/left|top-left/)) {
            _rect.x = initialRect.left - _deltaX
            _rect.width = initialRect.width + _deltaX
          }
          if (direction == 'top-left' || direction == 'left') {
            _rect.y = initialRect.top - _deltaX / aspectRatio
          } else if (direction.match('top')) {
            delta = initialPos.y - event.pageY
            _rect.y = initialRect.top - delta
            _rect.width = (initialRect.height + delta) * aspectRatio
          }
          if (direction == 'bottom') {
            _rect.width = (initialRect.height + deltaY) * aspectRatio
          }
        } else if (_config.resizeMode == 'inlineBlockReversed') {
          let delta = 0
          if (direction.match(/left|right/)) {
            delta = direction.match(/left/)
              ? initialPos.x - event.pageX
              : event.pageX - initialPos.x
          } else {
            delta = direction.match(/top/) ? initialPos.y - event.pageY : event.pageY - initialPos.y
          }

          _rect.x = initialRect.left - delta
          _rect.width = initialRect.width + delta
          _rect.y = initialRect.top - delta / aspectRatio
        } else if (_config.resizeMode == 'inlineBlock') {
          if (direction === 'right' || direction === 'left') {
            inlineBlock(widthDir, true)
          } else {
            // top|bottom
            const yDir = direction.match('top') ? -1 : 1
            const heightDir = initialRect.height + deltaY * yDir
            inlineBlock(heightDir, false)
          }

          function inlineBlock(size: number, on: boolean) {
            _rect[on ? 'width' : 'height'] = size
            const a = on ? wR : hR
            const b = a == wR ? hR : wR
            _rect[on ? 'height' : 'width'] = (size / a) * b
          }
        } else if (_config.resizeMode == 'center') {
          const sideways = direction.match(/right|left/)
          let delta = sideways ? deltaX : deltaY
          delta = direction.match(/left|top/) ? delta * -1 : delta

          _rect.width = initialRect.width + delta
          _rect.height = _rect.width / aspectRatio

          const pivot = delta / 2
          _rect.x = initialRect.left - pivot
          _rect.y = initialRect.top - pivot / aspectRatio
        } else {
          const resizeMode = _config.resizeMode
          // right|left|top|bottom
          const sideways = direction.match(/right|left/)
          let delta = sideways ? deltaX : deltaY
          delta = direction.match(/left|top/) ? delta * -1 : delta

          if (resizeMode.match(/right|left/)) {
            _rect.width = initialRect.width + delta * (resizeMode.match(/left/) ? -1 : 1)
          } else {
            _rect.height = initialRect.height + delta * (resizeMode.match(/top/) ? -1 : 1)
          }

          if (outOfBounds && _rect.height > rect.value.height) {
            return
          }
        }
        // ugly, FIXME:
        if (_config.resizeMode.length > 7) {
          _rect.height = _rect.width / _config.aspectRatio.value
        }
        // invalidate the signal!
        rect.set({ ...rect.value, ..._rect })
      },
    })

    grabbers.forEach(grabber => {
      element.appendChild(grabber)
      grabber.addEventListener('mousedown', tracker)
    })

    function update() {
      // ugly, FIXME:
      if (_config.resizeMode.length > 7) {
        element.style.aspectRatio = _config.aspectRatio.toString()
      }

      element.classList.toggle('hideResize', _config.hide)
    }
    update()

    return {
      destroy() {
        grabbers.forEach(grabber => {
          element.removeChild(grabber)
        })
        grabbers = []
      },
      update(Config: ResizeConfig) {
        Object.assign(_config, Config)
        update()
      },
    }
  }
  function createGrabbers() {
    // prettier-ignore
    const createElement = document.createElement.bind(document) as (tag: string) => El
    //#region grabbers
    const right = createElement('div')
    right.direction = 'right'
    right.classList.add('grabber')
    right.classList.add('right')

    const left = createElement('div')
    left.direction = 'left'
    left.classList.add('grabber')
    left.classList.add('left')

    const top = createElement('div')
    top.direction = 'top'
    top.classList.add('grabber')
    top.classList.add('top')

    const bottom = createElement('div')
    bottom.direction = 'bottom'
    bottom.classList.add('grabber')
    bottom.classList.add('bottom')

    const topLeft = createElement('div')
    topLeft.direction = 'top-left'
    topLeft.classList.add('grabber')
    topLeft.classList.add('top-left')

    const topRight = createElement('div')
    topRight.direction = 'top-right'
    topRight.classList.add('grabber')
    topRight.classList.add('top-right')

    const bottomLeft = createElement('div')
    bottomLeft.direction = 'bottom-left'
    bottomLeft.classList.add('grabber')
    bottomLeft.classList.add('bottom-left')

    const bottomRight = createElement('div')
    bottomRight.direction = 'bottom-right'
    bottomRight.classList.add('grabber')
    bottomRight.classList.add('bottom-right')
    //#endregion

    return [right, left, top, bottom, topLeft, topRight, bottomLeft, bottomRight]
  }
  export function aspectRatioFrom(aspectRatio: [number, number]) {
    return {
      toString: () => aspectRatio.join('/'),
      tuple: aspectRatio,
      value: aspectRatio[0] / aspectRatio[1],
    }
  }
</script>

<svelte:head>
  <style lang="scss">
    .box {
      left: 450px;
      top: 250px;
      width: 300px;
      position: fixed;
      user-select: none;
      z-index: 100;
    }

    .hideResize .grabber {
      background: transparent;
    }
    .grabber {
      --grabber-size: 10px;
      --grabber-percent: 100%;
      --grabber-offset: -5px;
      --grabber-corner: -10px;

      position: absolute;
      box-sizing: border-box;
      // background: rgba(128, 128, 128, 0.7);
      z-index: 2;

      &:hover {
        background: rgba(128, 128, 128);
      }
      &.selected {
        border: dotted 5px black;
      }

      &.right {
        width: var(--grabber-size);
        height: var(--grabber-percent);
        top: var(--grabber-offset);
        right: var(--grabber-offset);

        // background: red;
        cursor: e-resize;
      }
      &.left {
        width: var(--grabber-size);
        height: var(--grabber-percent);
        top: var(--grabber-offset);
        left: var(--grabber-offset);

        // background: blue;
        cursor: e-resize;
      }
      &.top {
        height: var(--grabber-size);
        width: var(--grabber-percent);
        top: var(--grabber-offset);

        // background: green;
        cursor: n-resize;
      }
      &.bottom {
        height: var(--grabber-size);
        width: var(--grabber-percent);
        bottom: var(--grabber-offset);

        // background: orange;
        cursor: s-resize;
      }

      &.top-left,
      &.top-right,
      &.bottom-left,
      &.bottom-right {
        height: 20px;
        width: 20px;
        border-radius: 100%;
      }
      &.top-left {
        top: var(--grabber-corner);
        left: var(--grabber-corner);

        // background: orange;
        cursor: nw-resize;
      }
      &.top-right {
        top: var(--grabber-corner);
        right: var(--grabber-corner);

        // background: orange;
        cursor: ne-resize;
      }
      &.bottom-left {
        bottom: var(--grabber-corner);
        left: var(--grabber-corner);

        // background: green;
        cursor: sw-resize;
      }
      &.bottom-right {
        bottom: var(--grabber-corner);
        right: var(--grabber-corner);

        // background: green;
        cursor: se-resize;
      }
    }
  </style>
</svelte:head>
