<script lang="ts">
  import { lib } from './timeline/ratio/map'

  import type { heatmap as _heatmap } from '$mock/heatmap.json'
  import type { Boundary } from './timeline/ratio/compute'

  export let heatmap: typeof _heatmap
  export let chapter: Boundary
  const arr = heatmap.heatMarkers

  // https://stackoverflow.com/a/62423926/13914180
  $: dataset = arr
    .slice(Math.floor($chapter.startRatio * arr.length), Math.floor($chapter.endRatio * arr.length))
    .map((e, xAxis) => {
      const el = e.heatMarkerRenderer
      const yAxis = el.heatMarkerIntensityScoreNormalized
      return [xAxis, yAxis]
    })
  // --------------------------------
  const _options = {
    xMin: 0,
    xMax: 30,
    yMin: -10,
    yMax: 100,
    line: {
      smoothing: 0.1,
      flattening: 1,
    },
  }
  $: _options.xMax = dataset.length - 1
  export let options = _options
  export let svg = {
    w: 1000,
    h: 100,
  }

  type point = [n, n]

  function line(pointA: point, pointB: point) {
    const lengthX = pointB[0] - pointA[0]
    const lengthY = pointB[1] - pointA[1]
    return {
      length: Math.sqrt(Math.pow(lengthX, 2) + Math.pow(lengthY, 2)),
      angle: Math.atan2(lengthY, lengthX),
    }
  }
  function controlPoint(current: point, previous: point, next: point, reverse?: b) {
    const p = previous || current
    const n = next || current
    const o = line(p, n)
    // work in progress…
    const flat = lib.map(Math.cos(o.angle) * options.line.flattening, 0, 1, 1, 0)
    const angle = o.angle * flat + (reverse ? Math.PI : 0)
    const length = o.length * options.line.smoothing
    const x = current[0] + Math.cos(angle) * length
    const y = current[1] + Math.sin(angle) * length
    return [x, y]
  }
  function bezierCommand(point: point, i: n, a: point[]) {
    const cps = controlPoint(a[i - 1], a[i - 2], point)
    const cpe = controlPoint(point, a[i - 1], a[i + 1], true)
    const close = i === a.length - 1 ? ' z' : ''
    return `C ${cps[0]},${cps[1]} ${cpe[0]},${cpe[1]} ${point[0]},${point[1]}${close}`
  }

  $: pointsPositions = dataset.map(e => {
    const x = lib.map(e[0], options.xMin, options.xMax, 0, svg.w)
    const y = lib.map(e[1] * options.yMax, options.yMin, options.yMax, svg.h, 0)
    return [x, y]
  })
</script>

<svg
  class="heat-map-svg"
  height="100%"
  preserveAspectRatio="none"
  version="1.1"
  viewBox="0 0 {svg.w} {svg.h}"
  width="100%"
>
  <path
    class="heat-map-path"
    d={pointsPositions.reduce((acc, e, i, a) => {
      if (i === 0) {
        if (!a[a.length - 1]?.[0]) {
          a.length = 0 // break
          return ''
        }
        return `
				M ${a[a.length - 1][0]},${svg.h} 
				L ${e[0]},${svg.h} 
				L ${e[0]},${e[1]}`
      } else {
        // @ts-expect-error
        return `${acc} ${bezierCommand(e, i, a)}`
      }
    }, '')}
    fill="white"
    fill-opacity="0.6"
  />
</svg>
