import type { TDropDown } from '../types'

export const ytgif = (<const>{
  drop: {
    on: 'changes',
    type: 'formatter',
  },
  sub: {
    url: {
      tooltip: 'Restore YT URL',
      on: 'link',
      type: 'url',
    },
    startEnd: {
      tooltip: '{{[[start|end]]}}',
      on: 'time',
      type: 'start|end',
    },
    start: {
      tooltip: '{{[[start]]}}',
      on: 'stopwatch',
      type: 'start',
    },
    end: {
      tooltip: '{{[[end]]}}',
      on: 'stopwatch',
      type: 'end',
    },
  },
}) satisfies TDropDown

const timestamp = (<const>{
  drop: {
    on: 'changes',
    type: 'formatter',
  },
  sub: {
    ytgif: {
      tooltip: '{{[[yt-gif]]}}',
      on: 'video',
      type: 'yt-gif',
    },
    swapFormat: {
      tooltip: 'Swap Formats',
      on: 'segmented-control',
      type: 'url',
    },
  },
}) satisfies TDropDown

const { url, ...urlButtonSub } = ytgif.sub
export const urlButton = (<const>{
  drop: {
    on: 'video',
    type: 'formatter',
  },
  sub: {
    ...urlButtonSub,
    ytgif: timestamp.sub.ytgif,
    swapFormat: {
      ...timestamp.sub.swapFormat,
      type: 'format',
    },
  },
}) satisfies TDropDown

export const insertOptions = (<const>{
  drop: {
    on: 'changes',
    type: 'insertOptions',
  },
  sub: {
    start: {
      tooltip: 'Insert as "start"',
      on: 'left-join',
      type: 'start',
    },
    end: {
      tooltip: 'Insert as "end"',
      on: 'right-join',
      type: 'end',
    },
    speed: {
      tooltip: 'Insert as "speed"',
      on: 'fast-forward',
      type: 'speed',
    },
    reset: {
      tooltip: 'Reset Boundaries',
      on: 'reset',
      type: 'reset',
    },
  },
}) satisfies TDropDown
