export const menu = <const>{
  name: 'Timestamps',
  'data-tooltip': 'Set timestamps per Block and Hierarchy',
}
export const tuts = <const>{
  hide: { name: 'Tutorials' },
  PWT3aHOiKRA: {
    name: 'Play/Mute Styles',
    'data-tooltip': 'Events after firing timestamps',
  },
  'cXf-PB1Vae4': {
    name: 'Creation',
    'data-tooltip': 'Ways to create timestamps',
  },
  '32atCTNYf9k': {
    name: 'Click Events',
    'data-tooltip': 'Input events while firing timestamps',
  },
  qWRktM562oo: {
    name: '{{anchors}}',
    'data-tooltip': 'Elements that cascade as a YT GIF proxy',
  },
  ocELIQ35Oes: {
    name: 'Loops',
    'data-tooltip': 'Children timestamps playing after one another',
  },
  Sqt_otLGTls: {
    name: 'Recovery',
    'data-tooltip': 'Recover last active timestamp after editing',
  },
  N18czV5tj5o: { name: 'YT API v3', 'data-tooltip': '...' },
}
export const recoveryOptions = <const>{
  id: 'tm_recovery',
  tooltip: 'After editing YT GIF Blocks remember active timestamps boundaries else deactivate them',
  name: 'Timestamp Recovery',
  value: false,
}
export const seekTo = <const>{
  label: {
    name: 'Seek To',
    'data-tooltip': 'Move to a position in time',
    id: 'tm_seek_to',
  },
  options: {
    strict: {
      'data-tooltip': 'Strict - Either start or end',
      name: 'Boundary',
    },
    soft: {
      'data-tooltip': 'If it is within the boundaries else rely on boundary',
      name: 'Current time',
      selected: true,
    },
  },
}
export const restore = <const>{
  label: {
    name: 'Restore',
    'data-tooltip': 'Once the last timestamp is created/rendered',
    id: 'tm_restore',
  },
  options: {
    match: {
      'data-tooltip': 'Match the displayed value inside the {{[[yt-gif/start|end]]}} component',
      name: 'Match',
      selected: true,
    },
    any: {
      'data-tooltip': `Any timestamp with it's previous position/index`,
      name: 'Any matches',
    },
  },
}
export const reset = <const>{
  label: {
    name: 'Reset on removal',
    'data-tooltip': `Reset yt-gif player once it's active timestamp-set is removed from DOM/Destroyed/Deleted`,
    id: 'tm_reset_on_removal',
  },
  options: {
    container: {
      'data-tooltip': 'Recommended with recovery mode on | When the container is removed',
      name: 'Container',
      selected: true,
    },
    block: {
      'data-tooltip': `Recommended with recovery mode off | When block content is removed/editing`,
      name: 'Block',
    },
    disabled: {
      'data-tooltip': `...`,
      name: 'Disabled',
    },
  },
}
export const seekToActions = <const>{
  label: {
    name: 'Seek To Actions',
    'data-tooltip': 'Recommended when recovery/restore mode is on',
    id: 'tm_seek_action',
  },
  options: {
    mute: {
      'data-tooltip': 'Recommended with recovery mode on | When the container is removed',
      name: 'Mute',
      selected: true,
    },
    pause: {
      'data-tooltip': `Recommended with recovery mode off | When block content is removed/editing`,
      name: 'Pause',
    },
    disabled: {
      'data-tooltip': `...`,
      name: 'None',
    },
  },
}
export const loopTimestamps = <const>{
  label: {
    name: 'Loop',
    'data-tooltip': 'Finish a set of timestamp boundaries, then move to the next one',
    id: 'tm_loop_hierarchy',
  },
  options: {
    auto: {
      'data-tooltip': 'Fire the next rendered timestamp',
      name: 'Automatically',
      selected: true,
    },
    active: {
      'data-tooltip': `Only if there is an active set playing`,
      name: 'Last Active',
    },
    disabled: {
      'data-tooltip': `...`,
      name: 'Disabled',
    },
  },
}
export const displayTm = <const>{
  label: {
    name: 'Display',
    'data-tooltip': 'Rendered Components',
    id: 'tm_workflow_display',
  },
  options: {
    lessHMS: {
      'data-tooltip': `Show few digits as possible. E.g. 1s - 59s - 1:30 - 2:30:10`,
      name: 'Less HMS',
      selected: true,
    },
    HMS: {
      'data-tooltip': `Show time with the HH:MM:SS format`,
      name: 'Formatted HMS',
    },
    hmsSufix: {
      'data-tooltip': `Try to show the amount with it's time suffix E.g. 1h5m30s else rely on "lessHMS"`,
      name: 'hms suffix',
    },
    S: {
      'data-tooltip': `Show time as integers. E.g. 1s - 59s - 1000s`,
      name: 'Seconds Only',
    },
    Default: {
      'data-tooltip': `Show the exact value placed inside {{[[yt-gif/start|end]]}} components`,
      name: 'Default',
    },
  },
}
export const grabTm = <const>{
  label: {
    name: 'Grab',
    'data-tooltip': 'Timestamp Digits',
    id: 'tm_workflow_grab',
  },
  options: {
    lessHMS: {
      'data-tooltip': `Grab few digits as possible. E.g. 1s - 59s - 1:30 - 2:30:10`,
      name: 'Less HMS',
    },
    HMS: {
      'data-tooltip': `Grab time with the HH:MM:SS format`,
      name: 'Formatted HMS',
    },
    hmsSufix: {
      'data-tooltip': `Try to grab the amount with it's time suffix E.g. 1h5m30s else rely on "lessHMS"`,
      name: 'hms suffix',
    },
    S: {
      'data-tooltip': `Grab time as integers. E.g. 1s - 59s - 1000s`,
      name: 'Seconds Only',
    },
  },
}
//--------------------------------------------
export const startEndOptions = <const>{
  id: 'tm_loop_to',
  attributes: ['single', 'row'],
  options: {
    start: {
      name: 'Start',
      'data-tooltip': 'Target {{[[start]]}} boundaries',
      selected: true,
    },
    end: {
      name: 'End',
      'data-tooltip': 'Target {{[[end]]}} boundaries',
    },
  },
}
export const LoopOptions = <const>{
  id: 'tm_loop_options',
  attributes: ['single', 'row'],
  options: {
    skip: {
      name: 'Skip',
      'data-tooltip': 'Skip if next timestamp is out-of-bounds - Recommended',
      selected: true,
    },
    include_player: {
      name: 'Player',
      'data-tooltip':
        "Include players' timestamp in the loop - If set to Last Active, it will make a lap to the player then stop looping",
      selected: true,
    },
  },
}
export const featuresOptions = <const>{
  id: 'tm_options',
  attributes: ['multiple', 'row'],
  options: {
    anchor: {
      name: 'Anchor',
      'data-tooltip':
        'Gain the scope of a {{[[yt-gif/anchor]]}} parent and perform operations E.g. looping... Recovery...',
      selected: true,
      icon: 'path',
    },
    shortcuts: {
      name: 'Shortcuts',
      'data-tooltip':
        'Grab timestamps using Shortcuts E.g. Start: Ctrl/Cmd + Alt + s End: Ctrl/Cmd + Alt + d',
      icon: 'key-command',
    },
    // smartblocks: {
    // 	name: '',
    // 	'data-tooltip':
    // 		'Grab timestamps using smartblocks kauderk.github.io/yt-gif-components',
    // },
    YT_API_KEY_V3: {
      name: 'YT API',
      'data-tooltip':
        'Enable my YouTube API DATA v3 KEY to perform operations ... Watch the up-right-conner tutorial to learn more',
      disabled: true,
      icon: 'key',
    },
  },
}
export const smartBlocksLink = <const>{
  on: 'share',
  tooltip: 'Grab timestamps using SmartBlocks kauderk.github.io/yt-gif-components',
  click: () =>
    window
      .open(
        'https://github.com/kauderk/kauderk.github.io/tree/main/yt-gif-extension/install/components'
      )
      ?.focus(),
}
