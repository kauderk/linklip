export const menu = <const>{
  name: 'Experience',
  'data-tooltip': 'Quality of life Features',
}
export const tuts = <const>{
  hide: { name: 'Tutorials' },
  _96XDmFPzbU: {
    name: 'Iframe Buffer',
    'data-tooltip': 'YT GIFs as iframes and garbage collection',
  },
}
export const awaiting_input_type = <const>{
  label: {
    name: 'Input Type',
    'data-tooltip': "Don't load until interaction",
    id: 'awaiting_input_type',
  },
  options: {
    mousedown: { name: 'Clicks', selected: true },
    mouseenter: { name: 'Hovering' },
  },
}
export const initialize_mode = <const>{
  label: {
    name: 'Mode',
    id: 'initialize_mode',
  },
  options: {
    input_x_buffer: {
      name: 'Buffer + Interaction',
      'data-tooltip': 'Create a stack, push and shift at will - Performance Mode ⚡️',
      selected: true,
      customChange() {
        //ifBuffer_ShiftOldest()
      },
    },
    input: {
      name: 'Awaiting for Inputs',
      'data-tooltip': "Don't load until interaction",
    },
    overflow: {
      name: 'Handle Overflow',
      'data-tooltip':
        'Set Automatically - To gain access to the buffer, either increase the limit or manually unload videos',
      disabled: true,
    },
    disabled: {
      name: 'Everything',
      'data-tooltip': 'As soon as any "yt-gif" component gets rendered',
    },
  },
}
export const iframe_buffer_slider = <const>{
  label: {
    name: 'Iframe Buffer',
    'data-tooltip':
      'The greater the slider, the less tries, the less loadings :D - Recomended 5-10',
  },
  range: {
    attr: {
      min: 1,
      max: 30,
      value: 15,
      id: 'iframe_buffer_slider',
      'data-tooltip': <StrSearch>undefined,
    },
    counter: {
      'data-tooltip': 'From 1 to 30 - Loaded Simultaneously',
    },
  },
}
type Key = keyof typeof initialize_modeOptions['options']
type Evt = { detail: Key }
export const initialize_modeOptions = <const>{
  id: 'xp_options',
  attributes: ['multiple'],
  options: {
    thumbnail_as_bg: {
      name: 'Video Thumbnail',
      'data-tooltip': 'Aesthetics - or - minimalism',
      selected: true,
      icon: 'media',
      customChange(e: Evt) {
        //playersProps.set({ thumbnail: e.detail === 'thumbnail_as_bg' })
      },
    },
    try_to_load_when_rendered: {
      name: 'Try To Load When Rendered',
      'data-tooltip': 'Newly observed components will try to displace the oldest ones',
      hide: false,
      icon: 'cloud-download',
    },
  },
}
