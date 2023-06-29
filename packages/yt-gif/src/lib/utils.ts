import type { DeepPartial } from './types/utilities'

export const ObjectKeys = <obj extends o>(o: obj) => Object.keys(o) as (keyof typeof o)[]

export const ObjectValues = <obj extends o>(o: obj) =>
  Object.values(o) as Array<(typeof o)[keyof typeof o]>

export const ObjectEntries = <obj extends o>(o: obj) =>
  Object.entries(o) as [keyof typeof o, (typeof o)[keyof typeof o]][]

// use: clone( <thing to copy> ) returns <new copy>
// untested use at own risk
// https://stackoverflow.com/a/54206471/13914180
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function Clone<T extends object>(o: T, m?: any): T {
  // return non object values
  if ('object' !== typeof o) return o
  // m: a map of old refs to new object refs to stop recursion
  if ('object' !== typeof m || null === m) m = new WeakMap()
  let n = m.get(o)
  if ('undefined' !== typeof n) return n
  // shallow/leaf clone object
  let c = Object.getPrototypeOf(o).constructor
  // TODO: specialize copies for expected built in types i.e. Date etc
  switch (c) {
    // shouldn't be copied, keep reference
    case Boolean:
    case Error:
    case Function:
    case Number:
    case Promise:
    case String:
    case Symbol:
    case WeakMap:
    case WeakSet:
      n = o
      break
    // array like/collection objects
    case Array:
      // @ts-ignore

      m.set(o, (n = o.slice(0)))
      // recursive copy for child objects
      // @ts-ignore
      n.forEach(function (v, i) {
        if ('object' === typeof v) n[i] = Clone(v, m)
      })
      break
    case ArrayBuffer:
      // @ts-ignore
      m.set(o, (n = o.slice(0)))
      break
    case DataView:
      m.set(
        o,
        // @ts-ignore
        (n = new c(Clone(o.buffer, m), o.byteOffset, o.byteLength))
      )
      break
    case Map:
    case Set:
      // @ts-ignore
      m.set(o, (n = new c(Clone(Array.from(o.entries()), m))))
      break
    case Int8Array:
    case Uint8Array:
    case Uint8ClampedArray:
    case Int16Array:
    case Uint16Array:
    case Int32Array:
    case Uint32Array:
    case Float32Array:
    case Float64Array:
      // @ts-ignore
      m.set(o, (n = new c(Clone(o.buffer, m), o.byteOffset, o.length)))
      break
    // use built in copy constructor
    case Date:
    case RegExp:
      m.set(o, (n = new c(o)))
      break
    // fallback generic object copy
    default:
      m.set(o, (n = Object.assign(new c(), o)))
      // recursive copy for child objects
      for (c in n) if ('object' === typeof n[c]) n[c] = Clone(n[c], m)
  }
  return n
}
export const exitFullscreen = () => {
  if (document.exitFullscreen) {
    document.exitFullscreen() //@ts-ignore
  } else if (document.mozCancelFullScreen) {
    //@ts-ignore
    document.mozCancelFullScreen() //@ts-ignore
  } else if (document.webkitExitFullscreen) {
    //@ts-ignore
    document.webkitExitFullscreen()
  }
}
export const isValidUrl = (value: string) => {
  return /^(?:(?:(?:https?|ftp):)?\/\/)(?:\S+(?::\S*)?@)?(?:(?!(?:10|127)(?:\.\d{1,3}){3})(?!(?:169\.254|192\.168)(?:\.\d{1,3}){2})(?!172\.(?:1[6-9]|2\d|3[0-1])(?:\.\d{1,3}){2})(?:[1-9]\d?|1\d\d|2[01]\d|22[0-3])(?:\.(?:1?\d{1,2}|2[0-4]\d|25[0-5])){2}(?:\.(?:[1-9]\d?|1\d\d|2[0-4]\d|25[0-4]))|(?:(?:[a-z\u00a1-\uffff0-9]-*)*[a-z\u00a1-\uffff0-9]+)(?:\.(?:[a-z\u00a1-\uffff0-9]-*)*[a-z\u00a1-\uffff0-9]+)*(?:\.(?:[a-z\u00a1-\uffff]{2,})))(?::\d{2,5})?(?:[/?#]\S*)?$/i.test(
    value
  )
}
// linearly maps value from the range (a..b) to (c..d)
export const mapRange = (value: number, a: number, b: number, c: number, d: number) => {
  // first map value from (a..b) to (0..1)
  value = (value - a) / (b - a)
  // then map it from (0..1) to (c..d) and return it
  return c + value * (d - c)
}
export const RemovedElementObserver = (options: {
  el: HTMLElement | null
  OnRemovedFromDom_cb: () => void
  directMatch?: boolean
}) => {
  if (!options.el) {
    return null
  }
  const config = { subtree: true, childList: true }
  const RemovedObserver = new MutationObserver(MutationRemoval_cb)
  RemovedObserver.observe(document.body, config)
  return RemovedObserver

  async function MutationRemoval_cb(mutationsList: MutationRecord[], observer: MutationObserver) {
    removedTargets(mutationsList, {
      target: options.el!,
      onRemoved: options.OnRemovedFromDom_cb,
    })
  }
}
export function removedTargets(
  mutationsList: MutationRecord[],
  options: { target: HTMLElement; onRemoved: () => void }
) {
  for (const mutation of mutationsList) {
    const nodes = Array.from(mutation.removedNodes)
    const directMatch = nodes.indexOf(options.target) > -1
    const parentMatch = nodes.some(parent => parent.contains(options.target))

    if (directMatch || parentMatch) {
      options.onRemoved()
      return true
    }
  }
}
export const assertSelector = (sel: string) => {
  if (sel.includes('@')) {
    // if string begins with invalid character, such as '@---.com' -> '\\@---.com\\
    let selArr = sel.split(' > ')
    for (let i = 0; i < selArr.length; i++) {
      if (!selArr[i].includes('@')) continue
      const rgx = new RegExp(/(@.*)\.com/, 'gm')
      const replaceWith = rgx.exec(selArr[i])?.[1]
      selArr[i] = selArr[i].replace(rgx, `\\${replaceWith}\\.com`)
    }
    sel = selArr.join(' > ')
  }
  return sel
}
export const ChangeElementType = (element: Element, newtype: string) => {
  let newelement = document.createElement(newtype)

  // move children
  while (element.firstChild) newelement.appendChild(element.firstChild)

  // copy attributes
  for (let i = 0, a = element.attributes, l = a.length; i < l; i++) {
    // @ts-ignore
    newelement.attributes[a[i].name] = a[i].value
  }

  // event handlers on children will be kept. Unfortunately, there is
  // no easy way to transfer event handlers on the element itself,
  // this would require a full management system for events, which is
  // beyond the scope of this answer. If you figure it out, do it here.

  element.parentNode?.replaceChild(newelement, element)
  return newelement
}
export const HMSToSecondsOnly = (str: string) => {
  if (/:/.test(str)) {
    let p = str.split(':'),
      s = 0,
      m = 1

    while (p.length > 0) {
      s += m * parseInt(p.pop()!, 10)
      m *= 60
    }

    return s
  } else if (/h|m|s/.test(str)) {
    const hms = [...str.matchAll(/\w+h|\w+m|\w+s/g)].map(m => m[0])

    return hms.reduce((acc, crr) => {
      let t = parseInt(crr) || 0

      if (/s/.test(crr)) return t + acc
      if (/m/.test(crr)) return t * 60 + acc
      if (/h/.test(crr)) return t * 3600 + acc

      return acc
    }, 0)
  }

  return parseFloat(str)
}
export const toggleClasses = (bol: boolean, classNames: string[], el: Element) => {
  if (bol) {
    el.classList.add(...classNames)
  } else {
    el.classList.remove(...classNames)
  }
}
export const removeIMGbg = (wrapper: HTMLElement) => {
  wrapper.style.backgroundImage = 'none'
}
export const simHover = () => {
  return simMouseEvent('mouseenter')
}
export const applyIMGbg = (wrapper: HTMLElement, url: string) => {
  wrapper.style.backgroundImage = `url(${get_youtube_thumbnail(url)})`
}
export const isTrue = (value: string | number | boolean) => {
  if (typeof value === 'string') value = value.trim().toLowerCase()

  switch (value) {
    case true:
    case 'true':
    case 1:
    case '1':
    case 'on':
    case 'yes':
      return true
    default:
      return false
  }
}

export function GetClosestRate(rates: number[], x: number) {
  return [...rates].sort((a, b) => Math.abs(a - x) - Math.abs(b - x))[0]
}
export const sleep = (ms: number) => {
  return new Promise(resolve => setTimeout(resolve, ms))
}
export const isElementVisible = (elem: HTMLElement) => {
  // https://stackoverflow.com/questions/19669786/check-if-element-is-visible-in-dom#:~:text=function%20isElementVisible(elem)%20%7B%0A%20%20%20%20if%20(!(elem%20instanceof%20Element))%20throw%20Error(%27DomUtil%3A%20elem%20is%20not%20an%20element.%27)%3B%0A%20%20%20%20const%20style%20%3D%20getComputedStyle(elem)%3B
  const style = getComputedStyle(elem)
  if (style.display === 'none') return false
  if (style.visibility !== 'visible') return false
  // @ts-ignore
  if (style.opacity === 0) return false
  if (
    elem.offsetWidth +
      elem.offsetHeight +
      elem.getBoundingClientRect().height +
      elem.getBoundingClientRect().width ===
    0
  ) {
    return false
  }
  let elementPoints = {
    center: {
      x: elem.getBoundingClientRect().left + elem.offsetWidth / 2,
      y: elem.getBoundingClientRect().top + elem.offsetHeight / 2,
    },
    'top-left': {
      x: elem.getBoundingClientRect().left,
      y: elem.getBoundingClientRect().top,
    },
    'top-right': {
      x: elem.getBoundingClientRect().right,
      y: elem.getBoundingClientRect().top,
    },
    'bottom-left': {
      x: elem.getBoundingClientRect().left,
      y: elem.getBoundingClientRect().bottom,
    },
    'bottom-right': {
      x: elem.getBoundingClientRect().right,
      y: elem.getBoundingClientRect().bottom,
    },
  }

  for (let index in elementPoints) {
    // @ts-ignore
    let point = elementPoints[index]
    if (point.x < 0) return false
    if (point.x > (document.documentElement.clientWidth || window.innerWidth)) return false
    if (point.y < 0) return false
    if (point.y > (document.documentElement.clientHeight || window.innerHeight)) return false
    let pointContainer = document.elementFromPoint(point.x, point.y)
    if (pointContainer !== null) {
      do {
        if (pointContainer === elem) return true
        //@ts-ignore
      } while ((pointContainer = pointContainer.parentNode))
    }
  }
  return false
}
export const toggleAttribute = (bol: boolean, Name: string, el: Element, value = '') => {
  if (bol) {
    el.setAttribute(Name, value)
  } else {
    el.removeAttribute(Name)
  }
}
export const closestBlockID = (el: Element) => {
  return el?.closest('.rm-block__input')?.id
}
export const getUniqueSelectorSmart = (el: Element) => {
  const _sel = getUniqueSelector(el) as s
  return assertSelector(_sel)
}
export function isRendered(el: QrySearch) {
  return document.body.contains(el!)
}
/* -------------------------------- */
export const pushSame = <T>(arr = Array<T>(), el: T) => {
  arr.push(el)
  return arr
}
export const convertHMS = (value: string | number) => {
  const sec = parseInt(value.toString(), 10) // convert value to number if it's string
  let hours: string | number = Math.floor(sec / 3600) // get hours
  let minutes: string | number = Math.floor((sec - hours * 3600) / 60) // get minutes
  let seconds: string | number = sec - hours * 3600 - minutes * 60 //  get seconds
  // add 0 if value < 10; Example: 2 => 02
  if (hours < 10) {
    hours = '0' + hours
  }
  if (minutes < 10) {
    minutes = '0' + minutes
  }
  if (seconds < 10) {
    seconds = '0' + seconds
  }
  return hours + ':' + minutes + ':' + seconds // Return is HH : MM : SS
}
export const seconds2time = (seconds: number, useLetters?: boolean) => {
  // https://stackoverflow.com/questions/6312993/javascript-seconds-to-time-string-with-format-hhmmss#:~:text=Variation%20on%20a%20theme.%20Handles%20single%20digit%20seconds%20a%20little%20differently
  const hours = Math.floor(seconds / 3600)
  let minutes = Math.floor((seconds - hours * 3600) / 60)
  const _seconds = seconds - hours * 3600 - minutes * 60
  let time = ''
  const t = {
    h: useLetters ? 'h' : ':',
    m: useLetters ? 'm' : ':',
    s: useLetters ? 's' : '',
  }
  const cero = useLetters ? '' : '0'

  if (hours != 0) time = hours + t.h

  if (!useLetters || minutes > 0) {
    const _minutes = minutes < 10 ? cero + minutes : String(minutes)
    time += _minutes + t.m
  }

  if (time === '') time = _seconds + t.s
  else if (!useLetters || _seconds > 0) {
    time += _seconds < 10 ? cero + _seconds : String(_seconds)
    time += t.s
  }

  return time
}
export const getUniqueSelector = (el: Element) => {
  // https://stackoverflow.com/questions/3620116/get-css-path-from-dom-element#:~:text=Doing%20a%20reverse%20CSS%20selector%20lookup%20is%20an%20inherently%20tricky%20thing.%20I%27ve%20generally%20come%20across%20two%20types%20of%20solutions%3A
  let sSel,
    aAttr = ['name', 'value', 'title', 'placeholder', 'data-*'], // Common attributes
    aSel: string[] = [],
    // Derive selector from element
    getSelector = function (el: Element) {
      // 1. Check ID first
      // NOTE: ID must be unique amongst all IDs in an HTML5 document.
      // https://www.w3.org/TR/html5/dom.html#the-id-attribute
      if (el.id) {
        aSel.unshift('#' + el.id)
        return true
      }
      aSel.unshift((sSel = el.nodeName.toLowerCase()))
      // 2. Try to select by classes
      if (el.className) {
        aSel[0] = sSel += '.' + el.className.trim().replace(/ +/g, '.')
        if (uniqueQuery()) return true
      }
      // 3. Try to select by classes + attributes
      for (const element of aAttr) {
        if (element === 'data-*') {
          // Build array of data attributes
          const aDataAttr = [].filter.call(el.attributes, function (attr: Attr) {
            return attr.name.indexOf('data-') === 0
          })
          for (const element of aDataAttr) {
            aSel[0] = sSel +=
              '[' +
              // @ts-ignore TODO:
              element.name +
              '="' +
              // @ts-ignore TODO:
              element.value +
              '"]'
            if (uniqueQuery()) return true
          }
          //@ts-ignore
        } else if (el[element]) {
          aSel[0] = sSel +=
            //@ts-ignore
            '[' + element + '="' + el[element] + '"]'
          if (uniqueQuery()) return true
        }
      }
      // 4. Try to select by nth-of-type() as a fallback for generic elements
      let elChild: El | null = el,
        sChild,
        n = 1
      while ((elChild = elChild.previousElementSibling)) {
        if (elChild.nodeName === el.nodeName) ++n
      }
      aSel[0] = sSel += ':nth-of-type(' + n + ')'
      if (uniqueQuery()) return true
      // 5. Try to select by nth-child() as a last resort
      elChild = el
      n = 1
      while ((elChild = elChild.previousElementSibling)) ++n
      aSel[0] = sSel = sSel.replace(
        /:nth-of-type\(\d+\)/,
        n > 1 ? ':nth-child(' + n + ')' : ':first-child'
      )
      if (uniqueQuery()) return true
      return false
    },
    // Test query to see if it returns one element
    uniqueQuery = function () {
      return document.querySelectorAll(aSel.join('>')).length === 1
    }
  // Walk up the DOM tree to compile a unique selector
  while (el.parentNode) {
    if (getSelector(el)) return aSel.join(' > ')
    //@ts-ignore
    el = el.parentNode
  }
}
export const getYouTubeVideoID = (url: string) => {
  //https://stackoverflow.com/questions/28735459/how-to-validate-youtube-url-in-client-side-in-text-box#:~:text=function%20matchYoutubeUrl(url)%20%7B
  const urls = url.split(/(vi\/|v=|\/v\/|youtu\.be\/|\/embed\/)/)
  return urls[2] !== undefined ? urls[2].split(/[^0-9a-z_\-]/i)[0] : urls[0]
}
export const fetchTextTrimed = async (url: string) => {
  // https://stackoverflow.com/questions/27841112/how-to-remove-white-space-between-html-tags-using-javascript#:~:text=Ignoring%20%3C%20and%20%3E%20chars%20inside%20text%20nodes%3A
  const str = await FetchText(url)
  return trimHtml(str)
}
export const trimHtml = (str: string) => {
  const rexp = new RegExp('>[\ts\n ]*<', 'g')
  return str.replace(rexp, '><')
}
export const isNotZoomPath = (el: Element) => {
  return !el.closest("[class*='rm-zoom']")
}
export const unshiftSame = <T>(arr: Array<T>, el: T) => {
  arr.unshift(el)
  return arr
}
export const simMouseEvent = (eventName: string) => {
  return new MouseEvent(eventName, {
    view: window,
    bubbles: true,
    cancelable: true,
  })
}
export const simMousedown = () => {
  return simMouseEvent('mousedown')
}
//simHover,
export const simHoverOut = () => {
  return simMouseEvent('mouseleave')
}
export const includesAtlest = (arr: Array<string>, container: string, defaultString: string) => {
  const match = arr.filter(s => container.includes(s))
  return match.length > 0 ? match[0] : defaultString // filter first match or default
}
export const hasOneDayPassed_localStorage = (itemKey: string) => {
  // https://stackoverflow.com/questions/11741979/run-code-once-a-day#:~:text=Using%20localStorage%20is%20the%20best%20way%20to%20go%20when%20you%20don%27t%20have%20a%20server%2C%20since%20the%20javascript%20code%20might%20restarted%20(by%20closing%20the%20tab%20and%20re%2Dopening)%2C%20therefore%20loosing%20the%20previous%20state.
  // get today's date. eg: "7/37/2007"
  let date = new Date().toLocaleDateString()

  // if there's a date in localstorage and it's equal to the above:
  // inferring a day has yet to pass since both dates are equal.
  if (localStorage[itemKey] == date) return false

  // this portion of logic occurs when a day has passed
  localStorage[itemKey] = date
  return true
}
export const div = (classList = Array<string>()) => elm(classList, 'div')
export const span = (classList = Array<string>()) => elm(classList, 'span')
export const elm = (classList = Array<string>(), nodeType?: string) => {
  const span = document.createElement(nodeType!)
  span.classList.add(...classList!)
  return span
}
export const innerElsContains = (selector: string, text: string) => {
  // https://stackoverflow.com/questions/37098405/javascript-queryselector-find-div-by-innertext#:~:text=return%20Array.prototype.filter.call(elements%2C%20function(element)%7B
  let elements = document.querySelectorAll(selector)
  return Array.prototype.filter.call(elements, function (element) {
    return RegExp(text).test(element.textContent)
  })
}
/**
 * Returns copy of itself with subOjects that directly include the filterKey
 * @param {String} subKeyAsFilter
 * @returns {Object} Filtered sub properties
 */
export const FilterSubObjByKey = (subKeyAsFilter: string, refObj: Object) => {
  return (
    Object.keys(refObj)
      //@ts-ignore
      .filter(key => refObj[key].hasOwnProperty(subKeyAsFilter))
      .reduce((accObj, key) => {
        //@ts-ignore
        accObj[key] = refObj[key]
        return accObj
      }, {})
  )
}
/* ----------------------------------------------- */
export const RemoveElsEventListeners = (withEventListeners: Element[]) => {
  for (const el of withEventListeners) {
    el.replaceWith(el.cloneNode(true))
  }
}
export const RemoveAllChildren = (node: Element) => {
  //https://stackoverflow.com/questions/3955229/remove-all-child-elements-of-a-dom-node-in-javascript#:~:text=var%20cNode%20%3D%20node.cloneNode(false)%3B
  const cNode = node.cloneNode(false)
  node.parentNode?.replaceChild(cNode, node)
  return node
}

export const print = (str = 'hi') => {
  console.log(str)
}
export const linkClickPreviousElement = (el: Element) => {
  el.previousElementSibling?.setAttribute('for', el.id) // link clicks
}
export const NoCash = (url: string) => {
  return url + '?' + new Date().getTime()
}

export const inViewportEls = (els: HTMLElement[]) => {
  let matches = [],
    elCt = els.length

  for (let i = 0; i < elCt; ++i) {
    let el = els[i],
      b = el.getBoundingClientRect(),
      c

    if (
      b.width > 0 &&
      b.height > 0 &&
      b.left + b.width > 0 &&
      b.right - b.width < window.outerWidth &&
      b.top + b.height > 0 &&
      b.bottom - b.width < window.outerHeight &&
      (c = window.getComputedStyle(el)) &&
      c.getPropertyValue('visibility') === 'visible' &&
      c.getPropertyValue('opacity') !== 'none'
    ) {
      matches.push(el)
    }
  }
  return matches
}
export const inViewportElsHard = (els: HTMLElement[]) => {
  let matches = []

  for (const el of els) {
    if (isElementVisible(el)) {
      matches.push(el)
    }
  }
  return matches
}
export function partition<T>(
  array: T[],
  callback: (element: T, index: number, array: T[]) => boolean
) {
  return array.reduce(
    function (result, element, i) {
      callback(element, i, array) ? result[0].push(element) : result[1].push(element)

      return result
    },
    [[], []] as [T[], T[]]
  )
}
export const emptyEl = (classList: string, el: HTMLElement) => {
  if (classList) el.classList.add(classList)
  return el
}
export const allIframeIDprfx = (iframeIDprfx: string) => {
  return document.querySelectorAll(`[id*=${iframeIDprfx}]`)
}
export const allIframeStyle = (style: string) => {
  return document.querySelectorAll(`[${style}]`)
}
export const isValidFetch = async (url: string) => {
  try {
    const response = await fetch(url, { cache: 'no-store' })
    if (!response.ok) throw new Error('Request failed.')
    return [response, null]
  } catch (error) {
    console.log(`Your custom link ${url} is corrupt. ;c`)
    return [null, error]
  }
}
export const FetchText = async (url: string) => {
  const [response, err] = await isValidFetch(NoCash(url)) // firt time fetching something... This is cool
  // @ts-ignore
  if (response) return await response.text()
}
export const get_youtube_thumbnail = (url: string, quality?: 'low' | 'medium' | 'high') => {
  //https://stackoverflow.com/questions/18681788/how-to-get-a-youtube-thumbnail-from-a-youtube-iframe
  if (url) {
    let video_id, thumbnail: string, result
    if ((result = url.match(/youtube\.com.*(\?v=|\/embed\/)(.{11})/))) {
      video_id = result.pop()
    } else if ((result = url.match(/youtu.be\/(.{11})/))) {
      video_id = result.pop()
    }

    if (video_id) {
      if (typeof quality == 'undefined') {
        quality = 'high'
      }

      let quality_key = 'maxresdefault' // Max quality
      if (quality == 'low') {
        quality_key = 'sddefault'
      } else if (quality == 'medium') {
        quality_key = 'mqdefault'
      } else if (quality == 'high') {
        quality_key = 'hqdefault'
      }

      let thumbnail = 'https://img.youtube.com/vi/' + video_id + '/' + quality_key + '.jpg'
      return thumbnail
    }
  }
  return false
}

export const isValidCSSUnit = (value: string) => {
  //  valid CSS unit types
  const CssUnitTypes = [
    'em',
    'ex',
    'ch',
    'rem',
    'vw',
    'vh',
    'vmin',
    'vmax',
    '%',
    'cm',
    'mm',
    'in',
    'px',
    'pt',
    'pc',
  ]

  // create a set of regexps that will validate the CSS unit value
  const regexps = CssUnitTypes.map(unit => {
    // creates a regexp that matches '#unit' or '#.#unit' for every unit type
    return new RegExp(`^[0-9]+${unit}$|^[0-9]+\\.[0-9]+${unit}$`, 'i')
  })

  // attempt to find a regexp that tests true for the CSS value
  const isValid = regexps.find(regexp => regexp.test(value)) !== undefined

  return isValid
}

// https://stackoverflow.com/questions/50749322/javascript-nested-properties
export function keyFinder<T extends object>(object: T, key: s): unknown | null {
  // @ts-expect-error
  if (object.hasOwnProperty(key)) return object[key]
  for (let subkey in object) {
    if (!object.hasOwnProperty(subkey) || typeof object[subkey] !== 'object') continue
    // @ts-expect-error
    let match = keyFinder(object[subkey], key)
    if (match) return match
  }
  return null
}
export function selfKeyFinder<T extends object>(object: T, key: s): unknown | null {
  if (object.hasOwnProperty(key)) return object
  for (let subkey in object) {
    if (!object.hasOwnProperty(subkey) || typeof object[subkey] !== 'object') continue
    // @ts-expect-error
    let match = selfKeyFinder(object[subkey], key)
    if (match) return match
  }
  return null
}
// https://stackoverflow.com/a/35728997/13914180
/**
 * Access a deep value inside a object
 * Works by passing a path like "foo.bar", also works with nested arrays like "foo[0][1].baz"
 * @author Victor B. https://gist.github.com/victornpb/4c7882c1b9d36292308e
 * Unit tests: http://jsfiddle.net/Victornpb/0u1qygrh/
 */
export function pathFinder(obj: object, path: s) {
  if (typeof obj === 'undefined' || obj === null) return
  // @ts-expect-error
  path = path.split(/[\.\[\]\"\']{1,2}/)
  for (var i = 0, l = path.length; i < l; i++) {
    if (path[i] === '') continue
    // @ts-expect-error
    obj = obj[path[i]]
    if (typeof obj === 'undefined' || obj === null) return
  }
  return obj
}

export const debounce = <F extends (...args: any) => void>(func: F, delay: n) => {
  let timer: n
  return function () {
    // @ts-expect-error
    const context = this
    const args = arguments
    clearTimeout(timer)
    // @ts-expect-error
    timer = setTimeout(() => func.apply(context, args), delay)
  } as F
}

export function isObject(item: any) {
  return item && typeof item === 'object'
}

/**
 * Deep merge two objects.
 * @param target
 * @param ...sources
 */
export function mergeDeep<T>(target: T, ...sources: DeepPartial<T>[]) {
  if (!sources.length) return target
  const source = sources.shift()

  if (isObject(target) && isObject(source)) {
    for (const key in source) {
      if (isObject(source[key])) {
        // @ts-expect-error
        if (!target[key]) Object.assign(target, { [key]: {} })
        // @ts-expect-error
        mergeDeep(target[key], source[key])
      } else {
        // @ts-expect-error
        target[key] = source[key]
      }
    }
  }

  return mergeDeep(target, ...sources)
}
const util = {
  ObjKeysAsArr: ObjectKeys,
  ObjValsAsArr: ObjectValues,
  ObjEntriesAsArr: ObjectEntries,
  exitFullscreen,
  sleep,
  isTrue,
  getUniqueSelectorSmart,
  assertSelector,
  HMSToSecondsOnly,
  RemovedElementObserver,
  mapRange,
  applyIMGbg,
  removeIMGbg,
  isElementVisible,
  toggleClasses,
  toggleAttribute,
  closestBlockID,
  isValidUrl,
  ChangeElementType,
  /* */
  simHover,
  pushSame,
  convertHMS,
  seconds2time,
  getUniqueSelector,
  getYouTubeVideoID,
  fetchTextTrimed,
  trimHtml,
  isNotZoomPath,
  unshiftSame,
  simMouseEvent,
  simMousedown,
  simHoverOut,
  includesAtlest,
  hasOneDayPassed_localStorage,
  div,
  span,
  elm,
  innerElsContains,
  FilterSubObjByKey,
  RemoveElsEventListeners,
  RemoveAllChildren,
  print,
  linkClickPreviousElement,
  NoCash,
  inViewportEls,
  inViewportElsHard,
  emptyEl,
  allIframeIDprfx,
  allIframeStyle,
  isValidFetch,
  FetchText,
  get_youtube_thumbnail,
  isValidCSSUnit,
}
//window.kauderk.util = util
//export default util
