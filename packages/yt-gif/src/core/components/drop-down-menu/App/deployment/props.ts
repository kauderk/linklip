export const menu = <const>{
  name: 'Deployment Style',
  'data-tooltip': 'Look for components to create YT GIFs',
}
export const tuts = <const>{
  hide: { name: 'Tutorials' },
  deployments: {
    name: 'Deployments',
    'data-tooltip': 'Deploy selected YT GIFs',
  },
}
export const featuresOptions = <const>{
  id: 'override_roam_video_component',
  attributes: ['multiple'],
  options: {
    'yt-gif': {
      name: '{{[[yt-gif]]}}',
      'data-tooltip': '...',
      selected: true,
      icon: 'new-grid-item',
    },
    video: {
      name: '{{[[video]]}}',
      'data-tooltip': '...',
      icon: 'new-grid-item',
    },
  },
}
export const power = <const>{
  id: 'power',
  value: true,
  icon: 'power',
  name: 'Power',
  tooltip: 'Suspend component deployment',
}
export const deployReset = {
  icon: ['send-to', 'eraser'],
  name: ['Deploy', 'Erase'],
  tooltip: ['Deploy components', 'Erase Previous components'],
}
