export const menu = <const>{
  name: 'Player Settings',
  'data-tooltip': 'Tweak Parameters',
}
export const tuts = {
  hide: { name: 'Tutorials' },
  PWT3aHOiKRA: {
    name: 'Play/Mute Styles',
    'data-tooltip': 'Scenerios where YT GIFs overlap others',
  },
}
export const play_style = <const>{
  label: {
    name: 'Initialize',
    'data-tooltip': 'Play/Pause yt-gifs',
    id: 'play_style',
  },
  options: {
    strict: {
      'data-tooltip':
        'Strict &amp; Recommended - InAndOutKeys or not, all get muted, except current',
      name: 'Last Active',
      selected: true,
    },
    soft: {
      'data-tooltip': 'InAndOutKeys have priority. You can play multiple videos with some control.',
      name: 'Hovering',
    },
    all_visible: {
      'data-tooltip': 'Initialized yt-gifs will autoplay indefinitely',
      name: 'Forever',
    },
  },
}
export const mute_style = <const>{
  label: {
    name: 'Mute',
    'data-tooltip': 'Mute/Unmute yt-gifs',
    id: 'mute_style',
  },
  options: {
    strict: {
      'data-tooltip': 'Maximum of 1 YT GIF plays unmuted at a time',
      name: 'Last Active',
      selected: true,
    },
    soft: {
      'data-tooltip': "Play without sound - 'InAndOutKeys' can unmute it",
      name: 'Hovering',
    },
    all_muted: {
      'data-tooltip': "'InAndOutKeys' won't unmute any yt-gif",
      name: 'Locked',
    },
  },
}
export const fullscreen_style = <const>{
  label: {
    name: 'Fullscreen',
    'data-tooltip': 'While hovering the frame/player/video',
    id: 'fullscreen_style',
  },
  options: {
    disabled: { name: 'Disabled', selected: true },
    mute: { name: 'Mute on exit' },
    pause: { name: 'Pause on exit' },
    play: { name: 'Keep Playing' },
  },
}
export const url_boundaries = <const>{
  label: {
    name: 'Boundaries',
    'data-tooltip': 'Recover parameters after editing blocks',
    id: 'url_boundaries',
  },
  options: {
    strict: {
      'data-tooltip': '&t= has priority over previous timestamp tick',
      name: 'Strict Recovery',
      selected: true,
    },
    soft: {
      'data-tooltip': 'Remember previous timestamp tick or rely on default',
      name: 'Soft Recovery',
    },
    start_only: {
      'data-tooltip': 'Initialize with &t= start every time',
      name: 'Start only',
    },
  },
}
export const url_volume = <const>{
  label: {
    name: 'Volume',
    'data-tooltip': 'Recover parameters after editing blocks',
    id: 'url_volume',
  },
  options: {
    strict: {
      'data-tooltip': '&v= volume has priority over previous volume level',
      name: 'Strict Recovery',
      selected: true,
    },
    soft: {
      'data-tooltip': 'Remember previous volume level or rely on default',
      name: 'Soft Recovery',
    },
    start_only: {
      'data-tooltip': 'Initialize with &v= volume every time or rely on default',
      name: 'Volume only',
    },
  },
}
export const options = <const>{
  id: 'ps_options',
  attributes: ['multiple'],

  options: {
    mantain_last_active_player: {
      name: 'Maintain last active player',
      'data-tooltip': `Keep Playing - Make them active by interacting with them in a decive way: exiting yt-gifs while holding down 'InAndOutKeys' or by firing timestamp`,
      selected: true,
      icon: 'confirm',
    },
    minimize_on_video_ended: {
      name: 'Smoll Vid When Big Ends',
      'data-tooltip': 'Exit Fullscreen when the clip ends?',
      icon: 'fullscreen',
    },
  },
}
